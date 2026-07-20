"""
History Models.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class HistoryItemCreate(BaseModel):
    tool_name: str = Field(..., description="e.g., 'resume-analyzer', 'skill-gap', 'cover-letter', 'interview'")
    job_title: Optional[str] = Field(None, description="Extracted or provided job title")
    content: str = Field(..., description="The generated Markdown text or results")
    score: Optional[int] = Field(None, description="ATS or Interview Score if applicable")

class HistoryItemResponse(HistoryItemCreate):
    id: str
    user_id: str
    created_at: datetime
