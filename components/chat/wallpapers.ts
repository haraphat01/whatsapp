import { Theme } from "@/lib/validation/schemas";

export function wallpaperStyle(theme: Theme): React.CSSProperties {
  const dark = theme.mode === "dark";
  switch (theme.wallpaper) {
    case "minimal":
      return {
        background: dark ? "#0d1216" : "#f3f5f4",
        backgroundImage: dark
          ? "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))"
          : "linear-gradient(180deg, rgba(0,0,0,0.015), rgba(0,0,0,0.01))",
      };
    case "dark":
      return {
        background: "#0a1014",
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
      };
    case "warm":
      return {
        background: dark
          ? "linear-gradient(180deg,#2a1f15,#1a1410)"
          : "linear-gradient(180deg,#fdf3e7,#f7e6cf)",
        backgroundImage: dark
          ? "radial-gradient(circle at 15% 25%, rgba(255,255,255,0.06), transparent 25%), radial-gradient(circle at 80% 65%, rgba(0,0,0,0.12), transparent 26%)"
          : "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.04) 0, transparent 35%), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.03) 0, transparent 32%)",
      };
    case "professional":
      return {
        background: dark ? "#11151c" : "#eef1f5",
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(18,20,24,0.02))",
      };
    case "custom":
      return theme.wallpaperCustomUrl
        ? { backgroundImage: `url(${theme.wallpaperCustomUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { background: dark ? "#0b141a" : "#e5ddd5" };
    case "classic":
    default:
      return {
        background: dark ? "#0b141a" : "#e5ddd5",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.03) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.03) 0, transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.015))",
      };
  }
}
