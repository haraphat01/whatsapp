"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { MessageCircle, Pencil, Trash2, Users } from "lucide-react";
import { Persona } from "@/lib/validation/persona";
import { deletePersona, getPersonasSnapshot, renamePersona, subscribeToPersonas } from "@/lib/storage/personaStore";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/chat/Avatar";
import { toast } from "@/stores/useToastStore";

const EMPTY_PERSONAS: Persona[] = [];

export default function PersonasPage() {
  const personas = useSyncExternalStore(subscribeToPersonas, getPersonasSnapshot, () => EMPTY_PERSONAS);

  function handleRename(persona: Persona) {
    const name = prompt("Rename character", persona.name);
    if (!name) return;
    renamePersona(persona.id, name);
  }

  function handleDelete(persona: Persona) {
    if (!confirm(`Delete "${persona.name}" from your character library?`)) return;
    deletePersona(persona.id);
    toast({ title: "Character deleted" });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </span>
            ChatFrame AI
          </Link>
          <Link href="/create"><Button size="sm">New Conversation</Button></Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900">Your characters</h1>
        </div>
        <p className="mb-8 text-sm text-zinc-500">
          Characters saved from the create wizard or the editor. Load one into any project instead
          of re-typing a personality and writing style every time.
        </p>

        {personas.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No saved characters yet"
            description={
              'Open a participant\'s traits in the create wizard or editor and choose "Save as character" to add one.'
            }
            action={<Link href="/create"><Button>Start a conversation</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {personas.map((p) => (
              <div key={p.id} className="group rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} src={p.avatar} color={p.accentColor} size={44} />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-zinc-900">{p.name}</p>
                    {p.role && <p className="truncate text-xs text-zinc-500">{p.role}</p>}
                  </div>
                </div>
                {p.personality && (
                  <p className="mt-3 line-clamp-2 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-400">Personality: </span>
                    {p.personality}
                  </p>
                )}
                {p.writingStyle && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-400">Writing style: </span>
                    {p.writingStyle}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-1 border-t border-zinc-100 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="ghost" onClick={() => handleRename(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Rename
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(p)}>
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
