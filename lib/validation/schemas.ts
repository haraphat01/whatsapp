import { z } from "zod";

/**
 * Canonical ChatFrame conversation data model.
 * This is the single source of truth consumed by the editor, preview,
 * screenshot exporter, and Remotion video renderer.
 */

export const conversationTypeSchema = z.enum([
  "romantic",
  "friends",
  "workplace",
  "family",
  "school",
  "funny",
  "argument",
  "business",
  "group",
  "story",
  "custom",
]);
export type ConversationType = z.infer<typeof conversationTypeSchema>;

export const toneSchema = z.enum([
  "romantic",
  "flirty",
  "casual",
  "friendly",
  "professional",
  "formal",
  "funny",
  "sarcastic",
  "emotional",
  "angry",
  "apologetic",
  "persuasive",
  "dramatic",
  "serious",
  "playful",
  "custom",
]);
export type Tone = z.infer<typeof toneSchema>;

export const languageSchema = z.enum([
  "english",
  "nigerian_english",
  "nigerian_pidgin",
  "yoruba_influenced",
  "custom",
]);
export type Language = z.infer<typeof languageSchema>;

export const messageStatusSchema = z.enum([
  "sending",
  "sent",
  "delivered",
  "read",
  "failed",
  "none",
]);
export type MessageStatus = z.infer<typeof messageStatusSchema>;

export const participantSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  avatar: z.string().default(""),
  username: z.string().optional(),
  role: z.string().optional(),
  personality: z.string().optional(),
  writingStyle: z.string().optional(),
  gender: z.string().optional(),
  description: z.string().optional(),
  accentColor: z.string().default("#25D366"),
  isMe: z.boolean().default(false),
  online: z.boolean().default(false),
  lastSeen: z.string().optional(),
  phone: z.string().optional(),
  /** Shows `phone` instead of `name` wherever this participant is displayed —
   * mirrors real WhatsApp's behavior for a contact who isn't saved. */
  showPhoneAsName: z.boolean().default(false),
});
export type Participant = z.infer<typeof participantSchema>;

export const reactionSchema = z.object({
  emoji: z.string(),
  participantId: z.string(),
});
export type Reaction = z.infer<typeof reactionSchema>;

export const linkPreviewSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  domain: z.string().optional(),
});
export type LinkPreview = z.infer<typeof linkPreviewSchema>;

const messageBase = {
  id: z.string(),
  senderId: z.string(),
  timestamp: z.string(),
  status: messageStatusSchema.default("read"),
  replyToId: z.string().optional(),
  reactions: z.array(reactionSchema).default([]),
  timingOverrideMs: z.number().int().nonnegative().optional(),
  typingDurationMs: z.number().int().nonnegative().optional(),
};

export const textMessageSchema = z.object({
  ...messageBase,
  type: z.literal("text"),
  text: z.string().min(1).max(4000),
  linkPreview: linkPreviewSchema.optional(),
});

export const imageMessageSchema = z.object({
  ...messageBase,
  type: z.literal("image"),
  mediaUrl: z.string(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const videoMessageSchema = z.object({
  ...messageBase,
  type: z.literal("video"),
  mediaUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  caption: z.string().optional(),
  durationSec: z.number().optional(),
});

export const voiceMessageSchema = z.object({
  ...messageBase,
  type: z.literal("voice"),
  durationSec: z.number().default(4),
  waveform: z.array(z.number()).default([]),
});

export const documentMessageSchema = z.object({
  ...messageBase,
  type: z.literal("document"),
  fileName: z.string(),
  fileSize: z.number().default(0),
  fileType: z.string().default("pdf"),
});

export const locationMessageSchema = z.object({
  ...messageBase,
  type: z.literal("location"),
  name: z.string(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const contactMessageSchema = z.object({
  ...messageBase,
  type: z.literal("contact"),
  name: z.string(),
  phone: z.string().optional(),
});

export const systemMessageSchema = z.object({
  ...messageBase,
  type: z.literal("system"),
  text: z.string(),
});

export const callTypeSchema = z.enum(["voice", "video"]);
export type CallType = z.infer<typeof callTypeSchema>;

export const callStatusSchema = z.enum(["missed", "received"]);
export type CallStatus = z.infer<typeof callStatusSchema>;

export const callMessageSchema = z.object({
  ...messageBase,
  type: z.literal("call"),
  callType: callTypeSchema,
  callStatus: callStatusSchema,
  /** Only meaningful when callStatus is "received". */
  durationSec: z.number().optional(),
});

export const dateSeparatorMessageSchema = z.object({
  ...messageBase,
  type: z.literal("date_separator"),
  label: z.string(),
});

export const unreadDividerMessageSchema = z.object({
  ...messageBase,
  type: z.literal("unread_divider"),
});

export const messageSchema = z.discriminatedUnion("type", [
  textMessageSchema,
  imageMessageSchema,
  videoMessageSchema,
  voiceMessageSchema,
  documentMessageSchema,
  locationMessageSchema,
  contactMessageSchema,
  systemMessageSchema,
  callMessageSchema,
  dateSeparatorMessageSchema,
  unreadDividerMessageSchema,
]);
export type Message = z.infer<typeof messageSchema>;
export type MessageType = Message["type"];

export const bubbleStyleSchema = z.enum(["classic", "modern", "minimal", "rounded"]);
export const wallpaperSchema = z.enum([
  "classic",
  "minimal",
  "dark",
  "warm",
  "professional",
  "custom",
]);

export const themeSchema = z.object({
  mode: z.enum(["light", "dark", "system"]).default("light"),
  bubbleStyle: bubbleStyleSchema.default("classic"),
  wallpaper: wallpaperSchema.default("classic"),
  wallpaperCustomUrl: z.string().optional(),
  accentColor: z.string().default("#25D366"),
  fontSize: z.number().min(12).max(20).default(14.5),
  fontFamily: z.string().default("system"),
  bubbleRadius: z.number().min(0).max(24).default(8),
  headerStyle: z.enum(["classic", "minimal", "gradient"]).default("classic"),
  timestampStyle: z.enum(["inline", "hidden", "hover"]).default("inline"),
  statusIconStyle: z.enum(["classic", "minimal"]).default("classic"),
});
export type Theme = z.infer<typeof themeSchema>;

export const timingStyleSchema = z.enum(["realistic", "fast", "slow", "custom"]);

export const playbackSettingsSchema = z.object({
  timingStyle: timingStyleSchema.default("realistic"),
  baseMessageDelayMs: z.number().default(1800),
  typingDelayMs: z.number().default(1400),
  readDelayMs: z.number().default(900),
  scrollDurationMs: z.number().default(400),
  speed: z.number().default(1),
  autoScroll: z.boolean().default(true),
  animateStatusTicks: z.boolean().default(true),
});
export type PlaybackSettings = z.infer<typeof playbackSettingsSchema>;

export const deviceFrameSchema = z.enum(["none", "modern", "android", "ios"]);
export type DeviceFrame = z.infer<typeof deviceFrameSchema>;
export const simulationLabelPositionSchema = z.enum(["top", "bottom", "watermark", "hidden"]);
export type SimulationLabelPosition = z.infer<typeof simulationLabelPositionSchema>;

export const exportSettingsSchema = z.object({
  // "none" renders edge-to-edge with just the status bar, matching an actual
  // phone screenshot/recording. The bezel/notch mockups are opt-in for people
  // who specifically want a marketing-style "phone in hand" graphic.
  deviceFrame: deviceFrameSchema.default("none"),
  showStatusBar: z.boolean().default(true),
  statusBarTime: z.string().default("9:41"),
  statusBarBattery: z.number().min(0).max(100).default(85),
  showSignal: z.boolean().default(true),
  showWifi: z.boolean().default(true),
  simulationLabel: simulationLabelPositionSchema.default("hidden"),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  resolution: z.enum(["720p", "1080p", "1440p", "2160p"]).default("1080p"),
  frameRate: z.union([z.literal(30), z.literal(60)]).default(30),
  videoMode: z.enum(["live-playback", "scrolling", "finalized"]).default("finalized"),
  format: z.enum(["png", "jpeg", "mp4", "webm"]).default("mp4"),
  screenshotMode: z.enum(["viewport", "full", "custom"]).default("full"),
});
export type ExportSettings = z.infer<typeof exportSettingsSchema>;

export const conversationSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120),
  type: conversationTypeSchema.default("custom"),
  tone: toneSchema.default("casual"),
  language: languageSchema.default("english"),
  timezone: z.string().default("UTC"),
  timeFormat: z.enum(["12h", "24h"]).default("12h"),
  participants: z.array(participantSchema).min(2).max(20),
  messages: z.array(messageSchema),
  scenario: z.string().optional(),
  isGroup: z.boolean().default(false),
  groupName: z.string().optional(),
  groupAvatar: z.string().optional(),
});
export type Conversation = z.infer<typeof conversationSchema>;

export const projectSchema = z.object({
  id: z.string(),
  userId: z.string().default("local"),
  name: z.string(),
  description: z.string().optional(),
  conversation: conversationSchema,
  theme: themeSchema,
  playbackSettings: playbackSettingsSchema,
  exportSettings: exportSettingsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

export function createDefaultTheme(): Theme {
  return themeSchema.parse({});
}
export function createDefaultPlaybackSettings(): PlaybackSettings {
  return playbackSettingsSchema.parse({});
}
export function createDefaultExportSettings(): ExportSettings {
  return exportSettingsSchema.parse({});
}
