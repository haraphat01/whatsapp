"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { useWizardStore } from "@/stores/useWizardStore";
import { WizardProgress, WIZARD_STEPS } from "@/components/create/WizardProgress";
import { ConversationTypeStep } from "@/components/create/ConversationTypeStep";
import { ParticipantsStep } from "@/components/create/ParticipantsStep";
import { ScenarioStep } from "@/components/create/ScenarioStep";
import { ToneLanguageStep } from "@/components/create/ToneLanguageStep";
import { DateTimeStep } from "@/components/create/DateTimeStep";
import { LengthStep } from "@/components/create/LengthStep";
import { GenerateStep } from "@/components/create/GenerateStep";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/lib/validation/schemas";
import { createProject } from "@/lib/storage/projectStore";
import { toast } from "@/stores/useToastStore";

const STEP_TITLES = [
  "What kind of conversation is this?",
  "Who's in this conversation?",
  "What's happening?",
  "Set the tone and language",
  "When does it take place?",
  "How long should it be?",
  "Ready to generate",
];

export default function CreatePage() {
  const router = useRouter();
  const wizard = useWizardStore();

  function canAdvance(): boolean {
    switch (wizard.step) {
      case 0:
        return wizard.conversationType !== null;
      case 1:
        return wizard.participants.filter((p) => p.name.trim()).length >= 2;
      case 2:
        return wizard.scenario.trim().length > 0;
      case 3:
        return wizard.tone !== null;
      default:
        return true;
    }
  }

  function next() {
    if (!canAdvance()) {
      toast({ title: "Almost there", description: "Please complete this step before continuing." });
      return;
    }
    wizard.setStep(Math.min(WIZARD_STEPS.length - 1, wizard.step + 1));
  }
  function back() {
    wizard.setStep(Math.max(0, wizard.step - 1));
  }

  function handleGenerated(conversation: Conversation) {
    const project = createProject({
      name: conversation.title,
      description: wizard.scenario.slice(0, 140),
      conversation: {
        ...conversation,
        timeFormat: wizard.timeFormat,
      },
    });
    toast({ title: "Conversation generated", description: "Opening the editor...", variant: "success" });
    wizard.reset();
    router.push(`/editor/${project.id}`);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </span>
            ChatFrame AI
          </Link>
          <Link href="/projects" className="text-sm text-zinc-500 hover:text-zinc-800">
            Save & exit
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8">
        <WizardProgress step={wizard.step} />

        <div className="mt-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{STEP_TITLES[wizard.step]}</h1>

          <div className="mt-6">
            {wizard.step === 0 && <ConversationTypeStep />}
            {wizard.step === 1 && <ParticipantsStep />}
            {wizard.step === 2 && <ScenarioStep />}
            {wizard.step === 3 && <ToneLanguageStep />}
            {wizard.step === 4 && <DateTimeStep />}
            {wizard.step === 5 && <LengthStep />}
            {wizard.step === 6 && <GenerateStep onGenerated={handleGenerated} />}
          </div>

          {wizard.step < WIZARD_STEPS.length - 1 && (
            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={back} disabled={wizard.step === 0}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={next}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {wizard.step === WIZARD_STEPS.length - 1 && (
            <div className="mt-6">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
