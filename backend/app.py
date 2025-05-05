# Access site: https://binkhoale1812-triage-llm.hf.space/
# Utilities
import os
import json
import logging
import tempfile
import psutil
from typing import Dict
import re
import requests

# Server-side
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import uvicorn


# AI/LLM
import torch
from transformers import pipeline
from google import genai

# ──────────────────────────────────────────────────────────────────────────────
# Logging Setup (Debugs)
# ──────────────────────────────────────────────────────────────────────────────
logger = logging.getLogger("triage-response")
logger.setLevel(logging.INFO)
fmt = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s")
handler = logging.StreamHandler()
handler.setFormatter(fmt)
logger.addHandler(handler)
# suppress noisy libs
for lib in ("pymongo", "urllib3", "httpx", "uvicorn",):
    logging.getLogger(lib).setLevel(logging.WARNING)

# ──────────────────────────────────────────────────────────────────────────────
# Environment & Validation
# ──────────────────────────────────────────────────────────────────────────────
load_dotenv()
REQUIRED = ["PROFILE_URI", "GEMINI_API_KEY", "HOSPITAL_API", "HF_TOKEN"]
for var in REQUIRED:
    if not os.getenv(var):
        logger.error(f"Missing env var: {var}")
        raise RuntimeError(f"{var} not set")

# ──────────────────────────────────────────────────────────────────────────────
# MongoDB Setup
# ──────────────────────────────────────────────────────────────────────────────
mongo_uri = os.getenv("PROFILE_URI")
client    = MongoClient(mongo_uri)
db        = client["MedicalChatbotDB"]
users     = db["Personal_Info"]

# ──────────────────────────────────────────────────────────────────────────────
# FastAPI Init and CORS bypassing
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Triage Response System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/statics", StaticFiles(directory="statics"), name="statics")

# ──────────────────────────────────────────────────────────────────────────────
# Resource Monitor
# ──────────────────────────────────────────────────────────────────────────────
def check_resources():
    mem = psutil.virtual_memory().percent
    cpu = psutil.cpu_percent(interval=1)
    disk = psutil.disk_usage("/").percent
    logger.info(f"🔍 RAM: {mem}%, CPU: {cpu}%, Disk: {disk}%")
    if mem>85: logger.warning("High RAM usage")
    if cpu>90: logger.warning("High CPU usage")
    if disk>90: logger.warning("High Disk usage")
check_resources()

# ──────────────────────────────────────────────────────────────────────────────
# Load Whisper ASR & Gemini LLM at Startup
# ──────────────────────────────────────────────────────────────────────────────
asr_pipe = None
llm_client = None

@app.on_event("startup")
async def load_models():
    global asr_pipe, llm_client
    # whisper-large-v3 ASR
    device = 0 if torch.cuda.is_available() else -1 # Likely CPU server-side
    asr_pipe = pipeline(
        "automatic-speech-recognition",
        model="openai/whisper-large-v3",            # Heavy-size but high accuracy, switch to other transformer based models like `whisper-small.en`` or `wav2vec2-base-960h`` for quicker response
        chunk_length_s=30,
        device=device,
    )
    logger.info("[MODEL] Whisper-v3 loaded")
    # Gemini client
    llm_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    logger.info("[MODEL] Gemini client ready")

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
def rag_context(user_summary: dict) -> str:
    # placeholder for FAISS lookup
    return "RAG context placeholder"

# Break down JSON body to extract Markdown content
def extract_json(text: str):
    try:
        import re
        clean = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip("` \n")
        return json.loads(clean)
    except Exception as e:
        logger.error(f"JSON parse error: {e}")
        return None

# Call LLM
def call_gemini(prompt: str) -> str:
    logger.info("[LLM] Generating summary prompt...")
    resp = llm_client.models.generate_content(
        model="gemini-2.5-flash-preview-04-17",
        contents=prompt
    )
    text = "".join(part.text for part in resp.candidates[0].content.parts)
    logger.info(f"[LLM] Output length: {len(text)} chars")
    return text

# ──────────────────────────────────────────────────────────────────────────────
# 1) Serve SPA
# ──────────────────────────────────────────────────────────────────────────────
@app.get("/")
async def serve_index():
    p = "statics/index.html"
    if os.path.exists(p):
        logger.info("[STATIC] Serving index.html")
        return FileResponse(p)
    logger.error("[STATIC] index.html not found")
    return JSONResponse(status_code=404, content={"detail":"Not found"})

# ──────────────────────────────────────────────────────────────────────────────
# 2) Emergency Endpoint
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/emergency")
async def handle_emergency(payload: Dict):
    try:
        logger.info("[EMERGENCY] Received request")
        uid   = payload.get("user_id")
        voice = payload.get("voice_text", "")
        user  = users.find_one({"user_id": uid})
        if not user:
            logger.warning("[EMERGENCY] User missing")
            raise HTTPException(404, "User not found")
        # Extract profile using user_id
        profile = user.get("profile", {}) 
        if not any(profile.values()):
            logger.warning("[EMERGENCY_WARNING] Profile is empty or incomplete.")
        # Convert emergency contact (list) to string
        contact_info = profile.get("emergency_contact")
        if isinstance(contact_info, dict):
            contact_str = f'{contact_info.get("name", "")} - {contact_info.get("phone", "")}'
        else:
            contact_str = str(contact_info)
        # User profile summary
        summary = {
            "Name": profile.get("name"),
            "Age": profile.get("age"),
            "Blood Type": profile.get("blood_type"),
            "Allergies": profile.get("allergies"),
            "History": profile.get("medical_history"),
            "Meds": profile.get("active_medications"),
            "Disability": profile.get("disability"),
            "Emergency Contact": contact_str,
            "Location": profile.get("home_address"),
        }
        logger.debug(f"[EMERGENCY] Profile summary: {summary}")
        # Boost-up decision-making with context-based response guideline
        context = rag_context(summary)
        prompt = (
            "You are an AI assistant supporting medical staff. "
            "Summarize the patient's critical info and suggest best-practice actions "
            "for triage (do not decide autonomously).\n\n"
            f"PATIENT INFO:\n{summary}\n\n"
            f"RAG CONTEXT:\n{context}\n\n"
            f"EMERGENCY ASSERTION:\n\"{voice}\"\n\n"
            "Return a JSON object with keys:\n"
            "  \"highlights\": [<key bullet points>],\n"
            "  \"recommendations\": [<staff guidance steps>]\n\n"
            "Strict JSON only."
        )
        llm_out = call_gemini(prompt)
        logger.debug(f"[LLM_RAW] {llm_out}")
        # Extract JSON body out
        parsed = extract_json(llm_out)
        if not parsed:
            raise ValueError("LLM output not JSON")
        # Send to hospital staff API for decision-making stage
        body = {
            "user_id": uid,
            "profile": summary,
            "emergency_text": voice,
            "highlights": parsed.get("highlights", []),
            "recommendations": parsed.get("recommendations", []),
        }
        resp = requests.post(os.getenv("HOSPITAL_API"), json=body)
        logger.info(f"[HOSPITAL] {resp.status_code} {resp.text}")
        # If success
        return {"status":"success", **parsed}
    # Catch HTTP handshake staging
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"[EMERGENCY_ERROR] {e}")
        return JSONResponse(status_code=500, content={"status":"error","detail":"Processing failure"})

# ──────────────────────────────────────────────────────────────────────────────
# 3) Voice Transcription Endpoint (Accept wav and mp3 based format)
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/voice-transcribe")
async def voice_transcribe(file: UploadFile = File(...)):
    if file.content_type not in {"audio/wav","audio/mpeg"}:
        raise HTTPException(415,"Unsupported audio")
    # write to temp
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    tmp.write(await file.read()); tmp.close()
    # transcribe
    result = asr_pipe(tmp.name, batch_size=8)
    os.remove(tmp.name)
    text = result.get("text","").strip()
    if not text:
        raise HTTPException(400,"No speech detected")
    return {"status":"success","transcription":text}

# ──────────────────────────────────────────────────────────────────────────────
# 4) Auth & Profile RAG Endpoints
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/register")
async def register(data: Dict):
    u,p = data.get("username"), data.get("password")
    if not u or not p:
        raise HTTPException(400,"username & password required")
    if users.find_one({"username":u}):
        return {"status":"error","detail":"exists"}
    uid = os.urandom(6).hex()
    users.insert_one({"username":u,"password":p,"user_id":uid,"profile":{}})
    logger.info(f"[AUTH] Registered {u}→{uid}")
    return {"status":"success","user_id":uid}

@app.post("/login")
async def login(data: Dict):
    u,p = data.get("username"), data.get("password")
    user=users.find_one({"username":u,"password":p})
    if not user:
        raise HTTPException(401,"Invalid credentials")
    return {"status":"success","user_id":user["user_id"]}

# Re-embed new data upon request
@app.post("/profile")
async def update_profile(data: Dict):
    # forward to RAG space
    r = requests.post(
        os.getenv("PROFILE_API"),
        json=data, timeout=30
    )
    logger.info(f"[PROFILE] {r.status_code}")
    return r.json()

# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=7860, log_level="debug")
