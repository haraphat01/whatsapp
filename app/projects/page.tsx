"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Folder, MessageCircle, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Project } from "@/lib/validation/schemas";
import {
  deleteProject,
  duplicateProject,
  getProjectsSnapshot,
  renameProject,
  saveProject,
  subscribeToProjects,
} from "@/lib/storage/projectStore";
import { seedDemoProjects } from "@/lib/seed/demoProjects";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/stores/useToastStore";

const EMPTY_PROJECTS: Project[] = [];

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useSyncExternalStore(subscribeToProjects, getProjectsSnapshot, () => EMPTY_PROJECTS);

  function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    deleteProject(id);
    toast({ title: "Project deleted" });
  }

  function handleDuplicate(id: string) {
    duplicateProject(id);
    toast({ title: "Project duplicated", variant: "success" });
  }

  function handleRename(project: Project) {
    const name = prompt("Rename project", project.name);
    if (!name) return;
    renameProject(project.id, name);
  }

  function loadDemos() {
    seedDemoProjects().forEach((p) => saveProject(p));
    toast({ title: "Demo projects added", variant: "success" });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </span>
            ChatFrame AI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/personas" className="text-sm text-zinc-500 hover:text-zinc-800">Characters</Link>
            <Link href="/create"><Button size="sm"><Plus className="h-4 w-4" /> New Conversation</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900">Your projects</h1>
          {projects.length > 0 && (
            <Button variant="ghost" size="sm" onClick={loadDemos}>
              <Sparkles className="h-3.5 w-3.5" /> Add demo projects
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No projects yet"
            description="Create your first AI-generated conversation, or start from a fictional demo project."
            action={
              <div className="flex gap-2">
                <Link href="/create"><Button>Create Conversation</Button></Link>
                <Button variant="outline" onClick={loadDemos}>Load demo projects</Button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div key={p.id} className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md">
                <button className="block w-full text-left" onClick={() => router.push(`/editor/${p.id}`)}>
                  <p className="truncate text-[15px] font-semibold text-zinc-900">{p.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{p.description || "No description"}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                    <span>{p.conversation.messages.length} messages</span>
                    <span>·</span>
                    <span>{p.conversation.participants.length} participants</span>
                  </div>
                  <p className="mt-3 text-xs text-zinc-400">Updated {new Date(p.updatedAt).toLocaleDateString()}</p>
                </button>
                <div className="mt-4 flex items-center gap-1 border-t border-zinc-100 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="ghost" onClick={() => handleRename(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Rename
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDuplicate(p.id)}>
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
