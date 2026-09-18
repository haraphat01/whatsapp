import { NextResponse } from "next/server";
import { generationRequestSchema } from "@/lib/ai/generationRequest";
import { generateConversation, GenerationValidationError } from "@/lib/ai/generation";
import { AiProviderError } from "@/lib/ai/providers";

// Long "custom" message counts generate in sequential batches (see
// lib/ai/generation.ts) that can take several minutes end to end. Vercel
// Functions default to a 300s budget on all plans (Fluid Compute) — use the
// full window; lib/ai/generation.ts's own time-budget guard stops starting
// new batches well before this fires, so a huge request degrades to "as many
// messages as fit" instead of the whole route getting killed mid-response.
export const maxDuration = 300;

// Simple in-memory rate limiter (per server instance). Good enough for a
// single-instance local/demo deployment; swap for a durable store (Upstash,
// Vercel KV/Redis) behind real authentication in production.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many generation requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = generationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Your conversation setup is incomplete or invalid.",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 422 }
    );
  }

  try {
    const conversation = await generateConversation(parsed.data);
    return NextResponse.json({ conversation });
  } catch (err) {
    if (err instanceof GenerationValidationError) {
      console.error(
        "[ai/generate] AI output failed schema validation twice",
        JSON.stringify(err.issues, null, 2)
      );
      return NextResponse.json(
        { error: "The AI produced an invalid conversation. Please try generating again." },
        { status: 502 }
      );
    }
    if (err instanceof AiProviderError) {
      console.error(`[ai/generate] provider error (${err.kind})`, err.message);
      const status = err.kind === "rate_limit" ? 429 : err.kind === "timeout" ? 504 : 502;
      const messages: Record<string, string> = {
        timeout: "The AI took too long to respond. Please try again.",
        rate_limit: "The AI provider is rate-limiting requests. Please wait a moment and retry.",
        invalid_response: "The AI returned an unreadable response. Please try again.",
        unknown: "AI generation failed. Please try again.",
      };
      return NextResponse.json({ error: messages[err.kind] }, { status });
    }
    console.error("[ai/generate] unexpected error", err);
    return NextResponse.json(
      { error: "Something went wrong generating your conversation." },
      { status: 500 }
    );
  }
}
