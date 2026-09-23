"use client";

import { useState } from "react";
import { ImageIcon, Loader2, Video } from "lucide-react";
import { useProjectEditorStore } from "@/stores/useProjectEditorStore";
import { Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { canUse, recordUsage, getUsage } from "@/lib/usage/usage";
import { toast } from "@/stores/useToastStore";
import { captureViewportAnchor } from "@/lib/rendering/viewportAnchor";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const { project, setExportSettings } = useProjectEditorStore();
  const [exporting, setExporting] = useState<"screenshot" | "video" | null>(null);
  if (!project) return null;
  const { exportSettings } = project;
  const { limits } = getUsage();

  async function exportScreenshot(format: "png" | "jpeg") {
    if (!project) return;
    if (!canUse("screenshots")) {
      toast({ title: "Monthly screenshot limit reached", description: "Upgrade your plan for more exports.", variant: "destructive" });
      return;
    }
    const preview = document.getElementById("editor-preview");
    const viewport =
      exportSettings.screenshotMode === "viewport" && preview ? captureViewportAnchor(preview) ?? undefined : undefined;
    setExporting("screenshot");
    try {
      const res = await fetch("/api/export/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: project.conversation,
          theme: project.theme,
          exportSettings: { ...exportSettings, format },
          viewport,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Screenshot export failed.");
      }
      const blob = await res.blob();
      downloadBlob(blob, `chatframe-export.${format}`);
      recordUsage("screenshots");
      toast({ title: "Screenshot exported", variant: "success" });
    } catch (err) {
      toast({ title: "Export failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  }

  async function exportVideo(format: "mp4" | "webm") {
    if (!project) return;
    if (!canUse("videos")) {
      toast({ title: "Monthly video limit reached", description: "Upgrade your plan for more exports.", variant: "destructive" });
      return;
    }
    setExporting("video");
    try {
      const res = await fetch("/api/export/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: project.conversation,
          theme: project.theme,
          playbackSettings: project.playbackSettings,
          exportSettings: { ...exportSettings, format },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Video export failed.");
      }
      const blob = await res.blob();
      downloadBlob(blob, `chatframe-export.${format}`);
      recordUsage("videos");
      toast({ title: "Video exported", variant: "success" });
    } catch (err) {
      toast({ title: "Export failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs">Device frame</Label>
        <Select
          className="mt-1.5"
          value={exportSettings.deviceFrame}
          onChange={(e) => setExportSettings({ deviceFrame: e.target.value as typeof exportSettings.deviceFrame })}
        >
          <option value="none">None (looks like a real screenshot/recording)</option>
          <option value="modern">Generic modern smartphone (marketing mockup)</option>
          <option value="ios">Generic iOS-style (marketing mockup)</option>
          <option value="android">Generic Android-style (marketing mockup)</option>
        </Select>
      </div>

      <label className="flex items-center justify-between text-xs text-zinc-600">
        Show status bar
        <Switch checked={exportSettings.showStatusBar} onCheckedChange={(v) => setExportSettings({ showStatusBar: v })} />
      </label>

      <div>
        <Label className="text-xs">Simulation label</Label>
        <Select
          className="mt-1.5"
          value={exportSettings.simulationLabel}
          onChange={(e) => setExportSettings({ simulationLabel: e.target.value as typeof exportSettings.simulationLabel })}
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="watermark">Watermark</option>
          <option value="hidden">Hidden</option>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Aspect ratio</Label>
        <Select
          className="mt-1.5"
          value={exportSettings.aspectRatio}
          onChange={(e) => setExportSettings({ aspectRatio: e.target.value as typeof exportSettings.aspectRatio })}
        >
          <option value="9:16">9:16 (portrait)</option>
          <option value="16:9">16:9 (landscape)</option>
          <option value="1:1">1:1 (square)</option>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Resolution</Label>
        <Select
          className="mt-1.5"
          value={exportSettings.resolution}
          onChange={(e) => setExportSettings({ resolution: e.target.value as typeof exportSettings.resolution })}
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="1440p" disabled={limits.maxResolution === "720p" || limits.maxResolution === "1080p"}>1440p</option>
          <option value="2160p" disabled={!limits.fourK}>4K (2160p){!limits.fourK ? " — Pro" : ""}</option>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Frame rate (video)</Label>
        <Select
          className="mt-1.5"
          value={String(exportSettings.frameRate)}
          onChange={(e) => setExportSettings({ frameRate: Number(e.target.value) as 30 | 60 })}
        >
          <option value="30">30 FPS</option>
          <option value="60">60 FPS</option>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Video mode</Label>
        <Select
          className="mt-1.5"
          value={exportSettings.videoMode}
          onChange={(e) => setExportSettings({ videoMode: e.target.value as typeof exportSettings.videoMode })}
        >
          <option value="live-playback">Live screen recording</option>
          <option value="scrolling">Scroll-through recording</option>
          <option value="finalized">Completed conversation</option>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Screenshot mode</Label>
        <Select
          className="mt-1.5"
          value={exportSettings.screenshotMode}
          onChange={(e) => setExportSettings({ screenshotMode: e.target.value as typeof exportSettings.screenshotMode })}
        >
          <option value="viewport">Visible viewport</option>
          <option value="full">Full conversation</option>
        </Select>
        {exportSettings.screenshotMode === "viewport" && (
          <p className="mt-1.5 text-[11px] text-zinc-400">
            Scroll the preview to the part you want — the screenshot captures exactly what&apos;s shown there.
          </p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-200 pt-4">
        <p className="text-xs font-semibold text-zinc-500">Export</p>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" disabled={exporting !== null} onClick={() => exportScreenshot("png")}>
            {exporting === "screenshot" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />} PNG
          </Button>
          <Button size="sm" variant="outline" disabled={exporting !== null} onClick={() => exportScreenshot("jpeg")}>
            {exporting === "screenshot" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />} JPEG
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" disabled={exporting !== null} onClick={() => exportVideo("mp4")}>
            {exporting === "video" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />} MP4
          </Button>
          <Button size="sm" disabled={exporting !== null} onClick={() => exportVideo("webm")}>
            {exporting === "video" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />} WebM
          </Button>
        </div>
        {exporting === "video" && (
          <p className="text-[11px] text-zinc-400">Rendering video — this can take a minute for longer conversations.</p>
        )}
      </div>
    </div>
  );
}
