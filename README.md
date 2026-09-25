# Neom — NEMP (Neom Educational Mobility Platform)

AI-powered university application platform. Students sign up, explore partner universities, and complete guided multi-step applications with AI assistance.

## Features

### Student Portal (`/student`)
- **Dashboard** — Track applications, view progress, and access the AI assistant
- **6-Step Application** — Profile → Destination → Academic → Programs → Documents → Review
- **University Explorer** — Filter by country, category, and program
- **AI Assistant** — Powered by Groq or DeepSeek; helps students understand services, universities, and the application process

### Landing Page (`/`)
- Futuristic 3D UI with glassmorphism design
- Feature highlights, process overview, and partner university showcase
- Sign up and sign in flows

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Live Deployment (Railway)

**Production URL:** [https://neom-production.up.railway.app](https://neom-production.up.railway.app)

For Supabase Auth on production, add this redirect URL in **Supabase → Authentication → URL Configuration**:
```
https://neom-production.up.railway.app/api/auth/callback
```
Also set **Site URL** to `https://neom-production.up.railway.app`.

## Supabase Setup

1. **Environment** — `.env.local` must include:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. **Run migrations** — Open Supabase SQL Editor and run both files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_agent_features.sql`

   Or with a database connection string:
   ```bash
   npm run db:migrate
   ```

3. **Seed platform data**:
   ```bash
   npm run db:seed
   ```

4. **Create an account** — Students sign up at `/signup`, then sign in at `/login`.

> **Security:** Never commit `.env.local`. The service role key must stay server-side only.

## AI Agent System

Three specialized agents power the platform:

| Agent | Route | Capabilities |
|-------|-------|--------------|
| **Student Advisor** | `/student`, `/student/apply` | Search universities, recommendations, track applications |
| **Research Agent** | `/admin/research` | Web research → staging → human approval |
| **Admin AI** | `/admin/ai` | Review apps, stats, draft emails |

### AI Configuration

**Recommended — Qwen3 on Railway:**

```env
AI_PROVIDER=qwen
QWEN_API_URL=https://your-qwen-service.up.railway.app/v1
QWEN_MODEL=qwen3
QWEN_API_KEY=             # optional
```

Set these in **Railway → Neom service → Variables**. The student assistant, admin AI, and research agent all use this endpoint.

**Fallback providers:**

```env
GROQ_API_KEY=your_key     # https://console.groq.com
DEEPSEEK_API_KEY=your_key # https://platform.deepseek.com
TAVILY_API_KEY=your_key   # optional — live web research
```

The platform works without any AI configured using intelligent fallback responses.

### Admin Access

Set a user's role to `admin` in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Then visit `/admin`.

## Tech Stack

- **Next.js 16** — App Router, TypeScript
- **Tailwind CSS 4** — Futuristic dark theme with glassmorphism
- **Supabase** — Auth, PostgreSQL, RLS
- **Framer Motion** — Smooth animations
- **React Three Fiber** — 3D background elements
- **Zustand** — Client state
- **Groq / DeepSeek** — AI models for student assistant

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/ & signup/      # Auth pages
│   ├── student/              # Student portal
│   └── api/                  # Platform, applications, AI, auth
├── components/
│   ├── 3d/                   # Three.js scene
│   ├── ai/                   # Chat panel
│   ├── landing/              # Landing page sections
│   ├── student/              # Student sidebar
│   └── ui/                   # Shared UI components
└── lib/
    ├── data.ts               # Reference data & knowledge base
    ├── store.ts              # Zustand store
    ├── ai.ts                 # AI integration
    └── supabase/             # Supabase clients
```

## License

Private — Neom Platform
