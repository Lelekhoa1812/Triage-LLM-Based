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
import base64

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
import faiss
import numpy as np
import io

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
REQUIRED = ["PROFILE_URI", "TRIAGE_URI", "GEMINI_API_KEY", "HOSPITAL_API", "HF_TOKEN"]
for var in REQUIRED:
    if not os.getenv(var):
        logger.error(f"Missing env var: {var}")
        raise RuntimeError(f"{var} not set")
PREFIX_RAG_API = "https://binkhoale1812-medical-profile.hf.space/"
PROFILE_API = os.path.join(PREFIX_RAG_API, "predict")
LOADER_API = os.path.join(PREFIX_RAG_API, "get_profile")

# ──────────────────────────────────────────────────────────────────────────────
# Set local Hugging Face cache directories (safe for Docker/non-root)
# ──────────────────────────────────────────────────────────────────────────────
os.environ['HF_HOME'] = '/app/.cache/huggingface'  # TRANSFORMERS_CACHE is depreciated
os.environ['SENTENCE_TRANSFORMERS_HOME'] = '/app/.cache/huggingface/sentence-transformers'
FAISS_DIR = './.cache/faiss_indexes'
os.makedirs(FAISS_DIR, exist_ok=True)

# ──────────────────────────────────────────────────────────────────────────────
# MongoDB Setup (Medical Profile and Triage Resp Guideline)
# ──────────────────────────────────────────────────────────────────────────────
# Medical Profile 
mongo_uri = os.getenv("PROFILE_URI")
client    = MongoClient(mongo_uri)
db        = client["user"]
user_collection     = db["Personal_Info"]

# Triage QA for Decision-making
triage_uri = os.getenv("TRIAGE_URI")
triage_client    = MongoClient(triage_uri)
triage_db        = triage_client["TriageQA"]
qa               = triage_db["faiss_index"]

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
    device = 0 if torch.cuda.is_available() else -1
    # Set language to English and avoid deprecated `inputs` use
    asr_pipe = pipeline(
        "automatic-speech-recognition",
        model="openai/whisper-large-v3",
        chunk_length_s=30,
        device=device,
        generate_kwargs={"language": "en"}  # Force English transcription
    )
    logger.info("[MODEL] Whisper-v3 loaded")
    # Gemini client
    llm_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    logger.info("[MODEL] Gemini client ready")


# Embedding model
from sentence_transformers import SentenceTransformer
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
# Convert dob in string to datetime
from datetime import datetime, date
def calculate_age(dob_str):
    try:
        birth_date = datetime.strptime(dob_str, "%Y-%m-%d").date()
        today = date.today()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    except Exception as e:
        logger.warning(f"[DOB_PARSE] Invalid dob format: {dob_str}")
        return "Unknown"
# Global FAISS memory cache
from bson import ObjectId
import gridfs
import zlib
import tempfile
fs = gridfs.GridFS(triage_db)
_faiss_index = None
_qa_map = None
# Retrieving approx 230k vector entries embedded in MongoDB (due to 512MB limitation on free-tier)
def rag_context(user_summary: dict, voice_text: str) -> str:
    global _faiss_index, _qa_map
    # Check if FAISS index and QA map is loaded or reload from MongoDB client
    if _faiss_index is None or _qa_map is None:
        logger.info("[RAG] Attempting to load FAISS index from MongoDB...")
        data = qa.find_one({"name": "pubmed_index"})
        if not data: # FAISS index not available
            logger.warning("[RAG] ❌ No FAISS index metadata found.")
            return "No context available."
        # Decode FAISS vector with base64
        try:
            ## Load FAISS index from GridFS
            faiss_id = data.get("faiss_gridfs_id")
            if not faiss_id:
                raise ValueError("Missing faiss_gridfs_id in metadata")
            faiss_blob = fs.get(ObjectId(faiss_id)).read()
            # Save as temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".faiss") as tmp:
                tmp.write(faiss_blob)
                tmp.flush()
                _faiss_index = faiss.read_index(tmp.name)
            ## Load QA map from GridFS
            qa_id = data.get("qa_map_gridfs_id")
            if not qa_id:
                raise ValueError("Missing qa_map_gridfs_id in metadata")
            qa_blob = fs.get(ObjectId(qa_id)).read()
            qa_json = zlib.decompress(qa_blob).decode("utf-8")
            _qa_map = json.loads(qa_json)
            logger.info(f"[RAG] ✅ FAISS index and QA map loaded: {len(_qa_map)} QAs")
        except Exception as e:
            logger.warning(f"[RAG] ❌ Failed to load FAISS index: {e}")
            return "Failed to load context."
    # Build context text (summarized profile + voice)
    context_input = {
        "dob": user_summary.get("Date of Birth"),
        "allergies": user_summary.get("Allergies"),
        "medical_history": user_summary.get("History"),
        "medications": user_summary.get("Meds"),
        "disability": user_summary.get("Disability"),
        "emergency_description": voice_text
    } 
    try:
        # Encode using the same sentence transformer as indexing time (all-MiniLM-L6-v2))
        query_text = json.dumps(context_input)
        query_vec = embed_model.encode([query_text])
        # Search in FAISS
        D, I = _faiss_index.search(np.array(query_vec), k=3)
        context_snippets = []
        # Prepare QA search mapping
        for idx in I[0]:
            try:
                q = _qa_map[idx].get("question", "N/A")
                a = _qa_map[idx].get("answer", "N/A")
                context_snippets.append(f"Q: {q}\nA: {a}")
            except Exception as e:
                logger.warning(f"[RAG] Index error: {e}")
                continue
        return "\n\n".join(context_snippets) if context_snippets else "No relevant context found."
    except Exception as e:
        logger.warning(f"[RAG] ❌ FAISS search error: {e}")
        return "Context retrieval failed."

# Break down JSON body to classes (e.g., highlights, suggestions etc)
import re
def extract_json(text: str):
    try:
        # Remove triple backticks and language hints
        clean = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip("` \n")
        # Find the first {...} block (simple JSON pattern match)
        match = re.search(r"\{[\s\S]*\}", clean)
        if match:
            json_text = match.group(0)
            return json.loads(json_text)
        else:
            logger.warning("[JSON_PARSE] No JSON object found.")
            return None
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected JSON error: {e}")
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
    logger.info(f"[LLM] Output content: {text}")
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
        user  = user_collection.find_one({"user_id": uid})
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
            "Age": calculate_age(profile.get("dob", "")), 
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
        context = rag_context(summary, voice)
        prompt = (
            "You are an AI assistant supporting medical staff. "
            "Summarize the patient's critical info and suggest best-practice actions "
            "for triage practitioner with full context-awareness (do not decide autonomously).\n\n"
            f"PATIENT INFO:\n{summary}\n\n"
            f"RESPONSE GUIDELINE:\n{context}\n\n"
            f"EMERGENCY ASSERTION (patient's voice recording):\n\"{voice}\"\n\n"
            "Return a JSON object with keys:\n"
            "  \"highlights\": [<key bullet points>],\n"
            "  \"recommendations\": [<staff guidance steps>]\n\n"
            "  \"medications\": [<optional, if any medication needed, leave blank if not applicable>]\n\n"
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
            "medications": parsed.get("medications", []),
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
    logger.info(f"[WHISPER] Transcribed text: {text}")
    if not text:
        raise HTTPException(400,"No speech detected")
    return {"status":"success","transcription":text}

# ──────────────────────────────────────────────────────────────────────────────
# 4) Auth & Profile Endpoints
# ──────────────────────────────────────────────────────────────────────────────
# Register User
@app.post("/register")
async def register_user(data: dict):
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")
    # Find matching credential
    if user_collection.find_one({"username": username}):
        return {"status": "error", "message": "Username already exists."}
    # New user get new id
    user_id = data.get("user_id") or os.urandom(6).hex() # user_id consist of 6 random hex
    user_collection.insert_one({"username": username, "password": password, "user_id": user_id})
    logger.info(f"Registration with account {username} id: {user_id}")
    return {"status": "success", "message": "User registered.", "user_id": user_id}

# Login
@app.post("/login")
async def login_user(data: dict):
    identifier = data.get("username")  # could be username or email 
    password = data.get("password")
    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Username/Email and Password Required")
    # Match on either username or email from document
    user = user_collection.find_one({
        "$or": [{"username": identifier}, {"email": identifier}],
        "password": password
    })    
    if not user:
        return JSONResponse(status_code=401, content={"status": "error", "message": "Invalid credentials."})
    return {"status": "success", "user_id": user.get("user_id")}

# Re-embed new data upon request
@app.post("/profile")
async def update_profile(data: dict):
    try:
        # Send data to RAG profile embedding service
        headers = {"Content-Type": "application/json"}
        res = requests.post(PROFILE_API, json=data, headers=headers, timeout=30)
        logger.info(f"[PROFILE] RAG API responded with {res.status_code}: {res.text}")
        return res.json()
    except Exception as e:
        logger.error(f"[PROFILE_ERROR] {e}")
        return {"status": "error", "message": f"Failed to update profile: {e}"}

# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=7860, log_level="debug")
