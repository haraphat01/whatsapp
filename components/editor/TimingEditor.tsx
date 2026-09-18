"use client";

import { useProjectEditorStore } from "@/stores/useProjectEditorStore";
import { Label } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const TIMING_STYLES = ["realistic", "fast", "slow", "custom"] as const;

export function TimingEditor() {
  const { project, setPlaybackSettings } = useProjectEditorStore();
  if (!project) return null;
  const { playbackSettings } = project;

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs">Timing style</Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {TIMING_STYLES.map((t) => (
            <button
              key={t}
              onClick={() => setPlaybackSettings({ timingStyle: t })}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-xs capitalize",
                playbackSettings.timingStyle === t ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-600"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">Base message delay: {(playbackSettings.baseMessageDelayMs / 1000).toFixed(1)}s</Label>
        <Slider
          className="mt-1.5"
          min={200}
          max={6000}
          step={100}
          value={playbackSettings.baseMessageDelayMs}
          onChange={(e) => setPlaybackSettings({ baseMessageDelayMs: Number(e.target.value) })}
        />
      </div>

      <div>
        <Label className="text-xs">Typing indicator duration: {(playbackSettings.typingDelayMs / 1000).toFixed(1)}s</Label>
        <Slider
          className="mt-1.5"
          min={200}
          max={5000}
          step={100}
          value={playbackSettings.typingDelayMs}
          onChange={(e) => setPlaybackSettings({ typingDelayMs: Number(e.target.value) })}
        />
      </div>

      <div>
        <Label className="text-xs">Read receipt delay: {(playbackSettings.readDelayMs / 1000).toFixed(1)}s</Label>
        <Slider
          className="mt-1.5"
          min={0}
          max={4000}
          step={100}
          value={playbackSettings.readDelayMs}
          onChange={(e) => setPlaybackSettings({ readDelayMs: Number(e.target.value) })}
        />
      </div>

      <label className="flex items-center justify-between text-xs text-zinc-600">
        Animate status ticks
        <Switch
          checked={playbackSettings.animateStatusTicks}
          onCheckedChange={(v) => setPlaybackSettings({ animateStatusTicks: v })}
        />
      </label>
      <label className="flex items-center justify-between text-xs text-zinc-600">
        Auto-scroll during playback
        <Switch checked={playbackSettings.autoScroll} onCheckedChange={(v) => setPlaybackSettings({ autoScroll: v })} />
      </label>
    </div>
  );
}
