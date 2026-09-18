"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useWizardStore, wizardParticipantsToApi } from "@/stores/useWizardStore";
import { messageCountForRequest, GenerationRequest, BATCH_SIZE } from "@/lib/ai/generationRequest";
import { Conversation } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { canUse, recordUsage } from "@/lib/usage/usage";
import { toast } from "@/stores/useToastStore";

const STAGES = [
  "Preparing participants...",
  "Building conversation...",
  "Writing messages...",
  "Adding realistic timing...",
  "Finalizing...",
];

export function GenerateStep({ onGenerated }: { onGenerated: (conversation: Conversation) => void }) {
  const wizard = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const messageCount = wizard.conversationType
    ? messageCountForRequest({
        lengthPreset: wizard.lengthPreset,
        customMessageCount: wizard.customMessageCount,
      } as GenerationRequest)
    : 0;

  async function handleGenerate() {
    if (!wizard.conversationType || !wizard.tone) return;

    if (!canUse("aiGenerations")) {
      toast({
        title: "Monthly AI generation limit reached",
        description: "Upgrade your plan to generate more conversations this month.",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setLoading(true);
    setStageIndex(0);
    intervalRef.current = setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, 1400);

    const request: GenerationRequest = {
      conversationType: wizard.conversationType,
      participants: wizardParticipantsToApi(wizard.participants),
      scenario: wizard.scenario,
      additionalInstructions: wizard.additionalInstructions || undefined,
      tone: wizard.tone,
      customTone: wizard.customTone || undefined,
      language: wizard.language,
      customLanguageInstructions: wizard.customLanguageInstructions || undefined,
      lengthPreset: wizard.lengthPreset,
      customMessageCount: wizard.customMessageCount,
      startDate: wizard.startDate,
      startTime: wizard.startTime,
      endDate: wizard.endDate !== wizard.startDate ? wizard.endDate : undefined,
      timezone: wizard.timezone,
      timingStyle: wizard.timingStyle,
      isGroup: wizard.isGroup,
      groupName: wizard.groupName || undefined,
      includeCalls: wizard.includeCalls,
    };

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Generation failed.");
      }
      recordUsage("aiGenerations");
      onGenerated(data.conversation as Conversation);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Review</h3>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <Row label="Type" value={wizard.conversationType ?? "—"} />
          <Row label="Participants" value={String(wizard.participants.filter((p) => p.name).length)} />
          <Row label="Tone" value={wizard.tone === "custom" ? wizard.customTone || "custom" : wizard.tone ?? "—"} />
          <Row label="Language" value={wizard.language} />
          <Row label="Length" value={`~${messageCount} messages`} />
          <Row label="Timing" value={wizard.timingStyle} />
          <Row label="Starts" value={`${wizard.startDate} ${wizard.startTime}`} />
          {wizard.endDate !== wizard.startDate && <Row label="Ends" value={wizard.endDate} />}
          <Row label="Timezone" value={wizard.timezone} />
          {wizard.includeCalls && <Row label="Calls" value="Included" />}
        </dl>
      </div>

      {messageCount > BATCH_SIZE && (
        <p className="text-xs text-zinc-500">
          Conversations this long generate in batches (~{Math.ceil(messageCount / BATCH_SIZE)} AI calls) and can take
          several minutes. If it runs long, you may get fewer messages than requested rather than a failure.
        </p>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button size="lg" className="w-full" disabled={loading} onClick={handleGenerate}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {STAGES[stageIndex]}
            {messageCount > BATCH_SIZE && " (this may take a few minutes)"}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Generate Conversation
          </>
        )}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-zinc-200/70 py-1.5 sm:border-none sm:py-0">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-800 capitalize">{value}</dd>
    </div>
  );
}
