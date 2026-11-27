# CareerVerse Build Progress

## Current Phase
- [x] Planning, wireframes, and scope alignment (salary merged into Career Explorer with sorting)
- [ ] Phase 1: Setup & Planning (10%)
- [ ] Phase 2: Core Build (50%)
- [ ] Phase 3: Game / Day-in-the-Life (20%)
- [ ] Phase 4: Polish & Bug Fixing (10% — Feature Freeze at ~80% time)
- [ ] Phase 5: Demo Prep (10%)

## Completed
- [x] Defined CareerVerse concept, tagline, and $0–$20 hackathon budget strategy
- [x] Created wireframes for Sign In/Log In, Dashboard, Day-in-the-Life Simulator, Career Explorer/Pathway/Salary, and Career Comparison
- [x] Updated spec so salary tiers, region filter, and salary sorting live directly inside Career Explorer
- [x] Built the responsive student Sign Up / MBTI onboarding form
- [x] Connected signup to Supabase Auth using the project URL and public anon key
- [x] Added email/password login and Google OAuth sign-in using Supabase Auth
- [x] Documented Google OAuth provider setup and handled OAuth errors returned in URL fragments
- [x] Moved signup styles to a separate stylesheet and removed the custom schema SQL setup

## In Progress
- [ ] Finalizing tech stack, repo/Vercel deployment, Supabase tables (`users`, `careers`, plus cache tables), and shared career JSON schema
- [ ] Selecting 5–8 careers and splitting research across the team

## Next Up (In Order)
1. Lock tech stack and deploy initial app to Vercel.
2. Configure Supabase auth + `users` and `careers` tables and seed 5–8 careers.
3. Build Auth/MBTI onboarding, Dashboard, Career Explorer (with pathway roadmap, region filter, salary tiers, and salary sorting), and Career Comparison UI.
4. Build Day-in-the-Life with one hardcoded 5–7 scene story (2–3 choices per scene), then connect `/api/compare` and `/api/simulate` with Supabase caching and fallbacks.
5. Hit feature freeze at ~80% time; polish mobile layout, loading/error states, and dark mode; test on phone and venue Wi-Fi; record a backup demo video and rehearse the 3-minute demo.

## Notes & Risk Controls
- Keep a hard spending cap on the AI API key and never commit `.env.local` or secrets.
- Cache demo comparison pairs and story scenes and keep deterministic fallbacks for live reliability.
