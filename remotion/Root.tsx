import { Composition } from "remotion";
import { ChatVideo, calculateChatVideoMetadata, chatVideoPropsSchema } from "./compositions/ChatVideo";
import {
  createDefaultExportSettings,
  createDefaultPlaybackSettings,
  createDefaultTheme,
} from "@/lib/validation/schemas";
import { birthdaySurpriseDemo } from "@/lib/seed/demoProjects";
import "../app/globals.css";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ChatVideo"
      component={ChatVideo}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1920}
      schema={chatVideoPropsSchema}
      defaultProps={{
        conversation: birthdaySurpriseDemo(),
        theme: createDefaultTheme(),
        playbackSettings: createDefaultPlaybackSettings(),
        exportSettings: createDefaultExportSettings(),
      }}
      calculateMetadata={calculateChatVideoMetadata}
    />
  );
};
