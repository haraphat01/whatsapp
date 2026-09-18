"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { birthdaySurpriseDemo } from "@/lib/seed/demoProjects";
import { createDefaultExportSettings, createDefaultTheme } from "@/lib/validation/schemas";

export function Hero() {
  const conversation = birthdaySurpriseDemo();
  const theme = createDefaultTheme();
  const exportSettings = { ...createDefaultExportSettings(), showStatusBar: true, simulationLabel: "bottom" as const };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" /> AI-generated · fully editable · exportable
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl">
            Create realistic conversations with AI.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-600">
            Generate, edit, animate and export fictional conversations in a realistic messaging
            experience — for storytelling, content, and demos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/create">
              <Button size="lg">
                Create Conversation <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/preview/demo_romantic">
              <Button size="lg" variant="outline">
                <PlayCircle className="h-4 w-4" /> View Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-zinc-400">
            All conversations are fictional and clearly labeled as simulated. ChatFrame AI is an
            independent product and is not affiliated with WhatsApp.
          </p>
        </div>

        <div className="relative mx-auto h-[560px] w-[280px]">
          <div className="absolute -inset-10 -z-10 rounded-full bg-emerald-200/30 blur-3xl" />
          <ChatWindow
            conversation={conversation}
            theme={theme}
            exportSettings={exportSettings}
            showComposer
            showDeviceFrame
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
