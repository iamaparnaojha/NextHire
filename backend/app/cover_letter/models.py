"""
Cover Letter Pydantic Models.
"""
from pydantic import BaseModel, Field

class CoverLetterRequest(BaseModel):
    resume_text: str = Field(..., description="The candidate's resume text")
    job_description: str = Field(..., description="The target job description text")
