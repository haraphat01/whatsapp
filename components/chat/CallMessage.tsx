import { Phone, PhoneMissed, Video, VideoOff } from "lucide-react";
import { CallStatus, CallType } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function CallMessage({
  callType,
  callStatus,
  durationSec,
}: {
  callType: CallType;
  callStatus: CallStatus;
  durationSec?: number;
}) {
  const missed = callStatus === "missed";
  const Icon = missed ? (callType === "video" ? VideoOff : PhoneMissed) : callType === "video" ? Video : Phone;
  const label = callType === "video" ? "Video call" : "Voice call";

  return (
    <div className="flex min-w-[160px] items-center gap-2 py-0.5">
      <span
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
          missed ? "bg-red-500/10 text-red-500" : "bg-black/5 text-current opacity-80"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className={cn("text-[13.5px] leading-tight", missed && "text-red-500")}>
          {missed ? `Missed ${label.toLowerCase()}` : label}
        </p>
        {!missed && durationSec != null && (
          <p className="text-[11.5px] leading-tight opacity-60">{formatDuration(durationSec)}</p>
        )}
      </div>
    </div>
  );
}
