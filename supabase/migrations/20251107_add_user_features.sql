-- Migration: Add sessions, session_files, and user_settings tables
-- Date: 2025-11-07
-- Purpose: Support LibraryScreen sessions and ProfileScreen settings persistence

-- ============================================================
-- SESSIONS TABLE - For delivered recording sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  session_name TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('music', 'podcast', 'upload')),
  session_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'archived')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_delivered_at ON sessions(delivered_at DESC);

-- RLS policies for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policies for sessions
CREATE POLICY "Admins can view all sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update sessions"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- SESSION_FILES TABLE - Individual files in a session
-- ============================================================
CREATE TABLE IF NOT EXISTS session_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('audio', 'video', 'document', 'other')),
  file_url TEXT,
  file_size INTEGER, -- in bytes
  duration INTEGER, -- in seconds (for audio/video)
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploading', 'uploaded', 'processing', 'ready', 'error')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for session_files
CREATE INDEX IF NOT EXISTS idx_session_files_session_id ON session_files(session_id);
CREATE INDEX IF NOT EXISTS idx_session_files_status ON session_files(status);

-- RLS policies for session_files
ALTER TABLE session_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files from their sessions"
  ON session_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_files.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert files to their sessions"
  ON session_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_files.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in their sessions"
  ON session_files FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_files.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from their sessions"
  ON session_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_files.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Admin policies for session_files
CREATE POLICY "Admins can view all session files"
  ON session_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage session files"
  ON session_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- USER_SETTINGS TABLE - User notification and privacy preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification settings
  notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  booking_reminders BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  post_notifications BOOLEAN DEFAULT TRUE,

  -- Privacy settings
  public_profile BOOLEAN DEFAULT TRUE,
  show_session_history BOOLEAN DEFAULT TRUE,
  show_followers BOOLEAN DEFAULT TRUE,
  show_following BOOLEAN DEFAULT TRUE,
  allow_messages_from TEXT DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'followers', 'none')),

  -- Display settings
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create user_settings on profile creation
-- ============================================================
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_settings ON profiles;
CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_settings();

-- ============================================================
-- TRIGGER: Update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- View for sessions with file counts
CREATE OR REPLACE VIEW sessions_with_files AS
SELECT
  s.*,
  COUNT(sf.id) as file_count,
  SUM(sf.file_size) as total_size,
  MAX(sf.uploaded_at) as last_file_uploaded
FROM sessions s
LEFT JOIN session_files sf ON s.id = sf.session_id
GROUP BY s.id;

-- Grant access to authenticated users
GRANT SELECT ON sessions_with_files TO authenticated;

COMMENT ON TABLE sessions IS 'Recording sessions delivered to users';
COMMENT ON TABLE session_files IS 'Individual files within recording sessions';
COMMENT ON TABLE user_settings IS 'User notification and privacy preferences';
