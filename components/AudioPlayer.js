import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../contexts/AudioContext';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export default function AudioPlayer({ track, compact = false, showQueue = false, onPlay = null }) {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    playbackSpeed,
    playTrack,
    togglePlayPause,
    seekTo,
    changeVolume,
    changePlaybackSpeed,
    playNext,
    playPrevious,
    isLoading,
  } = useAudio();

  const [showControls, setShowControls] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const pulseAnim = new Animated.Value(1);

  const isCurrentTrack = currentTrack?.id === track?.id;
  const isCurrentPlaying = isCurrentTrack && isPlaying;

  // Generate random waveform data for visualization
  useEffect(() => {
    const bars = compact ? 30 : 50;
    const data = Array.from({ length: bars }, () => Math.random() * 0.5 + 0.5);
    setWaveformData(data);
  }, [compact]);

  // Pulse animation when playing
  useEffect(() => {
    if (isCurrentPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCurrentPlaying]);

  const handlePlayPause = async () => {
    if (isCurrentTrack) {
      await togglePlayPause();
    } else {
      // Use custom onPlay handler if provided, otherwise use default
      if (onPlay) {
        await onPlay(track);
      } else {
        await playTrack(track);
      }
    }
  };

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!isCurrentTrack || !duration) return 0;
    return position / duration;
  };

  if (compact) {
    // Compact player for feed posts
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={handlePlayPause}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isCurrentPlaying ? ['#8B5CF6', '#EC4899'] : ['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.compactGradient}
        >
          {/* Waveform Background */}
          <View style={styles.compactWaveform}>
            {waveformData.map((height, index) => {
              const progress = getProgress();
              const barProgress = index / waveformData.length;
              const isActive = barProgress <= progress;

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height: `${height * 100}%`,
                      backgroundColor: isActive
                        ? 'rgba(255, 255, 255, 0.9)'
                        : 'rgba(255, 255, 255, 0.3)',
                      transform: isCurrentPlaying && isActive ? [{ scale: pulseAnim }] : [],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Content */}
          <View style={styles.compactContent}>
            {/* Play Button Indicator (visual only, whole container is tappable) */}
            <View style={styles.compactPlayButton}>
              {isLoading && isCurrentTrack ? (
                <View style={styles.loadingSpinner}>
                  <Text style={styles.loadingText}>...</Text>
                </View>
              ) : isCurrentPlaying ? (
                <View style={styles.pauseIconSmall}>
                  <View style={styles.pauseBarSmall} />
                  <View style={styles.pauseBarSmall} />
                </View>
              ) : (
                <View style={styles.playIconSmall} />
              )}
            </View>

            {/* Track Info */}
            <View style={styles.compactInfo}>
              <Text style={styles.compactFileName} numberOfLines={1}>
                {track?.audioFile || track?.name || 'Unknown Track'}
              </Text>
              <Text style={styles.compactDuration}>
                {isCurrentTrack ? formatTime(position) : formatTime(track?.durationMillis || 180000)} / {formatTime(track?.durationMillis || 180000)}
              </Text>
            </View>

            {/* Audio Icon */}
            <Text style={styles.compactIcon}>🎵</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Full player for detailed view
  return (
    <View style={styles.fullContainer}>
      <LinearGradient
        colors={['#1A1A1A', '#2D1B3D']}
        style={styles.fullGradient}
      >
        {/* Waveform Visualization */}
        <View style={styles.fullWaveform}>
          {waveformData.map((height, index) => {
            const progress = getProgress();
            const barProgress = index / waveformData.length;
            const isActive = barProgress <= progress;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.waveBarFull,
                  {
                    height: `${height * 100}%`,
                    backgroundColor: isActive
                      ? '#8B5CF6'
                      : 'rgba(255, 255, 255, 0.2)',
                    transform: isCurrentPlaying && isActive ? [{ scaleY: pulseAnim }] : [],
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(isCurrentTrack ? position : 0)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 180000}
            value={isCurrentTrack ? position : 0}
            onSlidingComplete={seekTo}
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
            thumbTintColor="#EC4899"
            disabled={!isCurrentTrack}
          />
          <Text style={styles.timeText}>{formatTime(duration || 180000)}</Text>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={playPrevious}
            disabled={!isCurrentTrack}
          >
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButtonLarge}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playButtonGradient}
            >
              {isLoading && isCurrentTrack ? (
                <Text style={styles.loadingTextLarge}>...</Text>
              ) : isCurrentPlaying ? (
                <View style={styles.pauseIconLarge}>
                  <View style={styles.pauseBarLarge} />
                  <View style={styles.pauseBarLarge} />
                </View>
              ) : (
                <View style={styles.playIconLarge} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={playNext}
            disabled={!isCurrentTrack}
          >
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Controls Toggle */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowControls(!showControls)}
        >
          <Text style={styles.moreText}>
            {showControls ? 'Hide Controls ▲' : 'More Controls ▼'}
          </Text>
        </TouchableOpacity>

        {/* Volume & Speed Controls */}
        {showControls && (
          <View style={styles.additionalControls}>
            {/* Volume */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>🔊 Volume</Text>
              <Slider
                style={styles.controlSlider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={changeVolume}
                minimumTrackTintColor="#8B5CF6"
                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                thumbTintColor="#EC4899"
              />
              <Text style={styles.controlValue}>{Math.round(volume * 100)}%</Text>
            </View>

            {/* Playback Speed */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>⚡ Speed</Text>
              <View style={styles.speedButtons}>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.speedButton,
                      playbackSpeed === speed && styles.speedButtonActive,
                    ]}
                    onPress={() => changePlaybackSpeed(speed)}
                  >
                    <Text
                      style={[
                        styles.speedButtonText,
                        playbackSpeed === speed && styles.speedButtonTextActive,
                      ]}
                    >
                      {speed}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact Player Styles
  compactContainer: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  compactGradient: {
    position: 'relative',
    height: 80,
  },
  compactWaveform: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    opacity: 0.3,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    position: 'relative',
    zIndex: 1,
  },
  compactPlayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  playIconSmall: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 14,
    borderRightWidth: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  pauseIconSmall: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBarSmall: {
    width: 4,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  compactInfo: {
    flex: 1,
  },
  compactFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  compactDuration: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  compactIcon: {
    fontSize: 28,
    marginLeft: 8,
  },

  // Full Player Styles
  fullContainer: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  fullGradient: {
    padding: 20,
  },
  fullWaveform: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  waveBarFull: {
    width: 4,
    borderRadius: 2,
    minHeight: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    minWidth: 40,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  playButtonLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginHorizontal: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTextLarge: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  playIconLarge: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  pauseIconLarge: {
    flexDirection: 'row',
    gap: 6,
  },
  pauseBarLarge: {
    width: 6,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  moreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  moreText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  additionalControls: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  controlRow: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  controlSlider: {
    width: '100%',
    marginBottom: 4,
  },
  controlValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  speedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  speedButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
  },
  speedButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  speedButtonTextActive: {
    color: '#FFFFFF',
  },
});
