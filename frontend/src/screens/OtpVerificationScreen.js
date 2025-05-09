import React, {useState, useRef} from 'react';
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

const OtpVerificationScreen = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);

  const handleVerify = () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    const dummyOtp = '123456';
    setTimeout(() => {
      setIsLoading(false);
      if (otp === dummyOtp) {
        navigation.navigate('Main');
      } else {
        setError('Invalid OTP');
      }
    }, 1000);
  };

  const handleOtpChange = text => {
    setOtp(text);
    setFocusedIndex(text.length < 6 ? text.length : 5);
  };

  const handleFocus = () => {
    setFocusedIndex(otp.length < 6 ? otp.length : 5);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
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
            <Text style={[styles.title, styles.bold]}>Verify OTP</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.instruction}>
              Enter the 6-digit code sent to your phone
            </Text>

            <View style={styles.otpContainer}>
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      focusedIndex === index && styles.otpBoxFocused,
                      error && styles.otpBoxError,
                    ]}>
                    <Text style={styles.otpText}>{otp[index] || ''}</Text>
                  </View>
                ))}
            </View>

            <TextInput
              ref={inputRef}
              style={[styles.hiddenInput, {fontFamily: 'Inter-Regular'}]}
              keyboardType="number-pad"
              value={otp}
              onChangeText={handleOtpChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              maxLength={6}
              autoFocus
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.semiBold]}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.navigate('LoginScreen')}>
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
  bold: {fontWeight: 'bold'},
  semiBold: {fontWeight: '600'},
  form: {gap: 15},
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  otpBoxFocused: {
    borderColor: '#99ddff',
    borderWidth: 2,
  },
  otpBoxError: {
    borderColor: 'red',
  },
  otpText: {
    fontSize: 20,
    color: '#333',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: 50,
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
});

export default OtpVerificationScreen;
