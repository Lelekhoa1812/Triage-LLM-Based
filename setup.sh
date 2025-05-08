#!/bin/bash

echo "🛠 Setting up TriageLLM project..."

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js >= 18.x first."
  exit 1
fi

# Install dependencies
echo "📦 Installing npm packages..."
npm install
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/native-stack
# Utilities
npm install react-native-gesture-handler react-native-reanimated \
            react-native-screens react-native-safe-area-context \
            @react-native-community/masked-view
# Bottom bar
npm install @react-navigation/bottom-tabs
# Fetch backend
npm install axios
# Icons
npm install react-native-vector-icons
# QR generation
npm install react-native-qrcode-svg


# Set Java 17 via SDKMAN (optional)
if command -v sdk &> /dev/null; then
  echo "☕ Switching to Java 17 via SDKMAN..."
  sdk install java 17.0.14-amzn
  sdk use java 17.0.14-amzn
else
  echo "⚠️ SDKMAN not installed. Please manually ensure Java 17 is active."
fi

# Configure Android NDK
NDK_VERSION="26.1.10909125"
NDK_PATH="$HOME/Library/Android/sdk/ndk/$NDK_VERSION"

if [ ! -d "$NDK_PATH" ]; then
  echo "📥 Installing Android NDK $NDK_VERSION..."
  "$HOME/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager" "ndk;$NDK_VERSION"
fi

# Ensure local.properties is configured
echo "📝 Writing android/local.properties..."
echo "ndk.dir=$NDK_PATH" > android/local.properties

# Write correct NDK version to build.gradle
BUILD_GRADLE="android/app/build.gradle"
if grep -q "ndkVersion" "$BUILD_GRADLE"; then
  sed -i '' "s/ndkVersion \".*\"/ndkVersion \"$NDK_VERSION\"/" "$BUILD_GRADLE"
else
  echo "    ndkVersion \"$NDK_VERSION\"" >> "$BUILD_GRADLE"
fi

# Clean project
cd android && ./gradlew clean && cd ..

echo "✅ Setup complete. Now run:"
echo "➡️  Terminal 1: npx react-native start"
echo "➡️  Terminal 2: npx react-native run-android"
