import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Animated,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import * as ImagePicker from 'react-native-image-picker';

// API endpoints
const TRIAGE_URL = 'https://binkhoale1812-triage-llm.hf.space';
const PROFILE_URL = 'https://binkhoale1812-medical-profile.hf.space';

// Hardcoded auth (TODO: Replace with context or secure storage)
const auth = {username: 'Khoa', password: '122003', user_id: 'bda550aa4e88'};

// Field order for rendering profile fields
const FIELD_ORDER = [
  'fullName',
  'dateOfBirth',
  'gender',
  'bloodType',
  'allergies',
  'pastMedicalHistory',
  'currentMedication',
  'disability',
  'insuranceCard',
  'address',
  'emergencyContact',
];

// Icons for each profile field
const ICONS = {
  fullName: 'user',
  dateOfBirth: 'birthday-cake',
  gender: 'venus-mars',
  bloodType: 'tint',
  allergies: 'exclamation-circle',
  pastMedicalHistory: 'file-medical',
  currentMedication: 'capsules',
  disability: 'wheelchair',
  insuranceCard: 'id-card',
  address: 'map-marker-alt',
  emergencyContact: 'phone-alt',
};

const ProfileScreen = () => {
  // State for profile data, editing mode, and button animation
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Fetch user profile from backend
  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${PROFILE_URL}/get_profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: auth.username,
          password: auth.password,
        }),
      });
      const json = await response.json();
      if (response.ok && json.status === 'success') {
        const p = json.profile;
        const [year = '', month = '', day = ''] = (p.dob || '').split('-');
        setProfile({
          fullName: p.name || '',
          dateOfBirth: p.dob || '',
          year,
          month,
          day,
          gender: p.sex || '',
          bloodType: p.blood_type || '',
          allergies: (p.allergies || []).join(', '),
          pastMedicalHistory: (p.medical_history || []).join(', '),
          currentMedication: (p.active_medications || []).join(', '),
          disability: p.disability || '',
          insuranceCard: p.insurance_card || '',
          address: p.home_address || '',
          emergencyContact: `${p.emergency_contact?.name || ''} - ${
            p.emergency_contact?.phone || ''
          }`,
        });
      } else {
        Alert.alert('Load Failed', json.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Profile load error:', error);
      Alert.alert('Load Failed', 'Unable to load profile. Please try again.');
    }
  };

  // Save updated profile to backend
  const handleSave = async () => {
    const payload = {
      username: auth.username,
      password: auth.password,
      user_id: auth.user_id,
      name: profile.fullName,
      dob: `${(profile.year || '0000').padStart(4, '0')}-${(
        profile.month || '01'
      ).padStart(2, '0')}-${(profile.day || '01').padStart(2, '0')}`,
      sex: profile.gender,
      phone_number: '',
      email_address: profile.username || '',
      blood_type: profile.bloodType,
      allergies: profile.allergies
        ? profile.allergies.split(',').map(s => s.trim())
        : [],
      medical_history: profile.pastMedicalHistory
        ? profile.pastMedicalHistory.split(',').map(s => s.trim())
        : [],
      active_medications: profile.currentMedication
        ? profile.currentMedication.split(',').map(s => s.trim())
        : [],
      disability: profile.disability,
      insurance_card: profile.insuranceCard,
      home_address: profile.address,
      emergency_contact: {
        name: profile.emergencyContact.split(' - ')[0] || 'N/A',
        phone: profile.emergencyContact.split(' - ')[1] || 'N/A',
      },
      last_updated: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${TRIAGE_URL}/profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (json.status === 'success') {
        Alert.alert('Success', 'Profile updated successfully');
        setEditing(false);
      } else {
        throw new Error(json.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('Save Failed', error.message || 'Network error');
    }
  };

  // Handle document/image upload and summarization for pastMedicalHistory and currentMedication
  const pickAndSummarise = async targetField => {
    const response = await ImagePicker.launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 1,
    });
    if (response.didCancel || response.errorCode) {
      if (response.errorCode) {
        Alert.alert('Error', 'Failed to select file');
      }
      return;
    }
    const file = response.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.fileName || 'upload',
    });

    try {
      const uploadResponse = await fetch(`${PROFILE_URL}/summarize`, {
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data'},
        body: formData,
      });
      const json = await uploadResponse.json();
      if (json.status === 'success') {
        const today = new Date().toLocaleDateString('en-GB');
        const newText = `\n${today}\n${json.summary}`;
        setProfile(prev => ({
          ...prev,
          [targetField]: (prev[targetField] + newText).trim(),
        }));
        Alert.alert(
          'Success',
          `Summary added to ${formatFieldName(targetField)}`,
        );
      } else {
        throw new Error(json.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Summarization error:', error);
      Alert.alert('Error', 'Failed to upload and summarize document');
    }
  };

  // Format field name for display
  const formatFieldName = key =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  // Button animation handlers
  const pressIn = () =>
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  const pressOut = () =>
    Animated.spring(buttonScale, {toValue: 1, useNativeDriver: true}).start();

  // Render loading state
  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.avatar}>
          <FontAwesome5 name="user-circle" size={48} color="#fff" />
        </View>
        <Text style={styles.header}>My Medical Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {FIELD_ORDER.map(key => (
          <View key={key} style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <FontAwesome5
                name={ICONS[key]}
                size={18}
                color="#007BFF"
                style={styles.fieldIcon}
              />
              <Text style={styles.label}>{formatFieldName(key)}</Text>
            </View>

            {key === 'pastMedicalHistory' || key === 'currentMedication' ? (
              editing ? (
                <>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    multiline
                    value={profile[key]}
                    onChangeText={value =>
                      setProfile({...profile, [key]: value})
                    }
                    placeholder={`Enter ${formatFieldName(key)}`}
                  />
                  <TouchableOpacity
                    style={[styles.uploadBtn, styles.uploadBtnMargin]}
                    onPress={() => pickAndSummarise(key)}>
                    <Text style={styles.uploadBtnText}>Upload Document</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.value}>
                  {profile[key] || 'Not specified'}
                </Text>
              )
            ) : key === 'dateOfBirth' && editing ? (
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="DD"
                  maxLength={2}
                  keyboardType="numeric"
                  value={profile.day}
                  onChangeText={value => setProfile({...profile, day: value})}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="MM"
                  maxLength={2}
                  keyboardType="numeric"
                  value={profile.month}
                  onChangeText={value => setProfile({...profile, month: value})}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.yearInput]}
                  placeholder="YYYY"
                  maxLength={4}
                  keyboardType="numeric"
                  value={profile.year}
                  onChangeText={value => setProfile({...profile, year: value})}
                />
              </View>
            ) : key === 'dateOfBirth' ? (
              <Text style={styles.value}>
                {profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB')
                  : 'Not specified'}
              </Text>
            ) : editing ? (
              <TextInput
                style={styles.input}
                value={profile[key]}
                onChangeText={value => setProfile({...profile, [key]: value})}
                placeholder={`Enter ${formatFieldName(key)}`}
              />
            ) : (
              <Text style={styles.value}>
                {profile[key] || 'Not specified'}
              </Text>
            )}
          </View>
        ))}
        <Animated.View
          style={[styles.buttonContainer, {transform: [{scale: buttonScale}]}]}>
          <TouchableOpacity
            style={[
              styles.button,
              editing ? styles.saveButton : styles.editButton,
            ]}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={editing ? handleSave : () => setEditing(true)}>
            <FontAwesome5
              name={editing ? 'save' : 'edit'}
              size={18}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  header: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 8,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  value: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateInput: {
    width: 60,
  },
  yearInput: {
    width: 80,
  },
  dateSeparator: {
    fontSize: 16,
    color: '#1F2937',
    marginHorizontal: 4,
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: '#007BFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadBtnMargin: {
    marginTop: 8,
  },
  uploadBtnText: {
    color: '#007BFF',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#007BFF',
  },
  saveButton: {
    backgroundColor: '#34D399',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default ProfileScreen;
