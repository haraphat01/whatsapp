"use client";

import { ConversationType } from "@/lib/validation/schemas";
import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";

const TYPES: { type: ConversationType; icon: string; name: string; desc: string; isGroup?: boolean }[] = [
  { type: "romantic", icon: "❤️", name: "Romantic", desc: "Flirty or loving exchanges between partners" },
  { type: "friends", icon: "👫", name: "Friends", desc: "Casual banter between close friends" },
  { type: "workplace", icon: "💼", name: "Workplace", desc: "Coworkers discussing projects and deadlines" },
  { type: "family", icon: "👨‍👩‍👧", name: "Family", desc: "Conversations between family members" },
  { type: "school", icon: "🎓", name: "School", desc: "Classmates or study group chats" },
  { type: "funny", icon: "😂", name: "Funny", desc: "Lighthearted, comedic exchanges" },
  { type: "argument", icon: "😡", name: "Argument", desc: "Tense disagreements and conflict" },
  { type: "business", icon: "🤝", name: "Business", desc: "Formal client or partner communication" },
  { type: "group", icon: "👥", name: "Group Chat", desc: "3-20 participants in one conversation", isGroup: true },
  { type: "story", icon: "🎬", name: "Story / Drama", desc: "Narrative-driven scripted dialogue" },
  { type: "custom", icon: "✍️", name: "Custom", desc: "Define your own conversation type" },
];

export function ConversationTypeStep() {
  const { conversationType, setConversationType } = useWizardStore();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TYPES.map((t) => (
        <button
          key={t.type}
          type="button"
          onClick={() => setConversationType(t.type, !!t.isGroup)}
          className={cn(
            "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all hover:shadow-md",
            conversationType === t.type
              ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500"
              : "border-zinc-200 bg-white"
          )}
        >
          <span className="text-2xl">{t.icon}</span>
          <span className="text-sm font-semibold text-zinc-900">{t.name}</span>
          <span className="text-xs leading-snug text-zinc-500">{t.desc}</span>
        </button>
      ))}
    </div>
  );
}
