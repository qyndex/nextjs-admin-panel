# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Admin Panel — Back-office admin panel with Supabase authentication, role-based access control (admin/editor/viewer), user management, key-value settings editor, and a searchable audit log. Dashboard shows real-time stats from the database. All data stored in Supabase (PostgreSQL with RLS).

Built with Next.js 14, React 18, TypeScript 5.9, Tailwind CSS, and Supabase.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npx tsc --noEmit         # Type check
npm run lint             # ESLint
npm run test             # Vitest unit tests
npm run test:watch       # Vitest watch mode

# Database
npx supabase start       # Start local Supabase
npx supabase db reset    # Reset DB and apply migrations + seed
npm run db:migrate       # Apply pending migrations
```

## Architecture

- `src/app/` — App Router pages and layouts
  - `src/app/auth/login/` — Login page (email/password via Supabase Auth)
  - `src/app/admin/users/` — User management with role editing (admin only)
  - `src/app/admin/settings/` — Key-value settings editor
  - `src/app/admin/audit/` — Searchable, filterable audit log with pagination
  - `src/app/api/admin/` — API routes for stats, users, settings, audit
- `src/components/` — Reusable React components
  - `src/components/auth/` — AuthProvider context with role-based access
  - `src/components/AppShell.tsx` — Layout wrapper (sidebar for authed, standalone for login)
- `src/lib/` — Utilities, Supabase client
  - `src/lib/supabase.ts` — Browser and server Supabase clients
- `src/types/` — TypeScript type definitions matching DB schema
- `src/middleware.ts` — Auth middleware protecting all routes except /auth/*
- `supabase/migrations/` — Database migrations
- `supabase/seed.sql` — Seed data (5 users, 10 settings, 15 audit entries)
- `public/` — Static assets

## Database Schema

Three tables: `profiles`, `settings`, `audit_log`. RLS enabled on all tables. Admins can see everything; editors can read settings and their own audit entries; viewers have limited access. Auto-profile trigger creates profile on user signup.

## Key Patterns

- **RBAC:** Three roles (admin, editor, viewer). AuthProvider exposes `role`, `isAdmin`. Admin-only actions check role before rendering controls.
- **Audit trail:** All role changes and settings modifications are logged to the audit_log table via API routes.
- **Auth flow:** Supabase Auth with email/password. Middleware redirects unauthenticated users to /auth/login. AuthProvider wraps the app with user + profile state.
- **API routes:** Next.js API routes in src/app/api/admin/ use the service role client for DB operations.

## Demo Credentials

- admin@example.com / password123 (Admin)
- editor@example.com / password123 (Editor)
- viewer@example.com / password123 (Viewer)

## Rules

- TypeScript strict mode — no `any` types
- All components must have proper TypeScript interfaces
- Use Tailwind utility classes — no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
- Use `next/image` for all images, `next/link` for navigation
- Supabase queries use the typed client from `src/lib/supabase.ts`
