# NextHire Dockerfile
# Builds a production-ready image containing the FastAPI backend & static frontend assets.

# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install dependencies required for building some python packages (e.g. grpcio, motor) if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
    
COPY backend/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Copy wheels from builder and install
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy application code
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# Create uploads directory dynamically instead of copying
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# Expose the API port
EXPOSE 8000

# Run FastAPI with Uvicorn
# Set environment variables for production (to be overridden at runtime)
ENV HOST=0.0.0.0
ENV PORT=8000
ENV UPLOAD_DIR=/app/uploads

# Run from inside the backend directory to resolve app module
WORKDIR /app/backend

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
