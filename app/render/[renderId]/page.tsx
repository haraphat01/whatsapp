import { notFound } from "next/navigation";
import { readRenderPayload } from "@/lib/rendering/tempStore";
import { exportPayloadSchema } from "@/lib/rendering/exportPayload";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const dynamic = "force-dynamic";

export default async function RenderPage({
  params,
}: {
  params: Promise<{ renderId: string }>;
}) {
  const { renderId } = await params;
  const raw = await readRenderPayload(renderId);
  if (!raw) notFound();

  const parsed = exportPayloadSchema.safeParse(raw);
  if (!parsed.success) notFound();

  const { conversation, theme, exportSettings, upToMessageId } = parsed.data;

  let visibleMessageIds: Set<string> | null = null;
  if (upToMessageId) {
    const index = conversation.messages.findIndex((m) => m.id === upToMessageId);
    visibleMessageIds = new Set(conversation.messages.slice(0, index + 1).map((m) => m.id));
  }

  const fullConversation = exportSettings.screenshotMode === "full";

  return (
    <div id="render-root" className={fullConversation ? "w-screen bg-white" : "h-screen w-screen bg-white"}>
      <ChatWindow
        conversation={conversation}
        theme={theme}
        exportSettings={exportSettings}
        visibleMessageIds={visibleMessageIds}
        showComposer
        showDeviceFrame={exportSettings.deviceFrame !== "none"}
        showSimulationLabel
        autoScroll={!fullConversation}
        scrollBehavior="instant"
        fullConversation={fullConversation}
      />
      <div id="render-ready" data-ready="true" style={{ display: "none" }} />
    </div>
  );
}
