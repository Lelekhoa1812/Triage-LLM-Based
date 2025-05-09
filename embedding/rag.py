import os
import uuid
import faiss
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException, APIRouter, Body
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from typing import Union
from model import UserData
from dotenv import load_dotenv

# ──────────────────────────────────────────────────────────────────────────────
# Logging Setup (Debugs)
# ──────────────────────────────────────────────────────────────────────────────
import logging
logger = logging.getLogger("profile-response")
logger.setLevel(logging.INFO)
fmt = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s")
handler = logging.StreamHandler()
handler.setFormatter(fmt)
logger.addHandler(handler)
# suppress noisy libs
for lib in ("pymongo", "urllib3", "httpx", "uvicorn",):
    logging.getLogger(lib).setLevel(logging.WARNING)


# Load environment variables
load_dotenv()

# --- FastAPI App ---
app = FastAPI(title="User Data Embedding & Update Service")
# Allow CORS bypass
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# Set Hugging Face cache directory to writable location
os.environ['TRANSFORMERS_CACHE'] = './.cache'
os.environ['HF_HOME'] = './.cache'
FAISS_DIR = "./.cache/faiss_indexes"
os.makedirs(FAISS_DIR, exist_ok=True)

# --- MongoDB Setup ---
mongo_uri = os.getenv("PROFILE_URI")
if not mongo_uri:
    raise RuntimeError("MongoDB Profile URI must be set in environment")
client = MongoClient(mongo_uri)
db = client["user"]
user_collection = db["Personal_Info"]

# --- Embedding Model ---
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# --- Helpers ---
def get_or_create_user(doc: UserData) -> str:
    """
    Authenticate by username/email and password. If user exists, ensure user_id matches.
    Otherwise, create a new user entry with a generated user_id.
    Returns the faiss_file name.
    """
    existing = user_collection.find_one({
        "$or": [
          {"username": doc.username},
          {"email_address": doc.username}
        ],        
        "password": doc.password
    })
    logger.info(f"[DEBUG] Found existing user: {existing}") # Comment in for simplicity
    # Fetch FAISS file for existing user or create new
    if existing:
        if "faiss_file" in existing:
            return os.path.join(FAISS_DIR, existing["faiss_file"])
        # existing user_id without faiss_file
        else:
            # Auto-fix: generate and add a faiss_file
            user_id = existing.get("user_id") or doc.user_id or str(uuid.uuid4())
            faiss_file_name = f"{user_id}_index.faiss"
            user_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"faiss_file": faiss_file_name}}
            )
            logger.warning(f"⚠️ Added missing faiss_file for existing user: {doc.username}")
            return os.path.join(FAISS_DIR, faiss_file_name)
    # New user: assign user_id if not provided
    user_id = doc.user_id or str(uuid.uuid4())
    faiss_file_name = f"{user_id}_index.faiss"
    faiss_file_path = os.path.join(FAISS_DIR, faiss_file_name)

    user_collection.insert_one({
        "username": doc.username,
        "password": doc.password,
        "user_id": user_id,
        "faiss_file": faiss_file_name,
        # store initial profile snapshot
        "profile": {
            "name": doc.name,
            "dob": doc.dob,
            "sex": doc.sex,
            "phone_number": doc.phone_number,
            "email_address": doc.email_address,
            "blood_type": doc.blood_type,
            "allergies": doc.allergies,
            "medical_history": doc.medical_history,
            "active_medications": doc.active_medications,
            "disability": doc.disability,
            "insurance_card": doc.insurance_card,
            "home_address": doc.home_address,
            "emergency_contact": doc.emergency_contact,
            "last_updated": doc.last_updated
        }
    })
    logger.info(f"✅ Created new user: {doc.username} ({user_id})")
    return faiss_file_path

# --- API Endpoint ---
@app.post("/update_user_data")
async def update_user_data(data: UserData):
    # 1) Authenticate / get faiss file
    faiss_file = get_or_create_user(data)

    # 2) Build the concatenated medical info string
    medical_info = (
        f"Name: {data.name}\n"
        f"Date of Birth: {data.dob}\n"
        f"Sex: {data.sex}\n"
        f"Phone Number: {data.phone_number}\n"
        f"Email Address: {data.email_address}\n"
        f"Blood Type: {data.blood_type}\n"
        f"Allergies: {', '.join(data.allergies)}\n"
        f"Medical History: {data.medical_history}\n"
        f"Active Medications: {', '.join(data.active_medications)}\n"
        f"Disability: {data.disability}\n"
        f"Insurance Card: {data.insurance_card}\n"
        f"Home Address: {data.home_address}\n"
        f"Emergency Contact: {data.emergency_contact}\n"
        f"Last Updated: {data.last_updated}\n"
    )

    # 3) Compute embedding
    embedding = embedding_model.encode([medical_info], convert_to_numpy=True)

    # 4) Load or create FAISS index
    if os.path.exists(faiss_file):
        index = faiss.read_index(faiss_file)
    else:
        index = faiss.IndexFlatL2(embedding.shape[1])

    # 5) Add new vector
    index.add(embedding)
    os.makedirs(os.path.dirname(faiss_file), exist_ok=True) # Ensure exist path upon refresh
    faiss.write_index(index, faiss_file)
    logger.info(f"✅ Updated FAISS index for {data.username} → {faiss_file}")

    # 6) Update MongoDB snapshot
    user_collection.update_one(
        {"username": data.username},
        {"$set": {
            "faiss_file": faiss_file,
            "profile": {
                "name": data.name,
                "dob": data.dob,
                "sex": data.sex,
                "phone_number": data.phone_number,
                "email_address": data.email_address,
                "blood_type": data.blood_type,
                "allergies": data.allergies,
                "medical_history": data.medical_history,
                "active_medications": data.active_medications,
                "disability": data.disability,
                "insurance_card": data.insurance_card,
                "home_address": data.home_address,
                "emergency_contact": data.emergency_contact,
                "last_updated": data.last_updated
            }
        }}
    )
    logger.info(f"✅ MongoDB profile snapshot updated for {data.username}")
    return {"status": "success", "message": f"User {data.username} data embedded."}


'''
Expose RAG as a specific POST /predict endpoint
This is since Hugging Face does not expose raw FastAPI endpoints (/update_user_data) to external callers in other Spaces unless:
=> Wrap the endpoint in an api/predict 
'''
@app.post("/predict")
async def predict_route(data: UserData):
    logger.info("[DEBUG] Received /predict payload:", data.dict())
    return await update_user_data(data)

# Upon Frontend startup, RAG server is expected to automatically fetch and send profile data of existing user
@app.post("/get_profile")
async def get_user_profile(credentials: dict = Body(...)):
    username = credentials.get("username")
    password = credentials.get("password")
    # Find matched credential
    user = user_collection.find_one({
       "password": password,
       "$or": [
         {"username": username},
         {"email_address": username}
       ]
    })    
    logger.info("[UPDATE] pointing to account at", user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found or incorrect credentials")
    # Append corresponding profile
    profile = user.get("profile", {})
    return {"status": "success", "profile": profile}

# --- Launch ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860, log_level="info")
