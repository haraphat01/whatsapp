import { ExportSettings } from "@/lib/validation/schemas";

/**
 * Status bar values are "auto" by default: an empty `statusBarTime` means the
 * current time and a null `statusBarBattery` means the device's real battery
 * level. Exports resolve these in the browser before sending the payload, so
 * the server renderers always receive concrete values.
 */

export function formatStatusTime(date: Date, timeFormat: "12h" | "24h"): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  // Phones show "9:41" (no AM/PM) in 12h mode and "21:41" in 24h mode.
  if (timeFormat === "24h") return `${String(hours).padStart(2, "0")}:${minutes}`;
  return `${hours % 12 || 12}:${minutes}`;
}

interface BatteryManager extends EventTarget {
  level: number;
}

function getBatteryManager(): Promise<BatteryManager> | null {
  const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
  return nav.getBattery ? nav.getBattery() : null;
}

// Browsers without the Battery API (Safari, Firefox) get a plausible level
// that stays stable for the session instead of a fixed number.
const fallbackBattery = 40 + Math.floor(Math.random() * 56);

export async function readBatteryLevel(): Promise<number> {
  try {
    const manager = await getBatteryManager();
    if (manager) return Math.round(manager.level * 100);
  } catch {
    // fall through
  }
  return fallbackBattery;
}

/** Subscribes to battery level changes; calls back with the latest level. */
export function watchBatteryLevel(callback: (level: number) => void): () => void {
  let cancelled = false;
  let manager: BatteryManager | null = null;
  const onChange = () => {
    if (manager && !cancelled) callback(Math.round(manager.level * 100));
  };
  readBatteryLevel().then((level) => !cancelled && callback(level));
  getBatteryManager()
    ?.then((m) => {
      manager = m;
      m.addEventListener("levelchange", onChange);
    })
    .catch(() => {});
  return () => {
    cancelled = true;
    manager?.removeEventListener("levelchange", onChange);
  };
}

export async function resolveStatusBar(
  settings: ExportSettings,
  timeFormat: "12h" | "24h"
): Promise<ExportSettings> {
  return {
    ...settings,
    statusBarTime: settings.statusBarTime || formatStatusTime(new Date(), timeFormat),
    statusBarBattery: settings.statusBarBattery ?? (await readBatteryLevel()),
  };
}
