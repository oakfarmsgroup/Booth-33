import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useAudio } from '../contexts/AudioContext';

export default function SettingsModal({ visible, onClose }) {
  const {
    volume,
    changeVolume,
    playbackSpeed,
    changePlaybackSpeed,
    repeatMode,
    cycleRepeatMode,
    sleepTimer,
    sleepTimerRemaining,
    startSleepTimer,
    cancelSleepTimer,
    eqPreset,
    changeEqPreset,
    currentTrack,
    toggleFavorite,
    isFavorite,
    queue,
    currentIndex,
    playFromQueue,
    removeFromQueue,
  } = useAudio();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (!currentTrack) return;
    try {
      await Share.share({
        message: `Check out this track: ${currentTrack.name || currentTrack.audioFile}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'off') return '🔁';
    if (repeatMode === 'one') return '🔂';
    return '🔁';
  };

  const getRepeatLabel = () => {
    if (repeatMode === 'off') return 'Off';
    if (repeatMode === 'one') return 'Repeat One';
    return 'Repeat All';
  };

  if (!visible) return null;

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.modalOverlay}
      onPress={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalContent}
        onPress={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Player Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* All Settings in One View */}
            <>
                {/* Volume Control */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🔊 Volume</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={changeVolume}
                    minimumTrackTintColor="#8B5CF6"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                    thumbTintColor="#EC4899"
                  />
                  <Text style={styles.valueText}>{Math.round(volume * 100)}%</Text>
                </View>

                {/* Playback Speed */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚡ Playback Speed</Text>
                  <View style={styles.speedGrid}>
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

                {/* Repeat Mode */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🔁 Repeat Mode</Text>
                  <TouchableOpacity style={styles.settingButton} onPress={cycleRepeatMode}>
                    <LinearGradient
                      colors={
                        repeatMode !== 'off'
                          ? ['#8B5CF6', '#EC4899']
                          : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.settingButtonGradient}
                    >
                      <Text style={styles.settingIcon}>{getRepeatIcon()}</Text>
                      <Text style={styles.settingLabel}>{getRepeatLabel()}</Text>
                      <Text style={styles.settingArrow}>›</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Sleep Timer */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⏱️ Sleep Timer</Text>
                  {sleepTimer ? (
                    <View>
                      <View style={styles.timerActive}>
                        <Text style={styles.timerText}>
                          ⏰ {formatTime(sleepTimerRemaining)} remaining
                        </Text>
                        <TouchableOpacity
                          style={styles.cancelTimerButton}
                          onPress={cancelSleepTimer}
                        >
                          <Text style={styles.cancelTimerText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.timerGrid}>
                      {[5, 10, 15, 30, 60].map((minutes) => (
                        <TouchableOpacity
                          key={minutes}
                          style={styles.timerButton}
                          onPress={() => startSleepTimer(minutes)}
                        >
                          <Text style={styles.timerButtonText}>
                            {minutes < 60 ? `${minutes}m` : '1h'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* EQ Presets */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎚️ EQ Preset</Text>
                  <View style={styles.eqGrid}>
                    {[
                      { id: 'studio', label: 'Studio', icon: '🎧' },
                      { id: 'bass', label: 'Bass Boost', icon: '🔊' },
                      { id: 'vocal', label: 'Vocal', icon: '🎤' },
                      { id: 'treble', label: 'Treble', icon: '🎵' },
                      { id: 'podcast', label: 'Podcast', icon: '🎙️' },
                    ].map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.eqButton,
                          eqPreset === preset.id && styles.eqButtonActive,
                        ]}
                        onPress={() => changeEqPreset(preset.id)}
                      >
                        <Text style={styles.eqButtonIcon}>{preset.icon}</Text>
                        <Text
                          style={[
                            styles.eqButtonText,
                            eqPreset === preset.id && styles.eqButtonTextActive,
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Share & Favorites */}
                {currentTrack && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📤 Actions</Text>

                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                      <LinearGradient
                        colors={['rgba(59, 130, 246, 0.2)', 'rgba(147, 51, 234, 0.2)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionButtonGradient}
                      >
                        <Text style={styles.actionIcon}>📤</Text>
                        <Text style={styles.actionText}>Share Track</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleFavorite(currentTrack.id)}
                    >
                      <LinearGradient
                        colors={
                          isFavorite(currentTrack.id)
                            ? ['#EC4899', '#F43F5E']
                            : ['rgba(236, 72, 153, 0.2)', 'rgba(244, 63, 94, 0.2)']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionButtonGradient}
                      >
                        <Text style={styles.actionIcon}>
                          {isFavorite(currentTrack.id) ? '❤️' : '🤍'}
                        </Text>
                        <Text style={styles.actionText}>
                          {isFavorite(currentTrack.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Queue Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📋 Up Next</Text>
                  {queue.length === 0 ? (
                    <View style={styles.emptyQueue}>
                      <Text style={styles.emptyQueueText}>No tracks in queue</Text>
                      <Text style={styles.emptyQueueSubtext}>
                        Tracks you play will appear here
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.queueList}>
                      {queue.map((track, index) => (
                        <View
                          key={index}
                          style={[
                            styles.queueItem,
                            index === currentIndex && styles.queueItemActive,
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.queueItemMain}
                            onPress={() => playFromQueue(index)}
                          >
                            <Text style={styles.queueItemIcon}>
                              {index === currentIndex ? '▶' : '🎵'}
                            </Text>
                            <Text
                              style={[
                                styles.queueItemText,
                                index === currentIndex && styles.queueItemTextActive,
                              ]}
                              numberOfLines={1}
                            >
                              {track.audioFile || track.name || 'Unknown Track'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.queueRemoveButton}
                            onPress={() => removeFromQueue(index)}
                          >
                            <Text style={styles.queueRemoveIcon}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </>

            <View style={{ height: 20 }} />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    height: '75%',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  speedButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
  },
  speedButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  speedButtonTextActive: {
    color: '#FFFFFF',
  },
  settingButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingArrow: {
    fontSize: 24,
    color: '#666',
  },
  timerActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  cancelTimerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelTimerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timerButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  timerButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eqGrid: {
    gap: 8,
  },
  eqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  eqButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
  },
  eqButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eqButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  eqButtonTextActive: {
    color: '#FFFFFF',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyQueue: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  emptyQueueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyQueueSubtext: {
    fontSize: 12,
    color: '#666',
  },
  queueList: {
    gap: 8,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  queueItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  queueItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  queueItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  queueItemText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  queueItemTextActive: {
    color: '#EC4899',
  },
  queueRemoveButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueRemoveIcon: {
    fontSize: 18,
    color: '#666',
  },
});
