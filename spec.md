# CareerVerse — Product & Technical Specification (`spec.md`)

**Version:** 1.0 (Hackathon MVP)  
**Tagline:** *Discover. Explore. Plan.*  
**Mission:** Help students explore meaningful careers and imagine how their strengths can help communities thrive.

---

## 1. System Architecture & Constraints

### 1.1 Tech Stack
* **Framework:** Next.js (App Router, TypeScript)
* **Styling:** Tailwind CSS (supporting Light & Dark mode)
* **Backend / Auth / DB:** Supabase (PostgreSQL + Auth)
* **Hosting:** Vercel (Free Hobby Tier)
* **AI Provider:** Low-cost, fast chat completion model (e.g., Gemini Flash / GPT-4o-mini) invoked strictly from server-side Route Handlers (`/api/*`).

### 1.2 Cost & Reliability Guardrails
* **Budget Cap:** $0–$20 total. Set a hard billing cap in the AI provider console prior to development.
* **Mandatory Caching:** Every AI response (career comparison pair or simulator scene) MUST be hashed/keyed and cached in Supabase (`ai_cache`) before returning to the client. Pre-warm cache for all demo scenarios.
* **Zero-Crash Demo Rule:** Every AI API route MUST catch timeouts/errors and return a valid, pre-authored fallback JSON payload so the UI never breaks during live judging.
* **Security:** `AI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must remain server-only environment variables.

---

## 2. UI/UX & Wireframe Specification

### 2.1 Global App Shell (Authenticated Views)
All post-login screens share a persistent two-region layout:
* **Left Sidebar:**
  * Brand Header: `Logo` + `CareerVerse`
  * Primary Navigation:
    * `Home` (Dashboard)
    * `Career Explorer`
    * `Day-in-the-Life`
    * `Comparison` (highlighted CTA button)
  * Divider
  * Secondary Navigation:
    * `Settings & MBTI`
    * `Log Out`
    * `Help`
  * Bottom Slot: Mascot / illustration card (`Picture`)
* **Top Utility Bar:**
  * Language selector dropdown (`EN` default)
  * `Dark mode` toggle button
  * `Profile` quick-access button

### 2.2 Screen-by-Screen Requirements

#### Screen 1: Sign In & Log In (`/login`)
* **Left Panel:** Logo, website name, optional mascot animation, and brief onboarding instructions.
* **Sign Up Mode (Default for new users):**
  * Inputs: `Name`, `Email`, `Password`
  * MBTI Section: Label *"Your MBTI personality type"* + `16 Types` badge + `Dropdown MBTI` (all 16 MBTI types) + helper link *"Haven't found your MBTI yet? Link"* (opens external MBTI quiz in new tab).
  * Primary CTA: `Enter Dashboard ->`
  * Mode Switch: *"Already have an account? Log in"*
* **Log In Mode:**
  * Inputs: `Name` (optional/display), `Email`, `Password`
  * Primary CTA: `Enter Dashboard ->`
  * Mode Switch: *"First time here? Sign In"*

#### Screen 2: Student Dashboard (`/`)
* **Top Row:**
  * **Mascot / Animation Area:** Welcoming visual or animated guide.
  * **UserName Profile Card:** Displays user's `MBTI` badge alongside 3 `"Your Top Match"` career cards.
  * **Career Compatibility Card:** Circular progress indicator showing match `Percentage` for the selected/top career.
* **Bottom Row:**
  * **Community / Insight Card (`?`):** Daily career tip, strength spotlight, or community impact prompt.
  * **Career Simulator Card:** Quick-launch module with `Start Simulation ->` button routing to `/simulator`.

#### Screen 3: Day-in-the-Life Simulator (`/simulator`)
* **Header Banner:**
  * Tag badge: `Interactive Scenario`
  * Title: `Day in the life Simulator`
  * Control: `Job dropdown list` to pick the simulated career.
* **Scenario Stage (Main Area):**
  * Displays current scene number (e.g., `Scene 1 of 6`), time of day (e.g., `09:30 AM`), narrative description, and **2–3 actionable choice buttons**.
  * Selecting a choice advances to the next scene and tracks skill/impact feedback, concluding with an end-of-day summary card and replay/compare CTAs.

#### Screen 4: Salary Explorer & Career Pathway (`/salary`)
* **Filter Header:**
  * Title: `Salary Explorer & Career Pathway`
  * Subtitle: `High School -> University -> Workspace roadmap`
  * Controls: `Job` dropdown and `Region` dropdown.
* **Roadmap Row (3 Cards):**
  1. `High School`: Recommended subjects and extracurriculars.
  2. `University`: Target degrees, certifications, and core skills.
  3. `Workspace`: Entry roles and long-term career progression.
* **Compensation Row (3 Tier Cards):**
  * `Entry` (`$`)
  * `Mid-level` (`$`)
  * `Senior / Lead` (`$`)
  * Dynamically formatted based on selected `Job` and `Region`.

#### Screen 5: Career Comparison (`/comparison`)
* **Selection Header (`Compare 2 Careers`):**
  * Dropdown `CA` (Career A) `Vs` Dropdown `CB` (Career B) + `Compare` button.
* **Results Container (`API`):**
  * Top Banner: `AI Recommendation` (personalized synthesis based on the user's MBTI and selected careers).
  * Side-by-Side Cards: `CA1` (Career A breakdown) and `CA2` (Career B breakdown) comparing daily work, required education, salary range, MBTI alignment, and community impact.

---

## 3. Data Models & Schemas

### 3.1 Supabase Tables
1. **`users`**
   * `id` (`uuid`, primary key, references `auth.users`)
   * `name` (`text`, not null)
   * `mbti` (`varchar(4)`, e.g., `'INTJ'`, `'ENFP'`)
   * `created_at` (`timestamptz`, default `now()`)

2. **`careers`**
   * `id` (`text`, primary key, slug e.g., `'software-engineer'`)
   * `title` (`text`, not null)
   * `category` (`text`, not null)
   * `summary` (`text`, not null)
   * `recommended_mbti` (`text[]`, e.g., `['INTJ', 'INTP', 'ENTJ']`)
   * `education_path` (`jsonb` — see structure below)
   * `salary_by_country` (`jsonb` — see structure below)

3. **`ai_cache`**
   * `cache_key` (`text`, primary key, e.g., `'compare:INTJ:data-scientist:ux-designer'`)
   * `endpoint` (`text`, `'compare'` | `'simulate'`)
   * `response_payload` (`jsonb`, not null)
   * `created_at` (`timestamptz`, default `now()`)

### 3.2 Career JSON Object Format (Seed Data: 5–8 Careers)
```json
{
  "id": "ux-designer",
  "title": "UX/UI Designer",
  "category": "Design & Technology",
  "summary": "Researches user needs and designs intuitive, accessible digital products.",
  "recommended_mbti": ["ENFP", "INFJ", "INFP", "ENTP"],
  "education_path": {
    "high_school": ["Art & Design", "Psychology", "Computer Science"],
    "university": {
      "degree": "B.Des / HCI / Psychology or Portfolio Bootcamp",
      "core_skills": ["User Research", "Wireframing", "Prototyping", "Accessibility"]
    },
    "workspace": {
      "progression": "Junior Product Designer -> Senior UX Designer -> Design Lead"
    }
  },
  "salary_by_country": {
    "US": { "currency": "USD", "entry": "$70,000", "mid": "$105,000", "senior": "$145,000" },
    "SG": { "currency": "SGD", "entry": "S$48,000", "mid": "S$78,000", "senior": "S$115,000" },
    "MM": { "currency": "MMK", "entry": "800,000 MMK/mo", "mid": "1,800,000 MMK/mo", "senior": "3,500,000+ MMK/mo" }
  }
}
```

### 3.3 Day-in-the-Life Story JSON Format
```json
{
  "career_id": "ux-designer",
  "title": "A Day in the Life: UX Designer",
  "scenes": [
    {
      "scene_number": 1,
      "time": "09:30 AM",
      "prompt": "Morning standup begins. Engineering flags that a mobile onboarding flow is confusing users. How do you respond?",
      "choices": [
        {
          "id": "a",
          "text": "Review user session recordings and analytics before proposing a fix.",
          "feedback": "Data-backed empathy helps pinpoint the exact drop-off step.",
          "next_scene": 2
        },
        {
          "id": "b",
          "text": "Sketch two quick wireframe alternatives right away to test with teammates.",
          "feedback": "Rapid prototyping sparks fast alignment with engineers.",
          "next_scene": 2
        }
      ]
    }
  ]
}
```

---

## 4. AI API Contracts & Prompt Specifications

### 4.1 `POST /api/compare`
* **Request Body:** `{ "careerAId": string, "careerBId": string, "mbti": string }`
* **Cache Lookup:** `compare:${mbti}:${[careerAId, careerBId].sort().join(':')}`
* **System Prompt Rules:**
  * Role: Encouraging student career advisor.
  * Output strictly valid JSON matching the schema below; keep text concise (`< 180 words` total) to minimize token cost and fit UI cards cleanly.
* **Response Schema:**
```json
{
  "recommendation": "Concise 2-3 sentence tailored advice explaining which role fits the user's MBTI best and why.",
  "careerA": {
    "title": "Career A Title",
    "strengths_for_user": ["Point 1", "Point 2"],
    "watch_outs": "1 sentence challenge",
    "community_impact": "1 sentence impact summary"
  },
  "careerB": {
    "title": "Career B Title",
    "strengths_for_user": ["Point 1", "Point 2"],
    "watch_outs": "1 sentence challenge",
    "community_impact": "1 sentence impact summary"
  },
  "source": "ai | cache | fallback"
}
```

### 4.2 `POST /api/simulate`
* **Request Body:** `{ "careerId": string, "mbti": string }`
* **Implementation Rule:** Build and verify `/simulator` using `data/fallback-story.json` first. Once stable, enable `/api/simulate` to generate or fetch cached 5–7 scene JSON stories in the exact schema defined in **Section 3.3**.

---

## 5. Team Task Allocation & Milestones

| Owner Role | Primary Deliverables |
| :--- | :--- |
| **Auth & Profile Lead** | `/login`, Supabase Auth, `users` table, MBTI selector, Dashboard profile & compatibility widgets |
| **Explorer & Pathway Lead** | `careers.json` schema, `/explorer`, `/salary` (High School -> University -> Workspace + regional salaries) |
| **Comparison & AI Lead** | `/comparison`, `/api/compare`, `/api/simulate`, `ai_cache` table, deterministic fallbacks |
| **Simulator & Shell Lead** | Persistent Sidebar + Top Bar (Dark mode, EN toggle), `/simulator` scene engine & schedule view |
| **Design & Demo Lead** | Mascot/illustrations, responsive QA, 3-minute demo script, backup screen recording, pitch slides |

### Definition of Done (MVP)
- [ ] Deployed on Vercel with zero build errors and live Supabase connection.
- [ ] User can sign up/log in, pick an MBTI type, and view matched careers on the Dashboard.
- [ ] All 5–8 seeded careers render cleanly in Explorer and Salary/Pathway views.
- [ ] Career Comparison returns AI + fallback results cleanly without exposing API keys.
- [ ] At least one career runs end-to-end (5–7 scenes) in the Day-in-the-Life Simulator on both desktop and mobile viewports.
