import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../contexts/AudioContext';
import Slider from '@react-native-community/slider';
import SettingsModal from './SettingsModal';
import { Vibration } from 'react-native';

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    togglePlayPause,
    seekTo,
    playNext,
    playPrevious,
    stopPlayback,
    repeatMode,
    sleepTimerRemaining,
    isFavorite,
  } = useAudio();

  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Slide in/out animation
  useEffect(() => {
    if (currentTrack) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentTrack]);

  // Pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!duration) return 0;
    return position / duration;
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Mini Player Bar */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowFullPlayer(true)}
          style={styles.touchableContainer}
        >
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgress() * 100}%` }]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Track Info */}
              <Animated.View style={[styles.trackInfo, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.trackIcon}>🎵</Text>
                <View style={styles.trackDetails}>
                  <Text style={styles.trackName} numberOfLines={1}>
                    {currentTrack.audioFile || currentTrack.name || 'Unknown Track'}
                  </Text>
                  <Text style={styles.trackTime}>
                    {formatTime(position)} / {formatTime(duration)}
                  </Text>
                </View>
              </Animated.View>

              {/* Controls */}
              <View style={styles.controls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    playPrevious();
                  }}
                >
                  <View style={styles.skipBackIcon}>
                    <View style={styles.skipLine} />
                    <View style={styles.skipTriangle} />
                    <View style={styles.skipTriangle} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                >
                  {isPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  ) : (
                    <View style={styles.playIcon} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    playNext();
                  }}
                >
                  <View style={styles.skipForwardIcon}>
                    <View style={styles.skipTriangleForward} />
                    <View style={styles.skipTriangleForward} />
                    <View style={styles.skipLine} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    stopPlayback();
                  }}
                >
                  <Text style={styles.closeIcon}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Full Player Modal */}
      <Modal
        visible={showFullPlayer}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowFullPlayer(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowFullPlayer(false)}
              >
                <Text style={styles.backIcon}>&lt;</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Now Playing</Text>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setShowSettings(true)}
              >
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Album Art / Track Visual */}
              <View style={styles.albumArt}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.albumGradient}
                >
                  <Text style={styles.albumIcon}>🎵</Text>
                </LinearGradient>
              </View>

              {/* Track Info */}
              <View style={styles.modalTrackInfo}>
                <Text style={styles.modalTrackName}>
                  {currentTrack.audioFile || currentTrack.name || 'Unknown Track'}
                </Text>
                <Text style={styles.modalArtist}>
                  {currentTrack.user || 'Unknown Artist'}
                </Text>
              </View>

              {/* Progress Slider */}
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration || 180000}
                  value={position}
                  onSlidingComplete={seekTo}
                  minimumTrackTintColor="#8B5CF6"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                  thumbTintColor="#EC4899"
                />
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{formatTime(position)}</Text>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>

              {/* Main Controls */}
              <View style={styles.modalControls}>
                <TouchableOpacity style={styles.modalControlButton} onPress={() => { Vibration.vibrate(10); playPrevious(); }}>
                  <View style={styles.skipBackIconLarge}>
                    <View style={styles.skipLineLarge} />
                    <View style={styles.skipTriangleLarge} />
                    <View style={styles.skipTriangleLarge} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.playButtonLarge} onPress={() => { Vibration.vibrate(10); togglePlayPause(); }}>
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.playButtonGradient}
                  >
                    {isPlaying ? (
                      <View style={styles.pauseIconLarge}>
                        <View style={styles.pauseBarLarge} />
                        <View style={styles.pauseBarLarge} />
                      </View>
                    ) : (
                      <View style={styles.playIconLarge} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalControlButton} onPress={() => { Vibration.vibrate(10); playNext(); }}>
                  <View style={styles.skipForwardIconLarge}>
                    <View style={styles.skipTriangleForwardLarge} />
                    <View style={styles.skipTriangleForwardLarge} />
                    <View style={styles.skipLineLarge} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Status Indicators */}
              <View style={styles.statusIndicators}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Repeat: {repeatMode}</Text>
                </View>
                {sleepTimerRemaining > 0 && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Sleep: {sleepTimerRemaining}s</Text>
                  </View>
                )}
                {currentTrack?.id && isFavorite(currentTrack.id) && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>? Favorited</Text>
                  </View>
                )}
              </View>

              {/* Settings Modal */}
              <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 85,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  touchableContainer: {
    width: '100%',
  },
  gradient: {
    padding: 12,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  trackIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  trackDetails: {
    flex: 1,
  },
  trackName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  trackTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 14,
    borderRightWidth: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  pauseBar: {
    width: 5,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  modalGradient: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Album Art
  albumArt: {
    height: 360,
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  albumGradient: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumIcon: {
    fontSize: 64,
    color: '#FFFFFF',
  },

  // Modal Track Info
  modalTrackInfo: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  modalTrackName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  modalArtist: {
    fontSize: 14,
    color: '#999',
  },

  // Slider / Time
  sliderContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#999',
    fontSize: 12,
  },

  // Modal Controls
  modalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  modalControlButton: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconLarge: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 18,
    borderRightWidth: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 6,
  },
  pauseIconLarge: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pauseBarLarge: {
    width: 6,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  // Custom Skip Button Styles (Mini Player)
  skipBackIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  skipForwardIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  skipLine: {
    width: 2,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  skipTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 0,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  skipTriangleForward: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  // Custom Skip Button Styles (Full Modal)
  skipBackIconLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  skipForwardIconLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  skipLineLarge: {
    width: 3,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  skipTriangleLarge: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 0,
    borderRightWidth: 9,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  skipTriangleForwardLarge: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 9,
    borderRightWidth: 0,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  // Settings Button
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },

  // Status Indicators
  statusIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});
