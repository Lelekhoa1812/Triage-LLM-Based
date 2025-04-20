from pydantic import BaseModel

class UserData(BaseModel):
    user_id: str
    name: str
    age: int
    medical_history: list[str]
