import React, {useState} from 'react';
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

// Current handle API from HF (FastAPI)
const BASE_URL = 'https://binkhoale1812-triage-llm.hf.space';

const ProfileScreen = () => {
  const [editing, setEditing] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    dateOfBirth: '1967-05-08',
    gender: 'Male',
    bloodType: 'O+',
    allergies: 'Penicillin',
    currentMedication: 'Lisinopril',
    pastMedicalHistory: 'Hypertension, 2 yrs',
    disability: 'None',
    address: '123 Main St, Melbourne, VIC',
    emergencyContact: 'Jane Doe (Wife) - 0400 123 456',
    medicalDocuments: [{name: 'Medical_Report.pdf'}, {name: 'Blood_Test.png'}],
    insuranceCard: {name: 'Insurance_Card.jpg'},
  });

  const handleSave = async () => {
    try {
      setEditing(false);
      Alert.alert(
        'Profile Updated',
        'Your medical information has been saved.',
      );
    } catch (err) {
      Alert.alert('Error', 'Unable to update profile at this time.');
    }
  };

  const formatLabel = key => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const fieldIcons = {
    fullName: 'user',
    dateOfBirth: 'birthday-cake',
    gender: 'venus-mars',
    bloodType: 'tint',
    allergies: 'exclamation-circle',
    currentMedication: 'capsules',
    pastMedicalHistory: 'file-medical',
    disability: 'wheelchair',
    address: 'map-marker-alt',
    emergencyContact: 'phone-alt',
    medicalDocuments: 'file-upload',
    insuranceCard: 'id-card',
  };

  const renderDocumentItem = (doc, index) => (
    <View key={index} style={styles.documentItem}>
      <FontAwesome5 name="file-medical" size={16} color="#007BFF" />
      <Text style={styles.documentName} numberOfLines={1}>
        {doc.name}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.avatar}>
          <FontAwesome5 name="user-circle" size={48} color="#fff" />
        </View>
        <Text style={styles.header}>My Medical Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {Object.keys(profile).map(key => (
          <View key={key} style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <FontAwesome5
                name={fieldIcons[key]}
                size={18}
                color="#007BFF"
                style={styles.fieldIcon}
              />
              <Text style={styles.label}>{formatLabel(key)}</Text>
            </View>
            {key === 'medicalDocuments' ? (
              editing ? (
                <TextInput
                  style={styles.input}
                  value={profile.medicalDocuments
                    .map(doc => doc.name)
                    .join(', ')}
                  placeholder="Enter document names"
                  placeholderTextColor="#A0A0A0"
                  onChangeText={val => {
                    const docs = val
                      .split(',')
                      .map(name => ({name: name.trim()}));
                    setProfile({...profile, medicalDocuments: docs});
                  }}
                />
              ) : (
                <View style={styles.documentsContainer}>
                  {profile.medicalDocuments.length > 0 ? (
                    profile.medicalDocuments.map(renderDocumentItem)
                  ) : (
                    <Text style={styles.value}>No documents uploaded</Text>
                  )}
                </View>
              )
            ) : key === 'insuranceCard' ? (
              editing ? (
                <TextInput
                  style={styles.input}
                  value={
                    profile.insuranceCard ? profile.insuranceCard.name : ''
                  }
                  placeholder="Enter insurance card name"
                  placeholderTextColor="#A0A0A0"
                  onChangeText={val => {
                    setProfile({
                      ...profile,
                      insuranceCard: val ? {name: val} : null,
                    });
                  }}
                />
              ) : (
                <View style={styles.insuranceCardContainer}>
                  {profile.insuranceCard ? (
                    <>
                      <FontAwesome5 name="id-card" size={16} color="#007BFF" />
                      <Text style={styles.documentName} numberOfLines={1}>
                        {profile.insuranceCard.name}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.value}>No insurance card uploaded</Text>
                  )}
                </View>
              )
            ) : editing ? (
              <TextInput
                style={styles.input}
                value={profile[key].toString()}
                onChangeText={val => setProfile({...profile, [key]: val})}
                placeholder={`Enter ${formatLabel(key)}`}
                placeholderTextColor="#A0A0A0"
              />
            ) : (
              <Text style={styles.value}>
                {key === 'dateOfBirth'
                  ? new Date(profile[key]).toLocaleDateString()
                  : profile[key] || 'Not specified'}
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
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
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

        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  documentsContainer: {
    marginTop: 10,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
  },
  insuranceCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  documentName: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
