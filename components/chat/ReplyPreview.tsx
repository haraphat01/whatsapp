import { Message, Participant } from "@/lib/validation/schemas";

function previewText(message: Message): string {
  switch (message.type) {
    case "text":
      return message.text;
    case "image":
      return message.caption ? `📷 ${message.caption}` : "📷 Photo";
    case "video":
      return message.caption ? `🎥 ${message.caption}` : "🎥 Video";
    case "voice":
      return "🎤 Voice message";
    case "document":
      return `📄 ${message.fileName}`;
    case "location":
      return `📍 ${message.name}`;
    case "contact":
      return `👤 ${message.name}`;
    case "call":
      return message.callStatus === "missed"
        ? `${message.callType === "video" ? "📹" : "📞"} Missed ${message.callType} call`
        : `${message.callType === "video" ? "📹" : "📞"} ${message.callType === "video" ? "Video" : "Voice"} call`;
    default:
      return "";
  }
}

export function ReplyPreview({
  repliedMessage,
  sender,
  accentColor,
}: {
  repliedMessage: Message;
  sender: Participant | undefined;
  accentColor: string;
}) {
  return (
    <div
      className="mb-1 rounded-md border-l-[3px] bg-black/5 px-2 py-1"
      style={{ borderColor: accentColor }}
    >
      <p className="text-[12.5px] font-medium" style={{ color: accentColor }}>
        {sender?.isMe ? "You" : sender?.name ?? "Unknown"}
      </p>
      <p className="truncate text-[12.5px] opacity-70">{previewText(repliedMessage)}</p>
    </div>
  );
}
