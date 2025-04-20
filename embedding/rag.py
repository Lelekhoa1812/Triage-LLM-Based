import os
import uuid
import faiss
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

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

# --- MongoDB Setup ---
mongo_uri = os.getenv("PROFILE_URI")
if not mongo_uri:
    raise RuntimeError("MongoDB Profile URI must be set in environment")
client = MongoClient(mongo_uri)
db = client["user"]
user_collection = db["Personal_Info"]

# --- Embedding Model ---
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# --- Pydantic Schema for Incoming Data ---
class UserData(BaseModel):
    username: str
    password: str
    user_id: str = None               # optional if new user; will be generated
    name: str
    age: int
    sex: str
    blood_type: str
    allergies: list[str]
    medical_history: str
    active_medications: list[str]
    disability: str
    home_address: str
    emergency_contact: dict
    embedded_profile: str | None = None
    last_updated: str | None = None

# --- Helpers ---
def get_or_create_user(doc: UserData) -> str:
    """
    Authenticate by username/password. If user exists, ensure user_id matches.
    Otherwise, create a new user entry with a generated user_id.
    Returns the faiss_file name.
    """
    existing = user_collection.find_one({
        "username": doc.username,
        "password": doc.password
    })

    if existing:
        # existing user – return their faiss file
        return existing["faiss_file"]

    # new user: assign user_id if not provided
    user_id = doc.user_id or str(uuid.uuid4())
    faiss_file = f"{user_id}_index.faiss"

    user_collection.insert_one({
        "username": doc.username,
        "password": doc.password,
        "user_id": user_id,
        "faiss_file": faiss_file,
        # store initial profile snapshot
        "profile": {
            "name": doc.name,
            "age": doc.age,
            "sex": doc.sex,
            "blood_type": doc.blood_type,
            "allergies": doc.allergies,
            "medical_history": doc.medical_history,
            "active_medications": doc.active_medications,
            "disability": doc.disability,
            "home_address": doc.home_address,
            "emergency_contact": doc.emergency_contact,
            "embedded_profile": doc.embedded_profile,
            "last_updated": doc.last_updated
        }
    })
    print(f"✅ Created new user: {doc.username} ({user_id})")
    return faiss_file

# --- API Endpoint ---
@app.post("/update_user_data")
async def update_user_data(data: UserData):
    # 1) Authenticate / get faiss file
    faiss_file = get_or_create_user(data)

    # 2) Build the concatenated medical info string
    medical_info = (
        f"Name: {data.name}\n"
        f"Age: {data.age}\n"
        f"Sex: {data.sex}\n"
        f"Blood Type: {data.blood_type}\n"
        f"Allergies: {', '.join(data.allergies)}\n"
        f"Medical History: {data.medical_history}\n"
        f"Active Medications: {', '.join(data.active_medications)}\n"
        f"Disability: {data.disability}\n"
        f"Home Address: {data.home_address}\n"
        f"Emergency Contact: {data.emergency_contact}\n"
        f"Embedded Profile (if any): {data.embedded_profile}\n"
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
    faiss.write_index(index, faiss_file)
    print(f"✅ Updated FAISS index for {data.username} → {faiss_file}")

    # 6) Update MongoDB snapshot
    user_collection.update_one(
        {"username": data.username},
        {"$set": {
            "faiss_file": faiss_file,
            "profile": {
                "name": data.name,
                "age": data.age,
                "sex": data.sex,
                "blood_type": data.blood_type,
                "allergies": data.allergies,
                "medical_history": data.medical_history,
                "active_medications": data.active_medications,
                "disability": data.disability,
                "home_address": data.home_address,
                "emergency_contact": data.emergency_contact,
                "embedded_profile": data.embedded_profile,
                "last_updated": data.last_updated
            }
        }}
    )
    print(f"✅ MongoDB profile snapshot updated for {data.username}")

    return {"status": "success", "message": f"User {data.username} data embedded."}


'''
=> Expose RAG as a specific POST /predict endpoint
This is since Hugging Face does not expose raw FastAPI endpoints (/update_user_data) to external callers in other Spaces unless:
- Serve app as an inference Space 
- Wrap the endpoint in an api/predict 
- Wrap the app in Gradio interface
'''
from fastapi import APIRouter
from model import UserData
@app.post("/predict")
async def predict_route(data: UserData):
    return await update_user_data(data)
# @app.post("/predict")
# async def predict_route(payload: dict):
#     data = UserData(**payload)
#     return await update_user_data(data)

# --- Launch ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860, log_level="info")
