import { Conversation, Project } from "@/lib/validation/schemas";
import {
  createDefaultExportSettings,
  createDefaultPlaybackSettings,
  createDefaultTheme,
} from "@/lib/validation/schemas";

function iso(minutesFromBase: number, base = "2026-09-16T21:30:00"): string {
  return new Date(new Date(base).getTime() + minutesFromBase * 60_000).toISOString();
}

function buildProject(name: string, description: string, conversation: Conversation): Project {
  const now = new Date().toISOString();
  return {
    id: conversation.id,
    userId: "local",
    name,
    description,
    conversation,
    theme: createDefaultTheme(),
    playbackSettings: createDefaultPlaybackSettings(),
    exportSettings: createDefaultExportSettings(),
    createdAt: now,
    updatedAt: now,
  };
}

export function birthdaySurpriseDemo(): Conversation {
  return {
    id: "demo_romantic",
    title: "Birthday Surprise",
    type: "romantic",
    tone: "flirty",
    language: "english",
    timezone: "Africa/Lagos",
    timeFormat: "12h",
    isGroup: false,
    participants: [
      { id: "p1", name: "Aisha", avatar: "", accentColor: "#e05f9b", isMe: true, online: true, showPhoneAsName: false },
      { id: "p2", name: "Daniel", avatar: "", accentColor: "#3f7fd1", isMe: false, online: true, showPhoneAsName: false },
    ],
    scenario: "Aisha is planning a surprise for Daniel's birthday and is checking he'll show up.",
    messages: [
      { id: "d1", senderId: "p1", timestamp: iso(0), status: "read", reactions: [], type: "text", text: "Are you still coming tonight? 👀" },
      { id: "d2", senderId: "p2", timestamp: iso(2), status: "none", reactions: [], type: "text", text: "Yeah, I'll be there ❤️" },
      { id: "d3", senderId: "p2", timestamp: iso(2.5), status: "none", reactions: [], type: "text", text: "why, what's going on lol" },
      { id: "d4", senderId: "p1", timestamp: iso(4), status: "read", reactions: [], type: "text", text: "Nothing 🙃 just don't be late this time" },
      { id: "d5", senderId: "p2", timestamp: iso(6), status: "none", reactions: [{ emoji: "😂", participantId: "p1" }], type: "text", text: "that was ONE time" },
      { id: "d6", senderId: "p1", timestamp: iso(8), status: "delivered", reactions: [], type: "text", text: "Uh huh. 9pm. Don't test me Daniel." },
    ],
  };
}

export function workplaceDemo(): Conversation {
  return {
    id: "demo_workplace",
    title: "Project Deadline",
    type: "workplace",
    tone: "professional",
    language: "english",
    timezone: "UTC",
    timeFormat: "12h",
    isGroup: false,
    participants: [
      { id: "p1", name: "Aisha", avatar: "", accentColor: "#e05f9b", isMe: true, online: true, showPhoneAsName: false },
      { id: "p2", name: "Daniel", avatar: "", accentColor: "#3f7fd1", isMe: false, online: false, lastSeen: "10:02 AM", showPhoneAsName: false },
    ],
    scenario: "Aisha discovers Daniel hasn't finished his part of the project before the deadline.",
    messages: [
      { id: "w1", senderId: "p1", timestamp: iso(0), status: "read", reactions: [], type: "text", text: "Hey, how's the deck coming along?" },
      { id: "w2", senderId: "p2", timestamp: iso(3), status: "none", reactions: [], type: "text", text: "almost done, just finishing the numbers" },
      { id: "w3", senderId: "p1", timestamp: iso(5), status: "read", reactions: [], type: "text", text: "It's due in 2 hours Daniel" },
      { id: "w4", senderId: "p2", timestamp: iso(6), status: "none", reactions: [], type: "text", text: "I know I know" },
      { id: "w5", senderId: "p2", timestamp: iso(6.5), status: "none", reactions: [], type: "text", text: "sending you what I have now, can you review while I finish the rest?" },
      { id: "w6", senderId: "p1", timestamp: iso(9), status: "delivered", reactions: [], type: "text", text: "Ok. Please don't do this again 😩" },
    ],
  };
}

export function familyGroupDemo(): Conversation {
  return {
    id: "demo_family",
    title: "Family Group",
    type: "family",
    tone: "playful",
    language: "english",
    timezone: "UTC",
    timeFormat: "12h",
    isGroup: true,
    groupName: "Adeyemi Family 🏡",
    participants: [
      { id: "p1", name: "Mom", avatar: "", accentColor: "#e0965f", isMe: false, online: true, showPhoneAsName: false },
      { id: "p2", name: "Aisha", avatar: "", accentColor: "#e05f9b", isMe: true, online: true, showPhoneAsName: false },
      { id: "p3", name: "Tunde", avatar: "", accentColor: "#5f9be0", isMe: false, online: false, showPhoneAsName: false },
    ],
    scenario: "Family group planning Sunday lunch.",
    messages: [
      { id: "f1", senderId: "p1", timestamp: iso(0), status: "none", reactions: [], type: "text", text: "Everyone coming for lunch on Sunday?" },
      { id: "f2", senderId: "p3", timestamp: iso(4), status: "none", reactions: [], type: "text", text: "I'll be there" },
      { id: "f3", senderId: "p2", timestamp: iso(6), status: "read", reactions: [], type: "text", text: "Me too! Should I bring anything?" },
      { id: "f4", senderId: "p1", timestamp: iso(8), status: "none", reactions: [{ emoji: "❤️", participantId: "p2" }], type: "text", text: "Just yourself dear" },
    ],
  };
}

export function seedDemoConversations(): Conversation[] {
  return [birthdaySurpriseDemo(), workplaceDemo(), familyGroupDemo()];
}

// Memoized so callers reading this repeatedly (e.g. useSyncExternalStore
// snapshots, which require a referentially stable result) get the same
// array/object references back instead of freshly-built ones each time.
let demoProjectsCache: Project[] | null = null;
export function seedDemoProjects(): Project[] {
  if (!demoProjectsCache) {
    demoProjectsCache = [
      buildProject("Birthday Surprise (Demo)", "A flirty romantic demo conversation.", birthdaySurpriseDemo()),
      buildProject("Project Deadline (Demo)", "A professional workplace demo conversation.", workplaceDemo()),
      buildProject("Family Group (Demo)", "A playful family group chat demo.", familyGroupDemo()),
    ];
  }
  return demoProjectsCache;
}
