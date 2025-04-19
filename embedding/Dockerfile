FROM python:3.10-slim

WORKDIR /app

# Install OS-level dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    git && \
    rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create cache directory and set permissions
RUN mkdir -p /app/.cache && chmod -R 777 /app/.cache

# Pre-download SentenceTransformer model AFTER installation
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy the app code
COPY . .

# Set Hugging Face cache env vars
ENV HF_HOME=/app/.cache

EXPOSE 7860

CMD ["uvicorn", "rag:app", "--host", "0.0.0.0", "--port", "7860"]
