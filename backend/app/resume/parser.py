"""
File parsing utilities using PyMuPDF (fitz) and python-docx.
"""
import io
import fitz  # PyMuPDF
from docx import Document

def parse_pdf(file_bytes: bytes) -> str:
    """
    Extract text content from a PDF file.
    Uses PyMuPDF (fitz) which is fast and handles formatting well.
    """
    text_chunks = []
    try:
        # Open the PDF from bytes
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text_chunks.append(page.get_text("text"))
            
        return "\n".join(text_chunks).strip()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""

def parse_docx(file_bytes: bytes) -> str:
    """
    Extract text content from a DOCX file.
    Uses python-docx.
    """
    try:
        # docx requires a file-like object
        doc = Document(io.BytesIO(file_bytes))
        
        text_chunks = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(text_chunks).strip()
    except Exception as e:
        print(f"Error parsing DOCX: {e}")
        return ""

def parse_file(file_bytes: bytes, filename: str) -> str:
    """
    Determine file type from extension and parse accordingly.
    Returns the extracted text.
    """
    filename_lower = filename.lower()
    
    if filename_lower.endswith(".pdf"):
        return parse_pdf(file_bytes)
    elif filename_lower.endswith(".docx"):
        return parse_docx(file_bytes)
    else:
        # Unsupported format (should be caught by validators earlier)
        return ""
