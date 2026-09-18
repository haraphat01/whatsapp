import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { z } from "zod";
import { conversationSchema, exportSettingsSchema, playbackSettingsSchema, themeSchema } from "@/lib/validation/schemas";
import { buildTimeline, stateAtTime } from "@/lib/timing/engine";
import { dimensionsFor } from "@/lib/rendering/exportPayload";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { DeviceStatusBar } from "@/components/chat/StatusBar";
import { SimulationLabel } from "@/components/chat/SimulationLabel";
import { PhoneFrame } from "@/components/chat/PhoneFrame";

export const chatVideoPropsSchema = z.object({
  conversation: conversationSchema,
  theme: themeSchema,
  playbackSettings: playbackSettingsSchema,
  exportSettings: exportSettingsSchema,
});
export type ChatVideoProps = z.infer<typeof chatVideoPropsSchema>;

export function calculateChatVideoMetadata({ props }: { props: ChatVideoProps }) {
  const timeline = buildTimeline(props.conversation, props.playbackSettings);
  const fps = props.exportSettings.frameRate;
  const durationInFrames = Math.max(30, Math.ceil((timeline.totalDurationMs / 1000) * fps));
  const { width, height } = dimensionsFor(props.exportSettings.resolution, props.exportSettings.aspectRatio);
  return { durationInFrames, fps, width, height };
}

export function ChatVideo({ conversation, theme, playbackSettings, exportSettings }: ChatVideoProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const atMs = (frame / fps) * 1000;

  const timeline = buildTimeline(conversation, playbackSettings);
  const liveState = stateAtTime(timeline, atMs);
  const dark = theme.mode === "dark";
  const typingParticipant = conversation.participants.find((p) => liveState.typingParticipantIds.has(p.id));

  const finalVisibleIds = new Set(conversation.messages.map((message) => message.id));
  const finalReactionIds = new Set(
    conversation.messages.filter((message) => message.reactions.length > 0).map((message) => message.id)
  );

  const videoMode = exportSettings.videoMode ?? "live-playback";
  const isLivePlayback = videoMode === "live-playback";
  const isScrollingMode = videoMode === "scrolling";
  const isFinalizedMode = videoMode === "finalized";

  const state = isLivePlayback
    ? liveState
    : {
        visibleMessageIds: finalVisibleIds,
        typingParticipantIds: new Set<string>(),
        messageStatusOverrides: new Map<string, typeof conversation.messages[number]["status"]>(),
        visibleReactionMessageIds: finalReactionIds,
        visibleSeparators: new Map<string, string>(),
      };

  const scrollProgress = isFinalizedMode
    ? 1
    : isScrollingMode
      ? Math.min(1, Math.max(0, atMs / Math.max(1000, timeline.totalDurationMs)))
      : undefined;

  const body = (
    <AbsoluteFill className={dark ? "bg-[#0b141a]" : "bg-[#e5ddd5]"} style={{ display: "flex", flexDirection: "column" }}>
      {exportSettings.showStatusBar && <DeviceStatusBar settings={exportSettings} dark={exportSettings.deviceFrame !== "none"} />}
      <ChatHeader conversation={conversation} theme={theme} typingLabel={typingParticipant ? "typing..." : null} />
      <MessageList
        conversation={conversation}
        theme={theme}
        visibleMessageIds={state.visibleMessageIds}
        typingParticipantIds={isLivePlayback ? state.typingParticipantIds : undefined}
        statusOverrides={isLivePlayback ? state.messageStatusOverrides : undefined}
        visibleReactionMessageIds={state.visibleReactionMessageIds}
        autoScroll={!isLivePlayback && !isScrollingMode}
        scrollBehavior={isScrollingMode ? "smooth" : "instant"}
        scrollProgress={scrollProgress}
        className="overflow-hidden"
      />
      <ChatComposer theme={theme} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill className="bg-white">
      <div className="relative h-full w-full">
        {exportSettings.deviceFrame !== "none" ? <PhoneFrame frame={exportSettings.deviceFrame}>{body}</PhoneFrame> : body}
        <SimulationLabel position={exportSettings.simulationLabel} />
      </div>
    </AbsoluteFill>
  );
}
