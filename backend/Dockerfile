FROM python:3.11-slim

# ───────────────────────────────
# ENV Variables
# ───────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/app/model_cache \
    HF_HOME=/app/.cache/huggingface \
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/huggingface/sentence-transformers

ARG HF_TOKEN
ENV HF_TOKEN=${HF_TOKEN}

# ───────────────────────────────
# Create working directory
# ───────────────────────────────
WORKDIR /app

# ───────────────────────────────
# System dependencies
# ───────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl dnsutils gcc openssl ffmpeg git \
    && rm -rf /var/lib/apt/lists/*

# ───────────────────────────────
# Python dependencies
# ───────────────────────────────
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ───────────────────────────────
# Prepare cache directories
# ───────────────────────────────
ENV HF_HOME=/app/.cache/huggingface \
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/huggingface/sentence-transformers

# ───────────────────────────────
# Pre-download SentenceTransformer model
# ───────────────────────────────
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# ───────────────────────────────
# Create non-root user and change ownership
# ───────────────────────────────
RUN useradd -m -u 1000 user && \
    mkdir -p /app/model_cache /app/.cache/huggingface/sentence-transformers && \
    chown -R user:user /app
USER user

# ───────────────────────────────
# Copy app source
# ───────────────────────────────
COPY . .

# Debug token access (optional)
RUN echo '✅ HF_TOKEN set?' && echo ${HF_TOKEN} | wc -c

# ───────────────────────────────
# Expose and run
# ───────────────────────────────
EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--log-level", "debug"]
