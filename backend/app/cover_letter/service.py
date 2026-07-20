"""
Cover Letter Service Layer.
"""
from app.ai.gemini_client import GeminiClient
from app.prompts.cover_letter import build_cover_letter_prompt, COVER_LETTER_SYSTEM

class CoverLetterService:
    def __init__(self):
        self.gemini = GeminiClient()

    async def stream_cover_letter(self, resume_text: str, job_description: str):
        prompt = build_cover_letter_prompt(resume_text, job_description)
        async for chunk in self.gemini.stream_response(prompt, system_instruction=COVER_LETTER_SYSTEM):
            yield chunk
