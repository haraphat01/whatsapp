import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Conversation, Theme } from "@/lib/validation/schemas";
import { Avatar } from "./Avatar";
import { cn, displayName, looksLikePhoneNumber } from "@/lib/utils";

export function ChatHeader({
  conversation,
  theme,
  typingLabel,
}: {
  conversation: Conversation;
  theme: Theme;
  typingLabel?: string | null;
}) {
  const dark = theme.mode === "dark";
  const other = conversation.participants.find((p) => !p.isMe);
  const phoneTitle = !conversation.isGroup && (looksLikePhoneNumber(other?.phone) || looksLikePhoneNumber(other?.name));
  const showingPhone = !conversation.isGroup && (!!other?.showPhoneAsName && !!other?.phone?.trim() || phoneTitle);
  const title = conversation.isGroup
    ? conversation.groupName || conversation.title
    : (other && displayName(other)) || conversation.title;
  const subtitle =
    typingLabel ??
    (conversation.isGroup
      ? `${conversation.participants.length} participants`
      : other?.online
        ? "online"
        : other?.lastSeen
          ? `last seen ${other.lastSeen}`
          : "tap for contact info");

  // "minimal" mirrors current WhatsApp: a white header with dark text/icons in
  // light mode (dark mode already looks the same across styles in the real app).
  const isMinimalLight = theme.headerStyle === "minimal" && !dark;
  const light = isMinimalLight
    ? {
        text: "text-[#111b21]",
        subtitle: "text-[#667781]",
        subtitleTyping: "text-emerald-600",
        icon: "text-[#54656f]",
      }
    : {
        text: "text-white",
        subtitle: "text-white/70",
        subtitleTyping: "text-emerald-200",
        icon: "text-white/90",
      };

  return (
    <div
      className={cn(
        "flex h-[64px] shrink-0 items-center px-3 py-2",
        showingPhone ? "gap-1.5" : "gap-3",
        dark ? "bg-[#1f2c34]" : isMinimalLight ? "bg-white" : "bg-[#075E54]",
        light.text
      )}
      style={theme.headerStyle === "gradient" ? { background: `linear-gradient(135deg, ${theme.accentColor}, #075E54)` } : undefined}
    >
      <button
        type="button"
        aria-label="Back"
        className={cn("flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80", light.icon)}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
      </button>

      <Avatar
        name={conversation.isGroup ? title : other?.name || title}
        src={conversation.isGroup ? conversation.groupAvatar : other?.avatar}
        color={other?.accentColor}
        size={36}
        generic={showingPhone}
      />

      <div className={cn("min-w-0 flex-1", !showingPhone && "overflow-hidden")}>
        <p
          className={cn(
            "font-semibold leading-tight",
            showingPhone
              ? "whitespace-nowrap text-[10.5px] tracking-[-0.02em] tabular-nums"
              : "truncate text-[15px]"
          )}
        >
          {title}
        </p>
        {!showingPhone && (
          <p className={cn("truncate text-[11.5px] leading-tight", typingLabel ? light.subtitleTyping : light.subtitle)}>
            {subtitle}
          </p>
        )}
      </div>

      <div className={cn("flex shrink-0 items-center pr-1", showingPhone ? "gap-1" : "gap-4", light.icon)}>
        <button
          type="button"
          aria-label="Video call"
          className={cn("flex items-center justify-center rounded-full hover:opacity-80", showingPhone ? "h-7 w-7" : "h-8 w-8")}
        >
          <Video className={showingPhone ? "h-[15px] w-[15px]" : "h-[18px] w-[18px]"} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="Voice call"
          className={cn("flex items-center justify-center rounded-full hover:opacity-80", showingPhone ? "h-7 w-7" : "h-8 w-8")}
        >
          <Phone className={showingPhone ? "h-[13px] w-[13px]" : "h-[16px] w-[16px]"} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="More options"
          className={cn("flex items-center justify-center rounded-full hover:opacity-80", showingPhone ? "h-7 w-7" : "h-8 w-8")}
        >
          <MoreVertical className={showingPhone ? "h-[15px] w-[15px]" : "h-[18px] w-[18px]"} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
