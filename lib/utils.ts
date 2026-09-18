import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Participant } from "@/lib/validation/schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The name shown for a participant, or their phone number when they've opted
 * to appear unsaved (real WhatsApp shows the number instead of a name in that case). */
export function looksLikePhoneNumber(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 7) return false;
  return /^\+?[0-9()\-\s.]{7,}$/.test(trimmed);
}

export function displayName(participant: Pick<Participant, "name" | "phone" | "showPhoneAsName">): string {
  if (participant.showPhoneAsName && participant.phone?.trim()) return participant.phone.trim();
  if (looksLikePhoneNumber(participant.name)) return participant.name.trim();
  return participant.name;
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Reads a local file (e.g. from a file input) into a data: URL, so it can be
 * stored directly on a participant/message and rendered with a plain <img>
 * src — no upload endpoint needed for this client-only, localStorage-backed app. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
