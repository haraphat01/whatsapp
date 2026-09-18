import { GenerationRequest, messageCountForRequest, spanDaysForRequest } from "./generationRequest";

const LANGUAGE_GUIDANCE: Record<string, string> = {
  english: "Standard natural English.",
  nigerian_english:
    "Nigerian English: natural word choices and rhythm typical of educated Nigerian speakers (e.g. 'I dey come', 'abeg' used sparingly, 'sha', 'sef'). Keep it readable and never a caricature.",
  nigerian_pidgin:
    "Nigerian Pidgin English. Write it the way real people text casually, not exaggerated or mocking. Keep grammar consistent with natural pidgin usage.",
  yoruba_influenced:
    "English lightly influenced by Yoruba speech patterns and the occasional Yoruba word/interjection (e.g. 'abi', 'sha', 'ehen'), used naturally and sparingly — never a caricature.",
  custom: "Follow the custom language instructions given below precisely.",
};

const TIMING_GUIDANCE: Record<string, string> = {
  realistic:
    "Vary the gap between messages naturally: quick back-and-forth replies (5-40s) during active exchanges, longer pauses (1-20 minutes, occasionally hours) when someone would realistically be busy, thinking, or asleep.",
  fast: "Keep gaps short throughout (5-60 seconds) to simulate an intense, fast-paced exchange.",
  slow: "Use longer, more spaced-out gaps (several minutes to a few hours) to simulate a relaxed, low-frequency conversation.",
  custom: "Use your best judgement for natural, non-repetitive timing gaps.",
};

export function buildSystemPrompt(): string {
  return `You are a professional dialogue writer for ChatFrame AI, a tool that generates FICTIONAL, SIMULATED text-message conversations for storytelling, content creation, and demos.

Rules:
- Every conversation you write is clearly fictional/simulated and does not depict real people.
- Write like real humans text: vary message length, use natural imperfect grammar occasionally, avoid sounding like an AI assistant.
- Keep each participant's voice distinct and consistent with their personality and writing style across the whole conversation.
- Prefer short, punchy messages over long paragraphs, but include occasional longer messages when someone is explaining something.
- Use emojis naturally and sparingly — not in every message.
- Never break the fourth wall, never mention being an AI, never add disclaimers inside the dialogue.
- Maintain chronological and logical coherence across the entire conversation.
- Only reference participants by the exact names provided.
- Output must strictly match the provided JSON schema.`;
}

function buildContextBlock(req: GenerationRequest): string {
  const participantsBlock = req.participants
    .map((p, i) => {
      const bits = [
        `${i + 1}. ${p.name}${p.isMe ? " (this is the user's own persona)" : ""}`,
        p.role ? `role: ${p.role}` : null,
        p.personality ? `personality: ${p.personality}` : null,
        p.writingStyle ? `writing style: ${p.writingStyle}` : null,
        p.gender ? `gender presentation: ${p.gender}` : null,
        p.description ? `notes: ${p.description}` : null,
      ].filter(Boolean);
      return bits.join(" | ");
    })
    .join("\n");

  const toneLine =
    req.tone === "custom" && req.customTone
      ? `Custom tone: ${req.customTone}`
      : `Tone: ${req.tone}`;

  const languageLine = `Language/dialect: ${LANGUAGE_GUIDANCE[req.language] ?? req.language}${
    req.customLanguageInstructions ? `\nAdditional language instructions: ${req.customLanguageInstructions}` : ""
  }`;

  const timingLine = `Timing style: ${TIMING_GUIDANCE[req.timingStyle] ?? req.timingStyle}`;

  const spanDays = spanDaysForRequest(req);
  const spanLine =
    spanDays > 0
      ? `This conversation spans a long period: from ${req.startDate} to ${req.endDate} (about ${spanDays} days). Do NOT keep every message on the same day — use "daysAfterPrevious" to jump forward to later conversation sessions spread naturally across that entire period (e.g. a few messages one day, then a gap of days/weeks/months, then another session, and so on until reaching close to the end date). Within a session, keep "daysAfterPrevious" at 0 and use "secondsAfterPrevious" for the normal in-session gaps.`
      : `This conversation happens in a single session on ${req.startDate}. Leave "daysAfterPrevious" at 0 (or omit it) for every message.`;

  const callsLine = req.includeCalls
    ? `Include a few realistic phone/video call log entries where they fit the scenario, using type "call" with "callType" ("voice" or "video"), "callStatus" ("missed" or "received"), and "callDurationSec" when received. A call's "sender" is whoever placed it.`
    : `Do not include any "call" type messages.`;

  return `Conversation type: ${req.conversationType}${req.isGroup ? ` (group chat${req.groupName ? ` named "${req.groupName}"` : ""})` : " (one-on-one)"}

Participants:
${participantsBlock}

Scenario:
${req.scenario}

${req.additionalInstructions ? `Additional instructions: ${req.additionalInstructions}\n` : ""}${toneLine}
${languageLine}
${timingLine}
${spanLine}
${callsLine}`;
}

function fieldInstructions(indexNote: string): string {
  return `For each message set "secondsAfterPrevious" to a natural gap per the timing style above (the very first message can be 0), and "daysAfterPrevious" per the span instruction above. Occasionally set "replyToIndex" when a message is a direct reply to an earlier one${indexNote}. Occasionally set "reactionEmoji" + "reactionBy" when another participant would naturally react to a message instead of replying with words. Mostly use type "text"; sprinkle in at most a few "image", "voice", "location", "video", or "document" messages only where it fits the scenario naturally (use "caption"/"locationName"/"documentName"/"voiceDurationSec" accordingly).`;
}

export function buildUserPrompt(
  req: GenerationRequest,
  opts?: { targetCount?: number; isMultiPart?: boolean }
): string {
  const messageCount = opts?.targetCount ?? messageCountForRequest(req);
  const context = buildContextBlock(req);

  const lengthLine = opts?.isMultiPart
    ? `Write exactly ${messageCount} messages for this FIRST part of a much longer conversation — more parts continue directly after this one, so do NOT wrap up, say goodbye, or bring the conversation to a close yet. Distribute messages across participants realistically for the scenario — in a group chat not everyone needs to speak equally.`
    : `Write approximately ${messageCount} messages total (between ${Math.max(4, messageCount - 4)} and ${messageCount + 6}). Distribute messages across participants realistically for the scenario — in a group chat not everyone needs to speak equally.`;

  return `${context}

${lengthLine}

${fieldInstructions("")}`;
}

/** Prompt for batch 2+ of a long conversation: gives the model a short tail of
 * what was already written (so voice/tone/thread continue naturally) without
 * resending the whole conversation so far. */
export function buildContinuationPrompt(
  req: GenerationRequest,
  opts: { priorTail: string; targetCount: number; alreadyWritten: number; totalTarget: number; isFinalPart: boolean }
): string {
  const context = buildContextBlock(req);
  const closing = opts.isFinalPart
    ? `This is the FINAL part — after these ${opts.targetCount} messages the conversation is complete, so it's fine (not required) to bring it to a natural close if that fits.`
    : `This is NOT the final part — more will continue directly after this one, so do NOT wrap up, say goodbye, or bring the conversation to a close.`;

  return `${context}

You are continuing an ALREADY IN-PROGRESS conversation. ${opts.alreadyWritten} of ${opts.totalTarget} total messages have already been written. Here are the most recent messages for context — do not repeat, rewrite, or reintroduce anything from them:
${opts.priorTail}

Continue naturally and consistently from exactly where that leaves off — same voices, same tone, same scenario. Write exactly ${opts.targetCount} NEW messages that pick up directly after the context above. ${closing}

${fieldInstructions(
  " (index refers only to messages you are writing in THIS response — do not reference the earlier conversation shown above, it is not part of this batch)"
)}`;
}
