import { NextResponse } from "next/server";
import { exportPayloadSchema, dimensionsFor } from "@/lib/rendering/exportPayload";
import { writeRenderPayload, deleteRenderPayload } from "@/lib/rendering/tempStore";

export const maxDuration = 60;

function originFromRequest(req: Request): string {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? url.host;
  const protocol = forwardedProto ?? url.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = exportPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid export settings.", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { exportSettings } = parsed.data;
  if (exportSettings.format !== "png" && exportSettings.format !== "jpeg") {
    return NextResponse.json({ error: "Format must be png or jpeg for screenshot export." }, { status: 422 });
  }

  let renderId: string | null = null;
  try {
    renderId = await writeRenderPayload(parsed.data);

    // Lazy import: keeps Playwright (a devDependency-sized native browser
    // binary) out of the route's cold-start path unless actually invoked.
    const { chromium } = await import("playwright");
    // Docker containers commonly run as root with no user namespace, under
    // which Chromium's setuid sandbox refuses to start.
    const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    try {
      const { width, height } = dimensionsFor(exportSettings.resolution, exportSettings.aspectRatio);
      // Cap viewport size (real device pixel ratios cover the "4K" case)
      const viewport = { width: Math.min(width, 900), height: Math.min(height, 1600) };
      const deviceScaleFactor = Math.min(4, Math.max(1, width / viewport.width));

      const page = await browser.newPage({ viewport, deviceScaleFactor });
      const origin = originFromRequest(req);
      await page.goto(`${origin}/render/${renderId}`, { waitUntil: "networkidle" });
      await page.waitForSelector("#render-ready", { state: "attached", timeout: 15_000 });

      const isFull = exportSettings.screenshotMode === "full";
      const buffer = isFull
        ? await page.screenshot({
            fullPage: true,
            type: exportSettings.format,
            quality: exportSettings.format === "jpeg" ? 92 : undefined,
          })
        : await page.locator("#render-root").screenshot({
            type: exportSettings.format,
            quality: exportSettings.format === "jpeg" ? 92 : undefined,
          });

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": exportSettings.format === "png" ? "image/png" : "image/jpeg",
          "Content-Disposition": `attachment; filename="chatframe-export.${exportSettings.format}"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error("[export/screenshot] failed", err);
    return NextResponse.json(
      { error: "Screenshot rendering failed. Please try again." },
      { status: 500 }
    );
  } finally {
    if (renderId) await deleteRenderPayload(renderId);
  }
}
