"use client";

import { create } from "zustand";
import { ConversationType, Language, Participant, Tone } from "@/lib/validation/schemas";
import { LengthPreset } from "@/lib/ai/generationRequest";
import { generateId } from "@/lib/utils";

export interface WizardParticipant {
  id: string;
  name: string;
  role: string;
  personality: string;
  writingStyle: string;
  gender: string;
  description: string;
  isMe: boolean;
  accentColor: string;
}

export const PARTICIPANT_COLORS = [
  "#25D366", "#3f7fd1", "#e05f9b", "#e0965f", "#8b5fe0", "#5fc4e0", "#e0d15f", "#e05f5f",
];

interface WizardState {
  step: number;
  conversationType: ConversationType | null;
  isGroup: boolean;
  groupName: string;
  participants: WizardParticipant[];
  scenario: string;
  additionalInstructions: string;
  tone: Tone | null;
  customTone: string;
  language: Language;
  customLanguageInstructions: string;
  lengthPreset: LengthPreset;
  customMessageCount: number;
  startDate: string;
  startTime: string;
  /** Optional — when set later than startDate, the conversation spans that whole range. */
  endDate: string;
  timezone: string;
  timeFormat: "12h" | "24h";
  timingStyle: "realistic" | "fast" | "slow" | "custom";
  includeCalls: boolean;

  setStep: (step: number) => void;
  setConversationType: (type: ConversationType, isGroup: boolean) => void;
  setGroupName: (name: string) => void;
  addParticipant: () => void;
  updateParticipant: (id: string, patch: Partial<WizardParticipant>) => void;
  removeParticipant: (id: string) => void;
  setScenario: (scenario: string) => void;
  setAdditionalInstructions: (v: string) => void;
  setTone: (tone: Tone) => void;
  setCustomTone: (v: string) => void;
  setLanguage: (language: Language) => void;
  setCustomLanguageInstructions: (v: string) => void;
  setLengthPreset: (preset: LengthPreset) => void;
  setCustomMessageCount: (n: number) => void;
  setDateTime: (
    patch: Partial<Pick<WizardState, "startDate" | "startTime" | "endDate" | "timezone" | "timeFormat">>
  ) => void;
  setTimingStyle: (style: WizardState["timingStyle"]) => void;
  setIncludeCalls: (v: boolean) => void;
  reset: () => void;
}

function defaultParticipant(overrides: Partial<WizardParticipant> = {}, index = 0): WizardParticipant {
  return {
    id: generateId("wp"),
    name: "",
    role: "",
    personality: "",
    writingStyle: "",
    gender: "",
    description: "",
    isMe: index === 0,
    accentColor: PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length],
    ...overrides,
  };
}

const initialState = {
  step: 0,
  conversationType: null as ConversationType | null,
  isGroup: false,
  groupName: "",
  participants: [defaultParticipant({ name: "You" }, 0), defaultParticipant({}, 1)],
  scenario: "",
  additionalInstructions: "",
  tone: null as Tone | null,
  customTone: "",
  language: "english" as Language,
  customLanguageInstructions: "",
  lengthPreset: "medium" as LengthPreset,
  customMessageCount: 30,
  startDate: new Date().toISOString().slice(0, 10),
  startTime: "21:30",
  endDate: new Date().toISOString().slice(0, 10),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
  timeFormat: "12h" as const,
  timingStyle: "realistic" as const,
  includeCalls: false,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setConversationType: (conversationType, isGroup) => set({ conversationType, isGroup }),
  setGroupName: (groupName) => set({ groupName }),

  addParticipant: () =>
    set((state) => ({
      participants: [...state.participants, defaultParticipant({}, state.participants.length)],
    })),
  updateParticipant: (id, patch) =>
    set((state) => ({
      participants: state.participants.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  removeParticipant: (id) =>
    set((state) => ({ participants: state.participants.filter((p) => p.id !== id) })),

  setScenario: (scenario) => set({ scenario }),
  setAdditionalInstructions: (additionalInstructions) => set({ additionalInstructions }),
  setTone: (tone) => set({ tone }),
  setCustomTone: (customTone) => set({ customTone }),
  setLanguage: (language) => set({ language }),
  setCustomLanguageInstructions: (customLanguageInstructions) => set({ customLanguageInstructions }),
  setLengthPreset: (lengthPreset) => set({ lengthPreset }),
  setCustomMessageCount: (customMessageCount) => set({ customMessageCount }),
  setDateTime: (patch) => set(patch),
  setTimingStyle: (timingStyle) => set({ timingStyle }),
  setIncludeCalls: (includeCalls) => set({ includeCalls }),

  reset: () => set({ ...initialState, participants: [defaultParticipant({ name: "You" }, 0), defaultParticipant({}, 1)] }),
}));

export function wizardParticipantsToApi(participants: WizardParticipant[]): Participant[] {
  return participants.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: "",
    role: p.role || undefined,
    personality: p.personality || undefined,
    writingStyle: p.writingStyle || undefined,
    gender: p.gender || undefined,
    description: p.description || undefined,
    accentColor: p.accentColor,
    isMe: p.isMe,
    online: true,
    showPhoneAsName: false,
  }));
}
