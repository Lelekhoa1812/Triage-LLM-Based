// src/screens/EmergencyScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
// import Voice from 'react-native-voice'; // voice lib if you want

export default function EmergencyScreen() {
  const [voiceActive, setVoiceActive] = useState(false);

  const handleEmergency = () => {
    Alert.alert('Emergency Triggered!', 'Dispatching triage logic...');
    // Call triage backend or do something real-time
  };

  const startVoiceRecognition = () => {
    setVoiceActive(true);
    // Start listening
  };

  const stopVoiceRecognition = () => {
    setVoiceActive(false);
    // Stop listening
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Assistance</Text>
      <Button title="Emergency Button" color="red" onPress={handleEmergency} />
      <View style={{ marginTop: 20 }}>
        {voiceActive ? (
          <Button title="Stop Voice Recognition" onPress={stopVoiceRecognition} />
        ) : (
          <Button title="Activate Voice Recognition" onPress={startVoiceRecognition} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});
