"use client";

import { BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPersona } from "@/lib/storage/personaStore";
import { toast } from "@/stores/useToastStore";

export interface PersonaFields {
  name: string;
  avatar?: string;
  role?: string;
  personality?: string;
  writingStyle?: string;
  gender?: string;
  description?: string;
  accentColor?: string;
}

export function SavePersonaButton({ fields }: { fields: PersonaFields }) {
  function handleSave() {
    if (!fields.name.trim()) {
      toast({ title: "Give this character a name first", variant: "destructive" });
      return;
    }
    createPersona(fields);
    toast({ title: `Saved "${fields.name}" to your character library`, variant: "success" });
  }

  return (
    <Button type="button" size="sm" variant="ghost" onClick={handleSave}>
      <BookmarkPlus className="h-3.5 w-3.5" /> Save as character
    </Button>
  );
}
