import "server-only";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { generateId } from "@/lib/utils";

const DIR = path.join(os.tmpdir(), "chatframe-renders");

async function ensureDir() {
  await fs.mkdir(DIR, { recursive: true });
}

export async function writeRenderPayload(data: unknown): Promise<string> {
  await ensureDir();
  const id = generateId("render");
  await fs.writeFile(path.join(DIR, `${id}.json`), JSON.stringify(data), "utf8");
  return id;
}

export async function readRenderPayload(id: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(path.join(DIR, `${sanitize(id)}.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteRenderPayload(id: string): Promise<void> {
  try {
    await fs.unlink(path.join(DIR, `${sanitize(id)}.json`));
  } catch {
    // already gone
  }
}

function sanitize(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "");
}
