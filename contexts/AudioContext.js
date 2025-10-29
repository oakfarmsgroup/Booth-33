import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // New features
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'one', 'all'
  const [sleepTimer, setSleepTimer] = useState(null); // { minutes: number, startTime: timestamp }
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0); // seconds
  const [eqPreset, setEqPreset] = useState('studio'); // 'studio', 'bass', 'vocal', 'treble', 'podcast'
  const [favorites, setFavorites] = useState(new Set()); // Set of track IDs

  const soundRef = useRef(null);
  const positionInterval = useRef(null);
  const sleepTimerInterval = useRef(null);

  // Configure audio mode on mount
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.log('Error configuring audio:', error);
      }
    };
    configureAudio();
  }, []);

  // Update position periodically
  useEffect(() => {
    if (isPlaying && soundRef.current) {
      positionInterval.current = setInterval(async () => {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);

            // Auto-play next track when current ends
            if (status.didJustFinish) {
              playNext();
            }
          }
        } catch (error) {
          console.log('Error getting status:', error);
        }
      }, 100);
    } else {
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
      }
    }

    return () => {
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
      }
    };
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playTrack = async (track, index = null) => {
    try {
      setIsLoading(true);

      // Stop current track if playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Update current index deterministically
      if (typeof index === 'number') {
        setCurrentIndex(index);
      } else {
        const trackIndex = queue.findIndex(t => t.id === track.id);
        if (trackIndex !== -1) {
          setCurrentIndex(trackIndex);
        }
      }

      // In a real app, you'd load the actual audio file
      // For now, we'll simulate with expo-av
      // const { sound } = await Audio.Sound.createAsync(
      //   { uri: track.audioUrl },
      //   { shouldPlay: true, volume, rate: playbackSpeed }
      // );

      // Since we don't have real audio files, we'll simulate
      setCurrentTrack(track);
      setIsPlaying(true);
      setPosition(0);
      // Simulate duration (3 minutes)
      setDuration(180000);
      setIsLoading(false);

      // Uncomment when using real audio:
      // soundRef.current = sound;
      // const status = await sound.getStatusAsync();
      // if (status.isLoaded) {
      //   setDuration(status.durationMillis || 0);
      // }
    } catch (error) {
      console.log('Error playing track:', error);
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!currentTrack) return;

      if (isPlaying) {
        // Pause
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
        setIsPlaying(false);
      } else {
        // Play
        if (soundRef.current) {
          await soundRef.current.playAsync();
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Error toggling playback:', error);
    }
  };

  const seekTo = async (positionMillis) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(positionMillis);
      }
      setPosition(positionMillis);
    } catch (error) {
      console.log('Error seeking:', error);
    }
  };

  const changeVolume = async (newVolume) => {
    try {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolume(clampedVolume);
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(clampedVolume);
      }
    } catch (error) {
      console.log('Error changing volume:', error);
    }
  };

  const changePlaybackSpeed = async (speed) => {
    try {
      const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
      setPlaybackSpeed(clampedSpeed);
      if (soundRef.current) {
        await soundRef.current.setRateAsync(clampedSpeed, true);
      }
    } catch (error) {
      console.log('Error changing speed:', error);
    }
  };

  const stopPlayback = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTrack(null);
      setPosition(0);
      setDuration(0);
    } catch (error) {
      console.log('Error stopping playback:', error);
    }
  };

  const addToQueue = (tracks) => {
    if (Array.isArray(tracks)) {
      setQueue(prev => [...prev, ...tracks]);
    } else {
      setQueue(prev => [...prev, tracks]);
    }
  };

  const playNext = async () => {
    // Handle repeat one mode - replay current track
    if (repeatMode === 'one' && currentTrack) {
      await seekTo(0);
      if (!isPlaying) {
        await togglePlayPause();
      }
      return;
    }

    // Handle queue navigation
    const n = queue.length;
    if (n === 0) {
      // No queue - do nothing, stay on current track
      console.log('No next track in queue');
      return;
    }

    if (currentIndex < n - 1) {
      const nextIndex = currentIndex + 1;
      await playTrack(queue[nextIndex], nextIndex);
    } else if (repeatMode === 'all') {
      // Loop back to beginning of queue when repeat all is on
      await playTrack(queue[0], 0);
    } else {
      // At end of queue - stop playback
      setIsPlaying(false);
      console.log('End of queue reached');
    }
  };

  const playPrevious = async () => {
    const n = queue.length;
    if (n === 0) {
      console.log('No previous track available');
      return;
    }
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      await playTrack(queue[prevIndex], prevIndex);
    } else if (repeatMode === 'all') {
      const lastIndex = n - 1;
      await playTrack(queue[lastIndex], lastIndex);
    } else {
      console.log('At beginning of queue');
    }
  };

  const playFromQueue = async (index) => {
    if (queue[index]) {
      await playTrack(queue[index], index);
    }
  };

  const removeFromQueue = (index) => {
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (index === currentIndex) {
      // If removing current track, stop playback
      stopPlayback();
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
  };

  const isInQueue = (trackId) => {
    return queue.some(track => track.id === trackId);
  };

  const toggleTrackInQueue = (track) => {
    const inQueue = isInQueue(track.id);
    if (inQueue) {
      // Remove from queue
      const newQueue = queue.filter(t => t.id !== track.id);
      setQueue(newQueue);
      // Adjust current index if needed
      if (currentTrack?.id === track.id) {
        // Don't remove currently playing track
        return false;
      }
      const trackIndex = queue.findIndex(t => t.id === track.id);
      if (trackIndex < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      }
    } else {
      // Add to queue
      setQueue([...queue, track]);
    }
    return !inQueue; // Return new state
  };

  // Repeat Mode Functions
  const toggleRepeatMode = () => {
    const modes = ['off', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const cycleRepeatMode = () => {
    if (repeatMode === 'off') setRepeatMode('one');
    else if (repeatMode === 'one') setRepeatMode('all');
    else setRepeatMode('off');
  };

  // Sleep Timer Functions
  const startSleepTimer = (minutes) => {
    const startTime = Date.now();
    setSleepTimer({ minutes, startTime });
    setSleepTimerRemaining(minutes * 60);

    // Start countdown
    if (sleepTimerInterval.current) {
      clearInterval(sleepTimerInterval.current);
    }

    sleepTimerInterval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = (minutes * 60) - elapsed;

      if (remaining <= 0) {
        stopPlayback();
        cancelSleepTimer();
      } else {
        setSleepTimerRemaining(remaining);

        // Fade out volume in last 10 seconds
        if (remaining <= 10 && remaining > 0) {
          const fadeVolume = remaining / 10;
          changeVolume(fadeVolume);
        }
      }
    }, 1000);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerInterval.current) {
      clearInterval(sleepTimerInterval.current);
      sleepTimerInterval.current = null;
    }
    setSleepTimer(null);
    setSleepTimerRemaining(0);
    // Restore volume if it was faded
    if (volume < 1.0) {
      changeVolume(1.0);
    }
  };

  // EQ Preset Functions
  const changeEqPreset = (preset) => {
    setEqPreset(preset);
    // In a real implementation, you would apply audio effects here
    console.log(`EQ preset changed to: ${preset}`);
  };

  // Favorites Functions
  const toggleFavorite = (trackId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  const isFavorite = (trackId) => {
    return favorites.has(trackId);
  };

  const value = {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    playbackSpeed,
    queue,
    currentIndex,
    isLoading,
    playTrack,
    togglePlayPause,
    seekTo,
    changeVolume,
    changePlaybackSpeed,
    stopPlayback,
    addToQueue,
    playNext,
    playPrevious,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    isInQueue,
    toggleTrackInQueue,
    // New features
    repeatMode,
    toggleRepeatMode,
    cycleRepeatMode,
    sleepTimer,
    sleepTimerRemaining,
    startSleepTimer,
    cancelSleepTimer,
    eqPreset,
    changeEqPreset,
    favorites,
    toggleFavorite,
    isFavorite,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
