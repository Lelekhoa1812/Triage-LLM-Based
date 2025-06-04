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

# Portal
**PROMPT 1**:
```bash
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

**PROMPT 2**:
```bash
curl -X POST https://dispatch-portal-amber.vercel.app/api/index \
  -H "Content-Type: application/json" \
  -d '{
    "action": "medication_request",
    "status": "received",
    "profile": {
      "Name": "Alice Smith",
      "Age": 29,
      "Blood Type": "A+",
      "Allergies": "Dust, Pollen",
      "History": "Mild seasonal allergies",
      "Meds": "Loratadine",
      "Disability": "None",
      "Emergency Contact": "Tom Smith - 0401 555 789",
      "Location": "456 Garden Ave"
    },
    "highlights": ["Mild allergy flare-up", "Requesting antihistamines"],
    "recommendations": ["Dispatch drone with antihistamines"],
    "medications": ["Loratadine"]
  }'
```

**PROMPT 3**:
```bash
curl -X POST https://dispatch-portal-amber.vercel.app/api/index \
  -H "Content-Type: application/json" \
  -d '{
    "action": "medication_refill",
    "status": "received",
    "profile": {
      "Name": "Mark Johnson",
      "Age": 58,
      "Blood Type": "B+",
      "Allergies": "None",
      "History": "Chronic hypertension",
      "Meds": "Amlodipine",
      "Disability": "None",
      "Emergency Contact": "Linda Johnson - 0432 987 654",
      "Location": "789 Elm Rd"
    },
    "highlights": ["Patient out of blood pressure medication"],
    "recommendations": ["Drone delivery of medication"],
    "medications": ["Amlodipine"]
  }'
```

**PROMPT 4**:
``` bash
curl -X POST https://dispatch-portal-amber.vercel.app/api/index \
  -H "Content-Type: application/json" \
  -d '{
    "action": "medication_delivery",
    "status": "received",
    "profile": {
      "Name": "Sarah Lee",
      "Age": 42,
      "Blood Type": "AB-",
      "Allergies": "Penicillin",
      "History": "Type 2 Diabetes",
      "Meds": "Metformin",
      "Disability": "None",
      "Emergency Contact": "Eric Lee - 0410 222 333",
      "Location": "102 Health Blvd"
    },
    "highlights": ["Missed morning diabetes medication"],
    "recommendations": ["Send Metformin via drone", "Monitor sugar levels"],
    "medications": ["Metformin"]
  }'
```

**PROMPT Emergency**:
``` bash
curl -X POST https://dispatch-portal-amber.vercel.app/api/index \
  -H "Content-Type: application/json" \
  -d '{
    "action": "emergency",
    "status": "received",
    "profile": {
      "Name": "Emma Wilson",
      "Age": 32,
      "Blood Type": "A+",
      "Allergies": "None",
      "History": "Gestational diabetes, first pregnancy",
      "Meds": "Prenatal vitamins",
      "Disability": "None",
      "Emergency Contact": "Liam Wilson - 0420 555 123",
      "Location": "210 Sunset Lane"
    },
    "highlights": [
      "Pregnant patient in third trimester",
      "Reported contractions and abdominal pain",
      "Gestational diabetes history"
    ],
    "recommendations": [
      "Immediate hospital transfer via ambulance",
      "Monitor vital signs en route",
      "Avoid high-sugar IV fluids due to diabetes",
      "Contact obstetrics department for delivery prep"
    ],
    "medications": ["IV fluids (low glucose)", "Prenatal supplements"]
  }'
```




# Emergency
**PROMPT 1**:
```bash
curl -X POST https://binkhoale1812-triage-llm.hf.space/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "bda550aa4e88",
    "voice_text": "I slipped on the stairs and now my ankle is swollen and hurts to walk."
  }'
```


**PROMPT 2**:
```bash
curl -X POST https://binkhoale1812-triage-llm.hf.space/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "bda550aa4e88",
    "voice_text": "I have asthma and I can barely breathe right now. I used my inhaler but it didn’t help."
  }'
```


**PROMPT 3**:
```bash
curl -X POST https://binkhoale1812-triage-llm.hf.space/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "bda550aa4e88",
    "voice_text": "I have sharp chest pain and it’s spreading to my left arm. I feel dizzy and cold."
  }'
```
