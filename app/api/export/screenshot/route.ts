import { NextResponse } from "next/server";
import { exportPayloadSchema, dimensionsFor } from "@/lib/rendering/exportPayload";
import { renderOrigin } from "@/lib/rendering/origin";
import { writeRenderPayload, deleteRenderPayload } from "@/lib/rendering/tempStore";
import { MESSAGE_SELECTOR, SCROLL_CONTAINER_SELECTOR } from "@/lib/rendering/viewportAnchor";

export const maxDuration = 60;

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
    const browser = await chromium.launch({
      // Docker containers commonly run as root with no user namespace,
      // under which Chromium's setuid sandbox refuses to start.
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // Pin to the full browser downloaded by `playwright install chromium`.
      // Without this, Playwright launches the separate chrome-headless-shell
      // binary for a plain headless launch, which can end up missing even
      // when the install step reports success (see chromium-headless-shell
      // install in the Dockerfile — this is belt-and-suspenders on top of it).
      channel: "chromium",
    });
    try {
      const isFull = exportSettings.screenshotMode === "full";
      const anchor = isFull ? undefined : parsed.data.viewport;

      const { width, height } = dimensionsFor(exportSettings.resolution, exportSettings.aspectRatio);
      // A viewport screenshot lays out at the editor preview's exact CSS size so
      // text wrapping and framing match what the user saw; resolution comes
      // from the device pixel ratio instead of a larger layout.
      const viewport = anchor
        ? { width: anchor.width, height: anchor.height }
        : // Cap viewport size (real device pixel ratios cover the "4K" case)
          { width: Math.min(width, 900), height: Math.min(height, 1600) };
      const deviceScaleFactor = Math.min(8, Math.max(1, width / viewport.width));

      const page = await browser.newPage({ viewport, deviceScaleFactor });
      const origin = renderOrigin(req);
      await page.goto(`${origin}/render/${renderId}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#render-ready[data-ready]", { state: "attached", timeout: 15_000 });

      if (anchor) {
        // Let fonts and images settle first so they can't shift layout after
        // the scroll position is restored.
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(
            Array.from(document.images)
              .filter((img) => !img.complete)
              .map((img) => new Promise((resolve) => { img.onload = img.onerror = resolve; }))
          );
        });
        await page.evaluate(
          ({ anchor, containerSelector, messageSelector }) => {
            const container = document.querySelector<HTMLElement>(containerSelector);
            if (!container) return;
            if (anchor.atBottom || !anchor.messageId) {
              container.scrollTop = container.scrollHeight;
              return;
            }
            const target = Array.from(container.querySelectorAll<HTMLElement>(messageSelector)).find(
              (el) => el.dataset.messageId === anchor.messageId
            );
            if (!target) return;
            const delta = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
            container.scrollTop += delta - anchor.offset;
          },
          { anchor, containerSelector: SCROLL_CONTAINER_SELECTOR, messageSelector: MESSAGE_SELECTOR }
        );
      }

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
