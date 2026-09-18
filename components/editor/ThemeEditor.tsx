"use client";

import { useProjectEditorStore } from "@/stores/useProjectEditorStore";
import { Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const WALLPAPERS = ["classic", "minimal", "dark", "warm", "professional"] as const;
const BUBBLE_STYLES = ["classic", "modern", "minimal", "rounded"] as const;

export function ThemeEditor() {
  const { project, setTheme } = useProjectEditorStore();
  if (!project) return null;
  const { theme } = project;

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs">Mode</Label>
        <div className="mt-1.5 flex gap-2">
          {(["light", "dark", "system"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setTheme({ mode: m })}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-xs capitalize",
                theme.mode === m ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-600"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">Wallpaper</Label>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {WALLPAPERS.map((w) => (
            <button
              key={w}
              onClick={() => setTheme({ wallpaper: w })}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-[11px] capitalize",
                theme.wallpaper === w ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-600"
              )}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">Bubble style</Label>
        <Select className="mt-1.5" value={theme.bubbleStyle} onChange={(e) => setTheme({ bubbleStyle: e.target.value as typeof BUBBLE_STYLES[number] })}>
          {BUBBLE_STYLES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label className="text-xs">Accent color</Label>
        <input
          type="color"
          value={theme.accentColor}
          onChange={(e) => setTheme({ accentColor: e.target.value })}
          className="mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-zinc-200"
        />
      </div>

      <div>
        <Label className="text-xs">Font size: {theme.fontSize.toFixed(1)}px</Label>
        <Slider className="mt-1.5" min={12} max={20} step={0.5} value={theme.fontSize} onChange={(e) => setTheme({ fontSize: Number(e.target.value) })} />
      </div>

      <div>
        <Label className="text-xs">Bubble corner radius: {theme.bubbleRadius}px</Label>
        <Slider className="mt-1.5" min={0} max={24} step={1} value={theme.bubbleRadius} onChange={(e) => setTheme({ bubbleRadius: Number(e.target.value) })} />
      </div>
    </div>
  );
}
