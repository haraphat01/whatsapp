"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Users, BookUser } from "lucide-react";
import { Persona } from "@/lib/validation/persona";
import { getPersonasSnapshot, subscribeToPersonas } from "@/lib/storage/personaStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/chat/Avatar";
import { EmptyState } from "@/components/ui/empty-state";

const EMPTY_PERSONAS: Persona[] = [];

export function PersonaPickerButton({ onSelect }: { onSelect: (persona: Persona) => void }) {
  const [open, setOpen] = useState(false);
  const personas = useSyncExternalStore(subscribeToPersonas, getPersonasSnapshot, () => EMPTY_PERSONAS);

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <BookUser className="h-3.5 w-3.5" /> Load from library
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Choose a saved character">
        {personas.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No saved characters yet"
            description="Save a participant's traits from the wizard or editor to reuse them in future conversations."
          />
        ) : (
          <div className="max-h-[50vh] space-y-1.5 overflow-y-auto chatframe-scrollbar">
            {personas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/50"
              >
                <Avatar name={p.name} src={p.avatar} color={p.accentColor} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{p.name}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {[p.role, p.personality].filter(Boolean).join(" · ") || "No traits set"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 border-t border-zinc-100 pt-3 text-center">
          <Link href="/personas" className="text-xs text-zinc-400 hover:text-zinc-600">
            Manage saved characters
          </Link>
        </div>
      </Dialog>
    </>
  );
}
