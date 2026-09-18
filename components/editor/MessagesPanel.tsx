"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useProjectEditorStore } from "@/stores/useProjectEditorStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function messagePreview(m: { type: string; [k: string]: unknown }): string {
  if (m.type === "text") return String(m.text ?? "");
  if (m.type === "system") return String(m.text ?? "");
  if (m.type === "call") {
    const missed = m.callStatus === "missed";
    const label = m.callType === "video" ? "video" : "voice";
    return missed ? `Missed ${label} call` : `${label} call`;
  }
  return `[${m.type}]`;
}

export function MessagesPanel() {
  const { project, selectedMessageId, selectMessage, reorderMessages, deleteMessage, addMessage } =
    useProjectEditorStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (!project) return null;
  const { messages, participants } = project.conversation;
  const participantsById = new Map(participants.map((p) => [p.id, p]));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-xs font-medium text-zinc-500">{messages.length} messages</p>
        <Button size="sm" variant="outline" onClick={() => addMessage(null, "after")}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto chatframe-scrollbar pr-1">
        {messages.map((m, index) => {
          const sender = participantsById.get(m.senderId);
          return (
            <div
              key={m.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index) reorderMessages(dragIndex, index);
                setDragIndex(null);
              }}
              onClick={() => selectMessage(m.id)}
              className={cn(
                "group flex items-center gap-2 rounded-lg border px-2 py-2 cursor-pointer transition-colors",
                selectedMessageId === m.id ? "border-emerald-400 bg-emerald-50" : "border-transparent hover:bg-zinc-100"
              )}
            >
              <GripVertical className="h-3.5 w-3.5 flex-shrink-0 text-zinc-300" />
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: sender?.accentColor ?? "#ccc" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-700">{sender?.name ?? "Unknown"}</p>
                <p className="truncate text-xs text-zinc-500">{messagePreview(m)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMessage(m.id);
                }}
                className="flex-shrink-0 text-zinc-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                aria-label="Delete message"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
