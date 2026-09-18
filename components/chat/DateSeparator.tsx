export function DateSeparator({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div className="flex justify-center my-2 select-none">
      <span
        className="rounded-lg px-3 py-1 text-[11.5px] font-medium shadow-sm"
        style={{
          background: dark ? "rgba(30,42,49,0.9)" : "rgba(255,255,255,0.9)",
          color: dark ? "#cfd9dd" : "#54656f",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function UnreadDivider({ dark }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2 my-2 px-4 select-none">
      <div className="h-px flex-1" style={{ background: dark ? "#2a3942" : "#d1d7db" }} />
      <span className="text-[11px] font-medium" style={{ color: dark ? "#8696a0" : "#667781" }}>
        UNREAD MESSAGES
      </span>
      <div className="h-px flex-1" style={{ background: dark ? "#2a3942" : "#d1d7db" }} />
    </div>
  );
}
