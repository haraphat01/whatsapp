"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getProjectSnapshot, subscribeToProjects } from "@/lib/storage/projectStore";
import { seedDemoProjects } from "@/lib/seed/demoProjects";
import { usePlaybackStore } from "@/stores/usePlaybackStore";
import { stateAtTime } from "@/lib/timing/engine";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { PlaybackControls } from "@/components/preview/PlaybackControls";
import { Button } from "@/components/ui/button";

function findProject(id: string) {
  return getProjectSnapshot(id) ?? seedDemoProjects().find((p) => p.id === id) ?? null;
}

export default function PreviewPage() {
  const params = useParams<{ id: string }>();
  const project = useSyncExternalStore(subscribeToProjects, () => findProject(params.id), () => undefined);
  const { timeline, currentTimeMs, isPlaying, tick, load } = usePlaybackStore();
  const frameRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    const found = findProject(params.id);
    if (found) load(found.conversation, found.playbackSettings);
  }, [params.id, load]);

  useEffect(() => {
    function step(ts: number) {
      if (lastTsRef.current !== null) {
        tick(ts - lastTsRef.current);
      }
      lastTsRef.current = ts;
      frameRef.current = requestAnimationFrame(step);
    }
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(step);
    } else {
      lastTsRef.current = null;
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, tick]);

  if (project === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }
  if (project === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-medium text-zinc-700">Project not found</p>
        <Link href="/projects"><Button variant="outline">Back to projects</Button></Link>
      </div>
    );
  }
  if (!timeline) return null;

  const state = stateAtTime(timeline, currentTimeMs);
  const typingParticipant = project.conversation.participants.find((p) => state.typingParticipantIds.has(p.id));

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-100 px-4 py-8">
      <div className="mb-6 flex w-full max-w-sm items-center justify-between">
        <Link href={`/editor/${project.id}`} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
          <ArrowLeft className="h-4 w-4" /> Back to editor
        </Link>
        <span className="text-sm font-medium text-zinc-700">{project.name}</span>
      </div>

      <div className="h-[640px] w-[320px] flex-shrink-0">
        <ChatWindow
          conversation={project.conversation}
          theme={project.theme}
          exportSettings={project.exportSettings}
          visibleMessageIds={state.visibleMessageIds}
          typingParticipantIds={state.typingParticipantIds}
          typingLabel={typingParticipant ? "typing..." : null}
          statusOverrides={state.messageStatusOverrides}
          visibleReactionMessageIds={state.visibleReactionMessageIds}
          autoScroll
        />
      </div>

      <div className="mt-6 w-full max-w-sm">
        <PlaybackControls />
      </div>
    </div>
  );
}
