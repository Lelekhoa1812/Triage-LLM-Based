import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';

const MedicalProfileFormScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    fullName: '',
    dateOfBirth: new Date(),
    gender: '',
    bloodType: '',
    allergies: '',
    currentMedication: '',
    pastMedicalHistory: '',
    phone_number: '',
    email_address: '',
    disability: 'none',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    insuranceCard: 'Uploaded',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (key, value) => {
    setProfile({ ...profile, [key]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
    }
  };

  const summarizeAndAppend = async (targetField) => {
    ImagePicker.launchDocument({ selectionLimit: 1 }, async (resp) => {
      if (resp.didCancel || resp.errorCode) return;
      const f = resp.assets[0];
      const form = new FormData();
      form.append('file', {
        uri: f.uri,
        type: f.type || 'application/pdf',
        name: f.fileName || 'upload'
      });
      try {
        const r = await fetch('https://binkhoale1812-medical-profile.hf.space/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          body: form
        });
        const j = await r.json();
        if (j.status === 'success') {
          const today = new Date().toLocaleDateString("en-GB");
          const newText = `\n${today}\n${j.summary}`;
          setProfile((p) => ({
            ...p,
            [targetField]: (p[targetField] + newText).trim()
          }));
          Alert.alert("Summary added to " + formatLabel(targetField));
        } else {
          throw new Error(j.message);
        }
      } catch (e) {
        Alert.alert('Summarise error', e.message || 'Upload failed');
      }
    });
  };

  const handleSubmit = async () => {
    const requiredFields = [
      'fullName', 'gender', 'bloodType', 'emergencyName', 'emergencyPhone'
    ];
    const emptyField = requiredFields.find(field => !profile[field]);

    if (emptyField) {
      Alert.alert('Missing Information', `Please fill in the ${formatLabel(emptyField)} field.`);
      return;
    }

    const payload = {
      username: 'Khoa',
      password: '122003',
      user_id: 'bda550aa4e88',
      name: profile.fullName,
      dob: profile.dateOfBirth.toISOString().split('T')[0],
      sex: profile.gender,
      phone_number: profile.phone_number,
      email_address: profile.email_address,
      blood_type: profile.bloodType,
      allergies: profile.allergies.split(',').map(x => x.trim()),
      medical_history: profile.pastMedicalHistory.split(',').map(x => x.trim()),
      active_medications: profile.currentMedication.split(',').map(x => x.trim()),
      disability: profile.disability,
      insurance_card: profile.insuranceCard,
      home_address: profile.address,
      emergency_contact: {
        name: profile.emergencyName,
        phone: profile.emergencyPhone,
      },
      last_updated: new Date().toISOString(),
    };

    try {
      const res = await fetch('https://binkhoale1812-triage-llm.hf.space/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.status === 'success') {
        Alert.alert('Profile Submitted', 'Your medical profile has been saved.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      Alert.alert('Submission Failed', err.message);
    }
  };

  const formatLabel = key => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Complete Your Medical Profile</Text>

        {["Full Name", "Date of Birth", "Gender", "Blood Type", "Allergies", "Current Medication", "Past Medical History", "Phone Number", "Email Address", "Disability", "Address", "Emergency Contact Name", "Emergency Contact Phone"].map((label, index) => {
          const key = [
            'fullName', 'dateOfBirth', 'gender', 'bloodType', 'allergies',
            'currentMedication', 'pastMedicalHistory', 'phone_number', 'email_address',
            'disability', 'address', 'emergencyName', 'emergencyPhone'
          ][index];

          const icon = [
            'user', 'birthday-cake', 'venus-mars', 'tint', 'exclamation-circle',
            'capsules', 'file-medical', 'phone', 'envelope',
            'wheelchair', 'map-marker-alt', 'user', 'phone-alt'
          ][index];

          return (
            <View style={styles.fieldContainer} key={key}>
              <View style={styles.labelContainer}>
                <FontAwesome5 name={icon} size={18} color="#007BFF" style={styles.fieldIcon} />
                <Text style={styles.label}>{label}</Text>
              </View>
              {key === 'dateOfBirth' ? (
                <>
                  <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>{profile.dateOfBirth.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker value={profile.dateOfBirth} mode="date" display="default" onChange={handleDateChange} />
                  )}
                </>
              ) : key === 'gender' || key === 'bloodType' || key === 'disability' ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={profile[key]}
                    onValueChange={v => handleInputChange(key, v)}
                    style={styles.picker}
                  >
                    {key === 'gender' && ["", "male", "female", "non-binary", "not-specified"].map(g => (
                      <Picker.Item key={g} label={formatLabel(g || 'Select Gender')} value={g} />
                    ))}
                    {key === 'bloodType' && ["", "A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"].map(bt => (
                      <Picker.Item key={bt} label={bt || "Select Blood Type"} value={bt} />
                    ))}
                    {key === 'disability' && ["none", "visual", "hearing", "mobility", "cognitive", "other"].map(d => (
                      <Picker.Item key={d} label={formatLabel(d)} value={d} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <>
                  <TextInput
                    style={[styles.input, key.includes('History') || key.includes('Medication') || key === 'address' ? styles.textArea : null]}
                    value={profile[key]}
                    onChangeText={v => handleInputChange(key, v)}
                    placeholder={`Enter ${label}`}
                    placeholderTextColor="#A0A0A0"
                    multiline={key.includes('History') || key.includes('Medication') || key === 'address'}
                  />
                  {(key === 'currentMedication' || key === 'pastMedicalHistory') && (
                    <TouchableOpacity
                      style={[styles.uploadButton, { marginTop: 8 }]}
                      onPress={() => summarizeAndAppend(key)}>
                      <FontAwesome5 name="file-upload" size={16} color="#fff" />
                      <Text style={styles.uploadText}>Upload Document</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <FontAwesome5 name="check-circle" size={18} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.submitText}>Submit Profile</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: { fontSize: 22, marginBottom: 20, color: '#1F2937', textAlign: 'center', fontWeight: '600' },
  fieldContainer: { marginBottom: 12, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, elevation: 1 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  fieldIcon: { marginRight: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', padding: 12, borderRadius: 12, fontSize: 16, backgroundColor: '#F9FAFB', color: '#1F2937' },
  textArea: { textAlignVertical: 'top', minHeight: 80 },
  dateText: { fontSize: 16, color: '#1F2937' },
  pickerContainer: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, backgroundColor: '#F9FAFB', overflow: 'hidden' },
  picker: { height: 50, width: '100%' },
  uploadButton: { flexDirection: 'row', backgroundColor: '#4F46E5', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 14, color: '#fff', marginLeft: 8 },
  submitButton: { flexDirection: 'row', backgroundColor: '#10B981', padding: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 24, elevation: 3 },
  buttonIcon: { marginRight: 8 },
  submitText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});

export default MedicalProfileFormScreen;