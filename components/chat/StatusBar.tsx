"use client";

import { useEffect, useState } from "react";
import { Signal, Wifi, BatteryFull, BatteryMedium, BatteryLow } from "lucide-react";
import { ExportSettings } from "@/lib/validation/schemas";
import { formatStatusTime, watchBatteryLevel } from "@/lib/statusBar";

/** Current time, refreshed each minute. Null until mounted to keep SSR hydration stable. */
function useClock(timeFormat: "12h" | "24h", enabled: boolean): string | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [enabled]);
  return now ? formatStatusTime(now, timeFormat) : null;
}

function useBatteryLevel(enabled: boolean): number | null {
  const [level, setLevel] = useState<number | null>(null);
  useEffect(() => (enabled ? watchBatteryLevel(setLevel) : undefined), [enabled]);
  return level;
}

export function DeviceStatusBar({
  settings,
  timeFormat = "12h",
  dark,
}: {
  settings: ExportSettings;
  timeFormat?: "12h" | "24h";
  dark?: boolean;
}) {
  const autoTime = useClock(timeFormat, !settings.statusBarTime);
  const autoBattery = useBatteryLevel(settings.statusBarBattery === null);
  if (!settings.showStatusBar) return null;

  const time = settings.statusBarTime || autoTime;
  const battery = settings.statusBarBattery ?? autoBattery;
  const BatteryIcon = battery === null || battery > 60 ? BatteryFull : battery > 20 ? BatteryMedium : BatteryLow;

  return (
    <div
      className="flex items-center justify-between px-5 pt-1.5 pb-1 text-[12px] font-medium flex-shrink-0"
      style={{ color: dark ? "#fff" : "#000", background: "transparent" }}
    >
      {/* Non-breaking space keeps the bar's height while the auto time loads. */}
      <span>{time ?? " "}</span>
      <div className="flex items-center gap-1">
        {settings.showSignal && <Signal className="h-3 w-3" />}
        {settings.showWifi && <Wifi className="h-3 w-3" />}
        <BatteryIcon className="h-3.5 w-3.5" />
        {battery !== null && <span className="text-[10px] ml-0.5">{battery}%</span>}
      </div>
    </div>
  );
}
