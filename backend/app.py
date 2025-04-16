import os
import requests
import uvicorn
from fastapi import FastAPI, File, UploadFile, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="Emergency Response System")

# MongoDB Connection for Patient Profile data (using PROFILE_URI from .env)
mongo_uri = os.getenv("PROFILE_URI")
client = MongoClient(mongo_uri)
db = client["MedicalChatbotDB"]  # updated database name for clarity
user_collection = db["Personal_Info"]

# Medical service partnerships endpoints from .env
PHARMACY_API = os.getenv("PHARMACY_API")
HOSPITAL_API = os.getenv("HOSPITAL_API")
CARETAKER_API = os.getenv("CARETAKER_API")

# --- LLM Helper Class ---
class LLMProcessor:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        # Base URL of the Gemini API endpoint (example placeholder)
        self.base_url = "https://gemini-api.example.com/v1/generate"

    def generate_response(self, prompt: str) -> str:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {"prompt": prompt, "max_tokens": 100}
        response = requests.post(self.base_url, headers=headers, json=payload)
        if response.status_code == 200:
            return response.json().get("response", "No response")
        else:
            return "LLM Error: Could not generate response."

# Instantiate the LLM processor
llm_processor = LLMProcessor()

# --- RAG Pipeline Placeholder ---
def rag_context(user_data: dict) -> str:
    """
    This function should retrieve relevant triage guidelines from a FAISS index.
    For instance, using a pre-embedded triage dataset (e.g., Emergency Department Triage from Kaggle),
    perform a similarity search based on the user's symptoms and context.
    
    For now, we return a static guidance string.
    """
    # In practice, integrate your FAISS index retrieval here.
    retrieved_context = "Retrieved triage guidelines: [Record1, Record2, Record3]."
    return retrieved_context

# --- Emergency Request Handler ---
@app.post("/emergency")
async def handle_emergency(data: dict):
    user_id = data.get("user_id")
    emergency_type = data.get("emergency_type")
    voice_input = data.get("voice_text")  # if voice-to-text is used

    # Retrieve user data from MongoDB
    user = user_collection.find_one({"user_id": user_id})
    if not user:
        return {"status": "error", "message": "User medical data not found."}

    user_summary = {
        "Name": user.get("name"),
        "Age": user.get("age"),
        "Sex": user.get("sex"),
        "Blood Type": user.get("blood_type"),
        "Allergies": user.get("allergies"),
        "Medical History": user.get("medical_history"),
        "Current Medication": user.get("active_medications"),
        "Disability": user.get("disability"),
        "Emergency Contact": user.get("emergency_contact"),
        "Location": user.get("home_address")
    }

    # Incorporate additional context from the RAG pipeline
    additional_context = rag_context(user_summary)

    # Build a prompt for the LLM
    prompt = (
        f"Patient details: {user_summary}. \n"
        f"Additional context: {additional_context}\n"
        f"Emergency type: {emergency_type}. \n"
        f"Based on the above, determine the best emergency response "
        f"(options: 'self-care' [drone medication], 'caretaker', 'ambulance')."
    )

    # Use LLM to get decision (you may optionally override if emergency_type is explicitly passed)
    llm_decision = llm_processor.generate_response(prompt)
    print(f"LLM decision: {llm_decision}")  # log for debugging

    # Based on the decision, call the corresponding API
    if emergency_type == "self-care" or "drone" in llm_decision.lower():
        # Dispatch Drone for Medication
        response = requests.post(PHARMACY_API, 
                                json={
                                "action": "dispatch",
                                "status": "dispatched",
                                "user": user_summary})
        return {"status": "success", "message": "Medication dispatched via drone."}
    elif emergency_type == "caretaker" or "caretaker" in llm_decision.lower():
        # Send caretaker assistance
        response = requests.post(CARETAKER_API,                                  
                                json={
                                "action": "send_caretaker",
                                "status": "dispatched",
                                
                                "user": user_summary})
        return {"status": "success", "message": "Caretaker dispatched to assist user."}
    elif emergency_type == "ambulance" or "ambulance" in llm_decision.lower():
        # Dispatch ambulance
        response = requests.post(HOSPITAL_API, 
                                json={
                                "action": "ambulance",
                                "status": "dispatched",
                                "user": user_summary})
        return {"status": "success", "message": "Ambulance dispatched to user's location."}

    return {"status": "error", "message": "Invalid emergency type or LLM decision not clear."}


# --- Voice-to-Text Endpoint (for emergency requests) ---
@app.post("/voice-transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    """
    This endpoint accepts an audio file, sends it to a Hugging Face inference
    API for a Wav2Vec2 model, and returns the transcribed text.
    """
    audio_data = await file.read()
    # For demonstration, we call a hypothetical HF API (you need to implement authentication and handling)
    hf_api_url = "https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h"
    headers = {"Authorization": f"Bearer {os.getenv('HF_API_KEY')}"}
    response = requests.post(hf_api_url, headers=headers, data=audio_data)
    if response.status_code == 200:
        transcription = response.json().get("text", "")
        return {"status": "success", "transcription": transcription}
    return {"status": "error", "message": "Transcription failed."}


# Serve the index page from the statics directory
@app.get("/app")
async def read_index():
    return FileResponse("statics/index.html")


# Mount the statics/ directory to serve CSS and JS files
app.mount("/statics", StaticFiles(directory="statics"), name="statics")


# Run Uvicorn if executed directly
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7870, log_level="debug")
