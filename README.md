# FAIR_GAME — AI Networking Strategy Platform

> "Google Maps for career fairs and networking events."

A full-stack AI-powered platform that transforms networking from random conversations into precision strategy.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 · React · TypeScript · TailwindCSS |
| Backend | Node.js · Express · TypeScript |
| Database | PostgreSQL |
| AI | OpenAI GPT-4o-mini |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Deployment | Vercel (frontend) · Railway/Render (backend) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
npm install
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### 3. Database

The tables are auto-created on first run. Or run manually:
```bash
cd backend && npx tsx src/db/schema.ts
```

---

## API Reference

### Auth
```
POST /api/auth/signup   — Create account
POST /api/auth/login    — Sign in → returns JWT
```

### User
```
GET  /api/user/profile  — Get profile (auth required)
PUT  /api/user/profile  — Update profile (auth required)
GET  /api/user/stats    — Activity stats (auth required)
```

### Career Fair
```
POST /api/career-fair/analyze  — Analyze companies list
GET  /api/career-fair/history  — Past analyses
```

**Request body:**
```json
{
  "companies": ["Google", "Nvidia", "Stripe"],
  "eventName": "Spring Career Fair 2025"
}
```

**Response:**
```json
{
  "rankedCompanies": [
    {
      "rank": 1,
      "company": "Nvidia",
      "score": 92,
      "description": "...",
      "roles": ["ML Engineer Intern", "Software Engineer"],
      "talkingPoints": ["..."],
      "suggestedQuestions": ["..."]
    }
  ],
  "recommendedRoute": ["Nvidia", "Google", "Stripe"],
  "strategy": "Focus on AI-focused companies first..."
}
```

### Networking
```
POST /api/networking/analyze   — Analyze LinkedIn profile
GET  /api/networking/history   — Past analyses
```

**Request body:**
```json
{ "linkedinUrl": "linkedin.com/in/alexjohnson" }
```

### Follow-up
```
POST /api/generate-followup
```

**Request body:**
```json
{
  "type": "career_fair",  // or "linkedin" or "email"
  "company": "Nvidia",
  "conversationNotes": "Discussed GPU infrastructure team and summer internship openings"
}
```

---

## Database Schema

```sql
users (
  id UUID PK,
  name, email, password_hash,
  university, major, graduation_year,
  linkedin, github, portfolio,
  skills TEXT[], target_industries TEXT[], target_companies TEXT[],
  career_interests TEXT,
  created_at, updated_at
)

career_fair_events (
  id UUID PK,
  user_id FK → users,
  event_name, company_list TEXT[],
  analysis_results JSONB,
  created_at
)

networking_analyses (
  id UUID PK,
  user_id FK → users,
  linkedin_url, person_data JSONB,
  conversation_notes, generated_strategy JSONB,
  created_at
)

follow_ups (
  id UUID PK,
  user_id FK → users,
  context_type, context_data JSONB,
  generated_message TEXT,
  created_at
)
```

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel deploy
# Set NEXT_PUBLIC_API_URL to your backend URL
```

### Backend → Railway / Render
- Push to GitHub
- Connect repo to Railway or Render
- Set environment variables from `.env.example`
- Set start command: `npm run build && npm start`

---

## AI Scoring Algorithm

Career fair company ranking uses weighted scoring:

| Factor | Weight |
|---|---|
| Skill match | 40% |
| Industry alignment | 30% |
| Career interest fit | 20% |
| Hiring probability | 10% |

Scores 0–100. Companies ranked high → low.

---

## Future Features

- [ ] Networking Potential Score (0–100 user score)
- [ ] Resume PDF upload + parsing
- [ ] Real LinkedIn scraping integration
- [ ] Email sending via SendGrid
- [ ] Mobile app (React Native)
- [ ] Career fair maps / floor plan integration
- [ ] Company recruiter database
- [ ] Networking history timeline

---

## License

MIT
