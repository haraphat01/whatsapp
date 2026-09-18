"use client";

import { useRef } from "react";
import { useProjectEditorStore } from "@/stores/useProjectEditorStore";
import { Message, MessageStatus, MessageType } from "@/lib/validation/schemas";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2, Upload, X } from "lucide-react";
import { fileToDataUrl } from "@/lib/utils";
import { toast } from "@/stores/useToastStore";

const MESSAGE_TYPES: MessageType[] = ["text", "image", "video", "voice", "call", "document", "location", "contact", "system"];
const STATUSES: MessageStatus[] = ["sending", "sent", "delivered", "read", "failed", "none"];
const EMOJIS = ["❤️", "😂", "😮", "😢", "🙏", "👍", "🔥"];
const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

function toLocalDateTimeInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MessageEditor() {
  const store = useProjectEditorStore();
  const { project, selectedMessageId } = store;
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!project) return null;
  const message = project.conversation.messages.find((m) => m.id === selectedMessageId);
  if (!message) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-400">
        Select a message in the preview to edit its properties.
      </div>
    );
  }

  const { participants, messages } = project.conversation;

  async function handleMediaUpload(file: File | undefined) {
    if (!file || !message) return;
    const expectsVideo = message.type === "video";
    if (!file.type.startsWith(expectsVideo ? "video/" : "image/")) {
      toast({
        title: expectsVideo ? "Not a video" : "Not an image",
        description: `Please choose a ${expectsVideo ? "video" : "image"} file.`,
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      toast({ title: "File too large", description: "Please choose a file under 8MB.", variant: "destructive" });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    store.updateMessage(message.id, { mediaUrl: dataUrl });
  }

  function setType(type: MessageType) {
    if (!message) return;
    const base = { id: message.id, senderId: message.senderId, timestamp: message.timestamp, status: message.status, replyToId: message.replyToId, reactions: message.reactions };
    let next: Message;
    switch (type) {
      case "image":
        next = { ...base, type: "image", mediaUrl: "" };
        break;
      case "video":
        next = { ...base, type: "video", mediaUrl: "" };
        break;
      case "voice":
        next = { ...base, type: "voice", durationSec: 6, waveform: Array.from({ length: 28 }, () => Math.random() * 0.7 + 0.3) };
        break;
      case "call":
        next = { ...base, type: "call", callType: "voice", callStatus: "received", durationSec: 30 };
        break;
      case "document":
        next = { ...base, type: "document", fileName: "document.pdf", fileSize: 240_000, fileType: "pdf" };
        break;
      case "location":
        next = { ...base, type: "location", name: "Shared location" };
        break;
      case "contact":
        next = { ...base, type: "contact", name: "Contact name" };
        break;
      case "system":
        next = { ...base, type: "system", text: "Someone changed the subject" };
        break;
      case "text":
      default:
        next = { ...base, type: "text", text: "" };
    }
    store.updateMessage(message.id, next);
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto chatframe-scrollbar pr-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Message</p>
        <button onClick={() => store.selectMessage(null)} className="text-zinc-400 hover:text-zinc-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <Label className="text-xs">Sender</Label>
        <Select
          className="mt-1.5"
          value={message.senderId}
          onChange={(e) => store.updateMessage(message.id, { senderId: e.target.value })}
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>{p.name}{p.isMe ? " (me)" : ""}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label className="text-xs">Type</Label>
        <Select className="mt-1.5" value={message.type} onChange={(e) => setType(e.target.value as MessageType)}>
          {MESSAGE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </div>

      {(message.type === "text" || message.type === "system") && (
        <div>
          <Label className="text-xs">Text</Label>
          <Textarea
            className="mt-1.5"
            rows={4}
            value={message.text}
            onChange={(e) => store.updateMessage(message.id, { text: e.target.value })}
          />
        </div>
      )}

      {(message.type === "image" || message.type === "video") && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">{message.type === "image" ? "Image" : "Video"}</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> Upload from device
              </Button>
              {message.mediaUrl && (
                <button
                  type="button"
                  onClick={() => store.updateMessage(message.id, { mediaUrl: "" })}
                  className="text-xs text-zinc-400 hover:text-red-500"
                >
                  Remove
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={message.type === "image" ? "image/*" : "video/*"}
                className="hidden"
                onChange={(e) => {
                  handleMediaUpload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            {message.mediaUrl && message.type === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={message.mediaUrl} alt="" className="mt-2 h-20 w-20 rounded-lg border border-zinc-200 object-cover" />
            )}
            <p className="mt-2 text-[11px] text-zinc-400">Or paste a URL instead:</p>
            <Input
              className="mt-1"
              placeholder="https://..."
              value={message.mediaUrl}
              onChange={(e) => store.updateMessage(message.id, { mediaUrl: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Caption</Label>
            <Input
              className="mt-1.5"
              value={message.caption ?? ""}
              onChange={(e) => store.updateMessage(message.id, { caption: e.target.value })}
            />
          </div>
        </div>
      )}

      {message.type === "voice" && (
        <div>
          <Label className="text-xs">Duration (seconds)</Label>
          <Input
            className="mt-1.5"
            type="number"
            value={message.durationSec}
            onChange={(e) => store.updateMessage(message.id, { durationSec: Number(e.target.value) })}
          />
        </div>
      )}

      {message.type === "call" && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Call type</Label>
            <Select
              className="mt-1.5"
              value={message.callType}
              onChange={(e) => store.updateMessage(message.id, { callType: e.target.value as "voice" | "video" })}
            >
              <option value="voice">Voice</option>
              <option value="video">Video</option>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select
              className="mt-1.5"
              value={message.callStatus}
              onChange={(e) => store.updateMessage(message.id, { callStatus: e.target.value as "missed" | "received" })}
            >
              <option value="received">Received</option>
              <option value="missed">Missed</option>
            </Select>
          </div>
          {message.callStatus === "received" && (
            <div>
              <Label className="text-xs">Duration (seconds)</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={message.durationSec ?? 0}
                onChange={(e) => store.updateMessage(message.id, { durationSec: Number(e.target.value) })}
              />
            </div>
          )}
          <p className="text-[11px] text-zinc-400">
            The sender above is whoever placed the call — the bubble side follows them, same as any message.
          </p>
        </div>
      )}

      {message.type === "document" && (
        <div>
          <Label className="text-xs">File name</Label>
          <Input
            className="mt-1.5"
            value={message.fileName}
            onChange={(e) => store.updateMessage(message.id, { fileName: e.target.value })}
          />
        </div>
      )}

      {message.type === "location" && (
        <div>
          <Label className="text-xs">Location name</Label>
          <Input
            className="mt-1.5"
            value={message.name}
            onChange={(e) => store.updateMessage(message.id, { name: e.target.value })}
          />
        </div>
      )}

      {message.type === "contact" && (
        <div>
          <Label className="text-xs">Contact name</Label>
          <Input
            className="mt-1.5"
            value={message.name}
            onChange={(e) => store.updateMessage(message.id, { name: e.target.value })}
          />
        </div>
      )}

      <div>
        <Label className="text-xs">Timestamp</Label>
        <Input
          className="mt-1.5"
          type="datetime-local"
          value={toLocalDateTimeInput(message.timestamp)}
          onChange={(e) => store.updateMessage(message.id, { timestamp: new Date(e.target.value).toISOString() })}
        />
      </div>

      <div>
        <Label className="text-xs">Status</Label>
        <Select
          className="mt-1.5"
          value={message.status}
          onChange={(e) => store.updateMessage(message.id, { status: e.target.value as MessageStatus })}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label className="text-xs">Reply to</Label>
        <Select
          className="mt-1.5"
          value={message.replyToId ?? ""}
          onChange={(e) => store.updateMessage(message.id, { replyToId: e.target.value || undefined })}
        >
          <option value="">None</option>
          {messages
            .filter((m) => m.id !== message.id)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.type === "text" ? m.text.slice(0, 40) : `[${m.type}]`}
              </option>
            ))}
        </Select>
      </div>

      <div>
        <Label className="text-xs">Reactions</Label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EMOJIS.map((emoji) => {
            const reactor = participants.find((p) => p.isMe) ?? participants[0];
            const active = message.reactions.some((r) => r.emoji === emoji);
            return (
              <button
                key={emoji}
                onClick={() =>
                  active
                    ? store.removeReaction(message.id, reactor.id)
                    : store.addReaction(message.id, emoji, reactor.id)
                }
                className={`rounded-full border px-2 py-1 text-sm ${active ? "border-emerald-400 bg-emerald-50" : "border-zinc-200"}`}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-zinc-200 pt-4">
        <Button size="sm" variant="outline" onClick={() => store.moveMessage(message.id, "up")}>
          <ArrowUp className="h-3.5 w-3.5" /> Move up
        </Button>
        <Button size="sm" variant="outline" onClick={() => store.moveMessage(message.id, "down")}>
          <ArrowDown className="h-3.5 w-3.5" /> Move down
        </Button>
        <Button size="sm" variant="outline" onClick={() => store.addMessage(message.id, "before")}>
          <Plus className="h-3.5 w-3.5" /> Add before
        </Button>
        <Button size="sm" variant="outline" onClick={() => store.addMessage(message.id, "after")}>
          <Plus className="h-3.5 w-3.5" /> Add after
        </Button>
        <Button size="sm" variant="outline" onClick={() => store.duplicateMessage(message.id)}>
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </Button>
        <Button size="sm" variant="destructive" onClick={() => store.deleteMessage(message.id)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}
