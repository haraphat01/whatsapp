"use client";

import { Conversation, ExportSettings, MessageStatus, Theme } from "@/lib/validation/schemas";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatComposer } from "./ChatComposer";
import { DeviceStatusBar } from "./StatusBar";
import { SimulationLabel } from "./SimulationLabel";
import { PhoneFrame } from "./PhoneFrame";
import { cn } from "@/lib/utils";

export interface ChatWindowProps {
  conversation: Conversation;
  theme: Theme;
  exportSettings?: ExportSettings;
  visibleMessageIds?: Set<string> | null;
  typingParticipantIds?: Set<string>;
  typingLabel?: string | null;
  statusOverrides?: Map<string, MessageStatus>;
  visibleReactionMessageIds?: Set<string> | null;
  selectedMessageId?: string | null;
  onSelectMessage?: (id: string) => void;
  showComposer?: boolean;
  showDeviceFrame?: boolean;
  showSimulationLabel?: boolean;
  autoScroll?: boolean;
  scrollBehavior?: "smooth" | "instant";
  /** Renders the entire message history in normal document flow (no fixed-height
   * scroll clipping or device frame) so a full-page screenshot captures every message. */
  fullConversation?: boolean;
  className?: string;
}

/**
 * Single source of truth for rendering a ChatFrame conversation. The editor,
 * live preview player, screenshot exporter, and Remotion video composition
 * all render through this component (or MessageList directly, for Remotion
 * frame-by-frame control) so visual changes never diverge between contexts.
 */
export function ChatWindow({
  conversation,
  theme,
  exportSettings,
  visibleMessageIds,
  typingParticipantIds,
  typingLabel,
  statusOverrides,
  visibleReactionMessageIds,
  selectedMessageId,
  onSelectMessage,
  showComposer = true,
  showDeviceFrame = true,
  showSimulationLabel = false,
  autoScroll = true,
  scrollBehavior = "smooth",
  fullConversation = false,
  className,
}: ChatWindowProps) {
  const dark = theme.mode === "dark";

  const body = (
    <div
      className={cn(
        "flex w-full flex-col",
        fullConversation ? "h-auto" : "h-full",
        dark ? "bg-[#0b141a]" : "bg-[#e5ddd5]"
      )}
    >
      {exportSettings?.showStatusBar && <DeviceStatusBar settings={exportSettings} timeFormat={conversation.timeFormat} dark={showDeviceFrame} />}
      <ChatHeader conversation={conversation} theme={theme} typingLabel={typingLabel} />
      <MessageList
        conversation={conversation}
        theme={theme}
        visibleMessageIds={visibleMessageIds}
        typingParticipantIds={typingParticipantIds}
        statusOverrides={statusOverrides}
        visibleReactionMessageIds={visibleReactionMessageIds}
        selectedMessageId={selectedMessageId}
        onSelectMessage={onSelectMessage}
        autoScroll={autoScroll}
        scrollBehavior={scrollBehavior}
        className={fullConversation ? "!flex-none !overflow-visible" : undefined}
      />
      {showComposer && <ChatComposer theme={theme} />}
    </div>
  );

  return (
    <div
      className={cn(
        "relative w-full",
        theme.fontFamily === "system" && "chatframe-native-font",
        fullConversation ? "h-auto" : "h-full",
        className
      )}
      style={theme.fontFamily !== "system" ? { fontFamily: theme.fontFamily } : undefined}
    >
      {showDeviceFrame && exportSettings && !fullConversation ? (
        <PhoneFrame frame={exportSettings.deviceFrame}>{body}</PhoneFrame>
      ) : (
        body
      )}
      {showSimulationLabel && exportSettings && <SimulationLabel position={exportSettings.simulationLabel} />}
    </div>
  );
}
