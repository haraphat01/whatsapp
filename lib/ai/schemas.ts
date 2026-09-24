import { z } from "zod";

/**
 * Schema for the raw structured output we ask the AI model to produce.
 * This is intentionally simpler than the canonical `Conversation` model
 * (lib/validation/schemas.ts) — it references senders by name instead of
 * id, and indices instead of message ids. `lib/ai/generation.ts` maps this
 * into the canonical model (assigning real ids, timestamps, and refs) so
 * invalid or partial AI output never reaches the frontend directly.
 */

// Some providers (e.g. DeepSeek's json_object mode, vs. OpenAI's strict
// json_schema mode) emit explicit `null` for absent optional fields instead
// of omitting them. Accept either and normalize to `undefined`.
const nullableString = z
  .string()
  .nullable()
  .optional()
  .transform((v) => v ?? undefined);
const nullableNumber = (schema: z.ZodNumber) =>
  schema
    .nullable()
    .optional()
    .transform((v) => v ?? undefined);

export const aiMessageSchema = z.object({
  sender: z.string().describe("Exact participant name sending this message"),
  type: z
    .enum(["text", "image", "voice", "call", "location", "document", "video"])
    .default("text"),
  text: nullableString.describe("Message text content, required for type 'text'"),
  caption: nullableString.describe("Caption for image/video/document messages"),
  locationName: nullableString,
  documentName: nullableString,
  voiceDurationSec: nullableNumber(z.number()),
  callType: z
    .enum(["voice", "video"])
    .nullable()
    .optional()
    .transform((v) => v ?? undefined)
    .describe("Required for type 'call': whether it was a voice or video call"),
  callStatus: z
    .enum(["missed", "received", "outgoing"])
    .nullable()
    .optional()
    .transform((v) => v ?? undefined)
    .describe("Required for type 'call': whether the call was missed, received (answered incoming call) or outgoing (answered call the sender placed)"),
  callDurationSec: nullableNumber(z.number()).describe(
    "For type 'call' with status 'received' or 'outgoing': how long the call lasted"
  ),
  replyToIndex: nullableNumber(z.number().int()).describe(
    "Zero-based index of an earlier message this replies to"
  ),
  reactionEmoji: nullableString.describe("A single emoji another participant reacts with, if natural"),
  reactionBy: nullableString.describe("Name of the participant giving the reaction"),
  daysAfterPrevious: nullableNumber(z.number().min(0).max(2000)).describe(
    "Whole days after the previous message before this one occurs — use this to jump to a later conversation session/day/month/year. 0 means the same day."
  ),
  secondsAfterPrevious: nullableNumber(z.number().min(0).max(86400))
    .describe("Natural gap in seconds within the same session/day since the previous message"),
});
export type AiMessage = z.infer<typeof aiMessageSchema>;

export const aiConversationSchema = z.object({
  title: z.string().min(1).max(80),
  messages: z.array(aiMessageSchema).min(1).max(200),
});
export type AiConversationOutput = z.infer<typeof aiConversationSchema>;

/** JSON Schema handed to the OpenAI Structured Outputs API. */
export const aiConversationJsonSchema = {
  name: "conversation",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      messages: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            sender: { type: "string" },
            type: {
              type: "string",
              enum: ["text", "image", "voice", "call", "location", "document", "video"],
            },
            text: { type: ["string", "null"] },
            caption: { type: ["string", "null"] },
            locationName: { type: ["string", "null"] },
            documentName: { type: ["string", "null"] },
            voiceDurationSec: { type: ["number", "null"] },
            callType: { type: ["string", "null"], enum: ["voice", "video", null] },
            callStatus: { type: ["string", "null"], enum: ["missed", "received", "outgoing", null] },
            callDurationSec: { type: ["number", "null"] },
            replyToIndex: { type: ["integer", "null"] },
            reactionEmoji: { type: ["string", "null"] },
            reactionBy: { type: ["string", "null"] },
            daysAfterPrevious: { type: ["number", "null"] },
            secondsAfterPrevious: { type: ["number", "null"] },
          },
          required: [
            "sender",
            "type",
            "text",
            "caption",
            "locationName",
            "documentName",
            "voiceDurationSec",
            "callType",
            "callStatus",
            "callDurationSec",
            "replyToIndex",
            "reactionEmoji",
            "reactionBy",
            "daysAfterPrevious",
            "secondsAfterPrevious",
          ],
        },
      },
    },
    required: ["title", "messages"],
  },
} as const;
