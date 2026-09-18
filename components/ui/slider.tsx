import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Slider({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn(
        "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-emerald-600",
        className
      )}
      {...props}
    />
  );
}
