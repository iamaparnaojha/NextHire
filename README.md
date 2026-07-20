<div align="center">
  <h1>⚡ NextHire</h1>
  <p><b>AI-Powered Placement & Interview Preparation Platform</b></p>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" />
</div>

<br />

NextHire is a modern, full-stack AI platform designed to help candidates prepare for their dream jobs. By leveraging Google's Gemini Pro AI, NextHire provides real-time resume analysis, personalized skill gap identification, tailored cover letter generation, and an interactive AI Interview Simulator (Aru).

## 🚀 Features

*   **Resume ATS Analyzer:** Upload your resume (PDF/DOCX) and a job description to instantly receive an ATS compatibility score and actionable improvement tips.
*   **Skill Gap Analysis:** Compare your actual skills vs job requirements. Get a calculated match percentage and a structured learning roadmap.
*   **Generate Cover Letters:** Instantly generate professional, personalized cover letters tailored to the specific role and your experience.
*   **Aru - AI Interview Simulator:** Practice your interviewing skills with our real-time streaming AI chatbot. Choose between Technical, HR, Behavioral, and Managerial rounds.
*   **Comprehensive Hiring Report:** After an interview session with Aru, generate a detailed hiring report grading you on communication, technical accuracy, and cultural fit.
*   **History Tracking:** Log in to save and access all your past analyses, interview reports, and cover letters securely stored in MongoDB.

## 🛠️ Technology Stack

*   **Backend:** Python, FastAPI, Motor (Async MongoDB), PyJWT, Uvicorn.
*   **Frontend:** Vanilla JS, Context-aware modular CSS (variables, animations), Server-Sent Events (SSE) for streaming.
*   **AI Engine:** Google Gemini (`gemini-2.5-pro`).
*   **Database:** MongoDB.
*   **Containerization:** Docker & Docker Compose.

## ⚙️ Local Development Setup

### Prerequisites
*   Python 3.11+
*   MongoDB (Running locally or MongoDB Atlas)
*   Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/nexthire.git
cd nexthire
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
Ensure you provide a valid `GEMINI_API_KEY`, `MONGODB_URI`, and `JWT_SECRET`.

### 3. Setup Virtual Environment (Recommended)
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the Server
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
NextHire will be available at: `http://localhost:8000/`

## 🐳 Running with Docker

NextHire includes a `docker-compose.yml` for effortless deployment of both the standard API and a local MongoDB instance.

```bash
# Build and run the containers
docker-compose up --build -d

# Check logs
docker-compose logs -f
```
Access the application at `http://localhost:8000/`.

## 📂 Project Architecture

NextHire uses a modular FastAPI pattern (MPA approach). The frontend uses standard HTML/CSS/JS injected dynamically and is served directly by FastAPI.

```
NextHire/
├── backend/            # FastAPI Backend
│   ├── app/            # Application logic
│   │   ├── auth/       # JWT Auth logic
│   │   ├── analysis/   # Resume & Skill Gap logic
│   │   ├── cover_letter/# Cover letter generation
│   │   ├── interview/  # Aru Streaming Interview logic
│   │   ├── history/    # MongoDB DB saving/fetching logic
│   │   ├── prompts/    # Gemini System Prompts
│   │   └── main.py     # Entry Point
├── frontend/           # Static frontend assets
│   ├── css/            # Modular CSS files
│   ├── js/             # Vanilla JS tools UI logic
│   └── *.html          # Static HTML Pages
├── uploads/            # Temporary file upload directory (gitignored)
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── DEPLOYMENT.md       # Cloud deployment instructions
```

## 🔒 Security Notes
*   JWT Tokens are used to secure API endpoints.
*   No hardcoded secrets (all sourced from `.env`).
*   Temporary file uploads are stored locally and could be configured for cleanup (s3 integration recommended for prod).

## 📄 License
This project is available under the [MIT License](LICENSE).
