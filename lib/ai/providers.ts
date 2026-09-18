import "server-only";
import OpenAI from "openai";
import { aiConversationJsonSchema } from "./schemas";

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly kind: "timeout" | "rate_limit" | "invalid_response" | "unknown"
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

type ProviderConfig = {
  name: "openai" | "deepseek";
  apiKey: string;
  baseURL?: string;
  model: string;
  /** DeepSeek's API supports json_object mode but not OpenAI's strict json_schema mode. */
  supportsJsonSchema: boolean;
};

function resolveProvider(): ProviderConfig {
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      name: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
      supportsJsonSchema: false,
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      name: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      supportsJsonSchema: true,
    };
  }
  throw new Error("No AI provider configured. Set OPENAI_API_KEY or DEEPSEEK_API_KEY.");
}

let cachedClient: OpenAI | null = null;
let cachedConfig: ProviderConfig | null = null;

function getClient(): { client: OpenAI; config: ProviderConfig } {
  const config = resolveProvider();
  if (!cachedClient || cachedConfig?.name !== config.name) {
    cachedClient = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });
    cachedConfig = config;
  }
  return { client: cachedClient, config };
}

const JSON_SCHEMA_HINT = `Respond with ONLY a single JSON object (no markdown, no commentary) matching exactly this shape:
{
  "title": string,
  "messages": [
    {
      "sender": string,
      "type": "text" | "image" | "voice" | "location" | "document" | "video",
      "text": string | null,
      "caption": string | null,
      "locationName": string | null,
      "documentName": string | null,
      "voiceDurationSec": number | null,
      "replyToIndex": number | null,
      "reactionEmoji": string | null,
      "reactionBy": string | null,
      "secondsAfterPrevious": number | null
    }
  ]
}`;

export async function requestStructuredConversation(
  systemPrompt: string,
  userPrompt: string,
  opts?: { repairOf?: string; validationError?: string; maxOutputTokens?: number }
): Promise<string> {
  const { client, config } = getClient();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: config.supportsJsonSchema ? systemPrompt : `${systemPrompt}\n\n${JSON_SCHEMA_HINT}`,
    },
    { role: "user", content: userPrompt },
  ];

  if (opts?.repairOf) {
    messages.push(
      { role: "assistant", content: opts.repairOf },
      {
        role: "user",
        content: `That output failed validation: ${opts.validationError}. Return corrected JSON that strictly matches the schema. Do not include commentary.`,
      }
    );
  }

  try {
    const response = await client.chat.completions.create(
      {
        model: config.model,
        messages,
        response_format: config.supportsJsonSchema
          ? { type: "json_schema", json_schema: aiConversationJsonSchema }
          : { type: "json_object" },
        temperature: 0.9,
        // Without an explicit cap, providers fall back to a default (often
        // ~4096) that's too small for a batch of structured messages — the
        // response gets cut off mid-JSON and fails to parse. Size this to
        // the batch actually being requested (lib/ai/generation.ts).
        max_tokens: opts?.maxOutputTokens,
      },
      { timeout: 60_000 }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AiProviderError("Empty response from model.", "invalid_response");
    }
    if (response.choices[0]?.finish_reason === "length") {
      throw new AiProviderError(
        "The AI response was cut off before finishing — the requested batch was too large.",
        "invalid_response"
      );
    }
    return content;
  } catch (err) {
    if (err instanceof AiProviderError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("timeout")) {
      throw new AiProviderError("The AI provider timed out.", "timeout");
    }
    if (message.toLowerCase().includes("rate limit") || message.includes("429")) {
      throw new AiProviderError("The AI provider rate-limited this request.", "rate_limit");
    }
    throw new AiProviderError(message, "unknown");
  }
}
