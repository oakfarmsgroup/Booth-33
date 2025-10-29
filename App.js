import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import MainApp from './MainApp';
import AdminLoginScreen from './AdminLoginScreen';
import AdminMainApp from './AdminMainApp';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome', 'login', 'signup', 'main', 'adminLogin', or 'admin'

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
          style={styles.gradientBackground}
        >
          {/* Logo */}
          <View style={styles.logoGlowWrapper}>
            <View style={styles.logoContainer}>
              <Image
                source={require('./assets/images/Booth_33.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Book. Create. Connect.</Text>
          </View>

          {/* Accent Line */}
          <View style={styles.accentLine} />

          {/* Get Started Button */}
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={() => setCurrentScreen('login')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>GET STARTED</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom accent */}
          <View style={styles.bottomAccent}>
            <View style={styles.glowDot} />
            <View style={[styles.glowDot, { marginHorizontal: 20 }]} />
            <View style={styles.glowDot} />
          </View>

          {/* Admin Link */}
          <TouchableOpacity 
            style={styles.adminLink}
            onPress={() => setCurrentScreen('adminLogin')}
          >
            <Text style={styles.adminLinkText}>Admin Portal ></Text>
          </TouchableOpacity>

        </LinearGradient>
        <StatusBar style="light" />
      </View>
    );
  }

  // Admin Login Screen
  if (currentScreen === 'adminLogin') {
    return (
      <>
        <AdminLoginScreen 
          onBackPress={() => setCurrentScreen('welcome')}
          onAdminLoginSuccess={() => setCurrentScreen('admin')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  // Admin Dashboard
  if (currentScreen === 'admin') {
    return <AdminMainApp onLogout={() => setCurrentScreen('welcome')} />;
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <>
        <LoginScreen 
          onBackPress={() => setCurrentScreen('welcome')}
          onSignUpPress={() => setCurrentScreen('signup')}
          onLoginSuccess={() => setCurrentScreen('main')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  // Sign Up Screen
  if (currentScreen === 'signup') {
    return (
      <>
        <SignUpScreen 
          onBackPress={() => setCurrentScreen('login')}
          onSignUpSuccess={() => setCurrentScreen('main')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  // Main App (after login/signup)
  if (currentScreen === 'main') {
    return <MainApp onLogout={() => setCurrentScreen('welcome')} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  gradientBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoGlowWrapper: {
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  logoContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 320,
    height: 320,
  },
  taglineContainer: {
    marginBottom: 40,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EC4899',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  accentLine: {
    width: 100,
    height: 3,
    backgroundColor: '#F59E0B',
    marginBottom: 50,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  button: {
    width: '80%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  bottomAccent: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  glowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  adminLink: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  adminLinkText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
});

