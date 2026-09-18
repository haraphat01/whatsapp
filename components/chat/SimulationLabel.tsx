import { SimulationLabelPosition } from "@/lib/validation/schemas";

export function SimulationLabel({ position }: { position: SimulationLabelPosition }) {
  if (position === "hidden") return null;

  if (position === "watermark") {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="rotate-[-18deg] text-[13px] font-semibold tracking-widest text-black/10 select-none whitespace-nowrap">
          SIMULATED CONVERSATION · CHATFRAME AI
        </span>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 flex justify-center ${
        position === "top" ? "top-1" : "bottom-1"
      }`}
    >
      <span className="rounded-full bg-black/55 px-2.5 py-0.5 text-[9.5px] font-medium tracking-wide text-white/90 select-none">
        SIMULATED CONVERSATION
      </span>
    </div>
  );
}
