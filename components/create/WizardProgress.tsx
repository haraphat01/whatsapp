import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  "Type",
  "Participants",
  "Scenario",
  "Tone & Language",
  "Date & Time",
  "Length",
  "Generate",
];

export function WizardProgress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
      {WIZARD_STEPS.map((label, i) => {
        const state = i < step ? "done" : i === step ? "current" : "upcoming";
        return (
          <div key={label} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div
              className={cn(
                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                state === "done" && "bg-emerald-600 text-white",
                state === "current" && "bg-emerald-600/10 text-emerald-700 ring-2 ring-emerald-600",
                state === "upcoming" && "bg-zinc-100 text-zinc-400"
              )}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                state === "upcoming" ? "text-zinc-400" : "text-zinc-700"
              )}
            >
              {label}
            </span>
            {i < WIZARD_STEPS.length - 1 && <div className="h-px w-4 sm:w-8 flex-shrink-0 bg-zinc-200" />}
          </div>
        );
      })}
    </div>
  );
}
