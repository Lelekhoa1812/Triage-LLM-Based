// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';

export default function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    age: '58',
    gender: 'Male',
    bloodType: 'O+',
    allergies: 'Penicillin',
    currentMedication: 'Lisinopril',
    pastMedicalHistory: 'Hypertension, 2 yrs',
    disability: '',
    address: '123 Main St, Melbourne, VIC',
    emergencyContact: 'Jane Doe (Wife) - 0400 123 456',
  });

  const handleSave = async () => {
    // Call your backend API to update the profile in MongoDB
    try {
      // await axios.post('/api/updateProfile', profile);
      setEditing(false);
      Alert.alert('Profile Updated', 'Your medical information has been saved.');
    } catch (err) {
      Alert.alert('Error', 'Unable to update profile at this time.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Medical Profile</Text>
      {Object.keys(profile).map((key) => (
        <View key={key} style={styles.fieldContainer}>
          <Text style={styles.label}>{key}</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile[key]}
              onChangeText={(val) => setProfile({ ...profile, [key]: val })}
            />
          ) : (
            <Text style={styles.value}>{profile[key]}</Text>
          )}
        </View>
      ))}

      {editing ? (
        <Button title="Save" onPress={handleSave} />
      ) : (
        <Button title="Edit Profile" onPress={() => setEditing(true)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  header: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  fieldContainer: { marginBottom: 10 },
  label: { fontWeight: 'bold', color: '#555' },
  value: { fontSize: 16, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 8, marginTop: 4, borderRadius: 4,
  },
});
