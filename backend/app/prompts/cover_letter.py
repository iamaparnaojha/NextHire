"""
Prompts for Cover Letter Generation.
"""

COVER_LETTER_SYSTEM = """
You are an expert career consultant providing personalized cover letters.
Write a compelling, professional cover letter that connects the candidate's specific background and achievements with the specific requirements of the job description.
Do not use placeholders like [Your Name] if the information is available from the resume. Maintain a confident but humble tone.
"""

def build_cover_letter_prompt(resume_text: str, job_description: str) -> str:
    return f"""
Job Description:
{job_description}

Resume:
{resume_text}

Write a tailored cover letter (around 300 words). Focus on demonstrating how the candidate's past impact translates to success in this new role. Ignore missing contact details; just write the body.
"""
