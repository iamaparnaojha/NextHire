"""
Local file storage utility. 
Built so that it can be swapped out for cloud storage (like S3/Cloudinary) later if needed.
"""
import os
import aiofiles
from app.config import settings

async def save_file(file_bytes: bytes, filename: str, subfolder: str = "resumes") -> str:
    """
    Save file to local storage.
    Returns the relative path to the saved file.
    """
    # Create the subfolder if it doesn't exist
    target_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(target_dir, exist_ok=True)
    
    # Optional: We could hash the filename or add a UUID to prevent collisions.
    # For now, we'll keep the original filename but just sanitize it a bit
    safe_filename = "".join(c for c in filename if c.isalnum() or c in "._- ")
    
    file_path = os.path.join(target_dir, safe_filename)
    
    # Save the file asynchronously
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(file_bytes)
        
    # Return a relative path that can be stored in the DB if needed
    return f"{subfolder}/{safe_filename}"
