import { Check } from "lucide-react";

const USE_CASES = [
  "Content creation",
  "Storytelling",
  "Film & screenplay visualization",
  "Social media content",
  "Education",
  "Product demonstrations",
  "UI demonstrations",
  "Creative projects",
];

export function UseCases() {
  return (
    <section id="use-cases" className="bg-zinc-950 py-20 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Built for creators, educators, and storytellers</h2>
            <p className="mt-3 max-w-md text-zinc-400">
              ChatFrame AI is a simulation tool — every conversation is clearly fictional and generated
              for creative and demonstrative purposes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {USE_CASES.map((u) => (
              <div key={u} className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-3">
                <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span className="text-sm text-zinc-200">{u}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
