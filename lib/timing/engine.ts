import { Conversation, Message, PlaybackSettings } from "@/lib/validation/schemas";
import { computeDateSeparators } from "./dateSeparators";

export type TimelineEventType =
  | "date_separator"
  | "typing_start"
  | "typing_end"
  | "message_appear"
  | "status_sent"
  | "status_delivered"
  | "status_read"
  | "reaction_appear";

export interface TimelineEvent {
  atMs: number;
  type: TimelineEventType;
  messageId?: string;
  participantId?: string;
  label?: string;
}

export interface Timeline {
  events: TimelineEvent[];
  totalDurationMs: number;
  /** Convenience: message ids in the order they appear. */
  order: string[];
}

const TIMING_STYLE_MULTIPLIER: Record<PlaybackSettings["timingStyle"], number> = {
  realistic: 1,
  fast: 0.45,
  slow: 1.8,
  custom: 1,
};

function typingDurationForMessage(message: Message, base: number): number {
  if (message.typingDurationMs != null) return message.typingDurationMs;
  const length = message.type === "text" ? message.text.length : 40;
  return Math.min(4200, Math.max(700, base * (0.5 + length / 60)));
}

/**
 * Builds a single, canonical timeline of playback events for a conversation.
 * This is consumed by both the real-time preview player (setTimeout-driven)
 * and the Remotion video composition (frame-driven), so behavior between
 * "preview" and "export" never diverges.
 */
export function buildTimeline(
  conversation: Conversation,
  settings: PlaybackSettings
): Timeline {
  const multiplier = TIMING_STYLE_MULTIPLIER[settings.timingStyle] / Math.max(0.25, settings.speed);
  const events: TimelineEvent[] = [];
  const order: string[] = [];
  const participantsById = new Map(conversation.participants.map((p) => [p.id, p]));
  const separators = computeDateSeparators(conversation.messages);

  let cursor = 0;

  conversation.messages.forEach((message, index) => {
    const separatorLabel = separators.get(message.id);
    if (separatorLabel) {
      events.push({ atMs: cursor, type: "date_separator", messageId: message.id, label: separatorLabel });
      cursor += 500 * multiplier;
    }

    const sender = participantsById.get(message.senderId);
    const gapMs =
      (message.timingOverrideMs ?? settings.baseMessageDelayMs) * multiplier * (index === 0 ? 0.3 : 1);
    cursor += gapMs;

    if (sender && !sender.isMe && message.type !== "system" && message.type !== "call") {
      const typingMs = typingDurationForMessage(message, settings.typingDelayMs) * multiplier;
      events.push({ atMs: cursor, type: "typing_start", participantId: sender.id });
      cursor += typingMs;
      events.push({ atMs: cursor, type: "typing_end", participantId: sender.id });
    }

    events.push({ atMs: cursor, type: "message_appear", messageId: message.id });
    order.push(message.id);

    if (sender?.isMe && settings.animateStatusTicks) {
      events.push({ atMs: cursor + 250, type: "status_sent", messageId: message.id });
      events.push({ atMs: cursor + 250 + settings.readDelayMs * 0.4 * multiplier, type: "status_delivered", messageId: message.id });
      if (message.status === "read") {
        events.push({
          atMs: cursor + 250 + settings.readDelayMs * multiplier,
          type: "status_read",
          messageId: message.id,
        });
      }
    }

    if (message.reactions.length > 0) {
      events.push({ atMs: cursor + 600 * multiplier, type: "reaction_appear", messageId: message.id });
    }
  });

  cursor += 400;

  return { events: events.sort((a, b) => a.atMs - b.atMs), totalDurationMs: cursor, order };
}

/** Returns the subset of state visible at a given point in playback time. */
export interface TimelineState {
  visibleMessageIds: Set<string>;
  typingParticipantIds: Set<string>;
  messageStatusOverrides: Map<string, Message["status"]>;
  visibleReactionMessageIds: Set<string>;
  visibleSeparators: Map<string, string>;
}

export function stateAtTime(timeline: Timeline, atMs: number): TimelineState {
  const visibleMessageIds = new Set<string>();
  const typingParticipantIds = new Set<string>();
  const messageStatusOverrides = new Map<string, Message["status"]>();
  const visibleReactionMessageIds = new Set<string>();
  const visibleSeparators = new Map<string, string>();

  for (const event of timeline.events) {
    if (event.atMs > atMs) break;
    switch (event.type) {
      case "date_separator":
        if (event.messageId && event.label) visibleSeparators.set(event.messageId, event.label);
        break;
      case "typing_start":
        if (event.participantId) typingParticipantIds.add(event.participantId);
        break;
      case "typing_end":
        if (event.participantId) typingParticipantIds.delete(event.participantId);
        break;
      case "message_appear":
        if (event.messageId) visibleMessageIds.add(event.messageId);
        break;
      case "status_sent":
        if (event.messageId) messageStatusOverrides.set(event.messageId, "sent");
        break;
      case "status_delivered":
        if (event.messageId) messageStatusOverrides.set(event.messageId, "delivered");
        break;
      case "status_read":
        if (event.messageId) messageStatusOverrides.set(event.messageId, "read");
        break;
      case "reaction_appear":
        if (event.messageId) visibleReactionMessageIds.add(event.messageId);
        break;
    }
  }

  return {
    visibleMessageIds,
    typingParticipantIds,
    messageStatusOverrides,
    visibleReactionMessageIds,
    visibleSeparators,
  };
}
