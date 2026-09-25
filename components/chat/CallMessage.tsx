import { PhoneIncoming, PhoneOutgoing, type LucideProps } from "lucide-react";
import { CallStatus, CallType } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

export function formatCallDuration(totalSeconds: number): string {
  const totalMins = Math.max(1, Math.round(totalSeconds / 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

/** Video camera with a direction arrow drawn inside the camera body, matching the phone-with-arrow call icons. */
function VideoCallIcon({ direction, className }: { direction: "incoming" | "outgoing"; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
      {direction === "incoming" ? (
        <>
          <path d="m12 9.5-5 5" />
          <path d="M7 10.5v4h4" />
        </>
      ) : (
        <>
          <path d="m6.5 14.5 5-5" />
          <path d="M7.5 9.5h4v4" />
        </>
      )}
    </svg>
  );
}

function CallIcon({ callType, direction, ...props }: LucideProps & { callType: CallType; direction: "incoming" | "outgoing" }) {
  if (callType === "video") return <VideoCallIcon direction={direction} className={props.className} />;
  return direction === "incoming" ? <PhoneIncoming {...props} /> : <PhoneOutgoing {...props} />;
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
  // Missed and received calls both came in; only calls the sender placed point outward.
  const direction = callStatus === "outgoing" ? "outgoing" : "incoming";
  const label = callType === "video" ? "Video call" : "Voice call";

  return (
    <div className="flex min-w-[160px] items-center gap-2 py-0.5">
      <span
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
          missed ? "bg-red-500/10 text-red-500" : "bg-black/5 text-current opacity-80"
        )}
      >
        <CallIcon callType={callType} direction={direction} className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[13.5px] leading-tight">
          {missed ? `Missed ${label.toLowerCase()}` : label}
        </p>
        {missed ? (
          <p className="text-[11.5px] leading-tight opacity-60">Tap to call back</p>
        ) : (
          durationSec != null && (
            <p className="text-[11.5px] leading-tight opacity-60">{formatCallDuration(durationSec)}</p>
          )
        )}
      </div>
    </div>
  );
}
