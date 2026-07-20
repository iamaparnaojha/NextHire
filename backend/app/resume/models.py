"""
Pydantic Models for Resume Upload and Parsing.
"""
from pydantic import BaseModel, Field
from typing import Optional

class ResumeUploadResponse(BaseModel):
    """Response returned when a resume is uploaded and parsed successfully."""
    filename: Optional[str] = Field(None, description="Name of the uploaded file")
    text_content: str = Field(..., description="Extracted text from the resume")
    file_path: Optional[str] = Field(None, description="Local path to the saved file (relative)")
    
class ResumeTextRequest(BaseModel):
    """Request for pasting resume text directly."""
    text: str = Field(..., description="Raw text of the resume", min_length=10)
