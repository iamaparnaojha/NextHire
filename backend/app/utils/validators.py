"""
File validators. Check extensions and file size limits.
"""
from fastapi import UploadFile, HTTPException, status
from app.config import settings

async def validate_upload(file: UploadFile) -> None:
    """
    Validate the uploaded file based on configured limits and extensions.
    Raises HTTPException if validation fails.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No file uploaded"
        )
        
    filename = file.filename.lower()
    if not any(filename.endswith(ext) for ext in settings.ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
        
    # Check file size (read chunks until either limit reached or file end)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    chunk_size = 1024 * 1024 # 1MB
    size_read = 0
    
    try:
        while chunk := await file.read(chunk_size):
            size_read += len(chunk)
            if size_read > max_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB"
                )
    finally:
        # Reset file pointer after reading so it can be read again elsewhere
        await file.seek(0)
