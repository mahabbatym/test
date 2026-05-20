# Cherry

Production-ready Next.js 15 application with TypeScript, Tailwind CSS v4, and a modular feature-based architecture.

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **Data fetching:** TanStack React Query
- **Validation:** Zod
- **Chess:** chess.js
- **Realtime:** socket.io-client
- **Backend (ready):** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm run dev`      | Start dev server (Turbopack) |
| `npm run build`    | Production build           |
| `npm run start`    | Start production server    |
| `npm run lint`     | ESLint                     |
| `npm run lint:fix` | ESLint with auto-fix       |
| `npm run format`   | Prettier write             |
| `npm run typecheck`| TypeScript check           |

## Project structure

```
src/
├── app/                 # App Router routes & layouts
├── components/          # Shared UI (ui/, layout/)
├── config/              # Env validation (Zod)
├── features/            # Feature modules (home/, …)
├── hooks/               # Shared React hooks
├── lib/                 # Integrations (supabase, socket, chess, react-query)
├── providers/           # Client providers
├── stores/              # Zustand stores
└── types/               # Shared TS types (incl. Supabase Database)
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy values into `.env.local` (see `.env.example`).
3. (Optional) Add `SUPABASE_SERVICE_ROLE_KEY` for admin/server tasks.
4. Generate types:

   ```bash
   npx supabase gen types typescript --project-id <id> > src/types/database.ts
   ```

5. Configure Auth redirect URL: `http://localhost:3000/auth/callback`

### SSR clients (`src/lib/supabase/`)

| File | Use in |
|------|--------|
| `client.ts` | Client Components — `createClient()` |
| `server.ts` | Server Components, Actions, routes — `await createClient()` |
| `middleware.ts` | Session refresh — `updateSession(request)` |
| `admin.ts` | Service role (server-only) — `createAdminClient()` |
| `env.ts` | URL/key helpers and `isSupabaseConfigured()` |

Root `src/middleware.ts` calls `updateSession` on every matched request.

## Socket.IO

Set `NEXT_PUBLIC_SOCKET_URL` in `.env.local` and use `useSocket()` or `getSocket()` from `src/lib/socket/client.ts`.
