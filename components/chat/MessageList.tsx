"use client";

import { useEffect, useRef } from "react";
import { Conversation, MessageStatus } from "@/lib/validation/schemas";
import { computeDateSeparators } from "@/lib/timing/dateSeparators";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator, UnreadDivider } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { wallpaperStyle } from "./wallpapers";
import { Theme } from "@/lib/validation/schemas";

const GROUP_WINDOW_MS = 3 * 60_000;

export interface MessageListProps {
  conversation: Conversation;
  theme: Theme;
  visibleMessageIds?: Set<string> | null;
  typingParticipantIds?: Set<string>;
  statusOverrides?: Map<string, MessageStatus>;
  visibleReactionMessageIds?: Set<string> | null;
  selectedMessageId?: string | null;
  onSelectMessage?: (id: string) => void;
  autoScroll?: boolean;
  /** "smooth" for live interactive playback, "instant" for frame-by-frame renders (Remotion). */
  scrollBehavior?: "smooth" | "instant";
  /** 0..1 progress for deterministic scroll-driven recording modes. */
  scrollProgress?: number;
  unreadBeforeMessageId?: string | null;
  className?: string;
}

export function MessageList({
  conversation,
  theme,
  visibleMessageIds = null,
  typingParticipantIds,
  statusOverrides,
  visibleReactionMessageIds = null,
  selectedMessageId,
  onSelectMessage,
  autoScroll = true,
  scrollBehavior = "smooth",
  scrollProgress,
  unreadBeforeMessageId,
  className,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const participantsById = new Map(conversation.participants.map((p) => [p.id, p]));
  const messagesById = new Map(conversation.messages.map((m) => [m.id, m]));
  const separators = computeDateSeparators(conversation.messages);

  const visible = conversation.messages.filter(
    (m) => visibleMessageIds === null || visibleMessageIds.has(m.id)
  );

  useEffect(() => {
    if (!containerRef.current) return;

    if (typeof scrollProgress === "number") {
      const maxScroll = Math.max(0, containerRef.current.scrollHeight - containerRef.current.clientHeight);
      const target = maxScroll * Math.min(1, Math.max(0, scrollProgress));
      containerRef.current.scrollTo({
        top: target,
        behavior: scrollBehavior === "instant" ? "auto" : "smooth",
      });
      return;
    }

    if (!autoScroll) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: scrollBehavior === "instant" ? "auto" : "smooth",
    });
  }, [visible.length, typingParticipantIds?.size, autoScroll, scrollBehavior, scrollProgress]);

  return (
    <div
      ref={containerRef}
      className={`chatframe-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-2 ${className ?? ""}`}
      style={wallpaperStyle(theme)}
    >
      {visible.map((message, index) => {
        const sender = participantsById.get(message.senderId);
        if (!sender) return null;
        const prev = visible[index - 1];
        const prevSender = prev ? participantsById.get(prev.senderId) : undefined;
        const next = visible[index + 1];
        const nextSender = next ? participantsById.get(next.senderId) : undefined;

        const withinPrevWindow =
          !!prev &&
          prevSender?.id === sender.id &&
          new Date(message.timestamp).getTime() - new Date(prev.timestamp).getTime() < GROUP_WINDOW_MS &&
          !separators.has(message.id);
        const withinNextWindow =
          !!next &&
          nextSender?.id === sender.id &&
          new Date(next.timestamp).getTime() - new Date(message.timestamp).getTime() < GROUP_WINDOW_MS &&
          !separators.has(next.id);

        const repliedMessage = message.replyToId ? messagesById.get(message.replyToId) : undefined;
        const repliedSender = repliedMessage ? participantsById.get(repliedMessage.senderId) : undefined;

        return (
          <div key={message.id}>
            {separators.has(message.id) && <DateSeparator label={separators.get(message.id)!} dark={theme.mode === "dark"} />}
            {unreadBeforeMessageId === message.id && <UnreadDivider dark={theme.mode === "dark"} />}
            <MessageBubble
              message={message}
              sender={sender}
              repliedMessage={repliedMessage}
              repliedSender={repliedSender}
              theme={theme}
              timeFormat={conversation.timeFormat}
              isGroupChat={conversation.isGroup}
              isFirstInGroup={!withinPrevWindow}
              isLastInGroup={!withinNextWindow}
              statusOverride={statusOverrides?.get(message.id)}
              showReaction={visibleReactionMessageIds === null || visibleReactionMessageIds.has(message.id)}
              selected={selectedMessageId === message.id}
              onClick={onSelectMessage ? () => onSelectMessage(message.id) : undefined}
            />
          </div>
        );
      })}

      {typingParticipantIds &&
        Array.from(typingParticipantIds).map((id) => {
          const participant = participantsById.get(id);
          if (!participant) return null;
          return (
            <div key={id} className="px-3 mt-1">
              <TypingIndicator name={participant.name} avatar={participant.avatar} color={participant.accentColor} dark={theme.mode === "dark"} />
            </div>
          );
        })}
    </div>
  );
}
