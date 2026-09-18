"use client";

import { Plus, Trash2, UserCircle2 } from "lucide-react";
import { useWizardStore } from "@/stores/useWizardStore";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PersonaPickerButton } from "@/components/create/PersonaPicker";
import { SavePersonaButton } from "@/components/create/SavePersonaButton";

export function ParticipantsStep() {
  const { participants, isGroup, groupName, setGroupName, addParticipant, updateParticipant, removeParticipant } =
    useWizardStore();

  const maxReached = participants.length >= 20;
  const minReached = participants.length <= 2;

  return (
    <div className="space-y-5">
      {isGroup && (
        <div>
          <Label>Group name</Label>
          <Input
            className="mt-1.5"
            placeholder="e.g. Adeyemi Family 🏡"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-4">
        {participants.map((p, index) => (
          <div key={p.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                  style={{ background: p.accentColor }}
                >
                  <UserCircle2 className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-zinc-700">Participant {index + 1}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Switch checked={p.isMe} onCheckedChange={(v) => updateParticipant(p.id, { isMe: v })} />
                  This is me
                </label>
                {!minReached && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(p.id)}
                    className="text-zinc-400 hover:text-red-500"
                    aria-label="Remove participant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <PersonaPickerButton
                onSelect={(persona) =>
                  updateParticipant(p.id, {
                    name: persona.name,
                    role: persona.role ?? "",
                    personality: persona.personality ?? "",
                    writingStyle: persona.writingStyle ?? "",
                    gender: persona.gender ?? "",
                    description: persona.description ?? "",
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  className="mt-1"
                  placeholder="Aisha"
                  value={p.name}
                  onChange={(e) => updateParticipant(p.id, { name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Role (optional)</Label>
                <Input
                  className="mt-1"
                  placeholder="Product Designer"
                  value={p.role}
                  onChange={(e) => updateParticipant(p.id, { role: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Personality</Label>
                <Input
                  className="mt-1"
                  placeholder="Calm, playful, slightly sarcastic"
                  value={p.personality}
                  onChange={(e) => updateParticipant(p.id, { personality: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Writing style</Label>
                <Input
                  className="mt-1"
                  placeholder="Short casual messages"
                  value={p.writingStyle}
                  onChange={(e) => updateParticipant(p.id, { writingStyle: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Gender presentation (optional)</Label>
                <Input
                  className="mt-1"
                  placeholder="Woman, man, non-binary..."
                  value={p.gender}
                  onChange={(e) => updateParticipant(p.id, { gender: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Notes (optional)</Label>
                <Textarea
                  className="mt-1"
                  rows={1}
                  placeholder="Anything else the AI should know"
                  value={p.description}
                  onChange={(e) => updateParticipant(p.id, { description: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {isGroup && !maxReached && (
        <Button variant="outline" onClick={addParticipant} className="w-full">
          <Plus className="h-4 w-4" /> Add participant
        </Button>
      )}
    </div>
  );
}
