# Compliance Tracker — LedgersCFO Assignment

A full-stack mini app to track compliance tasks for multiple clients.

🔗 **Live Demo**: [(https://compliance-tracker-three.vercel.app)]

## Tech Stack
- **Frontend + Backend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Features
- View and select clients from sidebar
- View, add, and filter tasks per client
- Update task status inline (Pending → In Progress → Completed)
- Overdue tasks highlighted in orange
- Filter by status and category
- Search tasks by title/category
- Summary stats (total, pending, completed, overdue)
- Seed data included

## Local Setup
1. Clone the repo: `git clone <repo-url>`
2. Install deps: `npm install`
3. Create `.env.local`:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
4. Run: `npm run dev`

## Tradeoffs & Assumptions
- Used Supabase (managed Postgres) instead of a custom backend — saves time, production-ready
- No auth — assumed single-user internal tool per the assignment scope
- Filtering done server-side via query params for clean API design
- Overdue = due_date < today AND status ≠ Completed