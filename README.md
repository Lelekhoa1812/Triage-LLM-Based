Remote Vers:

Main branch
```bash
git remote add origin https://github.com/Lelekhoa1812/Triage-LLM-Based.git
git push origin main
```

Backend branch
```bash
git remote add hf https://huggingface.co/spaces/BinKhoaLe1812/Triage_LLM
git push hf main
```

Frontend branch
```bash
git remote add fe https://github.com/Lelekhoa1812/Triage-LLM-Based.git
git push fe master
```

Embedding branch
```bash
git remote add eb https://huggingface.co/spaces/BinKhoaLe1812/Medical_Profile
git push eb main
```

CURL request to Service Portal
```
curl -X POST https://dispatch-portal-amber.vercel.app/api/index \
  -H "Content-Type: application/json" \
  -d '{
    "action": "emergency",
    "status": "received",
    "profile": {
      "Name": "John Doe",
      "Age": 45,
      "Blood Type": "O+",
      "Allergies": "Peanuts",
      "History": "Hypertension",
      "Meds": "Lisinopril",
      "Disability": "None",
      "Emergency Contact": "Jane Doe - 0400 123 456",
      "Location": "123 Main St"
    },
    "highlights": ["Breathing difficulty", "Chest pain"],
    "recommendations": ["Dispatch drone", "Apply oxygen mask"],
    "medications": ["Aspirin"]
  }'
```