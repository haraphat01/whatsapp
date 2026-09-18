import "server-only";
import { z } from "zod";
import { aiConversationSchema, type AiConversationOutput, type AiMessage } from "./schemas";
import { buildSystemPrompt, buildUserPrompt, buildContinuationPrompt } from "./prompts";
import { requestStructuredConversation, AiProviderError } from "./providers";
import { BATCH_SIZE, GenerationRequest, messageCountForRequest, spanDaysForRequest } from "./generationRequest";
import { Conversation, Message, Participant, conversationSchema } from "@/lib/validation/schemas";
import { generateId } from "@/lib/utils";

/** Stop starting new batches once this much wall-clock time has elapsed, so a
 * very large custom count degrades to "as many messages as fit" instead of
 * risking the whole request getting killed by the route's maxDuration with
 * nothing to show for it. Keep well under app/api/ai/generate/route.ts's
 * `maxDuration` (300s) to leave room for the final response to serialize. */
const GENERATION_TIME_BUDGET_MS = 260_000;

/** Safety cap on batch count, independent of the time budget, in case the
 * model repeatedly returns far fewer messages than requested. */
const MAX_BATCHES = 60;

/** Output-token budget for a batch of `count` messages. Each message in the
 * AI schema has ~14 fields (mostly null), so overhead alone runs well past a
 * typical ~4096-token provider default — this scales with the batch instead
 * of relying on that default, capped conservatively under DeepSeek's ~8192
 * output ceiling (the more constrained of the two supported providers). */
function estimateMaxTokens(count: number): number {
  return Math.min(8000, Math.max(2000, count * 140 + 1000));
}

export class GenerationValidationError extends Error {
  constructor(message: string, public readonly issues: z.ZodIssue[]) {
    super(message);
    this.name = "GenerationValidationError";
  }
}

function parseAiJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new AiProviderError("Model returned malformed JSON.", "invalid_response");
  }
}

async function generateRawConversation(
  systemPrompt: string,
  userPrompt: string,
  maxOutputTokens: number
): Promise<AiConversationOutput> {
  const first = await requestStructuredConversation(systemPrompt, userPrompt, { maxOutputTokens });
  const firstParsed = parseAiJson(first);
  const firstResult = aiConversationSchema.safeParse(firstParsed);
  if (firstResult.success) return firstResult.data;

  // Structured repair attempt: hand the error back to the model once.
  const repaired = await requestStructuredConversation(systemPrompt, userPrompt, {
    repairOf: first,
    validationError: firstResult.error.issues.map((i) => i.message).join("; "),
    maxOutputTokens,
  });
  const repairedParsed = parseAiJson(repaired);
  const repairedResult = aiConversationSchema.safeParse(repairedParsed);
  if (repairedResult.success) return repairedResult.data;

  throw new GenerationValidationError(
    "AI output failed validation twice; refusing to send invalid data to the client.",
    repairedResult.error.issues
  );
}

function buildTimestamp(
  startDate: string,
  startTime: string,
  timezone: string,
  cumulativeSeconds: number
): string {
  // startDate: yyyy-mm-dd, startTime: HH:mm (24h). We treat the pair as a
  // naive local timestamp and store it as an ISO-like string; timezone is
  // retained on the conversation for display purposes.
  const base = new Date(`${startDate}T${startTime}:00`);
  const withOffset = new Date(base.getTime() + cumulativeSeconds * 1000);
  return withOffset.toISOString();
}

function pickStatus(index: number, total: number, senderIsMe: boolean): Message["status"] {
  if (!senderIsMe) return "none";
  if (index === total - 1) return "delivered";
  return "read";
}

export function mapAiOutputToConversation(
  ai: AiConversationOutput,
  request: GenerationRequest,
  participants: Participant[]
): Conversation {
  const byName = new Map(participants.map((p) => [p.name.toLowerCase().trim(), p]));
  const resolveSender = (name: string): Participant => {
    const found = byName.get(name.toLowerCase().trim());
    if (found) return found;
    // Fall back to a fuzzy contains match, then the first participant.
    const fuzzy = participants.find(
      (p) =>
        name.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(name.toLowerCase())
    );
    return fuzzy ?? participants[0];
  };

  // Soft safety clamp: if the model ignores the day-span instructions and
  // reports huge day jumps, don't let the conversation run wildly past the
  // requested end date (plus a small buffer).
  const spanDays = spanDaysForRequest(request);
  const maxCumulativeSeconds = spanDays > 0 ? (spanDays + 3) * 86_400 : Infinity;

  let cumulativeSeconds = 0;
  const idByIndex: string[] = [];
  const rawMessages: (Message | null)[] = ai.messages.map((m, index) => {
    const dayJumpSeconds = Math.max(0, m.daysAfterPrevious ?? 0) * 86_400;
    const withinDaySeconds = Math.max(0, m.secondsAfterPrevious ?? (index === 0 ? 0 : 25));
    cumulativeSeconds = Math.min(cumulativeSeconds + dayJumpSeconds + withinDaySeconds, maxCumulativeSeconds);
    const sender = resolveSender(m.sender);
    const id = generateId("m");
    idByIndex.push(id);
    const timestamp = buildTimestamp(
      request.startDate,
      request.startTime,
      request.timezone,
      cumulativeSeconds
    );
    const status = pickStatus(index, ai.messages.length, sender.isMe);
    // The model occasionally sets replyToIndex to a message's own index —
    // guard against a message quoting itself as well as out-of-range indices.
    const replyToId =
      typeof m.replyToIndex === "number" && m.replyToIndex !== index && idByIndex[m.replyToIndex]
        ? idByIndex[m.replyToIndex]
        : undefined;
    const reactions =
      m.reactionEmoji && m.reactionBy
        ? [{ emoji: m.reactionEmoji, participantId: resolveSender(m.reactionBy).id }]
        : [];

    const base = {
      id,
      senderId: sender.id,
      timestamp,
      status,
      replyToId,
      reactions,
    };

    switch (m.type) {
      case "image":
        return { ...base, type: "image" as const, mediaUrl: "", caption: m.caption ?? m.text };
      case "video":
        return { ...base, type: "video" as const, mediaUrl: "", caption: m.caption ?? m.text };
      case "voice":
        return {
          ...base,
          type: "voice" as const,
          durationSec: m.voiceDurationSec ?? 6,
          waveform: Array.from({ length: 32 }, () => Math.random() * 0.7 + 0.3),
        };
      case "call":
        return {
          ...base,
          type: "call" as const,
          callType: m.callType ?? "voice",
          callStatus: m.callStatus ?? "received",
          durationSec: m.callStatus === "missed" ? undefined : (m.callDurationSec ?? 45),
        };
      case "location":
        return { ...base, type: "location" as const, name: m.locationName ?? "Shared location" };
      case "document":
        return {
          ...base,
          type: "document" as const,
          fileName: m.documentName ?? "document.pdf",
          fileSize: 245_000,
          fileType: "pdf",
        };
      case "text":
      default: {
        const text = (m.text ?? "").trim();
        // The model occasionally emits a "text" message with no actual text
        // (more often near the end of a large batch) — drop it instead of
        // letting one empty string fail validation for the whole
        // conversation after everything else generated successfully.
        if (!text) return null;
        return { ...base, type: "text" as const, text };
      }
    }
  });

  const messages = rawMessages.filter((m): m is Message => m !== null);

  const conversation: Conversation = {
    id: generateId("conv"),
    title: ai.title,
    type: request.conversationType,
    tone: request.tone,
    language: request.language,
    timezone: request.timezone,
    timeFormat: "12h",
    participants,
    messages,
    scenario: request.scenario,
    isGroup: request.isGroup,
    groupName: request.groupName,
    groupAvatar: undefined,
  };

  return conversationSchema.parse(conversation);
}

/** Short, human-readable recap of the last few messages of a batch, handed to
 * the next batch's prompt so it can continue the same voices/thread without
 * re-sending the whole conversation so far. */
function tailSummary(messages: AiMessage[], count = 8): string {
  return messages
    .slice(-count)
    .map((m) => {
      switch (m.type) {
        case "image":
          return `${m.sender}: [sent an image${m.caption ? ` — "${m.caption}"` : ""}]`;
        case "video":
          return `${m.sender}: [sent a video${m.caption ? ` — "${m.caption}"` : ""}]`;
        case "voice":
          return `${m.sender}: [sent a voice note]`;
        case "location":
          return `${m.sender}: [shared a location${m.locationName ? ` — ${m.locationName}` : ""}]`;
        case "document":
          return `${m.sender}: [sent a document${m.documentName ? ` — ${m.documentName}` : ""}]`;
        case "call":
          return `${m.sender}: [placed a ${m.callType ?? "voice"} call]`;
        case "text":
        default:
          return `${m.sender}: ${m.text ?? ""}`;
      }
    })
    .join("\n");
}

async function generateBatchedConversation(
  systemPrompt: string,
  request: GenerationRequest,
  totalTarget: number
): Promise<AiConversationOutput> {
  const startedAt = Date.now();
  let title: string | undefined;
  let messages: AiMessage[] = [];
  let batchCount = 0;

  while (messages.length < totalTarget && batchCount < MAX_BATCHES) {
    const remaining = totalTarget - messages.length;
    const targetCount = Math.min(BATCH_SIZE, remaining);
    const isFirst = batchCount === 0;
    const isFinal = remaining <= BATCH_SIZE;

    const userPrompt = isFirst
      ? buildUserPrompt(request, { targetCount, isMultiPart: true })
      : buildContinuationPrompt(request, {
          priorTail: tailSummary(messages),
          targetCount,
          alreadyWritten: messages.length,
          totalTarget,
          isFinalPart: isFinal,
        });

    const batch = await generateRawConversation(systemPrompt, userPrompt, estimateMaxTokens(targetCount));
    if (isFirst) title = batch.title;

    const offset = messages.length;
    const reindexed = batch.messages.map((m) => ({
      ...m,
      replyToIndex:
        typeof m.replyToIndex === "number" && m.replyToIndex >= 0 && m.replyToIndex < batch.messages.length
          ? m.replyToIndex + offset
          : undefined,
    }));
    messages = messages.concat(reindexed);
    batchCount += 1;

    // No progress this round (model returned nothing) — stop instead of
    // looping forever asking for the same remaining count.
    if (batch.messages.length === 0) break;
    // Time-budget guard: return everything generated so far rather than risk
    // the whole request getting killed by the platform with nothing to show.
    if (messages.length < totalTarget && Date.now() - startedAt > GENERATION_TIME_BUDGET_MS) break;
  }

  return { title: title ?? "Conversation", messages };
}

export async function generateConversation(
  request: GenerationRequest
): Promise<Conversation> {
  const participants: Participant[] = request.participants.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: "",
    role: p.role,
    personality: p.personality,
    writingStyle: p.writingStyle,
    gender: p.gender,
    description: p.description,
    accentColor: "#25D366",
    isMe: p.isMe ?? false,
    online: true,
    showPhoneAsName: false,
  }));

  const systemPrompt = buildSystemPrompt();
  const totalTarget = messageCountForRequest(request);

  const ai =
    totalTarget <= BATCH_SIZE
      ? await generateRawConversation(systemPrompt, buildUserPrompt(request), estimateMaxTokens(totalTarget))
      : await generateBatchedConversation(systemPrompt, request, totalTarget);

  return mapAiOutputToConversation(ai, request, participants);
}
