"""
Interview Pydantic Models.
"""
from pydantic import BaseModel, Field
from typing import List

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'aru'")
    text: str = Field(..., description="Message content")

class InterviewRequest(BaseModel):
    resume_text: str
    job_description: str
    history: List[ChatMessage] = Field(default_factory=list)

class HiringReportRequest(BaseModel):
    resume_text: str
    job_description: str
    history: List[ChatMessage] = Field(default_factory=list)
