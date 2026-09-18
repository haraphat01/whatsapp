"use client";

import { LengthPreset, MAX_CUSTOM_MESSAGE_COUNT, BATCH_SIZE } from "@/lib/ai/generationRequest";
import { useWizardStore } from "@/stores/useWizardStore";
import { Input, Label } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const PRESETS: { value: LengthPreset; label: string; desc: string }[] = [
  { value: "short", label: "Short", desc: "~14 messages" },
  { value: "medium", label: "Medium", desc: "~32 messages" },
  { value: "long", label: "Long", desc: "~60 messages" },
  { value: "custom", label: "Custom", desc: "Choose exact count" },
];

export function LengthStep() {
  const { lengthPreset, setLengthPreset, customMessageCount, setCustomMessageCount } = useWizardStore();

  function setClamped(value: number) {
    if (Number.isNaN(value)) return;
    setCustomMessageCount(Math.min(MAX_CUSTOM_MESSAGE_COUNT, Math.max(4, Math.round(value))));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setLengthPreset(p.value)}
            className={cn(
              "rounded-xl border p-3.5 text-left transition-colors",
              lengthPreset === p.value ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 hover:border-zinc-300"
            )}
          >
            <p className="text-sm font-medium text-zinc-900">{p.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{p.desc}</p>
          </button>
        ))}
      </div>

      {lengthPreset === "custom" && (
        <div>
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs">Number of messages</Label>
            <Input
              type="number"
              min={4}
              max={MAX_CUSTOM_MESSAGE_COUNT}
              value={customMessageCount}
              onChange={(e) => setClamped(Number(e.target.value))}
              className="h-8 w-24 text-right text-sm"
            />
          </div>
          <Slider
            className="mt-2"
            min={4}
            max={MAX_CUSTOM_MESSAGE_COUNT}
            step={1}
            value={customMessageCount}
            onChange={(e) => setClamped(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-zinc-400">
            Up to {MAX_CUSTOM_MESSAGE_COUNT.toLocaleString()} messages. Conversations over {BATCH_SIZE} messages
            generate in batches and take longer.
          </p>
        </div>
      )}
    </div>
  );
}
