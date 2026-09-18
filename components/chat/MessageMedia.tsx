import { FileText, MapPin, Play, User } from "lucide-react";
import { Message } from "@/lib/validation/schemas";
import { formatFileSize } from "@/lib/utils";

export function MessageMedia({ message }: { message: Message }) {
  if (message.type === "image") {
    return (
      <div className="mb-1 overflow-hidden rounded-lg">
        {message.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={message.mediaUrl} alt={message.caption ?? "Photo"} className="max-h-72 w-full object-cover" />
        ) : (
          <div className="flex h-44 w-64 items-center justify-center bg-gradient-to-br from-zinc-300 to-zinc-400 text-zinc-600 text-sm">
            Photo
          </div>
        )}
      </div>
    );
  }

  if (message.type === "video") {
    return (
      <div className="relative mb-1 overflow-hidden rounded-lg">
        <div className="flex h-44 w-64 items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
            <Play className="h-5 w-5 text-zinc-800 ml-0.5" fill="currentColor" />
          </div>
        </div>
        {message.durationSec != null && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            {Math.floor(message.durationSec / 60)}:{String(Math.floor(message.durationSec % 60)).padStart(2, "0")}
          </span>
        )}
      </div>
    );
  }

  if (message.type === "document") {
    return (
      <div className="mb-1 flex items-center gap-3 rounded-lg bg-black/5 px-3 py-2.5 min-w-[210px]">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/90 text-white">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium">{message.fileName}</p>
          <p className="text-[11.5px] opacity-60">
            {message.fileType.toUpperCase()} · {formatFileSize(message.fileSize)}
          </p>
        </div>
      </div>
    );
  }

  if (message.type === "location") {
    return (
      <div className="mb-1 overflow-hidden rounded-lg min-w-[220px]">
        <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
          <MapPin className="h-8 w-8 text-emerald-700" />
        </div>
        <div className="bg-black/5 px-2.5 py-1.5">
          <p className="text-[13px] font-medium">{message.name}</p>
          {message.address && <p className="text-[11.5px] opacity-60">{message.address}</p>}
        </div>
      </div>
    );
  }

  if (message.type === "contact") {
    return (
      <div className="mb-1 flex items-center gap-3 rounded-lg bg-black/5 px-3 py-2.5 min-w-[200px]">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-400 text-white">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[13.5px] font-medium">{message.name}</p>
          {message.phone && <p className="text-[11.5px] opacity-60">{message.phone}</p>}
        </div>
      </div>
    );
  }

  return null;
}
