"use client";

import { Tone, Language } from "@/lib/validation/schemas";
import { useWizardStore } from "@/stores/useWizardStore";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TONES: Tone[] = [
  "romantic", "flirty", "casual", "friendly", "professional", "formal", "funny", "sarcastic",
  "emotional", "angry", "apologetic", "persuasive", "dramatic", "serious", "playful", "custom",
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "nigerian_english", label: "Nigerian English" },
  { value: "nigerian_pidgin", label: "Nigerian Pidgin" },
  { value: "yoruba_influenced", label: "Yoruba-influenced English" },
  { value: "custom", label: "Custom" },
];

export function ToneLanguageStep() {
  const {
    tone, setTone, customTone, setCustomTone,
    language, setLanguage, customLanguageInstructions, setCustomLanguageInstructions,
  } = useWizardStore();

  return (
    <div className="space-y-8">
      <div>
        <Label>Tone</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors",
                tone === t
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {tone === "custom" && (
          <Input
            className="mt-3"
            placeholder="Describe the tone you want"
            value={customTone}
            onChange={(e) => setCustomTone(e.target.value)}
          />
        )}
      </div>

      <div>
        <Label>Language / dialect</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLanguage(l.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                language === l.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        {language === "custom" && (
          <Textarea
            className="mt-3"
            rows={2}
            placeholder="Describe the language/dialect instructions"
            value={customLanguageInstructions}
            onChange={(e) => setCustomLanguageInstructions(e.target.value)}
          />
        )}
        <p className="mt-2 text-xs text-zinc-400">
          Dialects are written naturally, never as caricature.
        </p>
      </div>
    </div>
  );
}
