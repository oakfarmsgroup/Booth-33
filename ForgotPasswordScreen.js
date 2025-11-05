import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { isValidEmail } from './utils/validation';

export default function ForgotPasswordScreen({ onBackPress, onCodeSent }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    setTouched(true);

    // Validate email
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    // Simulate sending verification code
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Code Sent',
        `A verification code has been sent to ${email}. Please check your inbox.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onCodeSent) {
                onCodeSent(email);
              }
            },
          },
        ]
      );
    }, 1500);
  };

  const handleBlur = () => {
    setTouched(true);
    if (!isValidEmail(email) && email.length > 0) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoGlowWrapper}>
            <View style={styles.logoContainer}>
              <Image
                source={require('./assets/images/Artist.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we'll send you a verification code to reset your password.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, touched && error && styles.inputError]}
              placeholder="Email Address"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              onBlur={handleBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {touched && error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              You'll receive a 6-digit verification code via email. The code will be valid for 10 minutes.
            </Text>
          </View>

          {/* Send Code Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendCode}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#666', '#444'] : ['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? 'SENDING...' : 'SEND VERIFICATION CODE'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={onBackPress}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  logoGlowWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#EC4899',
    fontSize: 14,
    fontWeight: '700',
  },
});
