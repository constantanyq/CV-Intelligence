# Career OS — C-01 Career Path Navigator 🧭

**Navigate your career with clarity — not guesswork.**

A full-stack hackathon module that maps your realistic 5-year career trajectory, surfaces skill gaps, recommends real courses and certifications, and uses real AI to enhance your CV — built for the Southeast Asian job market.

## Try the prototype

👉 **<https://constantanyq.github.io/CV-Intelligence/>**

---

## Modules Covered

| Module | Audience | Status |
|---|---|---|
| C-01 · Career Path Navigator | Candidate | ✅ Primary |
| C-02 · Living Portfolio | Candidate | ✅ Included |
| E-01 · Smart Talent Matching | Employer | ✅ Included |

---

## Features

### Candidate Portal

| Feature | What it does |
|---|---|
| 🛤️ **Career Path Timeline** | Visual 5-year trajectory with MYR salary bands and "why this step" reasoning for each milestone, grounded in comparable SEA profiles |
| ✨ **Enhance CV** | AI rewrites your bullet points for ATS and hiring managers — rephrasing only what you actually wrote, never inventing accomplishments |
| 🔍 **Job Listings** | 10 curated SEA roles with keyword search and CV fit scores |
| 🔖 **Saved Jobs** | Bookmark roles and track applications |
| 🗺️ **Field Fit** | Ranks 8 career fields by signal strength against your CV, with salary ranges and skill gap breakdown |
| 🚀 **Upskill Tracker** | Per-field skill gap plans with 80+ handpicked free and paid courses, workshops, and certifications (Coursera, Kaggle, Google, Udemy, and more) — tick off what you've completed, progress saved per user |
| 📄 **CV Upload** | Upload PDF or paste text — PDF text is extracted properly via pdf.js, not read as binary |
| 🔐 **Secure Auth** | PBKDF2-SHA256 password hashing (120k iterations), session tokens, login lockout |

### Employer Portal

| Feature | What it does |
|---|---|
| 📝 **Post a Role** | Define role requirements and critical skills |
| 🤖 **Smart Talent Matching** | AI-surfaced candidates ranked by CV fit %, with skill match highlighting and score breakdowns across technical depth, achievements, and leadership signals |
| 📈 **Trajectory Signal** | Each candidate shows where they're heading (e.g. "Senior Full Stack / Engineering Lead in ~1–2 yrs") — reads where someone is going, not just where they've been |
| 📬 **Applied Candidates** | View and manage candidates who have applied, sorted by fit score |

---

## How It Works

This is a **navigation tool, not a prediction tool**. Every recommendation includes reasoning grounded in the candidate's CV and comparable SEA market patterns. No black-box scores — the system always explains *why*.

- **Candidates** upload or paste their CV → AI parses it into structured skills and experience → Career Path, Field Fit, and Upskill pages all update to reflect their actual profile
- **Employers** post a role → the matching engine surfaces candidates by fit %, with a trajectory signal showing where each candidate is heading over the next 1–3 years
- **No API key required** — all features run in demo mode with local parsing; add an Anthropic key in Settings to unlock full AI-powered CV parsing, enhancement, and timeline generation

---

## Security Notes

- API key stored in `sessionStorage` only — cleared on browser close, never persisted
- Passwords hashed client-side with PBKDF2-SHA256 before storage
- All CV data stored locally per user — never sent to any server except the Anthropic API when a key is present
