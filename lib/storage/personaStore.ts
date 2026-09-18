"use client";

import { Persona, personaSchema } from "@/lib/validation/persona";
import { generateId } from "@/lib/utils";

/**
 * Local persistence for the persona/character library. Same localStorage
 * approach as lib/storage/projectStore.ts (see that file for why); a real
 * deployment would back this with the user's Supabase account instead.
 */

const INDEX_KEY = "chatframe.personas.index.v1";
const PERSONA_KEY = (id: string) => `chatframe.persona.${id}.v1`;

// Pub/sub + cached snapshot so components can read this with
// useSyncExternalStore without violating its "stable snapshot" requirement
// (see lib/storage/projectStore.ts for the bug this pattern avoids).
const listeners = new Set<() => void>();
let personasSnapshot: Persona[] | null = null;

function notify() {
  personasSnapshot = null;
  listeners.forEach((l) => l());
}
export function subscribeToPersonas(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
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

export function getPersona(id: string): Persona | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PERSONA_KEY(id));
    if (!raw) return null;
    const parsed = personaSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function listPersonas(): Persona[] {
  const ids = readIndex();
  const personas: Persona[] = [];
  for (const id of ids) {
    const p = getPersona(id);
    if (p) personas.push(p);
  }
  return personas.sort((a, b) => a.name.localeCompare(b.name));
}

/** Referentially-stable variant of listPersonas() for useSyncExternalStore. */
export function getPersonasSnapshot(): Persona[] {
  if (personasSnapshot === null) {
    personasSnapshot = listPersonas();
  }
  return personasSnapshot;
}

export function savePersona(persona: Persona): Persona {
  const validated = personaSchema.parse({ ...persona, updatedAt: new Date().toISOString() });
  window.localStorage.setItem(PERSONA_KEY(validated.id), JSON.stringify(validated));
  const ids = readIndex();
  if (!ids.includes(validated.id)) {
    writeIndex([...ids, validated.id]);
  }
  notify();
  return validated;
}

export function createPersona(fields: {
  name: string;
  avatar?: string;
  role?: string;
  personality?: string;
  writingStyle?: string;
  gender?: string;
  description?: string;
  accentColor?: string;
}): Persona {
  const now = new Date().toISOString();
  return savePersona({
    id: generateId("persona"),
    name: fields.name,
    avatar: fields.avatar ?? "",
    role: fields.role,
    personality: fields.personality,
    writingStyle: fields.writingStyle,
    gender: fields.gender,
    description: fields.description,
    accentColor: fields.accentColor ?? "#25D366",
    createdAt: now,
    updatedAt: now,
  });
}

export function deletePersona(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PERSONA_KEY(id));
  writeIndex(readIndex().filter((existing) => existing !== id));
  notify();
}

export function renamePersona(id: string, name: string): Persona | null {
  const persona = getPersona(id);
  if (!persona) return null;
  return savePersona({ ...persona, name });
}
