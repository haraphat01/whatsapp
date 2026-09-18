import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-8 py-16 text-center text-white sm:px-16">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Start creating your first conversation</h2>
        <p className="mx-auto mt-3 max-w-lg text-emerald-50">
          Free to start. No credit card required. Export your first screenshot in minutes.
        </p>
        <Link href="/create">
          <Button size="lg" className="mt-7 bg-white text-emerald-700 hover:bg-emerald-50">
            Create Conversation <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <MessageCircle className="h-4 w-4" />
          </span>
          ChatFrame AI
        </div>
        <p className="text-center text-xs text-zinc-400 sm:text-left">
          ChatFrame AI produces fictional, simulated conversations for creative and demonstrative use only.
          Not affiliated with WhatsApp or Meta Platforms, Inc.
        </p>
        <div className="flex gap-5 text-sm text-zinc-500">
          <Link href="/pricing" className="hover:text-zinc-800">Pricing</Link>
          <Link href="/settings" className="hover:text-zinc-800">Settings</Link>
        </div>
      </div>
    </footer>
  );
}
