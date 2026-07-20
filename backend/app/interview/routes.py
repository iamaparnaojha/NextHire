"""
Interview Routes.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.auth.dependencies import get_current_user
from app.interview.models import InterviewRequest, HiringReportRequest
from app.interview.service import InterviewService
from app.utils.sse import format_sse_event

router = APIRouter()
service = InterviewService()

@router.post("/chat")
async def chat_with_aru(
    request: InterviewRequest,
    user: dict = Depends(get_current_user)
):
    """Stream Aru's interview response based on context and history."""
    history_dicts = [{"role": msg.role, "text": msg.text} for msg in request.history]

    async def event_stream():
        async for chunk in service.stream_interview_reply(request.resume_text, request.job_description, history_dicts):
            yield format_sse_event(chunk)
        yield format_sse_event('[DONE]')

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/report")
async def generate_hiring_report(
    request: HiringReportRequest,
    user: dict = Depends(get_current_user)
):
    """Stream the hiring evaluation report from the interview transcript.
    Handles both complete and early-ended interviews correctly."""
    history_dicts = [{"role": msg.role, "text": msg.text} for msg in request.history]

    async def event_stream():
        async for chunk in service.stream_report(request.resume_text, request.job_description, history_dicts):
            yield format_sse_event(chunk)
        yield format_sse_event('[DONE]')

    return StreamingResponse(event_stream(), media_type="text/event-stream")
