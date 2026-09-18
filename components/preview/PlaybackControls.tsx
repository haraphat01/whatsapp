"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { usePlaybackStore } from "@/stores/usePlaybackStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 1, 1.5, 2];

export function PlaybackControls() {
  const { timeline, currentTimeMs, isPlaying, speed, toggle, restart, seek, setSpeed } = usePlaybackStore();
  if (!timeline) return null;

  const messageEvents = timeline.events.filter((e) => e.type === "message_appear");

  function jump(direction: -1 | 1) {
    const currentIndex = messageEvents.findIndex((e) => e.atMs > currentTimeMs);
    if (direction === 1) {
      const target = currentIndex === -1 ? timeline!.totalDurationMs : messageEvents[currentIndex].atMs;
      seek(target + 1);
    } else {
      const priorEvents = messageEvents.filter((e) => e.atMs < currentTimeMs - 50);
      seek(priorEvents.length > 0 ? priorEvents[priorEvents.length - 1].atMs : 0);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <Slider
        min={0}
        max={timeline.totalDurationMs}
        value={currentTimeMs}
        onChange={(e) => seek(Number(e.target.value))}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium",
                speed === s ? "bg-emerald-100 text-emerald-700" : "text-zinc-400 hover:text-zinc-700"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => jump(-1)} aria-label="Previous message">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => jump(1)} aria-label="Next message">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        <Button size="icon" variant="ghost" onClick={restart} aria-label="Restart">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
