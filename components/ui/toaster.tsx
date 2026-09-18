"use client";

import { CheckCircle2, X, XCircle, Info } from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-2.5 rounded-xl border bg-white p-3.5 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200",
            t.variant === "destructive" && "border-red-200",
            t.variant === "success" && "border-emerald-200",
            !t.variant || t.variant === "default" ? "border-zinc-200" : ""
          )}
        >
          {t.variant === "destructive" ? (
            <XCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
          ) : t.variant === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 flex-shrink-0 text-zinc-400 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-900">{t.title}</p>
            {t.description && <p className="text-xs text-zinc-500 mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
