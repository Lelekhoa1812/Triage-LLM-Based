// MedicalProfileFormScreen.js

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
  Image,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const MedicalProfileFormScreen = ({navigation}) => {
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
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [medicalDocuments, setMedicalDocuments] = useState([]);
  const [insuranceCard, setInsuranceCard] = useState(null);

  const handleInputChange = (key, value) => {
    setProfile({...profile, [key]: value});
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
    }
  };

  const pickDocument = async (multiple = false) => {
    try {
      const result = multiple
        ? await DocumentPicker.pickMultiple({
            type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
          })
        : await DocumentPicker.pick({
            type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
          });

      return multiple ? result : result[0];
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
      } else {
        Alert.alert('Error', 'Something went wrong while picking the document');
      }
    }
  };

  const handlePickMedicalDocuments = async () => {
    const docs = await pickDocument(true);
    if (docs) setMedicalDocuments(docs);
  };

  const handlePickInsuranceCard = async () => {
    const card = await pickDocument();
    if (card) setInsuranceCard(card);
  };

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
      {
        text: 'OK',
        onPress: () => navigation.navigate('Home'),
      },
    ]);
  };

  const formatLabel = key => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
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
              {profile.dateOfBirth.toLocaleDateString()}
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

        {/* Medical Documents Upload */}
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="file-upload"
              size={18}
              color="#007BFF"
              style={styles.fieldIcon}
            />
            <Text style={styles.label}>Medical Documents</Text>
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickMedicalDocuments}>
            <FontAwesome5 name="cloud-upload-alt" size={16} color="#fff" />
            <Text style={styles.uploadText}>Upload Documents</Text>
          </TouchableOpacity>
          {medicalDocuments.length > 0 && (
            <View style={styles.documentsContainer}>
              {medicalDocuments.map(renderDocumentItem)}
            </View>
          )}
        </View>

        {/* Insurance Card Upload */}
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
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickInsuranceCard}>
            <FontAwesome5 name="cloud-upload-alt" size={16} color="#fff" />
            <Text style={styles.uploadText}>Upload Insurance Card</Text>
          </TouchableOpacity>
          {insuranceCard && (
            <View style={styles.insuranceCardContainer}>
              <FontAwesome5 name="id-card" size={16} color="#007BFF" />
              <Text style={styles.documentName} numberOfLines={1}>
                {insuranceCard.name}
              </Text>
            </View>
          )}
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

        <View style={{height: 60}} />
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
    fontSize: 22,
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
    fontWeight: '600',
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
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  dateText: {
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
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
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
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default MedicalProfileFormScreen;
