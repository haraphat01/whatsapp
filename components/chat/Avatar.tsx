import { User } from "lucide-react";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  src,
  color = "#25D366",
  size = 40,
  className,
  /** No saved contact name to derive initials from — WhatsApp shows a generic
   * person silhouette on a neutral gray circle instead of colored initials. */
  generic = false,
}: {
  name: string;
  src?: string;
  color?: string;
  size?: number;
  className?: string;
  generic?: boolean;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover flex-shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  if (generic) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-full flex-shrink-0 bg-[#8696a0]", className)}
        style={{ width: size, height: size }}
      >
        <User className="text-white" style={{ width: size * 0.58, height: size * 0.58 }} fill="currentColor" strokeWidth={0} />
      </div>
    );
  }
  return (
    <div
      className={cn("flex items-center justify-center rounded-full flex-shrink-0 font-semibold text-white", className)}
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials(name || "?")}
    </div>
  );
}
