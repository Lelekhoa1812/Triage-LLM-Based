# Access site: https://binkhoale1812-triage-llm.hf.space/
import os
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import uvicorn

# Check permission (Authorized key)
token = os.getenv("HF_TOKEN")
print(f"[DEBUG] HF_TOKEN = {token[:5]}... ({'set' if token else 'NOT set'})")

# Enable Logging for Debugging
import logging
# Set up app-specific logger
logger = logging.getLogger("triage-response")
logger.setLevel(logging.INFO)  # Set to DEBUG only when needed
# Set log format
formatter = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s")
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
# Suppress noisy libraries like pymongo, urllib3, etc.
for noisy in ["pymongo", "urllib3", "httpx", "uvicorn", "uvicorn.error", "uvicorn.access"]:
    logging.getLogger(noisy).setLevel(logging.WARNING)

# Load environment variables
load_dotenv()

# FastAPI initialization
app = FastAPI(title="Emergency Response System")
# CORS (allow frontend in same Space and DB connection - anywhere)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
mongo_uri = os.getenv("PROFILE_URI")
client = MongoClient(mongo_uri)
db = client["user"]
user_collection = db["Personal_Info"]

# External APIs
PHARMACY_API = os.getenv("PHARMACY_API")
HOSPITAL_API = os.getenv("HOSPITAL_API")
CARETAKER_API = os.getenv("CARETAKER_API")
# RAG continuous embedding (wrapped in /predict endpoint to troubleshoot HF Space connection problem)
PREFIX_RAG_API = "https://binkhoale1812-medical-profile.hf.space/"
PROFILE_API = os.path.join(PREFIX_RAG_API, "predict")
LOADER_API = os.path.join(PREFIX_RAG_API, "get_profile")

# Validate critical env vars
required_env = ["PROFILE_URI", "GEMINI_API_KEY", "HF_TOKEN"]
for var in required_env:
    if not os.getenv(var):
        logger.error(f"Missing required environment variable: {var}")
        raise RuntimeError(f"Environment variable {var} not set.")
required_sv = ["PHARMACY_API", "HOSPITAL_API", "CARETAKER_API"]
for var in required_sv:
    if not os.getenv(var):
        logger.error(f"Missing required service variable: {var}")
        raise RuntimeError(f"Service variable {var} not set.")
    
# Monitor Resources Before Startup
import psutil
def check_system_resources():
    memory = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=1)
    disk = psutil.disk_usage("/")
    # Defines log info messages
    logger.info(f"🔍 System Resources - RAM: {memory.percent}%, CPU: {cpu}%, Disk: {disk.percent}%")
    if memory.percent > 85:
        logger.warning("⚠️ High RAM usage detected!")
    if cpu > 90:
        logger.warning("⚠️ High CPU usage detected!")
    if disk.percent > 90:
        logger.warning("⚠️ High Disk usage detected!")
check_system_resources()

# --- Serve Static Frontend ---
@app.get("/")
async def read_index():
    index_path = "statics/index.html"
    if os.path.exists(index_path):
        logger.info("[STATIC] Serving index.html")
        return FileResponse(index_path)
    else:
        logger.error("[STATIC_ERROR] index.html not found")
        return JSONResponse(status_code=404, content={"message": "index.html not found"})
# Mount app
app.mount("/statics", StaticFiles(directory="statics"), name="statics")

# --- LLM Processor (using Gemini Flash 2.0 via google-genai client) ---
from google import genai
from google.genai import types
class LLMProcessor:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-2.0-flash"

    def generate_response(self, prompt: str) -> str:
        logger.info("[LLM] Generating response...")
        if not self.api_key:
            logger.warning("[LLM_WARNING] Missing API Key. Defaulting to 'caretaker'")
            return "caretaker"
        try:
            client = genai.Client(api_key=self.api_key)
            # Generate response
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"[LLM_ERROR] Exception: {e}")
            return f"LLM Exception: {e}"
llm_processor = LLMProcessor()

# TODO: Find actual triage dataset
def rag_context(user_data: dict) -> str:
    print("[RAG] Retrieving user context from FAISS (mocked)...")
    return "Retrieved triage guidelines: [Example1, Example2, Example3]"

# Extract JSON from LLM response
import json
import re
def extract_json(text: str):
    try:
        # Clean markdown-style code block
        clean = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip("` \n")
        return json.loads(clean)
    except Exception as e:
        logger.error(f"[PARSE_ERROR] Failed to parse LLM response: {e}")
        return None
    
    
# --- Emergency Endpoint ---
@app.post("/emergency")
async def handle_emergency(data: dict):
    try:
        print("[EMERGENCY] Request received")
        user_id = data.get("user_id")
        # emergency_type = # TODO: This will be finalized on a proper triage dataset
        voice_input = data.get("voice_text")
        # Log request
        print(f"[EMERGENCY_INFO] user_id: {user_id}, voice_text: {voice_input}")
        # Attempt to find existing user_id
        user = user_collection.find_one({"user_id": user_id})
        if not user:
            logger.warning("[WARNING] User not found in database")
            return JSONResponse(status_code=404, content={"status": "error", "message": "User not found"})
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
        # User profile summary prepared in JSON
        user_summary = {
            "Name": profile.get("name"),
            "Age": profile.get("age"),
            "Sex": profile.get("sex"),
            "Blood Type": profile.get("blood_type"),
            "Allergies": profile.get("allergies"),
            "Medical History": profile.get("medical_history"),
            "Current Medication": profile.get("active_medications"),
            "Disability": profile.get("disability"),
            "Emergency Contact": contact_str,
            "Location": profile.get("home_address")
        }
        # Debug print user profile summary
        print(f"[EMERGENCY_USER] Retrieved user profile: {user_summary}")
        context = rag_context(user_summary)
        prompt = (
            f"Patient details: {user_summary}. \n"
            f"Symptoms reported by the patient: \"{voice_input}\"\n"
            # f"Additional context: {context}\n" # TODO: On next update, please use a proper triage dataset for guideline
            f"With contextual awareness, select 1 (or more) appropriate emergency response(s) from the list of triage response options. \n"
            f"Options:\n - Drone \n - Caretaker \n - Ambulance \n"
            f"If medication is needed, also list the exact medication names required for dispatch. "
            f"Respond in a short JSON format, with comma splitting selection, for instance:\n"
                f"{{ \"response\": [\"Drone\", \"Self-care\"], \"medications\": [\"Paracetamol\", \"Omeprazole\"] }}"
        )
        '''
          Routing API services accordingly to LLM decision,
          Sending action, status, user medical profile, message, and medication along in JSON req body
        '''
        llm_decision_raw = llm_processor.generate_response(prompt)
        print(f"[LLM_DECISION_RAW] {llm_decision_raw}")

        parsed = extract_json(llm_decision_raw)
        if parsed:
            response_type = parsed.get("response", "")
            meds = parsed.get("medications", [])
        else:
            response_type = llm_decision_raw  # fallback
            meds = []
        # Normalize responses (list or string)
        if isinstance(response_type, list):
            response_type = [r.lower() for r in response_type]
        else:
            response_type = response_type.lower()  # fallback     
        # Pharmacy route
        if ("self-care" in response_type) or ("drone" in response_type) or ("medication" in response_type):
            try:
                res = requests.post(PHARMACY_API, json={"action": "dispatch", "status": "dispatched", "user": user_summary, "medications": meds })
                print(f"[PHARMACY] Dispatch status: {res.status_code}, response: {res.text}")
                return {"status": "success", "message": "Medication dispatched via drone."}
            except Exception as e:
                print(f"[PHARMACY] Dispatch error: {e}")
                return {"status": "error", "message": "Failed to dispatch medication."}
        # Caretaker route
        if "caretaker" in response_type:
            try:
                res = requests.post(CARETAKER_API, json={"action": "send_caretaker", "status": "dispatched", "user": user_summary, "message": voice_input })
                print(f"[CARETAKER] Dispatch status: {res.status_code}, response: {res.text}")
                return {"status": "success", "message": "Caretaker dispatched to assist user."}
            except Exception as e:
                print(f"[CARETAKER] Dispatch error: {e}")
                return {"status": "error", "message": "Failed to dispatch caretaker."}
        # Ambulance route
        if "ambulance" in response_type:
            try:
                res = requests.post(HOSPITAL_API, json={"action": "ambulance", "status": "dispatched", "user": user_summary, "message": voice_input })
                print(f"[HOSPITAL] Dispatch status: {res.status_code}, response: {res.text}")
                return {"status": "success", "message": "Ambulance dispatched to user's location."}
            except Exception as e:
                print(f"[HOSPITAL] Dispatch error: {e}")
                return {"status": "error", "message": "Failed to dispatch ambulance."}
        # Irrelevant decision
        print("[EMERGENCY_WARNING] Invalid LLM decision or unmatched emergency type")
        return {"status": "error", "message": "Invalid emergency type or LLM decision not clear."}
    except Exception as main_error:
        print(f"[EMERGENCY_ERROR] Main exception: {main_error}")
        return {"status": "error", "message": "Error processing emergency request."}


# --- Voice-to-Text Endpoint ---
@app.post("/voice-transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    try: # TODO: Currently handling simulated text-based request on website, however mobile app already has voice built-in
        audio_data = await file.read()
        hf_api_url = "https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h"
        headers = {"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"}
        # Obtain response
        logger.info("[VOICE] Sending audio to Hugging Face API...")
        response = requests.post(hf_api_url, headers=headers, data=audio_data)
        logger.info(f"[VOICE] Status code: {response.status_code}, body: {response.text}")
        print(f"[VOICE] Status code: {response.status_code}, body: {response.text}")
        # Error 200
        if response.status_code == 200:
            transcription = response.json().get("text", "")
            return {"status": "success", "transcription": transcription}
        return {"status": "error", "message": "Transcription failed"}
    except Exception as e:
        logger.error(f"[VOICE_ERROR] Transcription error: {e}")
        return {"status": "error", "message": f"Exception: {e}"}


# --- User Auth & Profile Integration Endpoints ---
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
    username = data.get("username")
    password = data.get("password")
    user = user_collection.find_one({"username": username, "password": password})
    if not user:
        return JSONResponse(status_code=401, content={"status": "error", "message": "Invalid credentials."})
    return {"status": "success", "user_id": user.get("user_id")}

# Profile API - update via RAG
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860, log_level="debug")
