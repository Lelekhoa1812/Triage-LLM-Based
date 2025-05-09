from pydantic import BaseModel
from typing import List, Optional, Dict, Union

# --- Pydantic Schema for Incoming Data ---
class UserData(BaseModel):
    username: str
    password: str
    user_id: str
    name: str
    dob: str
    sex: str
    phone_number: str
    email_address: str
    blood_type: str
    allergies: List[str]
    medical_history: List[str]
    active_medications: List[str]
    disability: str
    insurance_card: str
    home_address: str
    emergency_contact: Dict[str, str]
    last_updated: Optional[str] = None


