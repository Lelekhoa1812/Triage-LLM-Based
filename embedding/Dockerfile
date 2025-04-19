# 1. Base image
FROM python:3.10-slim

# 2. Set working directory
WORKDIR /app

# 3. Install system deps for faiss
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      git \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy app code
COPY rag.py .
COPY .env .   # your environment variables file

# 6. Expose HF Spaces default port
EXPOSE 7860

# 7. Entrypoint
CMD ["uvicorn", "rag:app", "--host", "0.0.0.0", "--port", "7860"]
