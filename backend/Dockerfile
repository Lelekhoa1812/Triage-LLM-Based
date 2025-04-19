FROM python:3.11-slim

# Set environment variables (may need to change authority)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create working directory (and authorised token)
ARG HF_TOKEN
ENV HF_TOKEN=${HF_TOKEN}
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy source code
COPY . /app

# Expose the port used by Uvicorn
EXPOSE 7860

# Run the FastAPI application using Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
