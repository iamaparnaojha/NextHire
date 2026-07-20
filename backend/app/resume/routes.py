"""
Resume Routes — File upload, format validation, and text extraction.
"""
from fastapi import APIRouter, File, UploadFile, Depends, BackgroundTasks
from app.auth.dependencies import get_current_user
from app.resume.models import ResumeUploadResponse, ResumeTextRequest
from app.resume.parser import parse_file
from app.utils.validators import validate_upload
from app.utils.file_storage import save_file

router = APIRouter()

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """
    Upload a resume file (PDF or DOCX).
    - Validates file type and size.
    - Saves the file to local storage.
    - Parses the content into raw text.
    """
    # 1. Validate file (size, extension)
    await validate_upload(file)
    
    # 2. Read file bytes
    file_bytes = await file.read()
    
    # 3. Store file locally
    file_path = await save_file(file_bytes, file.filename, subfolder=f"resumes/{user['_id']}")
    
    # 4. Extract text
    text_content = parse_file(file_bytes, file.filename)
    
    return ResumeUploadResponse(
        filename=file.filename,
        text_content=text_content,
        file_path=file_path
    )

@router.post("/text", response_model=ResumeUploadResponse)
async def paste_resume(
    request: ResumeTextRequest,
    user: dict = Depends(get_current_user)
):
    """
    Submit resume text directly (without uploading a file).
    """
    return ResumeUploadResponse(
        filename="pasted_text.txt",
        text_content=request.text,
        file_path=None
    )
