"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircle, PlayCircle, Save } from "lucide-react";
import { useProjectEditorStore } from "@/stores/useProjectEditorStore";
import { getProject, getProjectSnapshot, subscribeToProjects } from "@/lib/storage/projectStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MessagesPanel } from "@/components/editor/MessagesPanel";
import { ParticipantEditor } from "@/components/editor/ParticipantEditor";
import { ThemeEditor } from "@/components/editor/ThemeEditor";
import { TimingEditor } from "@/components/editor/TimingEditor";
import { ExportPanel } from "@/components/editor/ExportPanel";
import { MessageEditor } from "@/components/editor/MessageEditor";

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const { project, selectedMessageId, selectMessage, loadProject, setProjectName, save, isDirty } =
    useProjectEditorStore();
  // Used only to decide whether the project exists; loading the working copy
  // into the editor store happens once per route id below, so autosaves
  // (which also touch localStorage) don't re-trigger and reset selection.
  const storedProject = useSyncExternalStore(
    subscribeToProjects,
    () => getProjectSnapshot(params.id),
    () => null
  );

  useEffect(() => {
    const found = getProject(params.id);
    if (found) loadProject(found);
  }, [params.id, loadProject]);

  useEffect(() => {
    if (!isDirty) return;
    const timeout = setTimeout(() => save(), 800);
    return () => clearTimeout(timeout);
  }, [isDirty, save]);

  if (!project && storedProject === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-medium text-zinc-700">Project not found</p>
        <Link href="/projects"><Button variant="outline">Back to projects</Button></Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </span>
          </Link>
          <Input
            className="h-8 w-56 border-transparent bg-transparent text-sm font-medium hover:border-zinc-200 focus:border-zinc-300"
            value={project.name}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{isDirty ? "Saving..." : "Saved"}</span>
          <Button size="sm" variant="outline" onClick={save}>
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
          <Link href={`/preview/${project.id}`}>
            <Button size="sm">
              <PlayCircle className="h-3.5 w-3.5" /> Preview
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[300px_1fr_320px]">
        <aside className="hidden overflow-x-hidden overflow-y-hidden border-r border-zinc-200 bg-white p-4 lg:flex lg:flex-col">
          <Tabs defaultValue="messages" className="flex h-full flex-col">
            <TabsList className="mb-4 w-full flex-wrap justify-start">
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto chatframe-scrollbar pr-1">
              <TabsContent value="messages" className="h-full"><MessagesPanel /></TabsContent>
              <TabsContent value="people"><ParticipantEditor /></TabsContent>
              <TabsContent value="theme"><ThemeEditor /></TabsContent>
              <TabsContent value="timing"><TimingEditor /></TabsContent>
              <TabsContent value="export"><ExportPanel /></TabsContent>
            </div>
          </Tabs>
        </aside>

        <main className="flex items-center justify-center overflow-y-auto bg-zinc-100 p-6">
          <div className="h-[680px] w-[340px] flex-shrink-0">
            <ChatWindow
              conversation={project.conversation}
              theme={project.theme}
              exportSettings={project.exportSettings}
              selectedMessageId={selectedMessageId}
              onSelectMessage={selectMessage}
            />
          </div>
        </main>

        <aside className="hidden overflow-hidden border-l border-zinc-200 bg-white p-4 lg:block">
          <MessageEditor />
        </aside>
      </div>
    </div>
  );
}
