import { Reaction as ReactionType } from "@/lib/validation/schemas";

export function ReactionBadge({
  reactions,
  outgoing,
}: {
  reactions: ReactionType[];
  outgoing: boolean;
}) {
  if (reactions.length === 0) return null;
  const emojiCounts = new Map<string, number>();
  for (const r of reactions) emojiCounts.set(r.emoji, (emojiCounts.get(r.emoji) ?? 0) + 1);

  return (
    <div
      className={`absolute -bottom-3 flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 shadow-md border border-black/5 ${
        outgoing ? "right-2" : "left-2"
      }`}
    >
      {Array.from(emojiCounts.entries()).map(([emoji, count]) => (
        <span key={emoji} className="text-[12px] leading-none">
          {emoji}
          {count > 1 && <span className="ml-0.5 text-[10px] text-zinc-500">{count}</span>}
        </span>
      ))}
    </div>
  );
}
