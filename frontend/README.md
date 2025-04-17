# 🏥 TriageLLM - Emergency Medical Response App

TriageLLM is a cross-platform (Android/iOS) mobile application that supports **emergency medical triage**, **AI-based decision-making**, and **autonomous drone dispatch**. It is part of the broader system integrating:
- Large Language Models (LLMs) for triage,
- Vector-embedded user medical profiles (RAG),
- Real-time API communication,
- Biometric and QR-based multi-layer authentication.

This repo contains the **React Native frontend** for patients to:
- Trigger emergency support (via button or voice),
- Manage their medical profile,
- Receive live updates on medication delivery or EMS dispatch,
- Authenticate and complete secure medication pickup.

---

## ⚙️ System Requirements

| Tool              | Version                              |
|-------------------|---------------------------------------|
| Node.js           | `>= 18.x` (LTS Recommended)           |
| npm / yarn        | `npm >= 9.x` or `yarn >= 1.22`        |
| Java              | `17` (required for Android builds)    |
| Android Studio    | Latest (SDK 34+ and NDK installed)    |
| React Native CLI  | `>= 10.x`                             |
| Git               | `>= 2.x`                              |

---

## 🚀 Quick Setup

### 🔧 One-liner setup for devs
```bash
git clone -b master https://github.com/Lelekhoa1812/Triage-LLM-Based.git
cd Triage-LLM-Based
chmod +x setup.sh
./setup.sh
```

Then in **two separate terminals**:
```bash
# Terminal 1
npx react-native start

# Terminal 2
npx react-native run-android
```

To restart Metro, terminal 1 do:
```bash
npx react-native start --reset-cache
```

---

## 📱 App Features (Planned)
- 🔴 **Emergency Button** – triggers AI triage and dispatch via backend FastAPI.
- 🧠 **Voice-to-Text Recognition** – activate emergencies via Wav2Vec/Whisper integration.
- 👤 **Medical Profile** – update allergy, history, medication info.
- 🔐 **QR Wallet + Face ID** – multi-layer identity verification on delivery.
- 🚑 **Real-time status** – API-linked delivery and EMS updates.

---

## 📡 Backend Services (Connected or Planned)
| Component            | Tech Stack                            |
|---------------------|----------------------------------------|
| AI Triage Engine     | FastAPI + GPT-4 / Gemini + FAISS       |
| Voice-to-Text API    | Wav2Vec2.0 / Whisper                   |
| Data Embedding       | FAISS + MongoDB                        |
| Drone Dispatch Logic | External drone server (Node/FastAPI)   |

API endpoints will be defined in `/src/services/api.js`.

---

## 🧪 Developer Notes

### Project Structure (Basic)
```
TriageLLM/
 ┣ android/
 ┣ ios/
 ┣ app.json
 ┣ babel.config.js
 ┣ package.json
 ┣ App.js
 ┣ src
    ┗ /navigation
    ┗   ┗ BottomTabs.js
    ┗ /context
    ┗   ┗ LanguageContext.js
    ┗   ┗ ThemeContext.js
    ┗ /screens
    ┗   ┗ EmergencyScreen.js
    ┗   ┗ ChatbotScreen.js
    ┗   ┗ ProfileScreen.js
    ┗   ┗ QRWallerScreen.js
    ┗   ┗ SettingsScreen.js        
    ┗ /components
    ┗   ┗ ... (Future shared components or custom hooks)         
 ┣ setup.sh               # Auto-setup script for new devs
 ┣ README.md            
```

---

## 🧑‍💻 Contributing

Please follow these steps before pushing:

```bash
git pull origin main
git checkout -b feature/your-feature-name
# make changes
git add .
git commit -m "✨ Add feature XYZ"
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub 🚀

