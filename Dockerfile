FROM node:22-bookworm-slim

# Screenshot export (Playwright) and video export (Remotion) both launch a
# headless Chromium at runtime. Neither is a pure-JS dependency — Chromium
# needs these shared libraries present in the OS image, which a minimal
# Node slim image doesn't ship. Remotion's renderer also shells out to
# ffmpeg for the final encode. ffmpeg isn't part of Playwright's own
# dependency list, so it's installed separately here.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Playwright 1.63 launches Chromium's headless shell for screenshots, so both
# artifacts are installed — the regular browser package alone does not
# include it. --with-deps lets Playwright install the exact OS packages its
# specific Chromium build needs for the container's actual architecture,
# rather than a hand-picked list that turned out to be incomplete on x64
# (missing libglib-2.0.so.0) despite working on arm64.
RUN npx playwright install --with-deps chromium chromium-headless-shell

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
# Server-side screenshot rendering should call the app directly instead of
# hairpinning through Coolify's public reverse proxy.
ENV RENDER_BASE_URL=http://127.0.0.1:3000
EXPOSE 3000

CMD ["npm", "start"]
