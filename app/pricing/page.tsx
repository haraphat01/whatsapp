import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/usage/usage";

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    tagline: "Try ChatFrame AI with no commitment",
    features: [
      `${PLAN_LIMITS.free.aiGenerationsPerMonth} AI generations / month`,
      `${PLAN_LIMITS.free.screenshotsPerMonth} screenshots / month`,
      `${PLAN_LIMITS.free.videosPerMonth} videos / month`,
      `Up to ${PLAN_LIMITS.free.maxMessages} messages per conversation`,
      "1080p exports",
    ],
  },
  {
    id: "creator" as const,
    name: "Creator",
    price: "$19",
    tagline: "For regular content creators",
    highlighted: true,
    features: [
      `${PLAN_LIMITS.creator.aiGenerationsPerMonth} AI generations / month`,
      `${PLAN_LIMITS.creator.screenshotsPerMonth} screenshots / month`,
      `${PLAN_LIMITS.creator.videosPerMonth} videos / month`,
      `Up to ${PLAN_LIMITS.creator.maxMessages} messages per conversation`,
      "1440p exports",
      "All themes & device frames",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$49",
    tagline: "For studios and heavy production use",
    features: [
      `${PLAN_LIMITS.pro.aiGenerationsPerMonth} AI generations / month`,
      `${PLAN_LIMITS.pro.screenshotsPerMonth} screenshots / month`,
      `${PLAN_LIMITS.pro.videosPerMonth} videos / month`,
      `Up to ${PLAN_LIMITS.pro.maxMessages} messages per conversation`,
      "4K exports",
      "Priority rendering",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </span>
            ChatFrame AI
          </Link>
          <Link href="/create"><Button size="sm">Create Conversation</Button></Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Simple, transparent pricing</h1>
        <p className="mt-3 text-zinc-500">Start free. Upgrade when you need more generations, resolution, or exports.</p>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 ${plan.highlighted ? "border-emerald-500 shadow-lg ring-1 ring-emerald-500" : "border-zinc-200"}`}
            >
              {plan.highlighted && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">Most popular</p>}
              <h3 className="text-lg font-semibold text-zinc-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>
              <p className="mt-4 text-3xl font-semibold text-zinc-900">{plan.price}<span className="text-sm font-normal text-zinc-400">/mo</span></p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/settings">
                <Button className="mt-6 w-full" variant={plan.highlighted ? "default" : "outline"}>
                  {plan.id === "free" ? "Get started" : `Choose ${plan.name}`}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-zinc-400">
          Payment processing is not yet wired up — plans are simulated locally so you can preview limits.
          The usage/plan system is architected to support Stripe billing without further rework.
        </p>
      </div>
    </div>
  );
}
