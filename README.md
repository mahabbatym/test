# Cherry

A premium, real-time chess platform with AI opponents, multiplayer rooms, and a refined cherry-red design system.

## Who it's for

- Chess enthusiasts who want a beautiful, distraction-free playing experience
- Casual players looking to practice against Stockfish at 8 difficulty levels
- Developers looking for a reference Next.js 15 + Supabase + chess.js architecture

## Features

- **Instant play** — click "Play now" and start a game against AI with zero sign-up
- **Stockfish AI** — 8 difficulty levels (depth 4–18) running in a Web Worker
- **Legal move highlighting** — click any piece to see valid destinations
- **Drag & drop** — powered by chessground with smooth animations
- **Check / Checkmate / Stalemate detection** — visual alerts and game-over modal
- **Move history** — algebraic notation (e4, Nf3, O-O…) shown in real-time
- **Captured pieces** — displayed above/below the board
- **Evaluation bar** — live Stockfish centipawn evaluation
- **New Game / Resign / Draw / Flip board** — all buttons functional
- **Dark & Light theme** — toggle in header, saved to localStorage
- **Mobile responsive** — touch drag & drop, scales to 375px
- **Multiplayer rooms** — Supabase Realtime with presence & disconnect forfeit
- **Auth** — email/password via Supabase (sign up, sign in, sign out)
- **Game persistence** — games saved to Supabase with ELO rating system
- **Leaderboard** — global ELO rankings
- **i18n** — Kazakh, Russian, Korean language support

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Chess logic | chess.js |
| Board renderer | chessground (vendored) |
| AI engine | Stockfish WASM (Web Worker) |
| State | Zustand |
| Data fetching | TanStack React Query |
| Backend | Supabase (Auth, Postgres, Realtime) |
| Animations | Framer Motion |
| Validation | Zod |
| Icons | Lucide React |

## Getting started

```bash
# 1. Clone and install
git clone <repo-url> && cd Cherry
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your Supabase credentials (see below)

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — click **Play now** to start immediately.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | No | App base URL (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key for admin operations |
| `NEXT_PUBLIC_SOCKET_URL` | No | WebSocket server URL (optional) |

\* Required for auth, multiplayer, and game persistence. Local AI play works without them.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier write |
| `npm run typecheck` | TypeScript check |

## Project structure

```
src/
├── app/                 # App Router routes & layouts
│   ├── play/local/      # No-auth local chess game
│   └── play/[gameId]/   # Authenticated multiplayer game
├── components/          # Shared UI (ui/, layout/, auth/)
├── config/              # Env validation (Zod)
├── features/            # Feature modules
│   ├── chess/           # Engine, types, utilities
│   └── game/            # Actions, components
├── hooks/               # useStockfish, useMultiplayer, useHearts
├── lib/                 # Integrations (supabase, db, socket)
├── providers/           # Theme, i18n, React Query
├── stores/              # Zustand chess store
├── utils/               # Stockfish config, AI coach
└── vendor/              # chessground (vendored)
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy values into `.env.local` (see `.env.example`)
3. Run migrations from `supabase/` directory
4. Configure Auth redirect URL: `http://localhost:3000/auth/callback`

## License

Private — all rights reserved.
