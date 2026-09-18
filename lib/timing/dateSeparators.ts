function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function dateSeparatorLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const today = now;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "TODAY";
  if (isSameDay(date, yesterday)) return "YESTERDAY";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Returns the ids of messages that should have a date separator rendered
 * immediately before them, mapped to the separator label. */
export function computeDateSeparators(
  messages: { id: string; timestamp: string }[]
): Map<string, string> {
  const separators = new Map<string, string>();
  let lastDay: string | null = null;
  for (const m of messages) {
    const d = new Date(m.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (key !== lastDay) {
      separators.set(m.id, dateSeparatorLabel(m.timestamp));
      lastDay = key;
    }
  }
  return separators;
}

export function formatTimestamp(iso: string, timeFormat: "12h" | "24h"): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  if (timeFormat === "24h") {
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${suffix}`;
}
