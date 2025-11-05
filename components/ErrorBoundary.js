import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would log this to an error reporting service
    // Example: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
            style={styles.gradientBackground}
          >
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Error Icon */}
              <Text style={styles.errorIcon}>⚠️</Text>

              {/* Title */}
              <Text style={styles.title}>Oops! Something went wrong</Text>

              {/* Description */}
              <Text style={styles.description}>
                We encountered an unexpected error. Don't worry, your data is safe. Please try restarting the app.
              </Text>

              {/* Error Details (only in development) */}
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorDetailsTitle}>Error Details (Dev Only):</Text>
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>
                      {this.state.error.toString()}
                    </Text>
                  </View>
                  {this.state.errorInfo && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.button}
                onPress={this.handleReset}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>TRY AGAIN</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  // In production, navigate to support or home
                  this.handleReset();
                }}
              >
                <Text style={styles.secondaryButtonText}>Contact Support</Text>
              </TouchableOpacity>

              {/* Tips */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Common fixes:</Text>
                <Text style={styles.tipItem}>• Close and reopen the app</Text>
                <Text style={styles.tipItem}>• Check your internet connection</Text>
                <Text style={styles.tipItem}>• Clear app cache in settings</Text>
                <Text style={styles.tipItem}>• Update to the latest version</Text>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorDetails: {
    width: '100%',
    marginBottom: 24,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    maxHeight: 200,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
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
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '700',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 24,
  },
});
