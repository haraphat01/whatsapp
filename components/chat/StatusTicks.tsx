import { Check, CheckCheck, Clock } from "lucide-react";
import { MessageStatus } from "@/lib/validation/schemas";

export function StatusTicks({ status }: { status: MessageStatus }) {
  if (status === "none") return null;
  if (status === "sending") return <Clock className="h-3 w-3" />;
  if (status === "failed") return <span className="text-[10px] font-semibold text-red-500">!</span>;
  if (status === "sent") return <Check className="h-3.5 w-3.5" />;
  const color = status === "read" ? "#53bdeb" : "currentColor";
  return (
    <CheckCheck
      className="h-3.5 w-3.5"
      style={{ color, animation: "chatframe-tick-pop 0.25s ease-out" }}
    />
  );
}
