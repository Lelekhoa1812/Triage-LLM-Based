# python3 debug/post_profile.py
import requests
import json
from datetime import datetime

# URL of your FastAPI endpoint
PROFILE_API = "https://binkhoale1812-triage-llm.hf.space/profile"

# Auth
auth = {
    "username": "Khoa",
    "password": "122003",
    "user_id": "bda550aa4e88"
}

# Sample profile payload
profile_data = {
    "username": auth["username"],
    "password": auth["password"],
    "user_id": auth["user_id"],
    "name": "Dang Khoa Le",
    "dob": "2003-12-22",
    "sex": "Male",
    "phone_number": "0400123456",
    "email_address": "khoa@example.com",
    "blood_type": "O+",
    "allergies": ["Penicillin", "Peanuts"],
    "medical_history": ["Asthma", "Fractured wrist"],
    "active_medications": ["Ventolin"],
    "disability": "None",
    "insurance_card": "123456789",
    "home_address": "123 Swanston St, Melbourne VIC",
    "emergency_contact": {
        "name": "Jane Le",
        "phone": "0400765432"
    },
    "last_updated": datetime.now().isoformat()
}

# Send POST request
try:
    res = requests.post(
        PROFILE_API,
        headers={"Content-Type": "application/json"},
        data=json.dumps(profile_data)
    )
    res.raise_for_status()
    response_json = res.json()
    print("✅ Server response:")
    print(json.dumps(response_json, indent=2))
except requests.exceptions.RequestException as e:
    print("❌ Request failed:", e)
