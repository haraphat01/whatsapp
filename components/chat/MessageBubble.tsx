import { Message, MessageStatus, Participant, Theme } from "@/lib/validation/schemas";
import { formatTimestamp } from "@/lib/timing/dateSeparators";
import { Avatar } from "./Avatar";
import { StatusTicks } from "./StatusTicks";
import { ReactionBadge } from "./Reaction";
import { ReplyPreview } from "./ReplyPreview";
import { VoiceNote } from "./VoiceNote";
import { MessageMedia } from "./MessageMedia";
import { CallMessage } from "./CallMessage";
import { BubbleTail } from "./BubbleTail";
import { cn, displayName } from "@/lib/utils";

export interface MessageBubbleProps {
  message: Message;
  sender: Participant;
  repliedMessage?: Message;
  repliedSender?: Participant;
  theme: Theme;
  timeFormat: "12h" | "24h";
  isGroupChat: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  statusOverride?: MessageStatus;
  showReaction: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const RADIUS_PRESETS: Record<Theme["bubbleStyle"], number> = {
  classic: 8,
  modern: 16,
  minimal: 4,
  rounded: 20,
};

export function MessageBubble({
  message,
  sender,
  repliedMessage,
  repliedSender,
  theme,
  timeFormat,
  isGroupChat,
  isFirstInGroup,
  isLastInGroup,
  statusOverride,
  showReaction,
  selected,
  onClick,
}: MessageBubbleProps) {
  const dark = theme.mode === "dark";
  const outgoing = sender.isMe;
  const radius = theme.bubbleRadius ?? RADIUS_PRESETS[theme.bubbleStyle];
  const status = statusOverride ?? message.status;
  const timestampHidden = theme.timestampStyle === "hidden";
  const timestampColor = dark ? "rgba(255,255,255,0.55)" : outgoing ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.4)";

  if (message.type === "system") {
    return (
      <div className="flex justify-center my-1.5">
        <span
          className="rounded-md px-3 py-1 text-[11.5px]"
          style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
        >
          {message.text}
        </span>
      </div>
    );
  }
  if (message.type === "date_separator" || message.type === "unread_divider") return null;

  const bubbleBg = outgoing
    ? dark
      ? "#005c4b"
      : "#d9fdd3"
    : dark
      ? "#1f2c34"
      : "#ffffff";
  const textColor = dark ? "#e9edef" : "#111b21";

  const showTail = theme.bubbleStyle === "classic" && isLastInGroup;

  const cornerStyle: React.CSSProperties = {
    borderRadius: radius,
    ...(outgoing
      ? isLastInGroup
        ? { borderBottomRightRadius: showTail ? 0 : Math.max(2, radius / 3) }
        : {}
      : isLastInGroup
        ? { borderBottomLeftRadius: showTail ? 0 : Math.max(2, radius / 3) }
        : {}),
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)",
  };

  return (
    <div
      className={cn("flex px-3", outgoing ? "justify-end" : "justify-start", isFirstInGroup ? "mt-2" : "mt-0.5")}
      onClick={onClick}
    >
      {!outgoing && isGroupChat && (
        <div className="mr-1.5 w-7 shrink-0 self-end">
          {isLastInGroup && <Avatar name={sender.name} src={sender.avatar} color={sender.accentColor} size={26} />}
        </div>
      )}

      <div
        className={cn(
          "relative flow-root max-w-[72%] cursor-pointer px-2.5 py-1.5 transition-shadow",
          selected && "ring-2 ring-offset-1 ring-blue-500"
        )}
        style={{ background: bubbleBg, color: textColor, fontSize: theme.fontSize, ...cornerStyle }}
      >
        {!outgoing && isGroupChat && isFirstInGroup && (
          <p className="mb-0.5 text-[12.5px] font-semibold" style={{ color: sender.accentColor }}>
            {displayName(sender)}
          </p>
        )}

        {repliedMessage && (
          <ReplyPreview repliedMessage={repliedMessage} sender={repliedSender} accentColor={sender.accentColor} />
        )}

        {(message.type === "image" || message.type === "video" || message.type === "document" || message.type === "location" || message.type === "contact") && (
          <MessageMedia message={message} />
        )}

        {message.type === "voice" && (
          <VoiceNote
            durationSec={message.durationSec}
            waveform={message.waveform}
            outgoing={outgoing}
            accentColor={sender.accentColor}
            timeLabel={formatTimestamp(message.timestamp, timeFormat)}
            status={status}
            timestampHidden={timestampHidden}
            timestampColor={timestampColor}
          />
        )}

        {message.type === "call" && (
          <CallMessage callType={message.callType} callStatus={message.callStatus} durationSec={message.durationSec} />
        )}

        {message.type === "text" && <p className="whitespace-pre-wrap break-words leading-snug tracking-[0.01em]">{message.text}</p>}
        {(message.type === "image" || message.type === "video") && message.caption && (
          <p className="mt-0.5 whitespace-pre-wrap break-words leading-snug tracking-[0.01em]">{message.caption}</p>
        )}

        {message.type !== "voice" && (
          <span
            className={cn(
              "float-right ml-2 mt-1 flex items-center gap-1 select-none text-[10.5px] leading-none",
              timestampHidden && "opacity-0"
            )}
            style={{ color: timestampColor }}
          >
            {formatTimestamp(message.timestamp, timeFormat)}
            {outgoing && <StatusTicks status={status} />}
          </span>
        )}

        {showReaction && <ReactionBadge reactions={message.reactions} outgoing={outgoing} />}
        {showTail && <BubbleTail outgoing={outgoing} color={bubbleBg} />}
      </div>
    </div>
  );
}
