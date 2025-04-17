import os
import requests
from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pymongo import MongoClient
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="Emergency Response System")

# MongoDB connection
mongo_uri = os.getenv("PROFILE_URI")
client = MongoClient(mongo_uri)
db = client["MedicalChatbotDB"]
user_collection = db["Personal_Info"]

# External APIs
PHARMACY_API = os.getenv("PHARMACY_API")
HOSPITAL_API = os.getenv("HOSPITAL_API")
CARETAKER_API = os.getenv("CARETAKER_API")


# --- LLM Processor ---
class LLMProcessor:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.base_url = "https://gemini-api.example.com/v1/generate"

    def generate_response(self, prompt: str) -> str:
        print("[LLM] Generating response...")
        if not self.api_key:
            print("[LLM] Missing API Key. Defaulting to 'caretaker'")
            return "caretaker"

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {"prompt": prompt, "max_tokens": 100}
            response = requests.post(self.base_url, headers=headers, json=payload)
            print(f"[LLM] Status Code: {response.status_code}")
            print(f"[LLM] Raw Response: {response.text}")
            if response.status_code == 200:
                return response.json().get("response", "No response")
            return f"LLM Error: {response.status_code} - {response.text}"
        except Exception as e:
            print(f"[LLM] Exception: {e}")
            return f"LLM Exception: {e}"


llm_processor = LLMProcessor()

def rag_context(user_data: dict) -> str:
    print("[RAG] Retrieving user context from FAISS (mocked)...")
    return "Retrieved triage guidelines: [Example1, Example2, Example3]"


# --- Emergency Endpoint ---
@app.post("/emergency")
async def handle_emergency(data: dict):
    try:
        print("[EMERGENCY] Request received")
        user_id = data.get("user_id")
        emergency_type = data.get("emergency_type")
        voice_input = data.get("voice_text")

        print(f"[EMERGENCY] user_id: {user_id}, emergency_type: {emergency_type}, voice_text: {voice_input}")

        user = user_collection.find_one({"user_id": user_id})
        if not user:
            print("[EMERGENCY] User not found in database")
            return JSONResponse(status_code=404, content={"status": "error", "message": "User not found"})

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

        print(f"[EMERGENCY] Retrieved user profile: {user_summary}")

        context = rag_context(user_summary)
        prompt = (
            f"Patient details: {user_summary}. \n"
            f"Additional context: {context}\n"
            f"Emergency type: {emergency_type}. \n"
            f"Based on the above, determine the best emergency response "
            f"(options: 'self-care' [drone medication], 'caretaker', 'ambulance')."
        )

        llm_decision = llm_processor.generate_response(prompt)
        print(f"[LLM Decision] {llm_decision}")

        # Route accordingly
        if emergency_type == "self-care" or "drone" in llm_decision.lower():
            try:
                res = requests.post(PHARMACY_API, json={"action": "dispatch", "status": "dispatched", "user": user_summary})
                print(f"[PHARMACY] Dispatch status: {res.status_code}, response: {res.text}")
                return {"status": "success", "message": "Medication dispatched via drone."}
            except Exception as e:
                print(f"[PHARMACY] Dispatch error: {e}")
                return {"status": "error", "message": "Failed to dispatch medication."}

        elif emergency_type == "caretaker" or "caretaker" in llm_decision.lower():
            try:
                res = requests.post(CARETAKER_API, json={"action": "send_caretaker", "status": "dispatched", "user": user_summary})
                print(f"[CARETAKER] Dispatch status: {res.status_code}, response: {res.text}")
                return {"status": "success", "message": "Caretaker dispatched to assist user."}
            except Exception as e:
                print(f"[CARETAKER] Dispatch error: {e}")
                return {"status": "error", "message": "Failed to dispatch caretaker."}

        elif emergency_type == "ambulance" or "ambulance" in llm_decision.lower():
            try:
                res = requests.post(HOSPITAL_API, json={"action": "ambulance", "status": "dispatched", "user": user_summary})
                print(f"[HOSPITAL] Dispatch status: {res.status_code}, response: {res.text}")
                return {"status": "success", "message": "Ambulance dispatched to user's location."}
            except Exception as e:
                print(f"[HOSPITAL] Dispatch error: {e}")
                return {"status": "error", "message": "Failed to dispatch ambulance."}

        print("[EMERGENCY] Invalid LLM decision or unmatched emergency type")
        return {"status": "error", "message": "Invalid emergency type or LLM decision not clear."}

    except Exception as main_error:
        print(f"[EMERGENCY] Main exception: {main_error}")
        return {"status": "error", "message": "Error processing emergency request."}


# --- Voice-to-Text Endpoint ---
@app.post("/voice-transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    try:
        audio_data = await file.read()
        hf_api_url = "https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h"
        headers = {"Authorization": f"Bearer {os.getenv('HF_API_KEY')}"}

        print("[VOICE] Sending audio to Hugging Face API...")
        response = requests.post(hf_api_url, headers=headers, data=audio_data)
        print(f"[VOICE] Status code: {response.status_code}, body: {response.text}")

        if response.status_code == 200:
            transcription = response.json().get("text", "")
            return {"status": "success", "transcription": transcription}

        return {"status": "error", "message": "Transcription failed"}
    except Exception as e:
        print(f"[VOICE] Transcription error: {e}")
        return {"status": "error", "message": f"Exception: {e}"}


# --- Serve Frontend ---
@app.get("/")
async def read_index():
    index_path = "statics/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse(status_code=404, content={"message": "index.html not found"})

app.mount("/statics", StaticFiles(directory="statics"), name="statics")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860, log_level="debug")
