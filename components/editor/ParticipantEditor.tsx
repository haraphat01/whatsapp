"use client";

import { useState } from "react";
import { Camera, ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { useProjectEditorStore } from "@/stores/useProjectEditorStore";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/chat/Avatar";
import { PARTICIPANT_COLORS } from "@/stores/useWizardStore";
import { PersonaPickerButton } from "@/components/create/PersonaPicker";
import { SavePersonaButton } from "@/components/create/SavePersonaButton";
import { fileToDataUrl } from "@/lib/utils";
import { toast } from "@/stores/useToastStore";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function ParticipantEditor() {
  const { project, updateParticipant, removeParticipant, addParticipant } = useProjectEditorStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  if (!project) return null;
  const { participants, isGroup } = project.conversation;

  async function handleAvatarUpload(participantId: string, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Not an image", description: "Please choose an image file.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast({ title: "Image too large", description: "Please choose an image under 2MB.", variant: "destructive" });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    updateParticipant(participantId, { avatar: dataUrl });
  }

  return (
    <div className="space-y-3">
      {participants.map((p) => {
        const expanded = expandedId === p.id;
        return (
          <div key={p.id} className="rounded-xl border border-zinc-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="group relative block h-8 w-8 shrink-0 cursor-pointer" title="Upload profile picture">
                  <Avatar name={p.name} src={p.avatar || undefined} color={p.accentColor} size={32} />
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleAvatarUpload(p.id, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {p.avatar && (
                  <button
                    type="button"
                    onClick={() => updateParticipant(p.id, { avatar: "" })}
                    className="text-zinc-400 hover:text-red-500"
                    aria-label="Remove profile picture"
                    title="Remove profile picture"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <input
                  type="color"
                  value={p.accentColor}
                  onChange={(e) => updateParticipant(p.id, { accentColor: e.target.value })}
                  className="h-6 w-6 cursor-pointer rounded border-0"
                  title="Accent color"
                />
                <Input
                  className="h-8 text-sm"
                  value={p.name}
                  onChange={(e) => updateParticipant(p.id, { name: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpandedId(expanded ? null : p.id)}
                  className="text-zinc-400 hover:text-zinc-700"
                  aria-label={expanded ? "Hide traits" : "Show traits"}
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {participants.length > 2 && (
                  <button onClick={() => removeParticipant(p.id)} className="text-zinc-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <label className="flex items-center gap-1.5">
                <Switch checked={p.isMe} onCheckedChange={(v) => updateParticipant(p.id, { isMe: v })} />
                This is me (outgoing)
              </label>
              <label className="flex items-center gap-1.5">
                <Switch checked={p.online} onCheckedChange={(v) => updateParticipant(p.id, { online: v })} />
                Online
              </label>
            </div>

            {expanded && (
              <div className="mt-3 space-y-2.5 border-t border-zinc-100 pt-3">
                <div className="flex items-center gap-2">
                  <PersonaPickerButton
                    onSelect={(persona) =>
                      updateParticipant(p.id, {
                        name: persona.name,
                        role: persona.role,
                        personality: persona.personality,
                        writingStyle: persona.writingStyle,
                        gender: persona.gender,
                        description: persona.description,
                        accentColor: persona.accentColor,
                      })
                    }
                  />
                  <SavePersonaButton
                    fields={{
                      name: p.name,
                      role: p.role,
                      personality: p.personality,
                      writingStyle: p.writingStyle,
                      gender: p.gender,
                      description: p.description,
                      accentColor: p.accentColor,
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Role</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="Product Designer"
                    value={p.role ?? ""}
                    onChange={(e) => updateParticipant(p.id, { role: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Personality</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="Calm, playful, slightly sarcastic"
                    value={p.personality ?? ""}
                    onChange={(e) => updateParticipant(p.id, { personality: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Writing style</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="Short casual messages"
                    value={p.writingStyle ?? ""}
                    onChange={(e) => updateParticipant(p.id, { writingStyle: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Gender presentation</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="Woman, man, non-binary..."
                    value={p.gender ?? ""}
                    onChange={(e) => updateParticipant(p.id, { gender: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Phone number</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="+1 555 123 4567"
                    value={p.phone ?? ""}
                    onChange={(e) => updateParticipant(p.id, { phone: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Switch
                    checked={p.showPhoneAsName}
                    onCheckedChange={(v) => updateParticipant(p.id, { showPhoneAsName: v })}
                    disabled={!p.phone?.trim()}
                  />
                  Show phone number instead of name (unsaved contact)
                </label>
              </div>
            )}
          </div>
        );
      })}
      {isGroup && participants.length < 20 && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() =>
            addParticipant({ name: "New participant", accentColor: PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length] })
          }
        >
          <Plus className="h-3.5 w-3.5" /> Add participant
        </Button>
      )}
    </div>
  );
}
