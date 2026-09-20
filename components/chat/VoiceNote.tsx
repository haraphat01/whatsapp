import { Play } from "lucide-react";
import { MessageStatus } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";
import { StatusTicks } from "./StatusTicks";

export function formatVoiceDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function VoiceNote({
  durationSec,
  waveform,
  outgoing,
  accentColor,
  timeLabel,
  status,
  timestampHidden,
  timestampColor,
}: {
  durationSec: number;
  waveform: number[];
  outgoing: boolean;
  accentColor: string;
  timeLabel: string;
  status: MessageStatus;
  timestampHidden: boolean;
  timestampColor: string;
}) {
  const bars = waveform.length > 0 ? waveform : Array.from({ length: 28 }, () => 0.4);

  return (
    <div className="min-w-[190px] py-1">
      <div className="flex items-center gap-2">
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
      </div>
      <div className={cn("mt-0.5 flex items-center justify-between pl-[44px]", timestampHidden && "opacity-0")}>
        <span className="text-[11px] opacity-70 flex-shrink-0">{formatVoiceDuration(durationSec)}</span>
        <span
          className="flex items-center gap-1 select-none text-[10.5px] leading-none flex-shrink-0"
          style={{ color: timestampColor }}
        >
          {timeLabel}
          {outgoing && <StatusTicks status={status} />}
        </span>
      </div>
    </div>
  );
}
