# NextHire — AI Placement Coach: Implementation Plan

## Overview

Build a production-ready, full-stack AI-powered placement preparation platform. Users can upload resumes, paste job descriptions, get ATS analysis, optimize resumes, generate cover letters, practice AI interviews with a named interviewer ("Aru"), and receive a final hiring readiness report.

**Tech Stack:** HTML5/CSS3/Vanilla JS frontend · FastAPI backend · MongoDB · JWT auth · Google Gemini API · SSE streaming · Docker

---

## User Review Required

> [!IMPORTANT]
> **MongoDB**: The plan assumes you have MongoDB installed locally or a MongoDB Atlas URI. Please confirm which you prefer so I can configure the connection string accordingly.

> [!IMPORTANT]
> **Google Gemini API Key**: You'll need a valid `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/). The app reads it from `.env` — no key is ever hardcoded.

> [!WARNING]
> **File Size**: This is a large project (~50+ files). I will build it in **7 sequential phases**, reporting progress & requesting approval between phases if anything deviates from this plan.

---

## Project Structure

```
NextHire/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── config.py                # Env var loading (pydantic-settings)
│   │   ├── database.py              # MongoDB connection (motor)
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py            # /register, /login, /me
│   │   │   ├── service.py           # JWT creation, password hashing
│   │   │   ├── models.py            # User Pydantic models
│   │   │   └── dependencies.py      # get_current_user dependency
│   │   ├── resume/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py            # Upload & parse resume
│   │   │   ├── parser.py            # PDF (PyMuPDF) & DOCX parsing
│   │   │   └── models.py
│   │   ├── analysis/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py            # ATS score, resume analysis, skill gap
│   │   │   ├── service.py           # Gemini AI calls
│   │   │   └── models.py
│   │   ├── cover_letter/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── service.py
│   │   │   └── models.py
│   │   ├── interview/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py            # Start, ask, answer, report
│   │   │   ├── service.py           # Streaming interview logic
│   │   │   └── models.py
│   │   ├── prompts/
│   │   │   ├── __init__.py
│   │   │   ├── resume_analysis.py
│   │   │   ├── ats_score.py
│   │   │   ├── skill_gap.py
│   │   │   ├── cover_letter.py
│   │   │   ├── interview_hr.py
│   │   │   ├── interview_technical.py
│   │   │   ├── interview_behavioral.py
│   │   │   ├── interview_managerial.py
│   │   │   └── hiring_report.py
│   │   ├── ai/
│   │   │   ├── __init__.py
│   │   │   └── gemini_client.py     # Gemini SDK wrapper (sync + stream)
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── file_storage.py      # Local file storage (Cloudinary-ready)
│   │       └── validators.py        # Upload validation, sanitization
│   ├── uploads/                     # Local file storage directory
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html                   # Landing page
│   ├── login.html                   # Auth page
│   ├── dashboard.html               # Main dashboard
│   ├── resume-analyzer.html
│   ├── skill-gap.html
│   ├── cover-letter.html
│   ├── interview.html               # AI Interview Simulator
│   ├── report.html                  # Final Hiring Report
│   ├── css/
│   │   ├── variables.css            # Design tokens
│   │   ├── base.css                 # Reset + typography
│   │   ├── components.css           # Cards, buttons, modals, toast
│   │   ├── layout.css               # Grid, responsive
│   │   ├── animations.css           # Keyframes, transitions
│   │   └── pages.css                # Page-specific overrides
│   ├── js/
│   │   ├── api.js                   # Fetch wrapper, JWT interceptor
│   │   ├── auth.js                  # Login/Register logic
│   │   ├── router.js                # SPA-like navigation guard
│   │   ├── toast.js                 # Toast notification system
│   │   ├── upload.js                # Drag-and-drop file upload
│   │   ├── streaming.js             # SSE consumer + typing animation
│   │   ├── resume-analyzer.js
│   │   ├── skill-gap.js
│   │   ├── cover-letter.js
│   │   ├── interview.js             # Chat UI + streaming
│   │   └── report.js
│   └── assets/
│       └── (generated images/icons)
├── Dockerfile
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## Proposed Changes — Phased Build

### Phase 1: Project Scaffolding & Backend Foundation

**Goal:** Set up the project structure, FastAPI app, MongoDB connection, environment config, and JWT authentication.

#### Backend Core
- **[NEW]** `backend/app/main.py` — FastAPI app with CORS, static file mount, lifespan events
- **[NEW]** `backend/app/config.py` — Pydantic Settings loading from `.env`
- **[NEW]** `backend/app/database.py` — Motor async MongoDB client with connection pooling
- **[NEW]** `backend/requirements.txt` — All Python dependencies

#### Authentication
- **[NEW]** `backend/app/auth/routes.py` — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **[NEW]** `backend/app/auth/service.py` — bcrypt password hashing, JWT token creation/verification
- **[NEW]** `backend/app/auth/models.py` — `UserCreate`, `UserLogin`, `UserResponse` Pydantic models
- **[NEW]** `backend/app/auth/dependencies.py` — `get_current_user` FastAPI dependency

#### Config Files
- **[NEW]** `.env.example` — Empty env template
- **[NEW]** `.gitignore` — Python, Node, .env, uploads, __pycache__

---

### Phase 2: Frontend Foundation & Landing Page

**Goal:** Build the premium dark-theme landing page with glassmorphism, hero section, feature cards, navigation, and auth pages.

#### Design System
- **[NEW]** `frontend/css/variables.css` — Color palette, spacing scale, typography, shadows, gradients
- **[NEW]** `frontend/css/base.css` — CSS reset, body, headings, links, scrollbar
- **[NEW]** `frontend/css/components.css` — Buttons, cards, inputs, modals, skeletons, toast
- **[NEW]** `frontend/css/layout.css` — Responsive grid, container widths, nav, footer
- **[NEW]** `frontend/css/animations.css` — Fade-in, slide-up, pulse, typing indicator, skeleton shimmer

#### Pages
- **[NEW]** `frontend/index.html` — Hero, features grid, how-it-works, about, footer
- **[NEW]** `frontend/login.html` — Login/Register toggle form with validation
- **[NEW]** `frontend/dashboard.html` — Protected dashboard with feature cards

#### JS Core
- **[NEW]** `frontend/js/api.js` — `apiFetch()` wrapper with JWT `Authorization` header injection
- **[NEW]** `frontend/js/auth.js` — Login, register, logout, token storage
- **[NEW]** `frontend/js/router.js` — Auth guard, redirect-after-login
- **[NEW]** `frontend/js/toast.js` — Animated toast notifications

---

### Phase 3: Resume Upload & Parsing

**Goal:** File upload with drag-and-drop, PDF/DOCX parsing, and local storage.

#### Backend
- **[NEW]** `backend/app/resume/routes.py` — `POST /api/resume/upload` (file), `POST /api/resume/text` (paste)
- **[NEW]** `backend/app/resume/parser.py` — PyMuPDF for PDF, python-docx for DOCX
- **[NEW]** `backend/app/resume/models.py` — `ResumeUploadResponse`
- **[NEW]** `backend/app/utils/file_storage.py` — `save_file()` / `get_file()` with abstract interface
- **[NEW]** `backend/app/utils/validators.py` — File type, size validation (max 5MB)

#### Frontend
- **[NEW]** `frontend/js/upload.js` — Drag-and-drop component with preview

---

### Phase 4: AI Analysis Features (Resume Analyzer, Skill Gap, Cover Letter)

**Goal:** Integrate Google Gemini API for resume analysis, ATS scoring, skill gap analysis, and cover letter generation — all with SSE streaming.

#### AI Integration
- **[NEW]** `backend/app/ai/gemini_client.py` — `GeminiClient` class with `generate()` and `stream()` methods

#### Prompt Templates
- **[NEW]** `backend/app/prompts/resume_analysis.py` — Full ATS analysis prompt
- **[NEW]** `backend/app/prompts/ats_score.py` — ATS scoring prompt (0-100)
- **[NEW]** `backend/app/prompts/skill_gap.py` — Gap analysis + learning roadmap prompt
- **[NEW]** `backend/app/prompts/cover_letter.py` — Personalized cover letter prompt

#### Analysis Routes
- **[NEW]** `backend/app/analysis/routes.py` — `POST /api/analysis/resume` (SSE), `POST /api/analysis/skill-gap` (SSE)
- **[NEW]** `backend/app/analysis/service.py` — Orchestrates Gemini calls with prompts

#### Cover Letter Routes
- **[NEW]** `backend/app/cover_letter/routes.py` — `POST /api/cover-letter/generate` (SSE)
- **[NEW]** `backend/app/cover_letter/service.py`

#### Frontend Pages
- **[NEW]** `frontend/resume-analyzer.html` — Upload + JD input + streaming results
- **[NEW]** `frontend/skill-gap.html` — Side-by-side comparison + roadmap
- **[NEW]** `frontend/cover-letter.html` — Generated letter with copy/edit
- **[NEW]** `frontend/js/streaming.js` — SSE consumer with typing animation
- **[NEW]** `frontend/js/resume-analyzer.js`
- **[NEW]** `frontend/js/skill-gap.js`
- **[NEW]** `frontend/js/cover-letter.js`

---

### Phase 5: AI Interview Simulator (Flagship Feature)

**Goal:** Build the conversational AI interview with "Aru" — one question at a time, answer evaluation, score + feedback after each response, streaming responses. Support HR/Technical/Behavioral/Managerial modes and experience levels.

#### Prompt Templates
- **[NEW]** `backend/app/prompts/interview_hr.py`
- **[NEW]** `backend/app/prompts/interview_technical.py`
- **[NEW]** `backend/app/prompts/interview_behavioral.py`
- **[NEW]** `backend/app/prompts/interview_managerial.py`
- **[NEW]** `backend/app/prompts/hiring_report.py`

#### Interview Backend
- **[NEW]** `backend/app/interview/routes.py`
  - `POST /api/interview/start` — Initialize session (type, level, resume, JD)
  - `POST /api/interview/ask` — Get next question (SSE)
  - `POST /api/interview/answer` — Submit answer, get evaluation (SSE)
  - `POST /api/interview/report` — Generate final hiring report (SSE)
- **[NEW]** `backend/app/interview/service.py` — Conversation context management, Gemini streaming
- **[NEW]** `backend/app/interview/models.py` — `InterviewSession`, `InterviewAnswer`, `InterviewReport`

#### Interview Frontend
- **[NEW]** `frontend/interview.html` — Chat-style UI with configuration panel
- **[NEW]** `frontend/js/interview.js` — Chat logic, SSE streaming, typing indicator
- **[NEW]** `frontend/report.html` — Final hiring report with score visualization
- **[NEW]** `frontend/js/report.js` — Render report with charts/progress bars

---

### Phase 6: Database Persistence & History

**Goal:** Store interview history, generated reports, cover letters, and resume metadata in MongoDB.

#### Backend Updates
- Modify `analysis/service.py` — Save analysis results to MongoDB
- Modify `cover_letter/service.py` — Save generated cover letters
- Modify `interview/service.py` — Save interview sessions & reports
- Add history retrieval endpoints:
  - `GET /api/history/analyses`
  - `GET /api/history/interviews`
  - `GET /api/history/cover-letters`
  - `GET /api/history/reports`

---

### Phase 7: Docker, Deployment & Documentation

**Goal:** Containerize the full stack, create deployment guide, and write comprehensive README.

- **[NEW]** `Dockerfile` — Multi-stage Python + static file serving
- **[NEW]** `docker-compose.yml` — FastAPI + MongoDB services
- **[NEW]** `README.md` — Full documentation
- **[NEW]** `DEPLOYMENT.md` — AWS App Runner step-by-step guide

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Password Hashing** | bcrypt via `passlib` | Industry standard, per requirements |
| **MongoDB Driver** | `motor` (async) | Non-blocking, FastAPI-native |
| **Gemini SDK** | `google-genai` | Official Google SDK with streaming support |
| **SSE Implementation** | `StreamingResponse` + `text/event-stream` | Compatible with `EventSource` in browsers |
| **File Parsing** | `PyMuPDF` + `python-docx` | Reliable, lightweight, per requirements |
| **Frontend Routing** | Multi-page with shared JS auth guard | Simpler than SPA, no build tools needed |
| **File Storage** | Local with abstract interface | Easy Cloudinary swap later |
| **Frontend served by** | FastAPI `StaticFiles` mount | Single deployment unit |

---

## Open Questions

> [!IMPORTANT]
> 1. **MongoDB Setup**: Are you using MongoDB Atlas (cloud) or local MongoDB? This affects the connection string format in `.env.example`.
> 2. **Gemini Model**: The plan uses `gemini-2.0-flash` for speed. Do you prefer a different model like `gemini-2.5-pro` for higher quality (slower, more expensive)?
> 3. **Port**: Default `PORT=8000` for FastAPI — is that acceptable?

---

## Verification Plan

### Automated Tests
- Start backend with `uvicorn` and verify all endpoints return correct status codes
- Test auth flow: register → login → access protected route
- Test file upload with sample PDF & DOCX
- Test SSE streaming endpoints in browser
- Verify Docker builds and runs with `docker compose up`

### Manual Verification
- Visual review of all frontend pages for responsive design (desktop/tablet/mobile)
- End-to-end flow: Register → Upload Resume → Analyze → Interview → Report
- Verify streaming renders progressively (no full-page wait)
- Check all toast notifications and error states

### Browser Testing
- Use the browser subagent to navigate all pages and verify functionality
- Screenshot key UI states for the walkthrough artifact
