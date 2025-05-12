# List of API Services

## 1. **LLM and AI**
### a) Emergency Request
```bash
https://binkhoale1812-triage-llm.hf.space/emergency
```

### b) Transcribe voice-to-text (Whisper-v3)
```bash
https://binkhoale1812-triage-llm.hf.space/voice-transcribe
```

### c) Credential:
```bash
/register   /login
```

### d) Update profile (using update_user_data also fine):
```bash
https://binkhoale1812-triage-llm.hf.space/profile
```

## 2. **RAG (Embedding and DB system)**
### a) Update/Create Profile
```bash
https://binkhoale1812-medical-profile.hf.space/update_user_data
```

### b) Fetch Profile (feed in username + password return user_id)
```bash
https://binkhoale1812-medical-profile.hf.space/predict
```

### c) Transcribe/Summarize Image (Health Report or Prescription)
```bash
https://binkhoale1812-medical-profile.hf.space/summarize
```

## 3. **Hospital** 
```bash
https://triagellmhospital.vercel.app/ 
```