# CareerVerse — *Discover. Explore. Plan.*

> **Your future starts here.**  
> **A future with purpose.**  
> Explore meaningful careers and imagine how your strengths can help communities thrive.

**CareerVerse** is a student-focused career exploration web application and interactive *Day-in-the-Life* simulator built for our hackathon. It helps students move past guesswork by matching their MBTI personality type with real-world careers, exploring education roadmaps and regional salary tiers with salary sorting directly inside Career Explorer, comparing two careers side by side with AI insights, and experiencing a realistic workday through branching scenarios.

---

## The Problem

Students often choose academic tracks and future careers with little practical insight into what a day on the job actually feels like, how their personality fits the work, or what education and regional salary progression look like.

---

## Core Features

1. **MBTI Onboarding & Profile Dashboard:** Sign up or log in with an MBTI type (with a 16-types reference/test link for students who haven't taken an MBTI test yet) to enter the Dashboard showing `UserName Profile`, `MBTI`, `Your Top Match` cards, `Career Compatibility` percentage, and a `Start Simulation` shortcut.
2. **Career Explorer (with Integrated Salary Tiers, Region Filter & Salary Sorting):** Browse curated careers across multiple fields with clear summaries, a **High School → University → Workspace** pathway roadmap (`High School` subjects, `University` degree & core skills, `Workspace` career progression), and **Entry**, **Mid-level**, and **Senior/Lead** salary cards. Includes job/region filtering and **sorting by career salary**.
3. **Day-in-the-Life Simulator:** Pick a career from the job dropdown and step through an interactive workday scenario (5–7 scenes, 2–3 choices per scene).
4. **AI Career Comparison:** Compare two careers (`CA` vs. `CB`) to generate an `AI Recommendation` alongside side-by-side comparison cards (`CA1` and `CA2`).

---

## Tech Stack & Budget Strategy

Designed to stay within a **$0–$20 total hackathon budget**:
* **Frontend & API Routes:** Next.js (App Router) + Tailwind CSS (hosted on **Vercel** Free Hobby Tier)
* **Auth & Database:** **Supabase** Free Tier (Authentication + PostgreSQL storage + cached AI outputs)
* **AI Layer:** Fast, low-cost LLM via server-side API routes with response caching in Supabase and deterministic JSON fallbacks
* **Design:** Figma / Canva (Free Student Plans)

---

## Project Structure

```text
careerverse/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          # Sign In / Log In + MBTI selection
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Shared sidebar + top bar (EN, Dark Mode, Profile)
│   │   ├── page.tsx                # Dashboard (Profile, Top Matches, Compatibility, Simulator CTA)
│   │   ├── explorer/page.tsx       # Career Explorer + High School->University->Workspace + Salary & Sorting
│   │   ├── simulator/page.tsx      # Day-in-the-Life interactive scenario player
│   │   ├── comparison/page.tsx     # Compare 2 Careers + AI Recommendation (CA1 / CA2)
│   │   └── settings/page.tsx       # Settings & MBTI editor
│   └── api/
│       ├── compare/route.ts        # AI Career Comparison endpoint (cached + fallback)
│       └── simulate/route.ts       # AI Story Scene endpoint (cached + fallback)
├── data/
│   ├── careers.json                # Seed data for 5-8 researched careers
│   └── fallback-story.json         # Deterministic 5-7 scene story for demo reliability
├── lib/
│   ├── supabase.ts                 # Supabase client helpers
│   └── ai.ts                       # LLM wrapper + prompt templates + schema validation
├── AGENTS.md
├── progress.md
├── README.md
└── spec.md
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd careerverse
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` (never commit `.env.local` to GitHub):

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

---

## Supabase Signup Setup

The signup form uses the Supabase project URL and public anon key configured in `app.js`. Supabase Auth stores the submitted name and MBTI as user metadata, so this flow does not need a custom database schema. Never put the service-role key in frontend code.

Enable the Email provider in Supabase Auth. If email confirmation is enabled, the form tells new users to check their email after signup.

---

## Hackathon Build Plan & Demo Checklist

* **Time Allocation:** Setup & Planning (10%), Core Build (50%), Game / Day-in-the-Life (20%), Polish & Bug Fixing (10%), Demo Prep (10%) — with a **feature freeze at ~80%** of available time.
* **3-Minute Demo Flow:** Pick a student and MBTI type → view top matches & compatibility → explore/sort careers by salary & check the pathway → compare two careers with AI → play a Day-in-the-Life scenario → share what to build next (more careers, more regions/countries, and a teacher/counselor dashboard), with a working fallback and backup screen recording ready.
