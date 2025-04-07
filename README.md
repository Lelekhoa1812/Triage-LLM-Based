# 🏥 Triage LLM-Based Response Solution (Mobile App)
**🚀 Integrated from Hikma Health – Customized for Autonomous Emergency Medical Dispatch**

This React Native application is adapted from the [Hikma Health mobile EHR platform](https://github.com/hikmahealth/hikma-health-app) to serve as the **frontline interface** for a modern AI-based triage and emergency response system.

The system is designed to:
- Collect and update **user medical profiles**
- Trigger **LLM-based triage decisions**
- Dispatch **autonomous drones with medication**
- Enable **identity verification** and **QR wallet interactions**
- Support **voice and chatbot interfaces** for medical queries and emergencies

The backend is powered by:
- `rag.py` for continuous profile embedding
- `emergency.py` for triage decisions
- `app.py` for general AI Q&A and chatbot responses

---

## ✅ Key Features (Planned + In Progress)

| Feature                        | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **📋 Medical Profile Expansion**     | Form for allergies, disabilities, chronic conditions, blood type, medications, GPS address, etc. |
| **🧠 RAG Trigger Button**            | Allows daily health input to be embedded in FAISS via `rag.py`.           |
| **🚨 Emergency Dispatch Button**     | Voice-activated or tap-based trigger → sends request to `emergency.py`.   |
| **💬 AI Chatbot (optional)**         | Conversational Q&A with LLM using user profile context.                   |
| **🧾 QR Wallet Integration**         | QR code shows up upon identity auth, scanned by drone → confirms delivery and billing. |
| **📈 Triage Feedback View**          | Visual display of decision: self-medicate, caregiver visit, or ambulance dispatch. |

---

## 📦 Tech Stack

- **Frontend**: React Native (Expo), TypeScript
- **Backend**: FastAPI (Python), MongoDB, FAISS, LLMs (OpenAI GPT-4 or Gemini)
- **Auth**: Facial recognition + passcode fallback
- **Cloud**: AWS/GCP for scalable APIs, MongoDB Atlas for profile storage

---

## 🛠️ Local Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/Lelekhoa1812/Triage-LLM-Based.git
cd Triage-LLM-Based/frontend
npm install
```

### 2. Start with Expo (Recommended)

```bash
npx expo start
```

Scan the QR with **Expo Go App** on Android/iOS device  
or run on Android Studio Emulator / Xcode Simulator.

---

## ⚙️ Backend Integration

Make sure these services are running:

| Service         | Description                               |
|----------------|-------------------------------------------|
| `rag.py`        | Embeds updated medical profile to FAISS DB |
| `emergency.py`  | Makes triage decisions based on context   |
| `app.py`        | Handles chatbot-based general health Q&A  |

Update `src/components/Login.tsx` to connect to your backend:

```tsx
const [selectedInstance, setSelectedInstance] = useState({
  name: 'local',
  url: 'http://10.0.2.2:8080'  // or your_ip:8080
});
```

---

## 🧪 Development Workflow

Use **feature branches** for collaboration:

```bash
git checkout -b feature/<feature-name>
```

Suggested branches:
- `feature/user-profile-expansion`
- `feature/emergency-dispatch`
- `feature/rag-integration`
- `feature/qr-wallet-auth`
- `feature/triage-decision-ui`

---

## 🔐 Identity & Security

- Facial recognition (primary auth method)
- Passcode fallback option
- QR code generated post-auth for:
    - Drone delivery confirmation
    - Medication access + payment verification

---

## 📲 APK Build (Optional)

Follow React Native's [official APK guide](https://reactnative.dev/docs/signed-apk-android)  
or use Android Studio:
1. Open the project
2. Add new Run/Debug config → Gradle task → `assembleRelease`

---
