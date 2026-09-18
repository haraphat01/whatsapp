"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getUsageSnapshot, PlanId, PLAN_LIMITS, setPlan, subscribeToUsage } from "@/lib/usage/usage";
import { Button } from "@/components/ui/button";

const SERVER_USAGE = { usage: { month: "", aiGenerations: 0, screenshots: 0, videos: 0 }, limits: PLAN_LIMITS.free, plan: "free" as PlanId };

export default function SettingsPage() {
  const data = useSyncExternalStore(subscribeToUsage, getUsageSnapshot, () => SERVER_USAGE);

  function changePlan(plan: PlanId) {
    setPlan(plan);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </span>
            ChatFrame AI
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-5 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              This build runs without a live authentication backend — you&apos;re using a local demo
              session stored only in this browser. Sign-in with Supabase Auth (email/magic link/Google)
              is architected but requires a provisioned Supabase project to activate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Local demo session</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Switch plans locally to preview limit changes (no payment is processed).</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            {(["free", "creator", "pro"] as PlanId[]).map((plan) => (
              <Button
                key={plan}
                variant={data.plan === plan ? "default" : "outline"}
                size="sm"
                onClick={() => changePlan(plan)}
                className="capitalize"
              >
                {plan}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage this month</CardTitle>
            <CardDescription>Resets automatically at the start of each calendar month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <UsageRow label="AI generations" used={data.usage.aiGenerations} limit={data.limits.aiGenerationsPerMonth} />
            <UsageRow label="Screenshots" used={data.usage.screenshots} limit={data.limits.screenshotsPerMonth} />
            <UsageRow label="Videos" used={data.usage.videos} limit={data.limits.videosPerMonth} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-zinc-600">{label}</span>
        <span className="font-medium text-zinc-900">{used} / {limit}</span>
      </div>
      <Progress value={(used / limit) * 100} />
    </div>
  );
}
