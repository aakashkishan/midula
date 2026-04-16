## Qwen Added Memories
- MIDULA PROJECT - OVERVIEW & TECH STACK

Project: Midula - AI-powered health & wellness tracker (mobile-first web app)
Location: /Users/radhasriram/Desktop/PROJECTS/midula
Tech Stack: React 19.2.4 + Vite 8.0.1 + Express 5.2.1 + Supabase + OpenRouter API
Styling: Custom CSS with Gruvbox Dark palette (no Tailwind)
Target: Mobile web (max-width: 480px centered container, iOS safe-area support)
Font: Inter (400-800) via Google Fonts

Core Dependencies:
- @supabase/supabase-js ^2.101.1 (backend DB)
- canvas-confetti ^1.9.4 (celebrations)
- express ^5.2.1 (production server)
- lucide-react ^1.7.0 (icons)
- react/react-dom ^19.2.4

Build Scripts: dev (vite), build (vite build), preview (vite preview), start (node server.js)

Server: Express static file server serving dist/ with SPA fallback routing on port 3000 (configurable via PORT env)

Environment Variables (3):
- VITE_SUPABASE_URL (Supabase project endpoint)
- VITE_SUPABASE_ANON_KEY (Supabase public anon key)
- VITE_OPENROUTER_API_KEY (OpenRouter API key - CRITICAL: exposed in client bundle!)
- MIDULA PROJECT - DATABASE SCHEMA & DATA MODEL

Supabase Database (5 tables, all with FULLY PERMISSIVE RLS policies):

1. users: id (uuid PK), name (text), created_at (timestamp)
   - Sample data: "Default User" inserted
   - NO connection to Supabase Auth
   
2. daily_trackers: id, user_id (FK->users), date, water_ml, carbs_g, protein_g, fats_g, vitamins_logged
   - Tracks daily nutrition metrics
   - NOT connected to Dashboard UI (Dashboard uses local state only)
   
3. workouts: id, user_id (FK->users), date, routine_level (text), completed (boolean)
   - Stores completed workout sessions
   - NOT connected to Workouts UI (no write on completion)
   
4. goals: id, user_id (FK->users), title, target_value, current_value, deadline
   - User goal tracking
   - NOT connected to Goals UI (Goals page is hardcoded data)
   
5. recipes: id, title, ingredients (text[]), instructions, prep_time, calories, image_url
   - Recipe storage
   - NOT connected to Recipes UI (20+ recipes in src/data/recipes.js but UI shows 6 hardcoded stubs)

RLS Policies: ALL tables have "Allow all actions" with using(true) with check(true)
SECURITY ISSUE: Anyone with anon key can read/write/delete ALL data for ALL users. No user isolation via auth.uid().

Data Files in src/data/:
- exercises.js: 25 exercise definitions across 5 routines (Core Flow, HIIT, Yoga, Pilates, Evening Walk)
- recipes.js: 20+ Indian vegetarian recipes with full macros, ingredients, steps (UNUSED by UI)
- MIDULA PROJECT - COMPLETE FEATURE INVENTORY

PAGES (5):
1. Dashboard - Water ring tracker (SVG), quick stats, daily info with +/- buttons. All local state, NO persistence.
2. Workouts - 5 hardcoded routines, leads to WorkoutDetail view (inline, not route-based).
3. WorkoutDetail - Full exercise runner: timer, play/pause/skip/stop, flipbook exercise animation, rest periods (30s), coaching tips, progress dots, exercise list toggle, completion screen with confetti.
4. Goals - 4 hardcoded goals with progress bars. "Add New Goal" button non-functional.
5. Recipes - 6 hardcoded recipe cards (out of 20+ available). Cards non-clickable. No detail view.
6. Chat - AI Health Coach using OpenRouter (qwen-2.5-72b-instruct). Injects Supabase data as context. Full chat UI with loading states, error handling, auto-scroll.

COMPONENTS (2):
1. Navigation - Bottom tab bar (5 tabs): Tracker, Workouts, Goals, Recipes, Coach. State lifted to App.jsx.
2. ExerciseAnimation - Flipbook animation: alternates frame1/frame2 every 800ms with crossfade. Breathe animation for static poses.

COMPLETED FEATURES:
- Bottom tab navigation (state-based, NO browser routing)
- Water tracker with SVG ring
- Dashboard stat controls (+/-)
- 5 workout routines with metadata
- Full exercise runner with timer, animations, tips, progress tracking
- Workout completion with confetti & stats
- Goals page with progress bars
- Recipes grid (partial - 6 of 20+ recipes)
- AI Chat with Supabase context injection
- Supabase client setup
- Express production server
- Staggered fade-up entrance animations
- Mobile-optimized layout

INCOMPLETE/BROKEN FEATURES:
- NO user authentication (hardcoded "Hello, Jane")
- Dashboard data NOT persisted to Supabase
- Workout completions NOT saved to Supabase
- Goals are read-only (no CRUD)
- Recipes page disconnected from 20+ recipe dataset
- Recipe cards non-clickable (no detail view)
- Pill tabs non-functional on ALL pages (Dashboard, Workouts, Recipes)
- NO settings page
- NO user profile management
- NO browser routing (URL never changes, no deep linking, no back button)
- MIDULA PROJECT - CRITICAL IMPROVEMENTS NEEDED

CRITICAL (Security & Functionality):
1. OPENROUTER API KEY EXPOSED IN CLIENT BUNDLE - Must move to server-side proxy endpoint. The VITE_ prefix means it's bundled into client JS and visible to anyone.
2. SUPABASE RLS POLICIES FULLY PERMISSIVE - All tables allow any user to read/write/delete all data. Must tie policies to auth.uid().
3. NO USER AUTHENTICATION - Must implement Supabase Auth for user isolation. Currently hardcoded single user.
4. NO DATA PERSISTENCE - Dashboard, Workouts, Goals all use local state that resets on refresh. Must wire to Supabase tables.
5. UNUSED RECIPE DATASET - 20+ complete recipes in src/data/recipes.js but UI shows 6 hardcoded stubs. Must connect data to UI.

HIGH PRIORITY:
6. NON-FUNCTIONAL PILL TABS - Dashboard (Today/Week/Month), Workouts (All/Beginner/Intermediate), Recipes (All/Quick/Protein/Millet) tabs look interactive but do nothing.
7. NO BROWSER ROUTING - State-based tab switching means no URL changes, no deep linking, no browser back/forward. Must add React Router.
8. NO CODE SPLITTING - All app code in single JS bundle. Must configure Vite manualChunks for vendor/React/Supabase splits.
9. NO CI/CD PIPELINE - No GitHub Actions, no automated builds/tests.
10. NO DEPLOYMENT CONFIG - No vercel.json, netlify.toml, or Dockerfile. Deployment is manual.
11. EXPRESS SERVER MISSING MIDDLEWARE - No compression (gzip/brotli), no helmet (security headers), no rate limiting, no caching headers, no health check endpoint.
12. NO .env.example TEMPLATE - Risk of collaborators committing secrets.

MEDIUM PRIORITY:
13. NO PWA SUPPORT - No service worker, no manifest.json, cannot install on home screen.
14. NO OFFLINE SUPPORT - No caching strategy for workouts/recipes.
15. NO ERROR BOUNDARIES - Unhandled errors crash the app.
16. NO LOADING STATES - No skeletons/spinners for initial page loads or Supabase queries.
17. NO DATA VISUALIZATION - No charts/graphs for historical tracking trends.
18. NO NOTIFICATIONS/REMINDERS - No push notifications for water, workouts.
19. SUPABASE CALLED ONLY IN CHAT - Database used only for AI context injection, not for CRUD operations in other pages.
20. HARDCODED USER GREETING - "Hello, Jane" should come from authenticated user profile.

LOW PRIORITY:
21. .gitignore incomplete - Missing .DS_Store, .vscode/, .idea/, *.local, *.log
22. No engines field in package.json - Node.js version not pinned
23. Express 5.x is beta - Potential stability concerns
24. No image optimization - Exercise PNGs not optimized
25. No accessibility audit - Missing ARIA labels, keyboard navigation testing
- MIDULA PROJECT - DESIGN SYSTEM & UX ANALYSIS

COLOR SYSTEM (Gruvbox Dark):
- Backgrounds: --bg0-hard=#1d2021, --bg0=#282828, --bg1=#3c3836 (surface), --bg2=#504945 (borders)
- Text: --fg=#ebdbb2 (primary), --fg4=#a89984 (secondary)
- Accents: --aqua=#8ec07c (primary), --orange=#fe8019, --yellow=#fabd2f, --red=#fb4934, --green=#b8bb26, --purple=#d3869b

TYPOGRAPHY:
- Inter font (400, 500, 600, 700, 800 weights)
- h1: 1.6rem, section: 1.1rem, card: 0.95rem, body: 0.875rem, small: 0.72-0.78rem

LAYOUT:
- Mobile-first: max-width 480px centered container
- Bottom nav: fixed, 72px height, 5 items
- Page padding: 0 1.25rem, top 3rem, bottom 6.5rem
- iOS safe-area inset support

ANIMATIONS (all in App.css and component CSS):
- fadeUp: staggered entrance (scale + translateY, variants 1-6)
- pulseGlow: glowing pulse on workout play buttons
- shimmer: animated gradient on goal progress bars
- breathe: slow scale on recipe icons
- ringFill: SVG progress ring animation
- glowPulse: radial glow behind exercise illustrations
- restPulse: pulsing REST badges during workouts
- dotPulse: active exercise progress dots
- completionBounce: bouncy completion screen entrance
- canvas-confetti: particle celebrations (water, workout start, exercise/workout complete)

COMPONENT PATTERNS:
- Cards: 16px border-radius, surface background, bg1 border, hover lifts with shadow, active scales down
- Buttons: Primary (aqua fill, full-width), Control (circular), Secondary (bg1 fill)
- Pill Tabs: 4px gap, rounded container, active tab gets bg2 background

UX STRENGTHS:
- Polished cohesive dark theme
- Rich micro-animations make interactions feel alive
- Exercise runner is standout feature (timer + animation + tips + progress)
- Mobile-optimized with touch-friendly sizes
- AI Coach is unique differentiator with context-aware responses

UX CONCERNS:
- Large gap between available data (20+ recipes) and UI (6 stubs)
- All data persistence missing - resets on refresh frustrates users
- No onboarding flow for first-time users
- Tab pills look interactive but aren't wired up
- No empty states for when Supabase has no data
- Single hardcoded user shared across all instances
- No browser back navigation
- MIDULA PROJECT - DEPLOYMENT & ARCHITECTURE ANALYSIS

BUILD CONFIGURATION (Vite 8.0.1):
- Minimal config: only @vitejs/plugin-react
- Missing: base path, rollupOptions/code splitting, explicit minify, sourcemap config, asset size limits
- Output: dist/assets/index-{hash}.js (single bundle) + index-{hash}.css

DEPLOYMENT SETUP:
- Dual mode: Static hosting (dist/) OR Node.js server (server.js Express)
- NO deployment config files: no vercel.json, netlify.toml, Dockerfile, render.yaml, railway.toml
- NO CI/CD: No .github/workflows, .gitlab-ci.yml
- Deployment is MANUAL - must configure platform via UI or create config files

ENVIRONMENT VARIABLE MANAGEMENT:
- 3 VITE_ prefixed variables in .env (Supabase URL, Supabase anon key, OpenRouter API key)
- CRITICAL: OpenRouter key is a server-side secret exposed to browser
- .env in .gitignore (correct) but no .env.example template
- No .env.local, .env.production exclusions

EXPRESS SERVER (server.js):
- Serves dist/ as static files
- SPA fallback: all routes serve index.html
- Listens on PORT env (default 3000), binds 0.0.0.0
- MISSING: compression middleware, helmet (security headers), rate limiting, CORS config, health check endpoint, HTTP caching headers, body parsing

SCALABILITY:
- Current: Single-server, client-side Supabase calls, no CDN config
- Good: SPA can serve from any CDN, Supabase handles DB scaling, mobile-first keeps UI complexity bounded
- Concerns: Permissive RLS means unfiltered table access, all DB operations from browser don't scale securely

RECOMMENDED DEPLOYMENT FIXES:
1. Add vercel.json or Dockerfile for platform config
2. Add compression + helmet + cache headers to server.js
3. Add /health endpoint for platform health checks
4. Add engines field to package.json (node >=20.0.0)
5. Configure Vite manualChunks for code splitting (vendor/React/Supabase)
6. Add .env.example with placeholder values
7. Expand .gitignore (.DS_Store, .vscode/, *.local, *.log)
8. Consider GitHub Actions for automated builds
