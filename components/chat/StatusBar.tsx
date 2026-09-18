import { Signal, Wifi, BatteryFull } from "lucide-react";
import { ExportSettings } from "@/lib/validation/schemas";

export function DeviceStatusBar({ settings, dark }: { settings: ExportSettings; dark?: boolean }) {
  if (!settings.showStatusBar) return null;
  return (
    <div
      className="flex items-center justify-between px-5 pt-1.5 pb-1 text-[12px] font-medium flex-shrink-0"
      style={{ color: dark ? "#fff" : "#000", background: "transparent" }}
    >
      <span>{settings.statusBarTime}</span>
      <div className="flex items-center gap-1">
        {settings.showSignal && <Signal className="h-3 w-3" />}
        {settings.showWifi && <Wifi className="h-3 w-3" />}
        <BatteryFull className="h-3.5 w-3.5" />
        <span className="text-[10px] ml-0.5">{settings.statusBarBattery}%</span>
      </div>
    </div>
  );
}
