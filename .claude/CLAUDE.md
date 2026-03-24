# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collaborative todo application with rich features (priority, due dates, tags, subtasks, drag-and-drop, search) and real-time list sharing with role-based access.

## Commands

- `npm run dev` — Start Vite dev server (http://localhost:5173)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `npm test` — Run all tests (Vitest)
- `npm run test:watch` — Run tests in watch mode
- `npx vitest run src/path/to/file.test.tsx` — Run a single test file
- `npm run db:push` — Push SQL migrations to Supabase (requires `npx supabase link` first)

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 6
- **UI:** shadcn/ui (Radix UI + Tailwind CSS v4)
- **Backend/DB:** Supabase (Postgres, Auth, Real-time, RLS)
- **Data fetching:** TanStack Query v5
- **Routing:** React Router v7
- **Module system:** ESM (`"type": "module"`)

## Architecture

- **State:** TanStack Query for server state, React Context for auth/theme, URL params for filters
- **Real-time:** Supabase Realtime events → invalidate TanStack Query cache
- **Auth:** Supabase Auth (email/password + OAuth) via AuthProvider context
- **Permissions:** Row-level security in Postgres; `has_list_access()` / `has_editor_access()` helper functions
- **Path alias:** `@/` → `src/` (configured in tsconfig + vite.config.ts)

## Key Directories

- `src/lib/` — Supabase client, utilities, constants
- `src/types/` — Database types (placeholder until `supabase gen types`), domain types
- `src/hooks/` — Data fetching hooks (TanStack Query + Supabase)
- `src/providers/` — Auth, Query, Theme providers
- `src/components/ui/` — shadcn/ui primitives (installed via CLI)
- `src/pages/` — Route-level page components
- `supabase/migrations/` — SQL migrations (tables, RLS, realtime, functions)

## shadcn/ui

- Config in `components.json` with `resolvedPaths` pointing to `src/`
- Add new components: `npx shadcn@latest add <component> --yes`
- Uses `cn()` helper from `src/lib/utils.ts` for class merging

## Testing

- **Framework:** Vitest + jsdom + React Testing Library
- **Setup file:** `src/test/setup.ts` — global cleanup, Supabase mock
- **Test utils:** `src/test/test-utils.tsx` — `renderWithProviders()` wraps QueryClient + MemoryRouter
- **Convention:** Tests live in `__tests__/` directories next to the code they test
- **Supabase mock:** Global mock in setup.ts; per-test chain mocks via `mockFrom.mockReturnValue()`
- **Run after each feature:** Always add tests for new hooks and interactive components

## Database Migrations — IMPORTANT

**NEVER run `npm run db:push`, `npx supabase db push`, or any Supabase CLI command that modifies the remote database without explicit user permission.** Always ask the user to run migration commands themselves. You may create or edit migration SQL files, but pushing them to the live database is a destructive action that requires human approval.

## Database

- 7 tables: `todo_lists`, `todos`, `subtasks`, `tags`, `todo_tags`, `list_shares`, `share_invites`
- Full-text search via generated `tsvector` column on `todos`
- RLS enabled on all tables
- `accept_invite()` SECURITY DEFINER function for share link acceptance
