import { Avatar } from "./Avatar";

export function TypingIndicator({
  name,
  avatar,
  color,
  dark,
}: {
  name: string;
  avatar?: string;
  color?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-end gap-1.5 max-w-[75%] mb-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <Avatar name={name} src={avatar} color={color} size={22} />
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-3.5 py-3 shadow-sm"
        style={{ background: dark ? "#1f2c34" : "#ffffff" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full opacity-60"
            style={{
              background: dark ? "#aebac1" : "#8696a0",
              animation: `chatframe-typing-bounce 1.1s ${i * 0.15}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
