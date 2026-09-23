import { z } from "zod";
import {
  conversationSchema,
  exportSettingsSchema,
  playbackSettingsSchema,
  themeSchema,
} from "@/lib/validation/schemas";
import { viewportAnchorSchema } from "./viewportAnchor";

/** Payload shared by the screenshot and video export endpoints. */
export const exportPayloadSchema = z.object({
  conversation: conversationSchema,
  theme: themeSchema,
  exportSettings: exportSettingsSchema,
  /** For screenshots: only render messages up to (and including) this id. Omit for the full conversation. */
  upToMessageId: z.string().optional(),
  /** For "viewport" screenshots: the editor preview's exact size and scroll position. */
  viewport: viewportAnchorSchema.optional(),
});
export type ExportPayload = z.infer<typeof exportPayloadSchema>;

/** Payload for video export, which additionally needs playback/timing settings. */
export const videoExportPayloadSchema = z.object({
  conversation: conversationSchema,
  theme: themeSchema,
  exportSettings: exportSettingsSchema,
  playbackSettings: playbackSettingsSchema,
});
export type VideoExportPayload = z.infer<typeof videoExportPayloadSchema>;

export const RESOLUTION_PX: Record<string, { width: number; height: number }> = {
  "720p": { width: 720, height: 1280 },
  "1080p": { width: 1080, height: 1920 },
  "1440p": { width: 1440, height: 2560 },
  "2160p": { width: 2160, height: 3840 },
};

export function dimensionsFor(
  resolution: keyof typeof RESOLUTION_PX,
  aspectRatio: "9:16" | "16:9" | "1:1"
): { width: number; height: number } {
  const base = RESOLUTION_PX[resolution];
  if (aspectRatio === "9:16") return base;
  if (aspectRatio === "1:1") return { width: base.width, height: base.width };
  // 16:9 — swap
  return { width: base.height, height: base.width };
}
