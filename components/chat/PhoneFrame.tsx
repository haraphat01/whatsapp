import { ReactNode } from "react";
import { DeviceFrame } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

export function PhoneFrame({
  frame,
  children,
  className,
}: {
  frame: DeviceFrame;
  children: ReactNode;
  className?: string;
}) {
  if (frame === "none") {
    return <div className={cn("relative flex h-full w-full flex-col overflow-hidden", className)}>{children}</div>;
  }

  const isIos = frame === "ios";
  const isAndroid = frame === "android";

  return (
    <div
      className={cn(
        "relative mx-auto flex h-full w-full flex-col overflow-hidden bg-black shadow-2xl",
        isIos ? "rounded-[3rem] border-[6px] border-zinc-950 p-1.5" : "rounded-[2.2rem] border-[8px] border-zinc-900 p-1",
        className
      )}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-white" style={{ borderRadius: isIos ? "2.4rem" : "1.6rem" }}>
        {isIos && (
          <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />
        )}
        {isAndroid && (
          <div className="absolute left-1/2 top-1.5 z-20 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black" />
        )}
        {children}
      </div>
    </div>
  );
}
