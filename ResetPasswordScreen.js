import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { validatePassword, getPasswordStrength } from './utils/validation';

export default function ResetPasswordScreen({ email, onResetSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = () => {
    const newErrors = {};

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ password: true, confirmPassword: true });
      Alert.alert('Validation Error', Object.values(newErrors)[0]);
      return;
    }

    setErrors({});
    setLoading(true);

    // Simulate password reset
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onResetSuccess) {
                onResetSuccess();
              }
            },
          },
        ]
      );
    }, 1500);
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });

    if (field === 'password') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setErrors({ ...errors, password: passwordValidation.errors[0] });
      } else {
        const newErrors = { ...errors };
        delete newErrors.password;
        setErrors(newErrors);
      }
    }

    if (field === 'confirmPassword') {
      if (password !== confirmPassword) {
        setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.confirmPassword;
        setErrors(newErrors);
      }
    }
  };

  const passwordStrength = password.length > 0 ? getPasswordStrength(password) : null;

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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Create a strong new password for{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          {/* Password Requirements */}
          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementItem}>• At least 8 characters</Text>
            <Text style={styles.requirementItem}>• One uppercase letter (A-Z)</Text>
            <Text style={styles.requirementItem}>• One lowercase letter (a-z)</Text>
            <Text style={styles.requirementItem}>• One number (0-9)</Text>
          </View>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, touched.password && errors.password && styles.inputError]}
                placeholder="New Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                onBlur={() => handleBlur('password')}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            {passwordStrength && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width:
                          passwordStrength.level === 'weak'
                            ? '33%'
                            : passwordStrength.level === 'medium'
                            ? '66%'
                            : '100%',
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}

            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, touched.confirmPassword && errors.confirmPassword && styles.inputError]}
                placeholder="Confirm New Password"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => handleBlur('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
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
                {loading ? 'RESETTING...' : 'RESET PASSWORD'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Security Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoText}>
              For your security, you'll be automatically signed out from all devices after resetting your password.
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
    marginBottom: 30,
    lineHeight: 22,
  },
  emailText: {
    color: '#EC4899',
    fontWeight: '700',
  },
  requirementsBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    color: '#CCC',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '700',
    width: 60,
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
