import { Camera, Mic, Paperclip, Smile } from "lucide-react";
import { Theme } from "@/lib/validation/schemas";

export function ChatComposer({ theme }: { theme: Theme }) {
  const dark = theme.mode === "dark";
  return (
    <div
      className="flex shrink-0 items-center gap-2 px-2.5 py-2"
      style={{ background: dark ? "#0b141a" : "#f0f2f5" }}
    >
      <div
        className="flex flex-1 items-center gap-2 rounded-full px-2.5 py-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]"
        style={{ background: dark ? "#1f2c34" : "#ffffff" }}
      >
        <button type="button" aria-label="Emoji" className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 dark:text-zinc-300">
          <Smile className="h-5 w-5" />
        </button>

        <span className="flex-1 select-none text-[14px] text-zinc-500 dark:text-zinc-300/80">Message</span>

        <button type="button" aria-label="Attach" className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 dark:text-zinc-300">
          <Paperclip className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Camera" className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 dark:text-zinc-300">
          <Camera className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        aria-label="Send voice note"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-[1.02]"
        style={{ background: theme.accentColor }}
      >
        <Mic className="h-5 w-5" />
      </button>
    </div>
  );
}
