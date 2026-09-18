import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import { videoExportPayloadSchema } from "@/lib/rendering/exportPayload";

export const maxDuration = 300;

let cachedBundleUrl: string | null = null;

async function getBundle(): Promise<string> {
  if (cachedBundleUrl) return cachedBundleUrl;
  const { bundle } = await import("@remotion/bundler");
  const { enableTailwind } = await import("@remotion/tailwind-v4");
  const entry = path.join(process.cwd(), "remotion", "index.ts");
  cachedBundleUrl = await bundle({
    entryPoint: entry,
    webpackOverride: (config) => {
      const withTailwind = enableTailwind(config);
      return {
        ...withTailwind,
        resolve: {
          ...withTailwind.resolve,
          alias: {
            ...(withTailwind.resolve?.alias ?? {}),
            "@": process.cwd(),
          },
        },
      };
    },
  });
  return cachedBundleUrl;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = videoExportPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid export settings.", issues: parsed.error.issues }, { status: 422 });
  }

  const { conversation, theme, exportSettings, playbackSettings } = parsed.data;
  if (exportSettings.format !== "mp4" && exportSettings.format !== "webm") {
    return NextResponse.json({ error: "Format must be mp4 or webm for video export." }, { status: 422 });
  }
  if (conversation.messages.length === 0) {
    return NextResponse.json({ error: "Conversation has no messages to render." }, { status: 422 });
  }

  const outputPath = path.join(os.tmpdir(), `chatframe-video-${Date.now()}.${exportSettings.format}`);
  const inputProps = { conversation, theme, playbackSettings, exportSettings };

  try {
    const { selectComposition, renderMedia } = await import("@remotion/renderer");
    const serveUrl = await getBundle();

    const composition = await selectComposition({ serveUrl, id: "ChatVideo", inputProps });

    await renderMedia({
      composition,
      serveUrl,
      codec: exportSettings.format === "mp4" ? "h264" : "vp8",
      outputLocation: outputPath,
      inputProps,
    });

    const buffer = await fs.readFile(outputPath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": exportSettings.format === "mp4" ? "video/mp4" : "video/webm",
        "Content-Disposition": `attachment; filename="chatframe-export.${exportSettings.format}"`,
      },
    });
  } catch (err) {
    console.error("[export/video] failed", err);
    return NextResponse.json({ error: "Video rendering failed. Please try again." }, { status: 500 });
  } finally {
    await fs.unlink(outputPath).catch(() => {});
  }
}
