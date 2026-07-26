# Beyond Marketing — Business Growth Operating System

> Simplifying Marketing. Connecting Business. Empowering Growth.

A premium SaaS-quality platform for Beyond Marketing built on Next.js + MongoDB. It combines a high-converting marketing site, an AI-powered Content Genius, live SEO reporting via SearchAtlas, a client portal, an admin agency-ops console, and white-label public reports.

---

## ✨ What's inside

### Marketing website
- **Home** — hero, Plan/Build/Grow framework, connected systems, testimonials, CTAs
- **Services** mega-menu with dedicated pages for **Plan**, **Build**, **Grow**, **Connected Business Systems**
- **Approach**, **Learning Hub**, **Pricing**, **Contact**
- **Free Marketing Audit** on the homepage powered by SearchAtlas Domain Analyzer

### Client Portal (`/portal` after login)
- Business Health Score + KPI cards
- 12-month traffic chart
- **Live SEO snapshot from SearchAtlas** (the user's linked rank-tracker project)
- Projects & Tasks CRUD (persisted per user in Mongo)
- Monthly reports tab

### Admin Portal (auto-shown to users with `role = 'admin'`)
- Agency overview (clients, audits, leads, projects, tasks) + live SEO snapshot
- Clients management with **role promotion** and **SearchAtlas project linking**
- AI Audit submissions list with detail modal
- Contact leads list
- **SearchAtlas** tab: full rank-tracker projects with SERP distribution
- **Local SEO** tab: Google Business Profile locations with grid rankings
- **Content Genius** tab: AI-generated SEO content briefs (GPT-4o-mini)

### White-label public report (`/report/[hash]`)
- Fully branded standalone report for each client
- Live search visibility, avg. position, SERP distribution, traffic trends
- Shareable public link, no login required — powered by the SearchAtlas `public_share_hash`

---

## 🛠️ Tech stack

| Layer      | Choice                                                              |
|------------|---------------------------------------------------------------------|
| Frontend   | Next.js 15 (App Router, JSX), Tailwind CSS, shadcn/ui, Recharts     |
| Backend    | Next.js API routes (catch-all `/api/[[...path]]/route.js`)          |
| Database   | MongoDB (native driver, all IDs are UUIDs)                          |
| Auth       | Email + bcrypt + JWT (Bearer)                                       |
| AI         | OpenAI SDK → Emergent LLM gateway (gpt-4o-mini / gpt-5)              |
| SEO data   | SearchAtlas API (Rank Tracker, GBP)                                 |

---

## 🚀 Local setup

### Prerequisites
- Node.js 18+
- Yarn
- MongoDB running locally (or a MongoDB Atlas URI)

### Install & run
```bash
git clone <your-repo-url> beyond-marketing
cd beyond-marketing
cp .env.example .env      # fill in the values (see below)
yarn install
yarn dev                  # http://localhost:3000
```

### Required environment variables
See [`.env.example`](./.env.example). At minimum you need:

| Variable                 | What it does                                                      |
|--------------------------|-------------------------------------------------------------------|
| `MONGO_URL`              | Mongo connection string                                           |
| `DB_NAME`                | Database name (default: `beyond_marketing`)                       |
| `EMERGENT_LLM_KEY`       | LLM for Content Genius (from https://app.emergent.sh)             |
| `SEARCHATLAS_API_KEY`    | For live SEO data (from https://dashboard.searchatlas.com/api)    |
| `ADMIN_SEED_EMAIL`       | Auto-created admin email on first API hit                         |
| `ADMIN_SEED_PASSWORD`    | Initial admin password                                            |
| `JWT_SECRET`             | Random long string for signing tokens                             |

On first request, an admin user is auto-seeded with `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`.

---

## 🗂️ Project structure

```
app/
├── api/[[...path]]/route.js   # All backend endpoints (catch-all)
├── report/[hash]/page.js      # White-label public report page
├── page.js                    # Marketing site + portal SPA
├── layout.js                  # Root layout
└── globals.css                # Tailwind + design tokens

components/ui/                # shadcn components
lib/                          # utilities
```

---

## 🔌 API surface (all prefixed with `/api`)

### Public
- `POST /auth/register` — `{ name, email, password, company? }`
- `POST /auth/login`
- `POST /audit` — legacy AI audit endpoint (kept in code, not surfaced in UI)
- `POST /contact`
- `GET  /report/:publicShareHash` — white-label report data
- `GET  /searchatlas/projects` — proxy rank-tracker projects (server-side auth)
- `GET  /searchatlas/projects/:id/keywords`
- `GET  /searchatlas/gbp`

### Authenticated (`Authorization: Bearer <jwt>`)
- `GET  /auth/me`
- `GET  /portal/dashboard`
- `GET|POST /portal/projects`, `PATCH|DELETE /portal/projects/:id`
- `GET|POST /portal/tasks`, `PATCH|DELETE /portal/tasks/:id`
- `POST /content-genius/generate`
- `GET  /content-genius/briefs`
- `GET  /content-genius/briefs/:id`
- `DELETE /content-genius/briefs/:id`

### Admin-only (`role === 'admin'`)
- `GET  /admin/overview`
- `GET  /admin/clients`
- `PATCH /admin/clients/:id` — role or SearchAtlas project linkage
- `GET  /admin/audits`
- `GET  /admin/contacts`

---

## 🚀 Deploying

### Vercel (recommended)
1. Push this repo to GitHub.
2. Import into Vercel.
3. Add every env var from `.env.example` in the Vercel dashboard.
4. Deploy — done.

### Any Node host
Works anywhere Next.js 15 works. Build with `yarn build`, run with `yarn start`. Uses `nodejs` runtime for API routes (not edge).

---

## 🔐 Security notes
- `.env` is git-ignored. NEVER commit real keys.
- SearchAtlas API key is only used server-side (never exposed to the browser).
- Passwords hashed with bcrypt.
- JWTs signed with `JWT_SECRET` — use a long random value in production.
- Admin endpoints require both a valid JWT and `role === 'admin'`.

---

## 📝 License
Proprietary — built for Beyond Marketing.
