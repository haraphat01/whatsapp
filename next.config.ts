import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local dev access via 127.0.0.1/LAN IP as well as localhost — by
  // default Next only allows same-origin dev resource requests, which
  // otherwise silently blocks JS chunk loading (breaking hydration) when the
  // app is opened via an IP address instead of "localhost".
  allowedDevOrigins: ["localhost", "127.0.0.1", "127.67.211.192"],
  // Remotion's bundler/renderer (and its optional Studio/whisper deps) use
  // Node.js-specific dynamic requires and native bindings that break when
  // Next tries to statically bundle them for the video export route. Force
  // native `require` for these instead.
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/studio",
    "@remotion/tailwind-v4",
    "remotion",
    "esbuild",
  ],
};

export default nextConfig;
