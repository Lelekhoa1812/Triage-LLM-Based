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
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';

// API endpoint for summarization
const PROFILE_URL = 'https://binkhoale1812-medical-profile.hf.space';

const MedicalProfileFormScreen = ({navigation}) => {
  // State for profile data and UI controls
  const [profile, setProfile] = useState({
    fullName: '',
    dateOfBirth: new Date(),
    gender: '',
    bloodType: '',
    allergies: '',
    currentMedication: '',
    pastMedicalHistory: '',
    disability: 'none',
    address: '',
    emergencyContact: '',
    insuranceCard: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Handle input changes for profile fields
  const handleInputChange = (key, value) => {
    setProfile(prev => ({...prev, [key]: value}));
  };

  // Handle date picker changes
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
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
        handleInputChange(targetField, (profile[targetField] + newText).trim());
        Alert.alert('Success', `Summary added to ${formatLabel(targetField)}`);
      } else {
        throw new Error(json.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Summarization error:', error);
      Alert.alert('Error', 'Failed to upload and summarize document');
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    const requiredFields = [
      'fullName',
      'gender',
      'bloodType',
      'emergencyContact',
    ];
    const emptyField = requiredFields.find(field => !profile[field]);
    if (emptyField) {
      Alert.alert(
        'Missing Information',
        `Please fill in the ${formatLabel(emptyField)} field.`,
      );
      return;
    }

    Alert.alert('Profile Submitted', 'Your medical profile has been saved.', [
      {text: 'OK', onPress: () => navigation.navigate('Main')},
    ]);
  };

  // Format field label for display
  const formatLabel = key =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Complete Your Medical Profile</Text>

        {/* Full Name Input */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="user"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Full Name</Text>
          </View>
          <TextInput
            style={styles.input}
            value={profile.fullName}
            onChangeText={value => handleInputChange('fullName', value)}
            placeholder="Enter Full Name"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Date of Birth Picker */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="birthday-cake"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Date of Birth</Text>
          </View>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>
              {profile.dateOfBirth.toLocaleDateString('en-GB')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={profile.dateOfBirth}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Gender Dropdown */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="venus-mars"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Gender</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.gender}
              onValueChange={value => handleInputChange('gender', value)}
              style={styles.picker}>
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Non-binary" value="non-binary" />
              <Picker.Item label="Prefer not to say" value="not-specified" />
            </Picker>
          </View>
        </View>

        {/* Blood Type Dropdown */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="tint"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Blood Type</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.bloodType}
              onValueChange={value => handleInputChange('bloodType', value)}
              style={styles.picker}>
              <Picker.Item label="Select Blood Type" value="" />
              <Picker.Item label="A+" value="A+" />
              <Picker.Item label="A-" value="A-" />
              <Picker.Item label="B+" value="B+" />
              <Picker.Item label="B-" value="B-" />
              <Picker.Item label="AB+" value="AB+" />
              <Picker.Item label="AB-" value="AB-" />
              <Picker.Item label="O+" value="O+" />
              <Picker.Item label="O-" value="O-" />
              <Picker.Item label="Unknown" value="unknown" />
            </Picker>
          </View>
        </View>

        {/* Allergies Input */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="exclamation-circle"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Allergies</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.allergies}
            onChangeText={value => handleInputChange('allergies', value)}
            placeholder="List all allergies or type 'None'"
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Current Medication Input */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="capsules"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Current Medication</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.currentMedication}
            onChangeText={value =>
              handleInputChange('currentMedication', value)
            }
            placeholder="List all current medications or type 'None'"
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.uploadButton, styles.uploadButtonMargin]}
            onPress={() => pickAndSummarise('currentMedication')}>
            <FontAwesome5 name="cloud-upload-alt" size={16} color="#fff" />
            <Text style={styles.uploadText}>Upload Document</Text>
          </TouchableOpacity>
        </View>

        {/* Past Medical History Input */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="file-medical"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Past Medical History</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.pastMedicalHistory}
            onChangeText={value =>
              handleInputChange('pastMedicalHistory', value)
            }
            placeholder="Surgeries, hospitalizations, chronic conditions"
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.uploadButton, styles.uploadButtonMargin]}
            onPress={() => pickAndSummarise('pastMedicalHistory')}>
            <FontAwesome5 name="cloud-upload-alt" size={16} color="#fff" />
            <Text style={styles.uploadText}>Upload Document</Text>
          </TouchableOpacity>
        </View>

        {/* Disability Dropdown */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="wheelchair"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Disability</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.disability}
              onValueChange={value => handleInputChange('disability', value)}
              style={styles.picker}>
              <Picker.Item label="None" value="none" />
              <Picker.Item label="Visual Impairment" value="visual" />
              <Picker.Item label="Hearing Impairment" value="hearing" />
              <Picker.Item label="Mobility Impairment" value="mobility" />
              <Picker.Item label="Cognitive Impairment" value="cognitive" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        {/* Address Input */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="map-marker-alt"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Address</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.address}
            onChangeText={value => handleInputChange('address', value)}
            placeholder="Enter your full address"
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Emergency Contact Input */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="phone-alt"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Emergency Contact</Text>
          </View>
          <TextInput
            style={styles.input}
            value={profile.emergencyContact}
            onChangeText={value => handleInputChange('emergencyContact', value)}
            placeholder="Name: Relationship: Phone:"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Insurance Card Input */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="id-card"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Insurance Card</Text>
          </View>
          <TextInput
            style={styles.input}
            value={profile.insuranceCard}
            onChangeText={value => handleInputChange('insuranceCard', value)}
            placeholder="Enter insurance card number"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <FontAwesome5
            name="check-circle"
            size={18}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.submitText}>Submit Profile</Text>
        </TouchableOpacity>

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
  scrollContent: {
    padding: 20,
  },
  header: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
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
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonMargin: {
    marginTop: 8,
  },
  uploadText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#34D399',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 60,
  },
});

export default MedicalProfileFormScreen;
