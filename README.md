# DairyFarm Insight

A SaaS application for dairy and livestock farm management with industry-specific KPIs and minimal data entry burden.

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript)
- **UI**: Tailwind CSS / shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Revenue and expense management
- Herd and animal tracking
- Automatic KPI calculations
- Dashboard with profit analysis
- Subsidy and grant management
- Accounting export (CSV)
- Role-based access control

## Database Setup

Run the SQL migrations in `supabase/migrations/` to set up the database schema.


