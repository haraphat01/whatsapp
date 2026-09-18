FROM node:22-bookworm-slim

# Screenshot export (Playwright) and video export (Remotion) both launch a
# headless Chromium at runtime. Neither is a pure-JS dependency — Chromium
# needs these shared libraries present in the OS image, which a minimal
# Node slim image doesn't ship. Remotion's renderer also shells out to
# ffmpeg for the final encode.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates wget fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 \
    libcups2 libdbus-1-3 libdrm2 libexpat1 libgbm1 libglib2.0-0 \
    libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 \
    xdg-utils ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Playwright 1.63 launches Chromium's headless shell for screenshots. Install
# both artifacts because the regular browser package does not include it.
RUN npx playwright install chromium chromium-headless-shell

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
# Server-side screenshot rendering should call the app directly instead of
# hairpinning through Coolify's public reverse proxy.
ENV RENDER_BASE_URL=http://127.0.0.1:3000
EXPOSE 3000

CMD ["npm", "start"]
