import { Play } from "lucide-react";

export function VoiceNote({
  durationSec,
  waveform,
  outgoing,
  accentColor,
}: {
  durationSec: number;
  waveform: number[];
  outgoing: boolean;
  accentColor: string;
}) {
  const bars = waveform.length > 0 ? waveform : Array.from({ length: 28 }, () => 0.4);
  const mins = Math.floor(durationSec / 60);
  const secs = Math.floor(durationSec % 60);

  return (
    <div className="flex items-center gap-2 min-w-[190px] py-1">
      <button
        type="button"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: outgoing ? "#0b8a5f" : accentColor }}
      >
        <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
      </button>
      <div className="flex flex-1 items-center gap-[2px] h-6">
        {bars.map((v, i) => (
          <span
            key={i}
            className="w-[2.5px] rounded-full"
            style={{
              height: `${Math.max(15, v * 100)}%`,
              background: outgoing ? "rgba(255,255,255,0.5)" : "#8696a0",
            }}
          />
        ))}
      </div>
      <span className="text-[11px] opacity-70 flex-shrink-0">
        {mins}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}
