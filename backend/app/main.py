"""
NextHire — FastAPI Application Entry Point
Sets up CORS, routes, static files, and database lifecycle.
"""
import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.auth.routes import router as auth_router
from app.resume.routes import router as resume_router
from app.analysis.routes import router as analysis_router
from app.cover_letter.routes import router as cover_letter_router
from app.interview.routes import router as interview_router
from app.history.routes import router as history_router


# ──────────────────────────────────────────────
#  App Lifecycle
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    await connect_to_mongo()
    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print(f"🚀 NextHire API running on {settings.HOST}:{settings.PORT}")
    yield
    # Shutdown
    await close_mongo_connection()


# ──────────────────────────────────────────────
#  Create FastAPI App
# ──────────────────────────────────────────────
app = FastAPI(
    title="NextHire API",
    description="AI-Powered Placement Coach — Resume Analysis, Interview Prep & More",
    version="1.0.0",
    lifespan=lifespan,
)

# ──────────────────────────────────────────────
#  CORS Middleware
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
#  API Routes
# ──────────────────────────────────────────────
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resume_router, prefix="/api/resume", tags=["Resume"])
app.include_router(analysis_router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(cover_letter_router, prefix="/api/cover-letter", tags=["Cover Letter"])
app.include_router(interview_router, prefix="/api/interview", tags=["Interview"])
app.include_router(history_router, prefix="/api/history", tags=["History"])

# ──────────────────────────────────────────────
#  Serve Frontend Static Files
# ──────────────────────────────────────────────
frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend"

# Mount static assets (CSS, JS, images)
if frontend_dir.exists():
    app.mount("/css", StaticFiles(directory=str(frontend_dir / "css")), name="css")
    app.mount("/js", StaticFiles(directory=str(frontend_dir / "js")), name="js")
    app.mount("/assets", StaticFiles(directory=str(frontend_dir / "assets")), name="assets")


# ──────────────────────────────────────────────
#  HTML Page Routes
# ──────────────────────────────────────────────
@app.get("/")
async def serve_index():
    """Serve the landing page."""
    return FileResponse(str(frontend_dir / "index.html"))


@app.get("/login")
async def serve_login():
    """Serve the login/register page."""
    return FileResponse(str(frontend_dir / "login.html"))


@app.get("/dashboard")
async def serve_dashboard():
    """Serve the dashboard page."""
    return FileResponse(str(frontend_dir / "dashboard.html"))


@app.get("/resume-analyzer")
async def serve_resume_analyzer():
    return FileResponse(str(frontend_dir / "resume-analyzer.html"))


@app.get("/skill-gap")
async def serve_skill_gap():
    return FileResponse(str(frontend_dir / "skill-gap.html"))


@app.get("/cover-letter")
async def serve_cover_letter():
    return FileResponse(str(frontend_dir / "cover-letter.html"))

@app.get("/interview")
async def serve_interview():
    return FileResponse(str(frontend_dir / "interview.html"))


@app.get("/introduction")
async def serve_introduction():
    return FileResponse(str(frontend_dir / "introduction.html"))


@app.get("/history")
async def serve_history():
    return FileResponse(str(frontend_dir / "history.html"))


# ──────────────────────────────────────────────
#  Health Check
# ──────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "app": "NextHire", "version": "1.0.0"}


# ──────────────────────────────────────────────
#  Run with Uvicorn when executed directly
# ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
