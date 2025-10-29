import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Share, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../contexts/AudioContext';

export default function LibraryScreen() {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, addToQueue, clearQueue, playFromQueue, isInQueue, toggleTrackInQueue, toggleFavorite, isFavorite } = useAudio();
  const [selectedSession, setSelectedSession] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [collapsedSessions, setCollapsedSessions] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionNames, setSessionNames] = useState({});
  const [filterType, setFilterType] = useState('all'); // 'all', 'favorites', 'music', 'podcast', 'upload'

  // Example sessions data (will come from backend later)
  const sessions = [
    {
      id: 1,
      type: 'music',
      name: 'Summer Vibes EP',
      date: 'Oct 15, 2025',
      status: 'completed',
      isUpload: false,
      files: [
        { id: 1, name: 'Final_Mix_Master.mp3', type: 'audio', size: '8.4 MB', duration: '3:42' },
        { id: 2, name: 'Vocals_Only.wav', type: 'audio', size: '45.2 MB', duration: '3:42' },
        { id: 3, name: 'Instrumental.mp3', type: 'audio', size: '7.8 MB', duration: '3:42' },
      ],
    },
    {
      id: 2,
      type: 'podcast',
      name: 'Interview with Producer',
      date: 'Oct 8, 2025',
      status: 'completed',
      isUpload: false,
      files: [
        { id: 4, name: 'Episode_12_Final.mp3', type: 'audio', size: '52.1 MB', duration: '45:23' },
        { id: 5, name: 'Intro_Outro.mp3', type: 'audio', size: '2.3 MB', duration: '1:15' },
      ],
    },
    {
      id: 3,
      type: 'upload',
      name: 'Personal Collection',
      date: 'Oct 1, 2025',
      status: 'completed',
      isUpload: true,
      files: [
        { id: 8, name: 'My_Old_Track.mp3', type: 'audio', size: '5.2 MB', duration: '2:45' },
        { id: 9, name: 'Cover_Song.mp3', type: 'audio', size: '4.8 MB', duration: '3:12' },
      ],
    },
    {
      id: 4,
      type: 'music',
      name: 'Demo Recordings',
      date: 'Sep 28, 2025',
      status: 'completed',
      isUpload: false,
      files: [
        { id: 6, name: 'Demo_Track.mp3', type: 'audio', size: '6.2 MB', duration: '2:58' },
        { id: 7, name: 'Session_Video.mp4', type: 'video', size: '124.5 MB', duration: '12:34' },
      ],
    },
  ];

  // Auto-collapse sessions after the 3rd one on initial load
  React.useEffect(() => {
    const toCollapse = new Set();
    sessions.forEach((session, index) => {
      if (index >= 3) {
        toCollapse.add(session.id);
      }
    });
    setCollapsedSessions(toCollapse);
  }, []);

  // Filter sessions based on search and filter type
  const filteredSessions = sessions.filter(session => {
    // First, filter by type
    if (filterType !== 'all' && filterType !== 'favorites') {
      if (session.type !== filterType) return false;
    }

    // For favorites filter, check if session has any favorited files
    if (filterType === 'favorites') {
      const hasFavoriteFiles = session.files.some(file =>
        file.type === 'audio' && isFavorite(file.id)
      );
      if (!hasFavoriteFiles) return false;
    }

    // Then filter by search query
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const sessionNameMatch = session.name.toLowerCase().includes(query);
    const fileMatch = session.files.some(file =>
      file.name.toLowerCase().includes(query)
    );

    return sessionNameMatch || fileMatch;
  });

  const handleDownload = (file) => {
    // Will add real download logic later
    Alert.alert('Download', `Downloading: ${file.name}`);
  };

  const handleShare = async (file) => {
    try {
      await Share.share({
        message: `Check out my track: ${file.name}`,
        // In real app, would share actual file URL
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share file');
    }
  };

  const handlePostToFeed = (file) => {
    // Will add real post logic later
    Alert.alert(
      'Post to Feed',
      `Post "${file.name}" to your feed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Post', 
          onPress: () => Alert.alert('Success!', 'Posted to your feed!'),
        },
      ]
    );
  };

  const handlePlay = async (file, sessionFiles) => {
    // Check if this file is currently playing
    const isCurrentFile = currentTrack?.id === file.id;

    if (isCurrentFile && isPlaying) {
      // Pause if currently playing
      await togglePlayPause();
    } else if (isCurrentFile && !isPlaying) {
      // Resume if paused
      await togglePlayPause();
    } else {
      // Play new file
      const track = {
        id: file.id,
        name: file.name,
        audioFile: file.name,
        user: 'Library',
        durationMillis: 180000, // 3 minutes default
      };

      // First play the track
      await playTrack(track);

      // Then set up the queue with all session tracks
      const audioFiles = sessionFiles.filter(f => f.type === 'audio');
      const tracks = audioFiles.map(f => ({
        id: f.id,
        name: f.name,
        audioFile: f.name,
        user: 'Library',
        durationMillis: 180000,
      }));

      // Add all tracks to queue (this won't interrupt playback)
      clearQueue();
      addToQueue(tracks);
    }
  };

  const handleUpload = () => {
    // Will add real file picker later
    Alert.alert('Upload Files', 'File picker will open here to select audio/video files');
    setShowUploadModal(false);
  };

  const toggleSessionCollapse = (sessionId) => {
    const newCollapsed = new Set(collapsedSessions);
    if (newCollapsed.has(sessionId)) {
      newCollapsed.delete(sessionId);
    } else {
      newCollapsed.add(sessionId);
    }
    setCollapsedSessions(newCollapsed);
  };

  const handleRenameSession = (sessionId, currentName) => {
    Alert.prompt(
      'Rename Session',
      'Enter a new name for this session',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (newName) => {
            if (newName && newName.trim()) {
              setSessionNames({ ...sessionNames, [sessionId]: newName.trim() });
              Alert.alert('Success', 'Session renamed!');
            }
          },
        },
      ],
      'plain-text',
      currentName
    );
  };

  const getSessionDisplayName = (session) => {
    return sessionNames[session.id] || session.name;
  };

  const getFileIcon = (type) => {
    return type === 'video' ? '🎥' : '🎵';
  };

  const getSessionIcon = (type) => {
    if (type === 'upload') return '📤';
    return type === 'music' ? '🎵' : '🎙️';
  };

  const getSessionTitle = (type) => {
    if (type === 'upload') return 'My Uploads';
    return type === 'music' ? 'Music Session' : 'Podcast Session';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Library</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>{sessions.length} Sessions</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => setShowUploadModal(true)}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.uploadButtonGradient}
            >
              <Text style={styles.uploadButtonText}>+ Upload</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {sessions.length > 0 && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search sessions or files..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Filter Chips */}
        {sessions.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChipsContainer}
            contentContainerStyle={styles.filterChipsContent}
          >
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filterType === 'favorites' && styles.filterChipActive]}
              onPress={() => setFilterType('favorites')}
            >
              <Text style={[styles.filterChipText, filterType === 'favorites' && styles.filterChipTextActive]}>
                ⭐ Favorites
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filterType === 'music' && styles.filterChipActive]}
              onPress={() => setFilterType('music')}
            >
              <Text style={[styles.filterChipText, filterType === 'music' && styles.filterChipTextActive]}>
                🎵 Music
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filterType === 'podcast' && styles.filterChipActive]}
              onPress={() => setFilterType('podcast')}
            >
              <Text style={[styles.filterChipText, filterType === 'podcast' && styles.filterChipTextActive]}>
                🎙️ Podcast
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filterType === 'upload' && styles.filterChipActive]}
              onPress={() => setFilterType('upload')}
            >
              <Text style={[styles.filterChipText, filterType === 'upload' && styles.filterChipTextActive]}>
                📁 Uploads
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {sessions.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No Sessions Yet</Text>
            <Text style={styles.emptyText}>
              Book a studio session and your files will appear here after recording!
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>BOOK NOW</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          // Sessions List
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {filteredSessions.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsText}>No sessions found</Text>
                <Text style={styles.noResultsSubtext}>Try a different search term</Text>
              </View>
            ) : (
              filteredSessions.map((session) => {
                const isCollapsed = collapsedSessions.has(session.id);
                const displayName = getSessionDisplayName(session);
                
                return (
                  <View key={session.id} style={styles.sessionCard}>
                    {/* Session Header - Tappable to collapse/expand */}
                    <TouchableOpacity 
                      style={styles.sessionHeader}
                      onPress={() => toggleSessionCollapse(session.id)}
                      onLongPress={() => handleRenameSession(session.id, displayName)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.sessionHeaderLeft}>
                        <Text style={styles.sessionIcon}>{getSessionIcon(session.type)}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sessionType}>
                            {displayName}
                          </Text>
                          <Text style={styles.sessionDate}>{session.date}</Text>
                        </View>
                      </View>
                      <View style={styles.sessionHeaderRight}>
                        <View style={[
                          styles.sessionBadge,
                          session.isUpload && styles.sessionBadgeUpload
                        ]}>
                          <Text style={[
                            styles.sessionBadgeText,
                            session.isUpload && styles.sessionBadgeTextUpload
                          ]}>
                            {session.files.length} {session.files.length === 1 ? 'file' : 'files'}
                          </Text>
                        </View>
                        <Text style={styles.collapseIcon}>
                          {isCollapsed ? '▼' : '▲'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Files List - Hidden when collapsed */}
                    {!isCollapsed && (
                      <View style={styles.filesContainer}>
                        {session.files.map((file, index) => (
                          <View key={file.id} style={styles.fileCardWrapper}>
                            {/* Main Track Card - Tappable */}
                            <TouchableOpacity
                              style={[
                                styles.fileCard,
                                currentTrack?.id === file.id && styles.fileCardActive,
                              ]}
                              activeOpacity={0.7}
                              onPress={() => file.type === 'audio' && handlePlay(file, session.files)}
                              disabled={file.type !== 'audio'}
                            >
                              <View style={styles.fileInfo}>
                                <Text style={styles.fileIcon}>{getFileIcon(file.type)}</Text>
                                <View style={styles.fileDetails}>
                                  <View style={styles.fileNameRow}>
                                    <Text style={styles.fileName} numberOfLines={1}>
                                      {file.name}
                                    </Text>
                                    {currentTrack?.id === file.id && isPlaying && (
                                      <View style={styles.playingIndicator}>
                                        <View style={styles.playingBar} />
                                        <View style={styles.playingBar} />
                                        <View style={styles.playingBar} />
                                      </View>
                                    )}
                                  </View>
                                  <View style={styles.fileMetaRow}>
                                    <Text style={styles.fileMeta}>{file.size}</Text>
                                    <Text style={styles.fileMeta}> • </Text>
                                    <Text style={styles.fileMeta}>{file.duration}</Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>

                            {/* File Actions - Below Track */}
                            <View style={styles.fileActions}>
                              {/* Favorite Toggle Button */}
                              {file.type === 'audio' && (
                                <TouchableOpacity
                                  style={[
                                    styles.actionButton,
                                    isFavorite(file.id) && styles.actionButtonActive,
                                  ]}
                                  onPress={() => toggleFavorite(file.id)}
                                >
                                  <Text style={styles.favoriteIcon}>
                                    {isFavorite(file.id) ? '⭐' : '☆'}
                                  </Text>
                                  <Text style={[styles.actionButtonText, isFavorite(file.id) && styles.actionButtonTextActive]}>
                                    {isFavorite(file.id) ? 'Favorited' : 'Favorite'}
                                  </Text>
                                </TouchableOpacity>
                              )}

                              {/* Share Button */}
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleShare(file)}
                              >
                                <View style={styles.shareIconModern}>
                                  <View style={styles.shareCircle} />
                                  <View style={styles.shareLine1} />
                                  <View style={styles.shareLine2} />
                                  <View style={styles.shareDot1} />
                                  <View style={styles.shareDot2} />
                                </View>
                                <Text style={styles.actionButtonText}>Share</Text>
                              </TouchableOpacity>

                              {/* Download Button */}
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleDownload(file)}
                              >
                                <View style={styles.downloadIconModern}>
                                  <View style={styles.downloadArrowShaft} />
                                  <View style={styles.downloadArrowHead} />
                                  <View style={styles.downloadTray} />
                                </View>
                                <Text style={styles.actionButtonText}>Download</Text>
                              </TouchableOpacity>

                              {/* Post to Feed Button */}
                              <TouchableOpacity
                                style={[styles.actionButton, styles.actionButtonPost]}
                                onPress={() => handlePostToFeed(file)}
                              >
                                <View style={styles.postIconModern}>
                                  <View style={styles.postSquare} />
                                  <View style={styles.postPlus1} />
                                  <View style={styles.postPlus2} />
                                </View>
                                <Text style={styles.actionButtonText}>Post</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}

            {/* Bottom Spacer */}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* Upload Modal */}
        <Modal
          visible={showUploadModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowUploadModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Upload Files</Text>
              <Text style={styles.modalSubtitle}>
                Add your own audio or video files to your library
              </Text>

              <TouchableOpacity style={styles.modalOption} onPress={handleUpload}>
                <Text style={styles.modalOptionIcon}>🎵</Text>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Audio Files</Text>
                  <Text style={styles.modalOptionDesc}>MP3, WAV, M4A</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={handleUpload}>
                <Text style={styles.modalOptionIcon}>🎥</Text>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Video Files</Text>
                  <Text style={styles.modalOptionDesc}>MP4, MOV</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  uploadButton: {
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  // Search Bar
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  clearIcon: {
    fontSize: 20,
    color: '#666',
    marginLeft: 10,
  },
  // Filter Chips
  filterChipsContainer: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  filterChipsContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  // Favorite Icon
  favoriteIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  // No Results
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    width: '80%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  // Session Card
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collapseIcon: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  sessionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
  },
  sessionBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionBadgeUpload: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  sessionBadgeTextUpload: {
    color: '#10B981',
  },
  // Files
  filesContainer: {
    gap: 12,
  },
  fileCardWrapper: {
    gap: 8,
  },
  fileCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fileCardActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 12,
  },
  playingBar: {
    width: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    height: '100%',
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileMeta: {
    fontSize: 11,
    color: '#666',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 48,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
  },
  actionButtonPost: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextActive: {
    color: '#8B5CF6',
  },
  // Queue Icon (3 lines)
  queueIcon: {
    width: 14,
    height: 14,
    justifyContent: 'space-between',
  },
  queueLine1: {
    width: 14,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  queueLine2: {
    width: 10,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  queueLine3: {
    width: 6,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  // Modern Share Icon
  shareIconModern: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  shareCircle: {
    position: 'absolute',
    top: 0,
    left: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  shareLine1: {
    position: 'absolute',
    top: 3,
    left: 4,
    width: 8,
    height: 1,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '30deg' }],
  },
  shareLine2: {
    position: 'absolute',
    top: 8,
    left: 4,
    width: 8,
    height: 1,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-30deg' }],
  },
  shareDot1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  shareDot2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  // Modern Download Icon
  downloadIconModern: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  downloadArrowShaft: {
    position: 'absolute',
    top: 0,
    left: 6,
    width: 2,
    height: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  downloadArrowHead: {
    position: 'absolute',
    top: 6,
    left: 3,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    borderBottomColor: 'transparent',
  },
  downloadTray: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 14,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  // Modern Post Icon
  postIconModern: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  postSquare: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 3,
  },
  postPlus1: {
    position: 'absolute',
    top: 5,
    left: 3,
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  postPlus2: {
    position: 'absolute',
    top: 3,
    left: 5,
    width: 2,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  // Modern Play Icon
  playIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#8B5CF6',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  // Modern Pause Icon
  pauseIcon: {
    flexDirection: 'row',
    gap: 3,
  },
  pauseBar: {
    width: 3,
    height: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  pauseBarWhite: {
    backgroundColor: '#FFFFFF',
  },
  // Modern Download Icon (Arrow down with line)
  downloadIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#8B5CF6',
    borderBottomColor: 'transparent',
    marginBottom: 2,
  },
  downloadLine: {
    width: 12,
    height: 2,
    backgroundColor: '#8B5CF6',
    borderRadius: 1,
  },
  // Modern Share Icon
  shareIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 0,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: '#8B5CF6',
    marginBottom: 2,
  },
  shareDot: {
    width: 4,
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginTop: 2,
  },
  // Close Icon (X)
  closeIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeLine1: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  // Now Playing Bar
  nowPlayingBar: {
    position: 'absolute',
    bottom: 85,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  nowPlayingGradient: {
    flex: 1,
    padding: 12,
  },
  nowPlayingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nowPlayingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  nowPlayingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  nowPlayingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nowPlayingDuration: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  nowPlayingControls: {
    flexDirection: 'row',
    gap: 8,
  },
  nowPlayingButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Upload Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  modalOptionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
  modalCancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC4899',
  },
});