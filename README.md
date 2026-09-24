# Neom — NEMP (Neom Educational Mobility Platform)

AI-powered university application platform. Students apply to partner universities worldwide with guided multi-step flows and AI assistance. Admins manage applications, categories, promotions, and email campaigns through a full dashboard with an integrated AI agent.

## Features

### Student Portal (`/student`)
- **Dashboard** — Track applications, view progress, and access the AI assistant
- **6-Step Application** — Profile → Destination → Academic → Programs → Documents → Review
- **University Explorer** — Filter by country, category, and program
- **AI Assistant** — Powered by Groq or DeepSeek; helps students understand services, universities, and the application process

### Admin Dashboard (`/admin`)
- **Overview** — Key metrics and recent activity
- **Applications** — Review, filter, and update application statuses
- **Users** — View registered students and admins
- **Universities** — Publish/unpublish partner institutions
- **Categories** — Create and manage university categories
- **Promotions** — Manage promotional campaigns
- **Email Campaigns** — View and manage email outreach
- **AI Agent** — Admin AI that can manage applications, create categories, research universities, and search the platform

### Landing Page (`/`)
- Futuristic 3D UI with glassmorphism design
- Feature highlights, process overview, and partner university showcase

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Live Deployment (Railway)

**Production URL:** [https://neom-production.up.railway.app](https://neom-production.up.railway.app)

**Railway Dashboard:** [https://railway.com/project/00dae2c5-3537-4c0f-96ef-62d1c2081c9d](https://railway.com/project/00dae2c5-3537-4c0f-96ef-62d1c2081c9d)

For Supabase Auth on production, add this redirect URL in **Supabase → Authentication → URL Configuration**:
```
https://neom-production.up.railway.app/api/auth/callback
```
Also set **Site URL** to `https://neom-production.up.railway.app`.

## Supabase Setup (Real Database)

1. **Environment** — `.env.local` must include:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Run migration** — Open [Supabase SQL Editor](https://supabase.com/dashboard/project/ytdhzjdwfhtxzmobikzp/sql/new), paste `supabase/migrations/001_initial_schema.sql`, and click **Run**.

   Or with a database connection string:
   ```bash
   # Add SUPABASE_DB_URL to .env.local (Settings → Database → Connection string)
   npm run db:migrate
   ```

3. **Seed data** — Visit [http://localhost:3000/setup](http://localhost:3000/setup) and click **Run Seed**, or:
   ```bash
   npm run db:seed
   ```

4. **Login** — Demo accounts after seed:
   | Role    | Email               | Password          |
   |---------|---------------------|-------------------|
   | Admin   | admin@neom.edu      | NeomAdmin2026!    |
   | Student | ahmed@student.com   | NeomStudent2026!  |

> **Security:** Never commit `.env.local`. The service role key must stay server-side only.

## AI Configuration

Copy `.env.example` to `.env.local` and add your API key:

```env
AI_PROVIDER=groq          # or "deepseek"
GROQ_API_KEY=your_key     # https://console.groq.com
DEEPSEEK_API_KEY=your_key # https://platform.deepseek.com
```

The platform works without API keys using intelligent fallback responses. Connect Groq or DeepSeek for full AI capabilities.

## Tech Stack

- **Next.js 16** — App Router, TypeScript
- **Tailwind CSS 4** — Futuristic dark theme with glassmorphism
- **Framer Motion** — Smooth animations
- **React Three Fiber** — 3D background elements
- **Zustand** — Client state with localStorage persistence
- **Groq / DeepSeek** — AI models for student and admin assistants

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── student/              # Student portal
│   ├── admin/                # Admin dashboard
│   └── api/ai/               # AI API routes
├── components/
│   ├── 3d/                   # Three.js scene
│   ├── ai/                   # Chat panel
│   ├── landing/              # Landing page sections
│   ├── student/              # Student sidebar
│   ├── admin/                # Admin sidebar
│   └── ui/                   # Shared UI components
└── lib/
    ├── data.ts               # Seed data & knowledge base
    ├── store.ts              # Zustand store
    ├── ai.ts                 # AI integration
    └── types.ts              # TypeScript types
```

## License

Private — Neom Platform
