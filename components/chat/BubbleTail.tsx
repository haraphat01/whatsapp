/**
 * A small original bubble-tail shape (not WhatsApp's own asset) used on the
 * last bubble of a consecutive message group, mirrored for incoming vs
 * outgoing. The curve control points are hand-tuned to look like a generic
 * chat-bubble tail rather than tracing WhatsApp's exact SVG path.
 */
export function BubbleTail({
  outgoing,
  color,
}: {
  outgoing: boolean;
  color: string;
}) {
  return (
    <svg
      width="8"
      height="13"
      viewBox="0 0 8 13"
      className="absolute bottom-0 pointer-events-none"
      style={
        outgoing
          ? { right: -7 }
          : { left: -7, transform: "scaleX(-1)" }
      }
    >
      <path d="M0 0 C 0.5 6 2 10 8 13 L 0 13 Z" fill={color} />
    </svg>
  );
}
