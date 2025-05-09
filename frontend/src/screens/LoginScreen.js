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

const LoginScreen = () => {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

const handleLogin = () => {
  if (!identifier || !password) {
    setError('Please fill in all fields');
    return;
  }
  setIsLoading(true);
  setError('');
  fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: identifier, // could be either email or username
      password: password,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      setIsLoading(false);
      if (result.status === 'success') {
        navigation.navigate('Main');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    })
    .catch((err) => {
      setIsLoading(false);
      setError('Network error');
      console.error(err);
    });
};

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('OtpVerificationScreen');
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
            <Text style={styles.title}>Welcome Back</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, {fontFamily: 'Inter-Regular'}]}
              placeholder="Username or email"
              keyboardType="identifier"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
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
              style={styles.link}
              onPress={() => navigation.navigate('ForgotPasswordScreen')}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}>
              <Image
                source={require('../../assets/images/google-icon.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignupScreen')}>
                <Text style={styles.linkText}>Sign Up</Text>
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
  title: {fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10},
  form: {gap: 15},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {color: 'red', fontSize: 12},
  link: {alignSelf: 'flex-end'},
  linkText: {color: '#007AFF', fontSize: 14},
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonDisabled: {backgroundColor: '#999'},
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
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
});

export default LoginScreen;
