import "server-only";

/**
 * Resolve an origin that the server-side renderers can reach from inside the
 * application container. A public proxy hostname can fail here because it
 * requires a network hairpin back into the same container.
 */
export function renderOrigin(req: Request): string {
  const configuredOrigin = process.env.RENDER_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configuredOrigin) return configuredOrigin.replace(/\/$/, "");

  const url = new URL(req.url);
  return `http://127.0.0.1:${process.env.PORT ?? url.port ?? "3000"}`;
}