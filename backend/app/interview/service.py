"""
Interview Service.
"""
from app.ai.gemini_client import GeminiClient
from app.prompts.interview import (
    build_interview_prompt, ARU_SYSTEM_PROMPT,
    build_report_prompt, REPORT_SYSTEM_PROMPT,
)

class InterviewService:
    def __init__(self):
        self.gemini = GeminiClient()

    async def stream_interview_reply(self, resume_text: str, job_description: str, history: list):
        prompt = build_interview_prompt(resume_text, job_description, history)
        async for chunk in self.gemini.stream_response(prompt, system_instruction=ARU_SYSTEM_PROMPT):
            yield chunk

    async def stream_report(self, resume_text: str, job_description: str, history: list):
        """Generate a streaming hiring report from the interview transcript.
        Works for partial (early-ended) and complete interviews."""
        prompt = build_report_prompt(resume_text, job_description, history)
        async for chunk in self.gemini.stream_response(prompt, system_instruction=REPORT_SYSTEM_PROMPT):
            yield chunk

