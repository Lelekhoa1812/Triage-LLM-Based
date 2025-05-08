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

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
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
            <Text style={[styles.title, styles.bold]}>
              Forgot your password?
            </Text>
          </View>

          {sent ? (
            <View style={styles.success}>
              <Text style={styles.successText}>
                We've sent you an email with instructions to reset your
                password.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={[styles.buttonText, styles.semiBold]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                style={[styles.input, {fontFamily: 'Inter-Regular'}]}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.buttonText, styles.semiBold]}>
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}
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
  success: {alignItems: 'center', gap: 20},
  successText: {fontSize: 16, color: '#333', textAlign: 'center'},
});

export default ForgotPasswordScreen;
