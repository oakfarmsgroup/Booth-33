-- ============================================================
-- COMPLETE BOOTH 33 DATABASE SCHEMA SETUP FOR 'api' SCHEMA
-- ============================================================
-- This script creates all tables, functions, triggers, and RLS policies
-- directly in the 'api' schema for Supabase projects configured
-- to use custom schemas.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- 4. Refresh your app
-- ============================================================

-- Create api schema
CREATE SCHEMA IF NOT EXISTS api;

-- Set search path for this session
SET search_path TO api, public;

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON api.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON api.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON api.profiles(role);

-- RLS for profiles
ALTER TABLE api.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON api.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON api.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('music', 'podcast')),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 2,
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON api.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON api.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON api.bookings(status);

-- RLS for bookings
ALTER TABLE api.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON api.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON api.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON api.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all bookings"
  ON api.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM api.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  content TEXT,
  audio_url TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON api.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON api.posts(created_at DESC);

-- RLS for posts
ALTER TABLE api.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
  ON api.posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON api.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON api.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON api.posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- LIKES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES api.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON api.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON api.likes(user_id);

-- RLS for likes
ALTER TABLE api.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
  ON api.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON api.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON api.likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES api.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON api.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON api.comments(user_id);

-- RLS for comments
ALTER TABLE api.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON api.comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON api.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON api.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON api.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- FOLLOWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON api.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON api.follows(following_id);

-- RLS for follows
ALTER TABLE api.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone"
  ON api.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON api.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON api.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON api.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON api.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON api.messages(created_at DESC);

-- RLS for messages
ALTER TABLE api.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON api.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON api.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON api.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- ============================================================
-- EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  image_url TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  created_by UUID REFERENCES api.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON api.events(date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON api.events(created_by);

-- RLS for events
ALTER TABLE api.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON api.events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage events"
  ON api.events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM api.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- EVENT_RSVPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES api.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON api.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON api.event_rsvps(user_id);

-- RLS for event_rsvps
ALTER TABLE api.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RSVPs are viewable by everyone"
  ON api.event_rsvps FOR SELECT
  USING (true);

CREATE POLICY "Users can RSVP to events"
  ON api.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their RSVPs"
  ON api.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their RSVPs"
  ON api.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON api.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON api.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON api.notifications(created_at DESC);

-- RLS for notifications
ALTER TABLE api.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON api.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON api.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
  ON api.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES api.bookings(id) ON DELETE SET NULL,
  session_name TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('music', 'podcast', 'upload')),
  session_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'archived')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON api.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON api.sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON api.sessions(status);

-- RLS for sessions
ALTER TABLE api.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON api.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON api.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage sessions"
  ON api.sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM api.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- SESSION_FILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.session_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES api.sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('audio', 'video', 'document', 'other')),
  file_url TEXT,
  file_size INTEGER,
  duration INTEGER,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploading', 'uploaded', 'processing', 'ready', 'error')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_files_session_id ON api.session_files(session_id);

-- RLS for session_files
ALTER TABLE api.session_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files from their sessions"
  ON api.session_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api.sessions
      WHERE sessions.id = session_files.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage session files"
  ON api.session_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM api.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- USER_SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS api.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES api.profiles(id) ON DELETE CASCADE,
  notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  booking_reminders BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  post_notifications BOOLEAN DEFAULT TRUE,
  public_profile BOOLEAN DEFAULT TRUE,
  show_session_history BOOLEAN DEFAULT TRUE,
  show_followers BOOLEAN DEFAULT TRUE,
  show_following BOOLEAN DEFAULT TRUE,
  allow_messages_from TEXT DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'followers', 'none')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON api.user_settings(user_id);

-- RLS for user_settings
ALTER TABLE api.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON api.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON api.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION api.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO api.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update post likes count
CREATE OR REPLACE FUNCTION api.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE api.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE api.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update post comments count
CREATE OR REPLACE FUNCTION api.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE api.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE api.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update event attendees count
CREATE OR REPLACE FUNCTION api.update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'attending' THEN
    UPDATE api.events SET current_attendees = current_attendees + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'attending' THEN
    UPDATE api.events SET current_attendees = current_attendees - 1 WHERE id = OLD.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'attending' AND NEW.status != 'attending' THEN
      UPDATE api.events SET current_attendees = current_attendees - 1 WHERE id = NEW.event_id;
    ELSIF OLD.status != 'attending' AND NEW.status = 'attending' THEN
      UPDATE api.events SET current_attendees = current_attendees + 1 WHERE id = NEW.event_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user settings
CREATE OR REPLACE FUNCTION api.create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO api.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION api.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_created_settings ON api.profiles;
CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON api.profiles
  FOR EACH ROW EXECUTE FUNCTION api.create_user_settings();

DROP TRIGGER IF EXISTS update_post_likes ON api.likes;
CREATE TRIGGER update_post_likes
  AFTER INSERT OR DELETE ON api.likes
  FOR EACH ROW EXECUTE FUNCTION api.update_post_likes_count();

DROP TRIGGER IF EXISTS update_post_comments ON api.comments;
CREATE TRIGGER update_post_comments
  AFTER INSERT OR DELETE ON api.comments
  FOR EACH ROW EXECUTE FUNCTION api.update_post_comments_count();

DROP TRIGGER IF EXISTS update_event_attendees ON api.event_rsvps;
CREATE TRIGGER update_event_attendees
  AFTER INSERT OR UPDATE OR DELETE ON api.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION api.update_event_attendees_count();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON api.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON api.profiles
  FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON api.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON api.posts
  FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON api.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON api.bookings
  FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON api.sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON api.sessions
  FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON api.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON api.user_settings
  FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA api TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA api TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA api TO anon, authenticated, service_role;

-- ============================================================
-- COMPLETE!
-- ============================================================
-- All tables, functions, triggers, and policies have been created
-- in the 'api' schema. Your app should now work correctly.
-- ============================================================
