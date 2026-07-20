"""
Analysis Routes — Endpoints for Resume Analysis, ATS Scoring, and Skill Gap Analysis.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.auth.dependencies import get_current_user
from app.analysis.models import AnalysisRequest, ATSScoreRequest, IntroRequest
from app.analysis.service import AnalysisService
from app.utils.sse import format_sse_event

router = APIRouter()
service = AnalysisService()

@router.post("/resume")
async def analyze_resume(
    request: AnalysisRequest,
    user: dict = Depends(get_current_user)
):
    """
    Stream the resume analysis response.
    """
    async def event_stream():
        async for chunk in service.stream_resume_analysis(request.resume_text, request.job_description):
            yield format_sse_event(chunk)
        yield format_sse_event('[DONE]')

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@router.post("/ats-score")
async def get_ats_score(
    request: ATSScoreRequest,
    user: dict = Depends(get_current_user)
):
    """
    Get the ATS score (non-streaming).
    """
    score = await service.get_ats_score(request.resume_text, request.job_description)
    return {"score": score}

@router.post("/skill-gap")
async def analyze_skill_gap(
    request: AnalysisRequest,
    user: dict = Depends(get_current_user)
):
    """
    Stream the skill gap analysis.
    """
    async def event_stream():
        async for chunk in service.stream_skill_gap(request.resume_text, request.job_description):
            yield format_sse_event(chunk)
        yield format_sse_event('[DONE]')

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@router.post("/introduction")
async def generate_introduction(
    request: IntroRequest,
    user: dict = Depends(get_current_user)
):
    """
    Stream the impactful introduction.
    """
    async def event_stream():
        async for chunk in service.stream_impactful_intro(request.resume_text):
            yield format_sse_event(chunk)
        yield format_sse_event('[DONE]')

    return StreamingResponse(event_stream(), media_type="text/event-stream")
