export type PlanId = "free" | "creator" | "pro";

export interface PlanLimits {
  aiGenerationsPerMonth: number;
  screenshotsPerMonth: number;
  videosPerMonth: number;
  maxMessages: number;
  maxResolution: "720p" | "1080p" | "1440p" | "2160p";
  fourK: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    aiGenerationsPerMonth: 5,
    screenshotsPerMonth: 10,
    videosPerMonth: 2,
    maxMessages: 40,
    maxResolution: "1080p",
    fourK: false,
  },
  creator: {
    aiGenerationsPerMonth: 50,
    screenshotsPerMonth: 200,
    videosPerMonth: 30,
    maxMessages: 150,
    maxResolution: "1440p",
    fourK: false,
  },
  pro: {
    aiGenerationsPerMonth: 500,
    screenshotsPerMonth: 2000,
    videosPerMonth: 300,
    maxMessages: 200,
    maxResolution: "2160p",
    fourK: true,
  },
};

export type UsageKind = "aiGenerations" | "screenshots" | "videos";

interface UsageRecord {
  month: string; // yyyy-mm
  aiGenerations: number;
  screenshots: number;
  videos: number;
}

const STORAGE_KEY = "chatframe.usage.v1";
const PLAN_KEY = "chatframe.plan.v1";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function readUsage(): UsageRecord {
  if (typeof window === "undefined") {
    return { month: currentMonth(), aiGenerations: 0, screenshots: 0, videos: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no record");
    const parsed = JSON.parse(raw) as UsageRecord;
    if (parsed.month !== currentMonth()) {
      return { month: currentMonth(), aiGenerations: 0, screenshots: 0, videos: 0 };
    }
    return parsed;
  } catch {
    return { month: currentMonth(), aiGenerations: 0, screenshots: 0, videos: 0 };
  }
}

function writeUsage(record: UsageRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  notify();
}

// Minimal pub/sub so React components can subscribe with useSyncExternalStore
// instead of copying this into local state inside an effect. getUsageSnapshot
// caches its result (invalidated on every mutation) since useSyncExternalStore
// requires getSnapshot to return a referentially stable value when nothing
// has changed.
const listeners = new Set<() => void>();
let usageSnapshot: { usage: UsageRecord; limits: PlanLimits; plan: PlanId } | null = null;
function notify() {
  usageSnapshot = null;
  listeners.forEach((l) => l());
}
export function subscribeToUsage(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getPlan(): PlanId {
  if (typeof window === "undefined") return "free";
  const raw = window.localStorage.getItem(PLAN_KEY);
  return raw === "creator" || raw === "pro" ? raw : "free";
}

export function setPlan(plan: PlanId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAN_KEY, plan);
  notify();
}

export function getUsage(): { usage: UsageRecord; limits: PlanLimits; plan: PlanId } {
  const plan = getPlan();
  return { usage: readUsage(), limits: PLAN_LIMITS[plan], plan };
}

/** Cached, referentially-stable variant of getUsage() for useSyncExternalStore. */
export function getUsageSnapshot(): { usage: UsageRecord; limits: PlanLimits; plan: PlanId } {
  if (usageSnapshot === null) {
    usageSnapshot = getUsage();
  }
  return usageSnapshot;
}

const KIND_FIELD: Record<UsageKind, keyof Omit<UsageRecord, "month">> = {
  aiGenerations: "aiGenerations",
  screenshots: "screenshots",
  videos: "videos",
};

const KIND_LIMIT_FIELD: Record<
  UsageKind,
  "aiGenerationsPerMonth" | "screenshotsPerMonth" | "videosPerMonth"
> = {
  aiGenerations: "aiGenerationsPerMonth",
  screenshots: "screenshotsPerMonth",
  videos: "videosPerMonth",
};

// Monthly usage limits are disabled while the app is still in development —
// flip this back to `true` once real plans/billing are wired up, and canUse()
// will resume blocking generations/exports once a plan's monthly count is hit.
const ENFORCE_USAGE_LIMITS = false;

export function canUse(kind: UsageKind): boolean {
  if (!ENFORCE_USAGE_LIMITS) return true;
  const { usage, limits } = getUsage();
  const field = KIND_FIELD[kind];
  const limitField = KIND_LIMIT_FIELD[kind];
  return usage[field] < limits[limitField];
}

export function recordUsage(kind: UsageKind) {
  const usage = readUsage();
  const field = KIND_FIELD[kind];
  usage[field] += 1;
  writeUsage(usage);
}

export function remaining(kind: UsageKind): number {
  const { usage, limits } = getUsage();
  const field = KIND_FIELD[kind];
  const limitField = KIND_LIMIT_FIELD[kind];
  return Math.max(0, limits[limitField] - usage[field]);
}
