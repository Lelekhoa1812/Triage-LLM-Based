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

// Current handle API from HF (FastAPI)
const BASE_URL = 'https://binkhoale1812-triage-llm.hf.space';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

const handleSignup = async () => {
  if (!name || !email || !password) {
    setError('Please fill in all fields');
    return;
  }
  // Dummy bypass, must be in=comment
  navigation.navigate('OtpVerificationScreen', {
        user_id: '01nng1234',
        username: name,
        password: password,
  });
//  setIsLoading(true);
//  setError('');
//  try {
//    const res = await fetch(`${BASE_URL}/register`, {
//      method: 'POST',
//      headers: {'Content-Type': 'application/json'},
//      body: JSON.stringify({
//        username: name,
//        password: password,
//        user_id: '', // Handle on backend-side
//      }),
//    });
//    const result = await res.json();
//    if (res.ok && result.status === 'success') {
//      navigation.navigate('OtpVerificationScreen', {
//        user_id: result.user_id,
//        username: name,
//        password: password,
//      });
//    } else {
//      setError(result.message || 'Signup failed');
//    }
//  } catch (err) {
//    setError('Unable to sign up. Try again later.');
//  } finally {
//    setIsLoading(false);
//  }
};

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('PhoneNumberScreen');
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
            <Text fontWeight="bold" style={styles.title}>
              Create Account
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, {fontFamily: 'Inter-Regular'}]}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, {fontFamily: 'Inter-Regular'}]}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[styles.input, {fontFamily: 'Inter-Regular'}]}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text fontWeight="semi-bold" style={styles.buttonText}>
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignup}
              disabled={isLoading}>
              <Image
                source={require('../../assets/images/google-icon.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  title: {
    fontSize: 24,
    color: '#333',
    marginTop: 10,
    fontFamily: 'Inter-SemiBold',
  },
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
  buttonText: {color: '#fff', fontSize: 16, fontFamily: 'Inter-SemiBold'},
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  googleIcon: {width: 24, height: 24, marginRight: 10},
  googleButtonText: {color: '#333', fontSize: 16},
  footer: {flexDirection: 'row', justifyContent: 'center', marginTop: 20},
  footerText: {color: '#666', fontSize: 14},
  linkText: {color: '#007AFF', fontSize: 14},
});

export default SignupScreen;
