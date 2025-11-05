import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function VerifyCodeScreen({ email, onBackPress, onCodeVerified }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);

  // Refs for each input
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Enable resend after 30 seconds
  useEffect(() => {
    if (timeLeft <= 570) { // After 30 seconds (600 - 30 = 570)
      setResendDisabled(false);
    }
  }, [timeLeft]);

  const handleCodeChange = (text, index) => {
    // Only allow digits
    const sanitized = text.replace(/[^0-9]/g, '');

    if (sanitized.length === 0) {
      // Handle backspace
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);

      // Focus previous input
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else if (sanitized.length === 1) {
      // Handle single digit
      const newCode = [...code];
      newCode[index] = sanitized;
      setCode(newCode);

      // Focus next input
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      // Handle paste of multiple digits
      const digits = sanitized.slice(0, 6).split('');
      const newCode = [...code];

      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newCode[index + i] = digits[i];
      }

      setCode(newCode);

      // Focus appropriate next input
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = () => {
    const enteredCode = code.join('');

    if (enteredCode.length !== 6) {
      Alert.alert('Incomplete Code', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);

    // Simulate code verification
    setTimeout(() => {
      setLoading(false);

      // In a real app, verify code with backend
      // For now, accept any 6-digit code
      Alert.alert(
        'Code Verified',
        'Your verification code has been confirmed. You can now reset your password.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onCodeVerified) {
                onCodeVerified(email, enteredCode);
              }
            },
          },
        ]
      );
    }, 1500);
  };

  const handleResendCode = () => {
    if (resendDisabled) return;

    Alert.alert(
      'Resend Code',
      `Send a new verification code to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            // Reset timer
            setTimeLeft(600);
            setResendDisabled(true);

            // Clear code
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0].focus();

            Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
          },
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit.length > 0 && styles.codeInputFilled,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerIcon}>⏱️</Text>
            <Text style={[styles.timerText, timeLeft <= 60 && styles.timerTextWarning]}>
              Code expires in {formatTime(timeLeft)}
            </Text>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyCode}
            activeOpacity={0.8}
            disabled={loading || code.join('').length !== 6}
          >
            <LinearGradient
              colors={
                loading || code.join('').length !== 6
                  ? ['#666', '#444']
                  : ['#8B5CF6', '#EC4899']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? 'VERIFYING...' : 'VERIFY CODE'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={resendDisabled}
            >
              <Text style={[styles.resendLink, resendDisabled && styles.resendLinkDisabled]}>
                Resend
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Check your spam folder if you don't see the email. Make sure you entered the correct email address.
            </Text>
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
  },
  emailText: {
    color: '#EC4899',
    fontWeight: '700',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  timerTextWarning: {
    color: '#F59E0B',
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#EC4899',
    fontSize: 14,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    color: '#444',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
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
});
