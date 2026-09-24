"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Label } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const TIMING_OPTIONS = [
  { value: "realistic", label: "Realistic", desc: "Natural, varied gaps between messages" },
  { value: "fast", label: "Fast", desc: "Quick, intense back-and-forth" },
  { value: "slow", label: "Slow", desc: "Relaxed, spaced-out exchange" },
  { value: "custom", label: "Custom", desc: "Let the AI use its best judgement" },
] as const;

const COMMON_TIMEZONES = [
  "UTC", "Africa/Lagos", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Dubai", "Asia/Kolkata",
];

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.round((end - start) / 86_400_000);
}

export function DateTimeStep() {
  const {
    startDate, startTime, endDate, timezone, timeFormat, setDateTime,
    timingStyle, setTimingStyle, includeCalls, setIncludeCalls,
  } = useWizardStore();

  const spanDays = daysBetween(startDate, endDate);

  function handleStartDateChange(value: string) {
    // Keep endDate valid if the user drags the start date past it.
    if (endDate < value) {
      setDateTime({ startDate: value, endDate: value });
    } else {
      setDateTime({ startDate: value });
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs">Start date</Label>
          <Input type="date" className="mt-1.5" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Start time</Label>
          <Input type="time" className="mt-1.5" value={startTime} onChange={(e) => setDateTime({ startTime: e.target.value })} />
        </div>
      </div>

      <div>
        <Label className="text-xs">End date (optional — spread the conversation across days, months, or years)</Label>
        <Input
          type="date"
          className="mt-1.5"
          min={startDate}
          value={endDate}
          onChange={(e) => setDateTime({ endDate: e.target.value })}
        />
        <p className="mt-1.5 text-xs text-zinc-400">
          {spanDays > 0
            ? `Messages will be spread naturally across ~${spanDays} day${spanDays === 1 ? "" : "s"}, from ${startDate} to ${endDate}, instead of a single sitting.`
            : "Same as start date — the whole conversation happens in one sitting."}
        </p>
      </div>

      <div>
        <Label className="text-xs">Timezone</Label>
        <Select className="mt-1.5" value={timezone} onChange={(e) => setDateTime({ timezone: e.target.value })}>
          {[...new Set([timezone, ...COMMON_TIMEZONES])].map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label className="text-xs">Time format</Label>
        <div className="mt-1.5 flex gap-2">
          {(["12h", "24h"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDateTime({ timeFormat: f })}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm",
                timeFormat === f ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-600"
              )}
            >
              {f === "12h" ? "12-hour (9:41 PM)" : "24-hour (21:41)"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Message timing style</Label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TIMING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimingStyle(opt.value)}
              className={cn(
                "rounded-xl border p-3.5 text-left transition-colors",
                timingStyle === opt.value ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <p className="text-sm font-medium text-zinc-900">{opt.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-zinc-200 p-3.5">
        <div>
          <p className="text-sm font-medium text-zinc-900">Include simulated calls</p>
          <p className="text-xs text-zinc-500 mt-0.5">Occasionally add missed, received and outgoing voice/video call log entries where they fit.</p>
        </div>
        <Switch checked={includeCalls} onCheckedChange={setIncludeCalls} />
      </label>
    </div>
  );
}
