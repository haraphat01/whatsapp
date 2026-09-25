const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Whole calendar days between two dates' local midnights (positive when `a` is before `b`). */
function calendarDaysBetween(a: Date, b: Date): number {
  const startA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const startB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((startB - startA) / 86_400_000);
}

/** Mirrors WhatsApp: "Today", "Yesterday", the weekday within the past week,
 * otherwise "September 30, 2025". */
export function dateSeparatorLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const daysAgo = calendarDaysBetween(date, now);

  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo > 1 && daysAgo < 7) return WEEKDAYS[date.getDay()];

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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
