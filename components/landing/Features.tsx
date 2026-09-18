import {
  Sparkles,
  MessagesSquare,
  Smartphone,
  SlidersHorizontal,
  Clapperboard,
  ImageDown,
  Video,
  Users,
  Palette,
} from "lucide-react";

const FEATURES = [
  { icon: Sparkles, title: "AI Conversation Generator", desc: "Describe a scenario and let AI write a natural, on-tone conversation between your characters." },
  { icon: MessagesSquare, title: "Realistic Chat Simulation", desc: "Typing indicators, read receipts, delays and grouping behave like a real messaging app." },
  { icon: Smartphone, title: "WhatsApp-style Interface", desc: "A messaging UI instantly familiar to anyone who has used a modern chat app." },
  { icon: SlidersHorizontal, title: "Powerful Message Editor", desc: "Edit any message, sender, timestamp, status, reaction or reply — down to the last detail." },
  { icon: Clapperboard, title: "Animated Playback", desc: "Play the conversation back exactly as it would have unfolded, at any speed." },
  { icon: ImageDown, title: "Screenshot Export", desc: "Export crisp PNG or JPEG screenshots up to 4K, with or without a device frame." },
  { icon: Video, title: "Video Export", desc: "Render a fully animated MP4 or WebM video of the conversation with Remotion." },
  { icon: Users, title: "Group Chats", desc: "Simulate group conversations with up to 20 distinct personalities." },
  { icon: Palette, title: "Multiple Tones & Themes", desc: "Sixteen tones, several wallpapers, and full theme customization." },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">Everything you need to tell the story</h2>
        <p className="mt-3 text-zinc-600">From a one-line idea to a polished, exportable conversation.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-semibold text-zinc-900">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
