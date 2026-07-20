"""
Analysis Pydantic Models.
"""
from typing import Optional
from pydantic import BaseModel, Field

class AnalysisRequest(BaseModel):
    resume_text: str = Field(..., description="The raw text of the resume")
    job_description: Optional[str] = Field(None, description="The raw text of the job description")

class ATSScoreRequest(BaseModel):
    resume_text: str = Field(..., description="The raw text of the resume")
    job_description: str = Field(..., description="The raw text of the job description")

class IntroRequest(BaseModel):
    resume_text: str = Field(..., description="The raw text of the resume")
