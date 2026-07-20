"""
Service layer for Analysis. Orchestrates Gemini API calls for Resume Analysis, ATS Scoring, and Skill Gaps.
"""
from app.ai.gemini_client import GeminiClient
from app.prompts.resume_analysis import build_resume_analysis_prompt, RESUME_ANALYSIS_SYSTEM
from app.prompts.ats_score import build_ats_score_prompt, ATS_SCORE_SYSTEM
from app.prompts.skill_gap import build_skill_gap_prompt, SKILL_GAP_SYSTEM
from app.prompts.impactful_intro import build_impactful_intro_prompt, IMPACTFUL_INTRO_SYSTEM

class AnalysisService:
    def __init__(self):
        self.gemini = GeminiClient()

    async def stream_resume_analysis(self, resume_text: str, job_description: str = None):
        prompt = build_resume_analysis_prompt(resume_text, job_description)
        async for chunk in self.gemini.stream_response(prompt, system_instruction=RESUME_ANALYSIS_SYSTEM):
            yield chunk

    async def get_ats_score(self, resume_text: str, job_description: str) -> str:
        prompt = build_ats_score_prompt(resume_text, job_description)
        # We use standard generate (non-streaming) for ATS score since it's just a number
        response = await self.gemini.generate_response(prompt, system_instruction=ATS_SCORE_SYSTEM)
        
        # Simple extraction logic (it should be of format "SCORE: XX")
        import re
        match = re.search(r"SCORE:\s*(\d{1,3})", response, re.IGNORECASE)
        if match:
             return match.group(1)
        return "N/A"

    async def stream_skill_gap(self, resume_text: str, job_description: str):
        prompt = build_skill_gap_prompt(resume_text, job_description)
        async for chunk in self.gemini.stream_response(prompt, system_instruction=SKILL_GAP_SYSTEM):
            yield chunk
            
    async def stream_impactful_intro(self, resume_text: str):
        prompt = build_impactful_intro_prompt(resume_text)
        async for chunk in self.gemini.stream_response(prompt, system_instruction=IMPACTFUL_INTRO_SYSTEM):
            yield chunk
