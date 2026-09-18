"use client";

import { create } from "zustand";
import {
  Conversation,
  ExportSettings,
  Message,
  Participant,
  PlaybackSettings,
  Project,
  Theme,
} from "@/lib/validation/schemas";
import { saveProject as persistProject } from "@/lib/storage/projectStore";
import { generateId } from "@/lib/utils";

interface ProjectEditorState {
  project: Project | null;
  selectedMessageId: string | null;
  isDirty: boolean;

  loadProject: (project: Project) => void;
  save: () => void;
  setProjectName: (name: string) => void;

  selectMessage: (id: string | null) => void;

  updateConversationMeta: (patch: Partial<Conversation>) => void;
  setTheme: (patch: Partial<Theme>) => void;
  setPlaybackSettings: (patch: Partial<PlaybackSettings>) => void;
  setExportSettings: (patch: Partial<ExportSettings>) => void;

  addParticipant: (participant: Partial<Participant>) => void;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;

  updateMessage: (id: string, patch: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  duplicateMessage: (id: string) => void;
  moveMessage: (id: string, direction: "up" | "down") => void;
  reorderMessages: (fromIndex: number, toIndex: number) => void;
  addMessage: (relativeToId: string | null, position: "before" | "after", message?: Partial<Message>) => string;
  addReaction: (id: string, emoji: string, participantId: string) => void;
  removeReaction: (id: string, participantId: string) => void;
}

function touch<T extends { updatedAt: string }>(entity: T): T {
  return { ...entity, updatedAt: new Date().toISOString() };
}

function makeBlankTextMessage(senderId: string, timestamp: string): Message {
  return {
    id: generateId("m"),
    senderId,
    timestamp,
    status: "read",
    reactions: [],
    type: "text",
    text: "New message",
  };
}

export const useProjectEditorStore = create<ProjectEditorState>((set, get) => ({
  project: null,
  selectedMessageId: null,
  isDirty: false,

  loadProject: (project) => set({ project, selectedMessageId: null, isDirty: false }),

  save: () => {
    const { project } = get();
    if (!project) return;
    const saved = persistProject(touch(project));
    set({ project: saved, isDirty: false });
  },

  setProjectName: (name) =>
    set((state) => (state.project ? { project: { ...state.project, name }, isDirty: true } : state)),

  selectMessage: (id) => set({ selectedMessageId: id }),

  updateConversationMeta: (patch) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          conversation: { ...state.project.conversation, ...patch },
        },
        isDirty: true,
      };
    }),

  setTheme: (patch) =>
    set((state) => {
      if (!state.project) return state;
      return { project: { ...state.project, theme: { ...state.project.theme, ...patch } }, isDirty: true };
    }),

  setPlaybackSettings: (patch) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          playbackSettings: { ...state.project.playbackSettings, ...patch },
        },
        isDirty: true,
      };
    }),

  setExportSettings: (patch) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          exportSettings: { ...state.project.exportSettings, ...patch },
        },
        isDirty: true,
      };
    }),

  addParticipant: (participant) =>
    set((state) => {
      if (!state.project) return state;
      const newParticipant: Participant = {
        id: generateId("p"),
        name: participant.name ?? "New participant",
        avatar: participant.avatar ?? "",
        accentColor: participant.accentColor ?? "#25D366",
        isMe: participant.isMe ?? false,
        online: participant.online ?? false,
        showPhoneAsName: participant.showPhoneAsName ?? false,
        ...participant,
      };
      return {
        project: {
          ...state.project,
          conversation: {
            ...state.project.conversation,
            participants: [...state.project.conversation.participants, newParticipant],
          },
        },
        isDirty: true,
      };
    }),

  updateParticipant: (id, patch) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          conversation: {
            ...state.project.conversation,
            participants: state.project.conversation.participants.map((p) =>
              p.id === id ? { ...p, ...patch } : p
            ),
          },
        },
        isDirty: true,
      };
    }),

  removeParticipant: (id) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          conversation: {
            ...state.project.conversation,
            participants: state.project.conversation.participants.filter((p) => p.id !== id),
          },
        },
        isDirty: true,
      };
    }),

  updateMessage: (id, patch) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          conversation: {
            ...state.project.conversation,
            messages: state.project.conversation.messages.map((m) =>
              m.id === id ? ({ ...m, ...patch } as Message) : m
            ),
          },
        },
        isDirty: true,
      };
    }),

  deleteMessage: (id) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          conversation: {
            ...state.project.conversation,
            messages: state.project.conversation.messages.filter((m) => m.id !== id),
          },
        },
        selectedMessageId: state.selectedMessageId === id ? null : state.selectedMessageId,
        isDirty: true,
      };
    }),

  duplicateMessage: (id) =>
    set((state) => {
      if (!state.project) return state;
      const messages = state.project.conversation.messages;
      const index = messages.findIndex((m) => m.id === id);
      if (index === -1) return state;
      const copy: Message = { ...messages[index], id: generateId("m") };
      const next = [...messages.slice(0, index + 1), copy, ...messages.slice(index + 1)];
      return {
        project: { ...state.project, conversation: { ...state.project.conversation, messages: next } },
        isDirty: true,
      };
    }),

  moveMessage: (id, direction) =>
    set((state) => {
      if (!state.project) return state;
      const messages = [...state.project.conversation.messages];
      const index = messages.findIndex((m) => m.id === id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || target < 0 || target >= messages.length) return state;
      [messages[index], messages[target]] = [messages[target], messages[index]];
      return {
        project: { ...state.project, conversation: { ...state.project.conversation, messages } },
        isDirty: true,
      };
    }),

  reorderMessages: (fromIndex, toIndex) =>
    set((state) => {
      if (!state.project) return state;
      const messages = [...state.project.conversation.messages];
      if (
        fromIndex < 0 ||
        fromIndex >= messages.length ||
        toIndex < 0 ||
        toIndex >= messages.length
      )
        return state;
      const [moved] = messages.splice(fromIndex, 1);
      messages.splice(toIndex, 0, moved);
      return {
        project: { ...state.project, conversation: { ...state.project.conversation, messages } },
        isDirty: true,
      };
    }),

  addMessage: (relativeToId, position, messageOverrides) => {
    const state = get();
    if (!state.project) return "";
    const messages = state.project.conversation.messages;
    const index = relativeToId ? messages.findIndex((m) => m.id === relativeToId) : messages.length - 1;
    const anchor = messages[index];
    const senderId = messageOverrides?.senderId ?? anchor?.senderId ?? state.project.conversation.participants[0]?.id;
    const timestamp =
      messageOverrides?.timestamp ??
      anchor?.timestamp ??
      new Date().toISOString();
    const newMessage: Message = { ...makeBlankTextMessage(senderId, timestamp), ...messageOverrides } as Message;
    const insertAt = index === -1 ? messages.length : position === "before" ? index : index + 1;
    const next = [...messages.slice(0, insertAt), newMessage, ...messages.slice(insertAt)];
    set({
      project: { ...state.project, conversation: { ...state.project.conversation, messages: next } },
      isDirty: true,
      selectedMessageId: newMessage.id,
    });
    return newMessage.id;
  },

  addReaction: (id, emoji, participantId) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          conversation: {
            ...state.project.conversation,
            messages: state.project.conversation.messages.map((m) =>
              m.id === id
                ? {
                    ...m,
                    reactions: [
                      ...m.reactions.filter((r) => r.participantId !== participantId),
                      { emoji, participantId },
                    ],
                  }
                : m
            ),
          },
        },
        isDirty: true,
      };
    }),

  removeReaction: (id, participantId) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          conversation: {
            ...state.project.conversation,
            messages: state.project.conversation.messages.map((m) =>
              m.id === id
                ? { ...m, reactions: m.reactions.filter((r) => r.participantId !== participantId) }
                : m
            ),
          },
        },
        isDirty: true,
      };
    }),
}));
