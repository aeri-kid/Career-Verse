# AGENTS.md — CareerVerse Coding Agent Instructions

## Project Context
- **Project:** CareerVerse (*Discover. Explore. Plan.* — "Your future starts here. A future with purpose.")
- **Budget:** Strict **$0–$20** hackathon target. Favor free tiers (Vercel, Supabase), fast/low-cost models, and response caching.

## Scope & Architecture Rules
- **Build only what is requested** for the current feature/screen. Do not add unrequested libraries or over-engineer.
- **No standalone Salary page:** Salary tiers (`Entry`, `Mid-level`, `Senior/Lead`), region filtering, and **sorting by career salary** belong inside **Career Explorer**, alongside the `High School -> University -> Workspace` pathway roadmap.
- **Show MMK Rate for each country on top right corner right below the sort, in the career explorer**
- **Shared Navigation & Top Bar:**
  - Sidebar: `Home`, `Career Explorer`, `Day-in-the-Life`, `Comparison`, plus `Settings & MBTI`, `Log Out`, `Help` (and optional mascot/picture area).
  - Top bar: Language selector (`EN` default), Dark mode toggle, and Profile shortcut.
- **Core Pages & Flows:**
  - Sign In / Log In with 16-types MBTI selector/link -> Dashboard (`UserName Profile`, `MBTI`, `Your Top Match`, `Career Compatibility`, `Start Simulation`).
  - Career Explorer (job/region filter, salary sorting, High School -> University -> Workspace roadmap, Entry/Mid-level/Senior-Lead salary cards).
  - Day-in-the-Life Simulator (job dropdown, 5–7 scenes, 2–3 choices per scene).
  - Career Comparison (`CA` vs `CB`, `Compare` action, `AI Recommendation`, and `CA1` / `CA2` cards).

## Security, AI & Reliability Rules
- Never expose secret keys (`AI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in client code.
- Cache AI responses in Supabase and always include deterministic fallback data plus loading, empty, and error states.
- Never commit secrets or `.env.local` to Git.

### Light Mode Tokens
- **Primary:** `#7C3AED` | **Primary Hover:** `#6D28D9` | **Primary Light:** `#E9D5FF` | **Primary Soft:** `#F3E8FF`
- **Background:** `#FFFFFF` | **Surface:** `#F8FAFC` | **Card:** `#FFFFFF` | **Border:** `#E5E7EB`
- **Text Primary:** `#1F1F1F` | **Text Secondary:** `#6B7280` | **Text Tertiary:** `#9CA3AF` | **Disabled Text:** `#D1D5DB`

### Dark Mode Tokens
- **Primary:** `#A78BFA` | **Primary Hover:** `#8B5CF6` | **Primary Light:** `#6D28D9` | **Primary Soft:** `#4C1D95`
- **Background:** `#0B0B16` | **Surface:** `#111827` | **Card:** `#1F2937` | **Border:** `#374151`
- **Text Primary:** `#F9FAFB` | **Text Secondary:** `#D1D5DB` | **Text Tertiary:** `#9CA3AF` | **Disabled Text:** `#6B7280`

### Semantic Feedback & Gradients
- **Success:** `#22C55E` | **Warning:** `#FBBF24` | **Error:** `#EF4444` | **Info:** `#3B82F6`
- **Purple Gradient (Primary):** `#7C3AED` → `#A78BFA`
- **Soft Gradient (Accent):** `#E9D5FF` → `#C4B5FD`

## Workflow & Collaboration Rules
- Read `progress.md` before implementing and update it when completing tasks.
- Work on feature branches and keep `main` demo-safe.
- At ~80% of hackathon time, enter feature freeze (bug fixes, mobile responsiveness, loading/error states, and demo readiness only).
