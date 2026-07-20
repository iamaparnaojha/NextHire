"""
Cover Letter Routes.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.auth.dependencies import get_current_user
from app.cover_letter.models import CoverLetterRequest
from app.cover_letter.service import CoverLetterService
from app.utils.sse import format_sse_event

router = APIRouter()
service = CoverLetterService()

@router.post("/generate")
async def generate_cover_letter(
    request: CoverLetterRequest,
    user: dict = Depends(get_current_user)
):
    """
    Stream the generated cover letter.
    """
    async def event_stream():
        async for chunk in service.stream_cover_letter(request.resume_text, request.job_description):
            yield format_sse_event(chunk)
        yield format_sse_event('[DONE]')

    return StreamingResponse(event_stream(), media_type="text/event-stream")
