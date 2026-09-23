import { z } from "zod";

/**
 * Describes exactly what the editor preview is showing, so a "visible viewport"
 * screenshot reproduces that frame instead of the renderer's default scroll.
 * Scroll is anchored to a message (not a raw scrollTop) so small layout
 * differences between the user's browser and the server's Chromium — font
 * metrics, late-loading images — don't shift the captured frame.
 */
export const viewportAnchorSchema = z.object({
  /** CSS size of the preview; the renderer lays out at this size and scales up via device pixel ratio. */
  width: z.number().int().min(100).max(2000),
  height: z.number().int().min(100).max(3000),
  /** The preview was scrolled to the very bottom (the default auto-scrolled state). */
  atBottom: z.boolean(),
  /** First message at least partially visible at the top of the message list. */
  messageId: z.string().nullable(),
  /** That message's top edge relative to the list's top edge, in CSS px (negative when partially cut off). */
  offset: z.number(),
});
export type ViewportAnchor = z.infer<typeof viewportAnchorSchema>;

export const SCROLL_CONTAINER_SELECTOR = "[data-chatframe-scroll]";
export const MESSAGE_SELECTOR = "[data-message-id]";

/** Reads the current framing of a rendered ChatWindow. Runs in the editor. */
export function captureViewportAnchor(root: HTMLElement): ViewportAnchor | null {
  const container = root.querySelector<HTMLElement>(SCROLL_CONTAINER_SELECTOR);
  if (!container) return null;

  const containerTop = container.getBoundingClientRect().top;
  const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 2;

  let messageId: string | null = null;
  let offset = 0;
  for (const el of Array.from(container.querySelectorAll<HTMLElement>(MESSAGE_SELECTOR))) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom > containerTop) {
      messageId = el.dataset.messageId ?? null;
      offset = rect.top - containerTop;
      break;
    }
  }

  return { width: root.offsetWidth, height: root.offsetHeight, atBottom, messageId, offset };
}
