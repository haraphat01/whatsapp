import { z } from "zod";
import {
  conversationTypeSchema,
  languageSchema,
  participantSchema,
  toneSchema,
} from "@/lib/validation/schemas";

export const lengthPresetSchema = z.enum(["short", "medium", "long", "custom"]);
export type LengthPreset = z.infer<typeof lengthPresetSchema>;

/** Messages requested per AI call before lib/ai/generation.ts switches to
 * sequential batching. Shared with the client so the UI can warn when a
 * request will take multiple batches (and therefore longer) to generate.
 * Each message has ~14 schema fields, so this is sized to reliably fit under
 * a single response's output-token budget (see estimateMaxTokens in
 * lib/ai/generation.ts) rather than the largest count a model could ever
 * produce — a batch that runs long enough to get cut off fails outright. */
export const BATCH_SIZE = 40;

/** Upper bound for a "custom" message count. Requests longer than BATCH_SIZE
 * are generated as sequential batches stitched into one continuous
 * conversation, so this ceiling is a sanity bound rather than a single-call
 * limit. */
export const MAX_CUSTOM_MESSAGE_COUNT = 5000;

export const generationRequestSchema = z.object({
  conversationType: conversationTypeSchema,
  participants: z
    .array(
      participantSchema.pick({
        id: true,
        name: true,
        role: true,
        personality: true,
        writingStyle: true,
        gender: true,
        description: true,
        isMe: true,
      })
    )
    .min(2)
    .max(20),
  scenario: z.string().min(1).max(2000),
  additionalInstructions: z.string().max(1000).optional(),
  tone: toneSchema,
  customTone: z.string().max(200).optional(),
  language: languageSchema,
  customLanguageInstructions: z.string().max(500).optional(),
  lengthPreset: lengthPresetSchema,
  customMessageCount: z.number().int().min(4).max(MAX_CUSTOM_MESSAGE_COUNT).optional(),
  startDate: z.string(),
  startTime: z.string(),
  /** Optional — when later than startDate, the conversation is spread across
   * this whole range (days/months/years) instead of a single session. */
  endDate: z.string().optional(),
  timezone: z.string(),
  timingStyle: z.enum(["realistic", "fast", "slow", "custom"]),
  isGroup: z.boolean().default(false),
  groupName: z.string().optional(),
  includeCalls: z.boolean().default(false),
});
export type GenerationRequest = z.infer<typeof generationRequestSchema>;

/** Whole days spanned between startDate and endDate (0 if endDate is unset or not after startDate). */
export function spanDaysForRequest(req: GenerationRequest): number {
  if (!req.endDate) return 0;
  const start = new Date(`${req.startDate}T00:00:00`).getTime();
  const end = new Date(`${req.endDate}T00:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 86_400_000);
}

export function messageCountForRequest(req: GenerationRequest): number {
  switch (req.lengthPreset) {
    case "short":
      return 14;
    case "medium":
      return 32;
    case "long":
      return 60;
    case "custom":
      return req.customMessageCount ?? 30;
  }
}
