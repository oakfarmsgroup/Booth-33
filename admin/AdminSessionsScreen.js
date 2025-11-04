import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessions } from '../contexts/SessionsContext';

export default function AdminSessionsScreen() {
  const {
    sessions,
    createSession,
    updateSession,
    deleteSession,
    addFileToSession,
    removeFileFromSession,
    deliverSession,
    getSessionsByStatus,
    getSessionsStats,
  } = useSessions();

  const [filter, setFilter] = useState('ready_to_deliver'); // 'draft', 'ready_to_deliver', 'delivered', 'all'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Create session form
  const [newSessionUserName, setNewSessionUserName] = useState('');
  const [newSessionType, setNewSessionType] = useState('music');
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');

  // Upload form
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('audio');

  // Edit form
  const [editSessionName, setEditSessionName] = useState('');
  const [editSessionDate, setEditSessionDate] = useState('');

  const stats = getSessionsStats();

  // Get filtered sessions
  const getFilteredSessions = () => {
    if (filter === 'all') return sessions;
    return getSessionsByStatus(filter);
  };

  const handleCreateSession = () => {
    if (!newSessionUserName.trim()) {
      Alert.alert('Error', 'Please enter a user name');
      return;
    }

    const sessionName = newSessionName.trim() || `${newSessionType === 'music' ? 'Music' : 'Podcast'} Session`;
    const sessionDate = newSessionDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    createSession('user1', newSessionUserName, newSessionType, sessionName, sessionDate);

    Alert.alert('Success', 'Session created successfully');

    // Reset form
    setNewSessionUserName('');
    setNewSessionType('music');
    setNewSessionName('');
    setNewSessionDate('');
    setShowCreateModal(false);
  };

  const handleUploadFile = () => {
    if (!uploadFileName.trim()) {
      Alert.alert('Error', 'Please enter a file name');
      return;
    }

    const mockFile = {
      fileName: uploadFileName + (uploadFileType === 'audio' ? '.mp3' : '.mp4'),
      fileType: uploadFileType,
      fileSize: `${(Math.random() * 10 + 5).toFixed(1)} MB`,
      duration: `${Math.floor(Math.random() * 5 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    };

    addFileToSession(selectedSession.id, mockFile);

    Alert.alert('Success', 'File uploaded successfully');

    // Reset form
    setUploadFileName('');
    setUploadFileType('audio');
    setShowUploadModal(false);
  };

  const handleEditSession = () => {
    if (!editSessionName.trim() || !editSessionDate.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    updateSession(selectedSession.id, {
      sessionName: editSessionName,
      sessionDate: editSessionDate,
    });

    Alert.alert('Success', 'Session updated successfully');
    setShowEditModal(false);
  };

  const handleDeliverSession = (session) => {
    Alert.alert(
      'Deliver Session',
      `Deliver "${session.sessionName}" to ${session.userName}?\n\nThis will make ${session.files.length} file(s) visible in their library.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deliver',
          onPress: () => {
            deliverSession(session.id);
            Alert.alert('Success', `Session delivered to ${session.userName}!`);
          },
        },
      ]
    );
  };

  const handleDeleteSession = (session) => {
    Alert.alert(
      'Delete Session',
      `Delete "${session.sessionName}"?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSession(session.id);
            Alert.alert('Success', 'Session deleted');
          },
        },
      ]
    );
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'draft':
        return [styles.statusBadge, styles.statusBadgeDraft];
      case 'ready_to_deliver':
        return [styles.statusBadge, styles.statusBadgeReady];
      case 'delivered':
        return [styles.statusBadge, styles.statusBadgeDelivered];
      default:
        return styles.statusBadge;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'ready_to_deliver':
        return 'Ready';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Sessions</Text>
            <Text style={styles.headerSubtitle}>Upload & Deliver Files</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>+ Create</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.draft}</Text>
            <Text style={styles.statLabel}>Draft</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.readyToDeliver}</Text>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalFiles}</Text>
            <Text style={styles.statLabel}>Files</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'ready_to_deliver' && styles.filterChipActive]}
              onPress={() => setFilter('ready_to_deliver')}
            >
              <Text style={[styles.filterChipText, filter === 'ready_to_deliver' && styles.filterChipTextActive]}>
                📤 Ready to Upload ({stats.readyToDeliver})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'draft' && styles.filterChipActive]}
              onPress={() => setFilter('draft')}
            >
              <Text style={[styles.filterChipText, filter === 'draft' && styles.filterChipTextActive]}>
                📝 Draft ({stats.draft})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'delivered' && styles.filterChipActive]}
              onPress={() => setFilter('delivered')}
            >
              <Text style={[styles.filterChipText, filter === 'delivered' && styles.filterChipTextActive]}>
                ✅ Delivered ({stats.delivered})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
                📂 All ({stats.total})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Sessions List */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.sessionsList}>
          {getFilteredSessions().length > 0 ? (
            getFilteredSessions().map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName}>{session.sessionName}</Text>
                    <Text style={styles.sessionUser}>👤 {session.userName}</Text>
                    <Text style={styles.sessionDate}>📅 {session.sessionDate}</Text>
                  </View>
                  <View style={getStatusBadgeStyle(session.status)}>
                    <Text style={styles.statusBadgeText}>{getStatusText(session.status)}</Text>
                  </View>
                </View>

                {/* Session Type Badge */}
                <View style={styles.sessionTypeBadge}>
                  <Text style={styles.sessionTypeText}>
                    {session.sessionType === 'music' ? '🎵 Music' : '🎙️ Podcast'}
                  </Text>
                </View>

                {/* Files */}
                {session.files.length > 0 && (
                  <View style={styles.filesSection}>
                    <Text style={styles.filesSectionTitle}>
                      Files ({session.files.length})
                    </Text>
                    {session.files.map((file) => (
                      <View key={file.id} style={styles.fileItem}>
                        <Text style={styles.fileIcon}>
                          {file.fileType === 'audio' ? '🎵' : '🎥'}
                        </Text>
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName}>{file.fileName}</Text>
                          <Text style={styles.fileDetails}>
                            {file.fileSize} • {file.duration}
                          </Text>
                        </View>
                        {session.status !== 'delivered' && (
                          <TouchableOpacity
                            style={styles.removeFileButton}
                            onPress={() => {
                              Alert.alert(
                                'Remove File',
                                'Remove this file from the session?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: 'Remove',
                                    style: 'destructive',
                                    onPress: () => removeFileFromSession(session.id, file.id),
                                  },
                                ]
                              );
                            }}
                          >
                            <Text style={styles.removeFileText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {session.status !== 'delivered' && (
                    <>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          setSelectedSession(session);
                          setShowUploadModal(true);
                        }}
                      >
                        <Text style={styles.actionButtonText}>📤 Upload</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          setSelectedSession(session);
                          setEditSessionName(session.sessionName);
                          setEditSessionDate(session.sessionDate);
                          setShowEditModal(true);
                        }}
                      >
                        <Text style={styles.actionButtonText}>✏️ Edit</Text>
                      </TouchableOpacity>

                      {session.status === 'ready_to_deliver' && (
                        <TouchableOpacity
                          style={styles.deliverButton}
                          onPress={() => handleDeliverSession(session)}
                        >
                          <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.deliverButtonGradient}
                          >
                            <Text style={styles.deliverButtonText}>🚀 Deliver</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteSession(session)}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {session.status === 'delivered' && (
                    <View style={styles.deliveredInfo}>
                      <Text style={styles.deliveredText}>
                        ✅ Delivered on {new Date(session.deliveredAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📂</Text>
              <Text style={styles.emptyStateText}>No sessions found</Text>
              <Text style={styles.emptyStateSubtext}>
                {filter === 'draft' && 'Create a session to get started'}
                {filter === 'ready_to_deliver' && 'No sessions ready to deliver'}
                {filter === 'delivered' && 'No delivered sessions yet'}
                {filter === 'all' && 'Create your first session'}
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Create Session Modal */}
        <Modal
          visible={showCreateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>📂 Create Session</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>User Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter user name"
                  placeholderTextColor="#666"
                  value={newSessionUserName}
                  onChangeText={setNewSessionUserName}
                />

                <Text style={styles.inputLabel}>Session Type *</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[styles.typeOption, newSessionType === 'music' && styles.typeOptionActive]}
                    onPress={() => setNewSessionType('music')}
                  >
                    <Text style={[styles.typeOptionText, newSessionType === 'music' && styles.typeOptionTextActive]}>
                      🎵 Music
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeOption, newSessionType === 'podcast' && styles.typeOptionActive]}
                    onPress={() => setNewSessionType('podcast')}
                  >
                    <Text style={[styles.typeOptionText, newSessionType === 'podcast' && styles.typeOptionTextActive]}>
                      🎙️ Podcast
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Session Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Leave blank for default name"
                  placeholderTextColor="#666"
                  value={newSessionName}
                  onChangeText={setNewSessionName}
                />

                <Text style={styles.inputLabel}>Session Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Oct 20, 2025"
                  placeholderTextColor="#666"
                  value={newSessionDate}
                  onChangeText={setNewSessionDate}
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleCreateSession}>
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>CREATE SESSION</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Upload Files Modal */}
        <Modal
          visible={showUploadModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowUploadModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>📤 Upload File</Text>
                <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.modalBody}>
                {selectedSession && (
                  <View style={styles.sessionPreview}>
                    <Text style={styles.sessionPreviewLabel}>Uploading to:</Text>
                    <Text style={styles.sessionPreviewName}>{selectedSession.sessionName}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>File Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Final_Mix_Master"
                  placeholderTextColor="#666"
                  value={uploadFileName}
                  onChangeText={setUploadFileName}
                />

                <Text style={styles.inputLabel}>File Type *</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[styles.typeOption, uploadFileType === 'audio' && styles.typeOptionActive]}
                    onPress={() => setUploadFileType('audio')}
                  >
                    <Text style={[styles.typeOptionText, uploadFileType === 'audio' && styles.typeOptionTextActive]}>
                      🎵 Audio
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeOption, uploadFileType === 'video' && styles.typeOptionActive]}
                    onPress={() => setUploadFileType('video')}
                  >
                    <Text style={[styles.typeOptionText, uploadFileType === 'video' && styles.typeOptionTextActive]}>
                      🎥 Video
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.uploadNote}>
                  <Text style={styles.uploadNoteText}>
                    ℹ️ This is a mock upload. In production, you'd select actual files from your device.
                  </Text>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleUploadFile}>
                  <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>UPLOAD FILE</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Session Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>✏️ Edit Session</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Session Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter session name"
                  placeholderTextColor="#666"
                  value={editSessionName}
                  onChangeText={setEditSessionName}
                />

                <Text style={styles.inputLabel}>Session Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Oct 20, 2025"
                  placeholderTextColor="#666"
                  value={editSessionDate}
                  onChangeText={setEditSessionDate}
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleEditSession}>
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>SAVE CHANGES</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </SafeAreaView>
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
    paddingTop: 0,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  filterChipTextActive: {
    color: '#F59E0B',
  },
  sessionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  sessionUser: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeDraft: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  statusBadgeReady: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusBadgeDelivered: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sessionTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
    marginBottom: 12,
  },
  sessionTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  filesSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  filesSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fileDetails: {
    fontSize: 11,
    color: '#999',
  },
  removeFileButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  deliverButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  deliverButtonGradient: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  deliverButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deleteButton: {
    width: 45,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  deliveredInfo: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  deliveredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
  },
  typeOptionTextActive: {
    color: '#F59E0B',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  sessionPreview: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sessionPreviewLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  sessionPreviewName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  uploadNote: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  uploadNoteText: {
    fontSize: 12,
    color: '#8B5CF6',
    lineHeight: 18,
  },
});
