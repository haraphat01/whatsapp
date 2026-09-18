import { z } from "zod";

/**
 * A saved character/persona: the reusable traits of a participant, without
 * anything tied to a specific conversation (no isMe/online/message refs).
 * Personas live in their own store (lib/storage/personaStore.ts) and can be
 * dropped into any project's participants from the wizard or the editor.
 */
export const personaSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  avatar: z.string().default(""),
  role: z.string().optional(),
  personality: z.string().optional(),
  writingStyle: z.string().optional(),
  gender: z.string().optional(),
  description: z.string().optional(),
  accentColor: z.string().default("#25D366"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Persona = z.infer<typeof personaSchema>;
