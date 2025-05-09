import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

const PhoneNumberScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!phone || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('MedicalProfileFormScreen');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
            <Text style={[styles.title, styles.bold]}>Enter Phone Number</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, {fontFamily: 'Inter-Regular'}]}
              placeholder="Phone Number (10 digits)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.semiBold]}>Submit</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.navigate('SignupScreen')} // adjust if needed
            >
              <Text style={styles.linkText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  flex: {flex: 1},
  scrollContent: {flexGrow: 1, padding: 20, justifyContent: 'center'},
  logoContainer: {alignItems: 'center', marginBottom: 40},
  logo: {width: 300, height: 250},
  title: {fontSize: 24, color: '#333', marginTop: 10},
  form: {gap: 15},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {color: 'red', fontSize: 12},
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {backgroundColor: '#999'},
  buttonText: {color: '#fff', fontSize: 16},
  backLink: {alignSelf: 'center', marginTop: 20},
  linkText: {color: '#007AFF', fontSize: 14},
  bold: {fontWeight: 'bold'},
  semiBold: {fontWeight: '600'},
});

export default PhoneNumberScreen;
