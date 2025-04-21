from pydantic import BaseModel
from typing import List, Optional, Dict, Union

# --- Pydantic Schema for Incoming Data ---
class UserData(BaseModel):
    username: str
    password: str
    user_id: str
    name: str
    age: int
    sex: str
    blood_type: str
    allergies: List[str]
    medical_history: List[str]
    active_medications: List[str]
    disability: str
    home_address: str
    emergency_contact: Dict[str, str]
    embedded_profile: Optional[str] = None
    last_updated: Optional[str] = None


