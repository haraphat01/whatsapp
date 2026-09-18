"use client";

import { create } from "zustand";
import { Conversation, PlaybackSettings } from "@/lib/validation/schemas";
import { buildTimeline, Timeline } from "@/lib/timing/engine";

interface PlaybackState {
  timeline: Timeline | null;
  currentTimeMs: number;
  isPlaying: boolean;
  speed: number;

  load: (conversation: Conversation, settings: PlaybackSettings) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  seek: (ms: number) => void;
  setSpeed: (speed: number) => void;
  tick: (deltaMs: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  timeline: null,
  currentTimeMs: 0,
  isPlaying: false,
  speed: 1,

  load: (conversation, settings) => {
    const timeline = buildTimeline(conversation, { ...settings, speed: 1 });
    set({ timeline, currentTimeMs: 0, isPlaying: false });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  restart: () => set({ currentTimeMs: 0, isPlaying: true }),
  seek: (ms) => {
    const { timeline } = get();
    if (!timeline) return;
    set({ currentTimeMs: Math.min(Math.max(0, ms), timeline.totalDurationMs) });
  },
  setSpeed: (speed) => set({ speed }),

  tick: (deltaMs) => {
    const { timeline, isPlaying, speed, currentTimeMs } = get();
    if (!timeline || !isPlaying) return;
    const next = currentTimeMs + deltaMs * speed;
    if (next >= timeline.totalDurationMs) {
      set({ currentTimeMs: timeline.totalDurationMs, isPlaying: false });
    } else {
      set({ currentTimeMs: next });
    }
  },
}));
