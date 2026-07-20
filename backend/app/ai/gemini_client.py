"""
Google Gemini AI Client Wrapper.
Handles standard generation and real-time streaming using google-genai SDK.
"""
from google import genai
from google.genai import types
from app.config import settings


class GeminiClient:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key:
            print("WARNING: GEMINI_API_KEY is not set. AI calls will fail.")

        # Initialize the official SDK client
        self.client = genai.Client(api_key=self.api_key)

        # Use model from env (GEMINI_MODEL) or default to gemini-2.5-flash
        self.model_name = settings.GEMINI_MODEL

    async def generate_response(self, prompt: str, system_instruction: str = None) -> str:
        """
        Generate a complete response from Gemini (non-streaming).
        """
        config = {}
        if system_instruction:
            config['system_instruction'] = system_instruction

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(**config) if config else None
            )
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                from fastapi import HTTPException
                raise HTTPException(status_code=429, detail="Gemini API Quota Exceeded. Please check your API key or billing.")
            raise Exception(f"Failed to generate AI response: {error_msg}")

    async def stream_response(self, prompt: str, system_instruction: str = None):
        """
        Stream a response from Gemini.
        Yields text chunks as they arrive.
        """
        config = {}
        if system_instruction:
            config['system_instruction'] = system_instruction

        try:
            response_stream = self.client.models.generate_content_stream(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(**config) if config else None
            )

            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            print(f"Gemini API Streaming Error: {e}")
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                yield "\n[Error: Gemini API Quota Exceeded. Please check your API key or billing.]"
            else:
                yield f"\n[Error connecting to AI: {error_msg}]"
