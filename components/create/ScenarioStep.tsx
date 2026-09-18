"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Label, Textarea } from "@/components/ui/input";

export function ScenarioStep() {
  const { scenario, setScenario, additionalInstructions, setAdditionalInstructions } = useWizardStore();

  return (
    <div className="space-y-5">
      <div>
        <Label>Describe what is happening in this conversation</Label>
        <Textarea
          className="mt-1.5"
          rows={6}
          placeholder="e.g. Two coworkers are discussing a project deadline. Aisha discovers that Daniel has not completed his part of the project."
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-zinc-400">{scenario.length}/2000</p>
      </div>
      <div>
        <Label>Additional instructions (optional)</Label>
        <Textarea
          className="mt-1.5"
          rows={3}
          placeholder="Make it natural and realistic. Use short messages. Include some humor."
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
        />
      </div>
    </div>
  );
}
