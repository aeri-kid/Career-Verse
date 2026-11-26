# CareerVerse — *Discover. Explore. Plan.*

> **Your future starts here.**
>
> Explore meaningful careers and imagine how your strengths can help communities thrive.

**CareerVerse** is a student-focused career exploration web application and interactive *Day-in-the-Life* simulator built for our hackathon. It helps students move past guesswork by matching their MBTI personality type with real-world careers, visualizing High School-to-Workspace pathways and regional salaries directly while exploring careers, comparing roles side by side with AI insights, and experiencing a realistic workday through branching scenarios.

## The Problem

Students often choose academic tracks and future careers with little practical insight into what a day on the job actually feels like, how their personality fits the work, or what education and regional salary progression look like.

## Core Features

1. **MBTI Onboarding & Profile Dashboard:** Sign up or log in with an MBTI type (including a quick link for students who haven't taken an MBTI test yet) to unlock top career matches and a Career Compatibility score.

2. **Career Explorer (with Integrated Salary & Pathway Insights):** Browse curated careers across multiple fields with clear summaries, role highlights, a **High School → University → Workspace** education roadmap, and Entry, Mid-level, and Senior/Lead salary tiers. Includes region filtering and **sorting by career salary** (e.g., Highest to Lowest / Lowest to Highest across experience levels).

3. **Day-in-the-Life Simulator:** Step into an interactive, scene-by-scene workday scenario with branching choices (5–7 scenes, 2–3 choices per scene).

4. **AI Career Comparison:** Select two careers (`Career A` vs. `Career B`) to generate a tailored AI recommendation and side-by-side breakdown tailored to the student's MBTI profile.

## Navigation & Wireframe Alignment

* **Left Sidebar:** `Home`, `Career Explorer`, `Day-in-the-Life`, `Comparison`, plus `Settings & MBTI`, `Log Out`, `Help`, and mascot/profile card. *(Standalone Salary Explorer page removed; consolidated into Career Explorer).*
* **Top Bar:** Language selector (`EN` default), Dark mode toggle, and Profile shortcut.

## Tech Stack & Budget Strategy

Designed to stay within a **\$0–$20 total hackathon budget**:

* **Frontend & API Routes:** Next.js (App Router) + Tailwind CSS (hosted on **Vercel** Free Hobby Tier)

* **Auth & Database:** **Supabase** Free Tier (Authentication + PostgreSQL storage + AI response caching)

* **AI Layer:** Fast, low-cost LLM via server-side API routes with Supabase caching and deterministic JSON fallbacks

* **Design:** Figma / Canva (Free Student Plans)

## Project Structure (Recommended)

```text
careerverse/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Sign In / Log In + MBTI selection
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Shared sidebar + top bar (EN, Dark Mode, Profile)
│   │   ├── page.tsx                # Dashboard (Profile, Top Matches, Compatibility, Simulator CTA)
│   │   ├── explorer/page.tsx       # Career Explorer grid + Salary tiers, region filter & salary sorting + Pathway roadmap
│   │   ├── simulator/page.tsx      # Day-in-the-Life interactive scenario player
│   │   ├── comparison/page.tsx     # Compare 2 Careers + AI Recommendation
│   │   └── settings/page.tsx       # Settings & MBTI editor
│   └── api/
│       ├── compare/route.ts        # AI Career Comparison endpoint (cached + fallback)
│       └── simulate/route.ts       # AI Story Scene endpoint (cached + fallback)
├── data/
│   ├── careers.json                # Seed data for 5-8 researched careers (including salary_by_country & education_path)
│   └── fallback-story.json         # Deterministic 5-7 scene story for demo reliability
├── lib/
│   ├── supabase.ts                 # Supabase client helpers
│   └── ai.ts                       # LLM wrapper + prompt templates + schema validation
├── README.md
└── spec.md
```

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd careerverse
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (never commit this file to GitHub):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AI_API_KEY=your_llm_api_key
```

### 3. Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Hackathon Build Roadmap

* **Phase 1 — Setup & Planning (10%):** Lock tech stack, create repo, deploy "Hello World" to Vercel, configure Supabase (`users`, `careers`, `ai_cache`), and agree on career JSON schema.

* **Phase 2 — Core Build (50%):** Build Auth/MBTI onboarding, shared dashboard shell, Career Explorer (with integrated salary tiers, salary sorting, and education pathways), and Career Comparison UI.

* **Phase 3 — Day-in-the-Life Simulator (20%):** Hardcode one complete 5–7 scene career storyline first, then connect AI generation + Supabase caching.

* **Phase 4 — Polish & Freeze (10%):** Feature freeze at 80% elapsed time. Focus on mobile responsiveness, loading states, dark mode, and deterministic API fallbacks.

* **Phase 5 — Demo Prep (10%):** Rehearse the 3-minute live flow and record a backup video run.

## 3-Minute Demo Checklist

1. **Hook & Problem:** Explain how students make major career decisions without real insight into daily work or pathways.

2. **Onboarding:** Create/pick a student persona and select their **MBTI type**.

3. **Dashboard & Compatibility:** Show top career matches and compatibility score.

4. **Explore, Sort by Salary & Compare:** Browse careers in **Career Explorer**, sort by career salary and inspect the **High School → University → Workspace** roadmap, then compare two careers side by side with the **AI Recommendation**.

5. **Play One Day:** Launch the **Day-in-the-Life Simulator** and play through a branching workday scenario.

6. **Future Vision:** Highlight next steps (expanding career library, localized regional datasets, and a teacher/counselor dashboard).
