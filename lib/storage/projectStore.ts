"use client";

import {
  Project,
  projectSchema,
  createDefaultTheme,
  createDefaultPlaybackSettings,
  createDefaultExportSettings,
  Conversation,
} from "@/lib/validation/schemas";
import { generateId } from "@/lib/utils";

/**
 * Local persistence layer for ChatFrame projects.
 *
 * The product spec calls for Supabase-backed Postgres storage with RLS in
 * production (see README "Production data layer"), but this environment has
 * no provisioned Supabase project/credentials. Per the stated fallback
 * policy, we implement the correct shape (typed Project records, CRUD,
 * per-user scoping) against localStorage so the full app works end-to-end
 * locally, and isolate all access behind this module so swapping in a real
 * Supabase client later only requires reimplementing these functions.
 */

const INDEX_KEY = "chatframe.projects.index.v1";
const PROJECT_KEY = (id: string) => `chatframe.project.${id}.v1`;

// Minimal pub/sub so React components can read this module with
// useSyncExternalStore instead of copying data into local state inside an
// effect (which recent eslint-plugin-react-hooks flags as an anti-pattern).
//
// useSyncExternalStore requires getSnapshot to return a referentially stable
// value when nothing has changed (React throws "getSnapshot should be
// cached" otherwise), but listProjects()/getProject() parse fresh objects
// from localStorage on every call. getProjectsSnapshot/getProjectSnapshot
// below cache those results and are invalidated on every mutation.
const listeners = new Set<() => void>();
let projectsSnapshot: Project[] | null = null;
const projectSnapshotCache = new Map<string, Project | null>();

function notify() {
  projectsSnapshot = null;
  projectSnapshotCache.clear();
  listeners.forEach((l) => l());
}
export function subscribeToProjects(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getProjectsSnapshot(): Project[] {
  if (projectsSnapshot === null) {
    projectsSnapshot = listProjects();
  }
  return projectsSnapshot;
}

export function getProjectSnapshot(id: string): Project | null {
  if (!projectSnapshotCache.has(id)) {
    projectSnapshotCache.set(id, getProject(id));
  }
  return projectSnapshotCache.get(id) ?? null;
}

function readIndex(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

export function listProjects(): Project[] {
  const ids = readIndex();
  const projects: Project[] = [];
  for (const id of ids) {
    const p = getProject(id);
    if (p) projects.push(p);
  }
  return projects.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getProject(id: string): Project | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROJECT_KEY(id));
    if (!raw) return null;
    const parsed = projectSchema.safeParse(JSON.parse(raw));
    return parsed.success ? migrateStatusBar(parsed.data) : null;
  } catch {
    return null;
  }
}

// Projects saved before the status bar went automatic stored the old
// hard-coded "9:41" / 85% defaults, which had no UI to change them.
function migrateStatusBar(project: Project): Project {
  const { statusBarTime, statusBarBattery } = project.exportSettings;
  if (statusBarTime !== "9:41" || statusBarBattery !== 85) return project;
  return { ...project, exportSettings: { ...project.exportSettings, statusBarTime: "", statusBarBattery: null } };
}

export function saveProject(project: Project): Project {
  const validated = projectSchema.parse({ ...project, updatedAt: new Date().toISOString() });
  window.localStorage.setItem(PROJECT_KEY(validated.id), JSON.stringify(validated));
  const ids = readIndex();
  if (!ids.includes(validated.id)) {
    writeIndex([...ids, validated.id]);
  }
  notify();
  return validated;
}

export function deleteProject(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROJECT_KEY(id));
  writeIndex(readIndex().filter((existing) => existing !== id));
  notify();
}

export function duplicateProject(id: string): Project | null {
  const original = getProject(id);
  if (!original) return null;
  const now = new Date().toISOString();
  const copy: Project = {
    ...original,
    id: generateId("proj"),
    name: `${original.name} (Copy)`,
    conversation: { ...original.conversation, id: generateId("conv") },
    createdAt: now,
    updatedAt: now,
  };
  return saveProject(copy);
}

export function createProject(params: {
  name: string;
  description?: string;
  conversation: Conversation;
}): Project {
  const now = new Date().toISOString();
  const project: Project = {
    id: generateId("proj"),
    userId: "local",
    name: params.name,
    description: params.description,
    conversation: params.conversation,
    theme: createDefaultTheme(),
    playbackSettings: createDefaultPlaybackSettings(),
    exportSettings: createDefaultExportSettings(),
    createdAt: now,
    updatedAt: now,
  };
  return saveProject(project);
}

export function renameProject(id: string, name: string): Project | null {
  const project = getProject(id);
  if (!project) return null;
  return saveProject({ ...project, name });
}
