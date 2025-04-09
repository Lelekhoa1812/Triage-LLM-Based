# 🏥 Triage LLM-Based Response Solution (Mobile App)
**🚀 Integrated from **Hikma Health** – Customized for Autonomous Emergency Medical Dispatch**

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
#### 📦 Prerequisites
Make sure the following tools are installed on your machine:
- [Homebrew](https://brew.sh/)
  - [Node.js (v16/18 recommended)](https://nodejs.org/) 
- [Watchman (for macOS)](https://facebook.github.io/watchman/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
- [Java 11](https://sdkman.io/)
- [Android Studio (with SDK & AVD)](https://developer.android.com/studio)
- [Xcode (for iOS, optional)](https://developer.apple.com/xcode/) – **Skip if only doing Android**

#### 🧪 1. Clone the Repo
```bash
git clone https://github.com/Lelekhoa1812/Triage-LLM-Based.git
cd Triage-LLM-Based
```

#### ☕️ 2. Install Java 11 via SDKMAN
```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install java 11.0.20-tem
```
Then verify:
```bash
java -version
```

#### 📦 3. Install Node Modules
Run script `nvm install 18` and `nvm use 18` to scale down to Node16
```bash
yarn install
```
_Or, if you're using npm:_
```bash
npm install
```

#### 🧰 4. Set up Android SDK
Ensure your Android SDK is installed via Android Studio, then create a `local.properties` file:
```bash
nano android/local.properties
```
Paste this (edit path if needed):
```
sdk.dir = /Users/YOUR_USERNAME/Library/Android/sdk
```
Replace `YOUR_USERNAME` with your Mac username.

---

#### 🔐 5. Generate Debug Keystore (if not present)
```bash
keytool -genkey -v -keystore android/app/debug.keystore \
  -storepass android -alias androiddebugkey -keypass android \
  -keyalg RSA -keysize 2048 -validity 10000
```

#### 🧹 6. Clean Gradle Build Cache (optional but recommended)
```bash
cd android
./gradlew clean
cd ..
```

#### 📲 7. Start Metro Bundler (in one terminal)
```bash
npx react-native start
```

#### 🤖 8. Run the App on Android (in a new terminal)
```bash
npx react-native run-android
```

#### 🚫 Known Issues / Notes
- If you get an `adb: command not found` error, make sure `platform-tools` is in your `$PATH`. Example:
```bash
export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools
```
- If build fails due to missing NDK, open Android Studio > SDK Manager > SDK Tools > Install **NDK (Side by side)**
- If using a physical Android device, make sure USB debugging is enabled and `adb devices` shows your device.
Verify it again:
```bash
adb devices 
```

#### 📲 Run app on physical device
Scan the QR with **Expo Go App** on Android/iOS device or run on Android Studio Emulator / Xcode Simulator.

---

## 📦 Recommended Dependencies (React Native 0.71+)

| Feature / Purpose                        | Module / Package Name                                 | Suggested Version | Notes / Purpose                                                                 |
|-----------------------------------------|--------------------------------------------------------|-------------------|---------------------------------------------------------------------------------|
| Core App                                | react-native                                           | ^0.71.10          | Latest stable RN with Java 17 / Gradle 7+ support                              |
| Navigation                              | @react-navigation/native                               | ^6.1.6            | Main navigation library                                                        |
|                                         | react-native-screens                                   | ^3.18.2           | Required for navigation performance                                            |
|                                         | react-native-safe-area-context                         | ^4.4.1            | Required for header/footer layout safety                                       |
|                                         | @react-navigation/native-stack                         | ^6.9.12           | Stack navigation                                                               |
| Form Management                         | react-hook-form                                        | ^7.45.0           | Lightweight, performant form validation                                        |
|                                         | yup                                                    | ^1.1.1            | Schema validation for form input                                               |
| Camera & QR Code                        | react-native-vision-camera                             | ^3.0.0            | Modern camera support for biometrics/QR/scanning                              |
|                                         | react-native-qrcode-svg                                | ^6.1.2            | Generate QR codes for wallet delivery                                          |
| Face Authentication                     | react-native-facial-recognition                        | Custom wrapper    | You can use MLKit or Expo Camera + custom ML model                            |
|                                         | react-native-fingerprint-scanner                      | ^6.0.0            | Backup biometric auth (optional fallback)                                     |
| Voice Input / TTS                       | react-native-voice                                     | ^3.1.0            | Voice input capture                                                            |
|                                         | expo-speech                                            | ^10.3.0           | Text-to-speech for confirmation & alerts                                       |
| Storage                                 | @react-native-async-storage/async-storage              | ^1.17.11          | Local key-value storage                                                        |
| Network / API                           | axios                                                  | ^1.6.2            | Backend integration for profile sync & triage calls                           |
| Backend Auth                            | react-native-keychain                                  | ^8.0.0            | Secure storage for access tokens/passcodes                                     |
| Device Info                             | react-native-device-info                               | ^10.5.0           | Used for drone delivery logic/geolocation fallback                            |
| Geolocation                             | react-native-geolocation-service                       | ^5.3.0            | Grab current user location                                                     |
| File System                             | react-native-fs                                        | ^2.20.0           | Download or store QR code, image, etc.                                         |
| Zip / Archive (optional)                | react-native-zip-archive                               | ^6.0.0            | If you need secure zipping of local data                                       |
| Push Notifications                      | @react-native-firebase/app                             | ^18.4.0           | Firebase core                                                                  |
|                                         | @react-native-firebase/messaging                       | ^18.4.0           | Push notifications for alerts                                                  |
| Linting / Quality                       | eslint-config-react-native                             | latest            | Enforce RN code standards                                                      |
| Dev Tools                               | react-native-reanimated                                | ^2.18.0           | Needed for gestures/navigation                                                 |
|                                         | react-native-gesture-handler                           | ^2.12.0           | Required for swipe gestures                                                    |

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
