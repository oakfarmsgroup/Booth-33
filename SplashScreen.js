import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ onComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-complete after delay
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo with Glow */}
          <Animated.View
            style={[
              styles.logoGlowWrapper,
              {
                shadowOpacity: glowOpacity,
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('./assets/images/Booth_33.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* App Name */}
          <Text style={styles.appName}>BOOTH 33</Text>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Book. Create. Connect.</Text>
          </View>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingDot,
                { opacity: glowOpacity },
              ]}
            />
            <Animated.View
              style={[
                styles.loadingDot,
                {
                  opacity: glowOpacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.loadingDot,
                {
                  opacity: glowOpacity,
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Version */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
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
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlowWrapper: {
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    elevation: 20,
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 3,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 240,
    height: 240,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 6,
    marginBottom: 12,
  },
  taglineContainer: {
    marginBottom: 40,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EC4899',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  version: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});
