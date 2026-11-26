# CareerVerse — Product & Technical Specification (`spec.md`)

**Version:** 1.1 (Hackathon MVP)  
**Tagline:** *Discover. Explore. Plan.* — *Your future starts here. A future with purpose.*  
**Target Budget:** **$0–$20 total** (Free tiers where possible, low-cost fast AI model, response caching, hard spending cap)

---

## 1. Purpose & Problem Statement
Students often choose academic tracks and future careers with little practical insight into what a day on the job actually feels like, how their personality aligns with daily work, or what education and regional salary progression look like.

**CareerVerse** helps students explore meaningful careers and imagine how their strengths can help communities thrive through:
1. MBTI onboarding and a personalized Dashboard with top matches and compatibility.
2. **Career Explorer** (which includes High School → University → Workspace pathways, Entry / Mid-level / Senior-Lead salary tiers, region filtering, and **sorting by career salary**).
3. An interactive **Day-in-the-Life Simulator** with branching choices.
4. **AI Career Comparison** comparing two careers (`CA` vs. `CB`) with an `AI Recommendation` and side-by-side breakdown (`CA1` and `CA2`).

---

## 2. Navigation, Layout & Wireframe Specification

### Shared Shell (Authenticated / Main App Views)
* **Left Sidebar:**
  * Brand mark / Logo + `CareerVerse` title
  * Primary links: `Home`, `Career Explorer`, `Day-in-the-Life`, `Comparison` *(no standalone Salary Explorer page; salary tiers, region filter, and salary sorting live inside Career Explorer)*
  * Utility links: `Settings & MBTI`, `Log Out`, `Help`
  * Optional visual/mascot or picture block
* **Top Bar:**
  * Language selector (`EN` default)
  * Dark mode toggle
  * Profile shortcut

### Screens
1. **Sign In / Log In & MBTI Onboarding:**
   * Sign In view: `Name`, `Email`, `Password`, `Your MBTI Personality type` dropdown + `16 Types` reference + link for students who haven't taken an MBTI test yet, `Enter Dashboard ->` CTA, and switch to `Log In`.
   * Log In view: `Email` / `Name`, `Password`, `Enter Dashboard ->` CTA, and link back to `Sign In`.
2. **Dashboard (`Home`):**
   * `UserName Profile` card showing `MBTI` and `Your Top Match` slots.
   * `Career Compatibility` card showing compatibility score/percentage.
   * `Career Simulator` card with `Start Simulation ->` CTA (plus optional mascot/animation block).
3. **Career Explorer (with Integrated Salary & Pathway Roadmap):**
   * Career cards/list with category, summary, **Job** / **Region** filter controls, and **Sort by Career Salary** (e.g., Highest to Lowest / Lowest to Highest across selected salary tier: Entry, Mid-level, or Senior/Lead).
   * **High School → University → Workspace** roadmap cards (`High School` subjects, `University` degree & core skills, `Workspace` career progression).
   * Salary breakdown cards for **Entry**, **Mid-level**, and **Senior/Lead** levels.
4. **Day-in-the-Life Simulator:**
   * `Interactive Scenario` header with `Job dropdown list` selector.
   * Branching story player supporting **5–7 scenes** with **2–3 choices per scene**.
5. **Career Comparison:**
   * `Compare 2 Careers` selector with `CA` dropdown, `VS`, `CB` dropdown, and `Compare` button.
   * Results panel (`API` section) displaying an `AI Recommendation` summary plus side-by-side cards `CA1` and `CA2`.
6. **Settings & MBTI:**
   * Update profile details and MBTI personality type; return to Dashboard or Explorer.

---

## 3. Data Model & JSON Schema

### `users`
```json
{
  "id": "uuid",
  "name": "Student Name",
  "mbti": "INFJ"
}
```

### `careers`
```json
{
  "id": "career-slug-or-uuid",
  "title": "Career Title",
  "category": "Field / Category",
  "summary": "Concise student-friendly overview and community impact.",
  "education_path": {
    "high_school": ["Relevant subjects / electives"],
    "university": {
      "degree": "Recommended degree or training",
      "core_skills": ["Skill 1", "Skill 2"]
    },
    "workspace": ["Early role -> Mid role -> Senior/Lead progression"]
  },
  "salary_by_country": {
    "Region or Country Name": {
      "currency": "USD",
      "entry": 55000,
      "mid": 85000,
      "senior": 120000
    }
  }
}
```

### AI Caching & Fallback Rules
* Cache generated comparisons and story scenes in Supabase (and pre-generate key demo pairs/scenes) to keep AI costs near zero and responses fast.
* Keep API keys strictly server-side (`AI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
* Provide deterministic fallback outputs and clear loading/empty/error states so demos never fail if an external AI call errors or times out.

---

## 4. Execution Order & Feature Freeze
1. Lock tech stack, create GitHub repo, deploy initial app to Vercel, set up Supabase auth + `users` and `careers` tables, and agree on the career JSON schema.
2. Select **5–8 careers** (e.g., 2 per team member) and seed them into `careers`.
3. Build Auth/MBTI onboarding, Dashboard, Career Explorer (with High School → University → Workspace pathway, region filter, salary tiers, and **salary sorting**), and Career Comparison UI.
4. Build Day-in-the-Life with a hardcoded **5–7 scene** story (**2–3 choices** per scene) first, then wire `/api/compare` and `/api/simulate` with caching and fallbacks.
5. Enforce **feature freeze at ~80% of build time**: polish mobile layout, loading/error states, dark mode, venue Wi-Fi testing, backup screen recording, and the 3-minute demo script.
