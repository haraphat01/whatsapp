# ChatFrame AI

Generate, edit, animate, and export fictional, simulated WhatsApp-style conversations with AI.

CREATE → AI GENERATE → EDIT → PREVIEW → PLAY → SCREENSHOT → VIDEO

ChatFrame AI is an original, independently-branded simulation product. It is not affiliated with
WhatsApp or Meta Platforms, Inc. Every conversation it produces is fictional and is labeled
"SIMULATED CONVERSATION" in exports by default.

## Product overview

- **Create wizard** — pick a conversation type (romantic, workplace, group, etc.), define
  participants and personalities, describe a scenario, choose tone/language/length/timing, and
  generate a full conversation with AI.
- **Editor** — a three-pane WhatsApp-style editor: message list / participants / theme / timing /
  export on the left, a live phone preview in the center, and per-message properties on the right.
  Every message field is editable: sender, type, text, timestamp, status, replies, reactions.
- **Preview/playback** — replays the conversation with typing indicators, staggered delivery,
  read-receipt animation, and auto-scroll, at 0.5x–2x speed, scrubbable via a timeline.
- **Export** — PNG/JPEG screenshots (viewport or full conversation) via Playwright, and MP4/WebM
  animated video via Remotion, both driven by the exact same rendering components and timing engine
  as the editor/preview (single source of truth — see `lib/timing/engine.ts`).

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4, hand-rolled UI primitives (`components/ui/*`, CVA-based)
- **State**: Zustand (`stores/*`)
- **Forms/validation**: Zod schemas shared by the client, the AI pipeline, and the API routes
  (`lib/validation/schemas.ts`, `lib/ai/schemas.ts`)
- **AI**: OpenAI or DeepSeek (OpenAI-compatible API) via the `openai` SDK — see `lib/ai/`
- **Screenshot rendering**: Playwright (headless Chromium)
- **Video rendering**: Remotion (`@remotion/bundler` + `@remotion/renderer`)
- **Persistence**: browser `localStorage` (see "Data layer" below)

## Data layer (important)

The product spec calls for a Supabase-backed Postgres database with Row Level Security and
Supabase Auth in production. **This environment has no provisioned Supabase project or
credentials**, so per the project's documented local-fallback policy, ChatFrame persists projects
to the browser's `localStorage` (`lib/storage/projectStore.ts`) and runs without real
authentication (a local-only "demo session"). The architecture is isolated behind that one module
specifically so a real Supabase client can be dropped in later without touching the rest of the
app — see "Remaining production work" below.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need:

```bash
cp .env.example .env.local
```

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | one of these two | Used if `DEEPSEEK_API_KEY` is not set |
| `OPENAI_MODEL` | no | Defaults to `gpt-4o-mini` |
| `DEEPSEEK_API_KEY` | one of these two | Takes priority over OpenAI if both are set |
| `DEEPSEEK_MODEL` | no | Defaults to `deepseek-chat` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | no | Reserved for a future Supabase migration; unused today |
| `NEXT_PUBLIC_APP_URL` | no | Only needed in production behind a proxy that doesn't set `x-forwarded-host` |
| `RENDER_BASE_URL` | no | Internal URL used by screenshot rendering; defaults to `http://127.0.0.1:3000` in Docker |
| `RENDER_CONCURRENCY` | no | Remotion render concurrency; defaults to `1` for small production containers |

AI generation requires **one** of `OPENAI_API_KEY` or `DEEPSEEK_API_KEY`. Everything else
(editor, playback, screenshot export, video export, projects, demo content) works with no keys at
all.

## Local setup

```bash
npm install
npx playwright install chromium   # only needed for screenshot export
cp .env.example .env.local        # add an OpenAI or DeepSeek key for AI generation
npm run dev
```

Open http://localhost:3000. Use `127.0.0.1:3000` instead of `localhost:3000` if you hit a
same-origin dev-resource warning in an unusual local DNS setup — `allowedDevOrigins` in
`next.config.ts` is already configured for both.

## Development

- `npm run dev` — start the dev server (Turbopack)
- `npm run lint` — ESLint (Next core-web-vitals + TypeScript rules)
- `npx tsc --noEmit` — type-check
- `npm run build && npm run start` — production build and serve

## Testing performed

This was manually verified end-to-end in a real browser and via direct API calls, since no
automated test suite is included in this build (see "Remaining production work"):

- Landing page renders and the embedded live phone demo works
- Full 7-step create wizard: type → participants → scenario → tone/language → date/time → length →
  generate, including back/forward navigation, validation, and the AI error-handling path
- Real AI generation end-to-end via DeepSeek (natural dialogue, distinct voices, replies,
  reactions, realistic timing — validated against the strict Zod schema)
- Editor: message selection, live editing of every field, participant editing, group chat
  rendering, theme changes, autosave
- Preview/playback: progressive message reveal, typing indicators, read-receipt animation,
  auto-scroll, speed control, scrubbing
- Screenshot export via the UI and via direct API call (produces a correctly-sized, correctly
  rendered PNG)
- Video export via the UI and via direct API call (produces a valid MP4)
- Projects page: demo project seeding, open/rename/duplicate/delete
- Settings/usage page: plan switching, usage counters updating correctly after real actions
- Pricing page
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass clean

## Rendering architecture

`components/chat/ChatWindow.tsx` and `components/chat/MessageList.tsx` are the single source of
truth for rendering a conversation. Four different contexts render through them with different
inputs, never different code:

1. **Editor** — full message list, interactive (click to select, drag to reorder)
2. **Preview** — `lib/timing/engine.ts` computes a canonical timeline (`buildTimeline`), and
   `stateAtTime(timeline, ms)` derives which messages/typing indicators/reactions are visible at
   any point; the preview player advances `ms` with `requestAnimationFrame`
3. **Screenshot export** (`app/api/export/screenshot/route.ts`) — writes the conversation/theme/
   export-settings payload to a temp file, has Playwright load `app/render/[renderId]/page.tsx`
   (a plain server-rendered page with no editor chrome), and screenshots it
4. **Video export** (`app/api/export/video/route.ts`) — bundles `remotion/index.ts` with
   `@remotion/bundler` and renders `remotion/compositions/ChatVideo.tsx` with `@remotion/renderer`;
   that composition uses the exact same `buildTimeline`/`stateAtTime` functions, frame-driven
   instead of real-time-driven

## Remaining production work

Everything above runs and was verified locally. These require infrastructure this environment
doesn't have:

- **Real database + auth**: swap `lib/storage/projectStore.ts` for a Supabase client, add the
  tables/RLS policies described in the product spec, and wire Supabase Auth (email, magic link,
  Google). No code outside that one module needs to change.
- **Payments**: the plan/usage system (`lib/usage/usage.ts`) is provider-agnostic and ready for
  Stripe, but no payment processing is wired up — the pricing page's plan switcher is a local
  simulation.
- **Server-side usage enforcement**: usage limits are currently tracked client-side in
  `localStorage`, which is fine for a local/demo build but is trivially bypassable; a production
  deployment needs limits enforced server-side against an authenticated user.
- **Real media uploads**: image/video/document messages accept a URL but there's no upload
  pipeline; Supabase Storage (or equivalent) would back that.
- **Automated tests**: no unit/e2e test suite is included; all verification in this build was
  manual (browser + direct API testing, described above).
- **4K video rendering** at scale and **rate limiting** beyond the simple in-memory limiter in
  `app/api/ai/generate/route.ts` (which resets per server instance/restart) would need a durable
  store (Redis/Upstash) in a multi-instance deployment.
