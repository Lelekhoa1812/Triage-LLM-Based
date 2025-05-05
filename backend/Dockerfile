FROM python:3.11-slim

# Set environment variables (may need to change authority)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/app/model_cache \
    HF_HOME=/app/.cache/huggingface \
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/huggingface/sentence-transformers

# ENV to inject secret (for HF model utilities)
ARG HF_TOKEN
ENV HF_TOKEN=${HF_TOKEN}

# Create working directory (and authorised token)
WORKDIR /app

# Install SSL root certs and system deps required by pymongo + DNS + ASR
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl dnsutils gcc openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Prepare cache dirs (for ASR model caching)
RUN mkdir -p /app/model_cache /app/.cache/huggingface \
 && chown -R 1000:1000 /app

# Debug HF token existance
RUN echo "✅ HF_TOKEN length: $(echo $HF_TOKEN | wc -c)"

# Copy source code (app files)
COPY . .
RUN ls -R /app

# Expose the port used by Uvicorn
EXPOSE 7860

# Run the FastAPI application using Uvicorn (add ["--workers", "1"] parameter if resource go low)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--log-level", "debug"]
