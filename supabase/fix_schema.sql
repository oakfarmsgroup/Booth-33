-- Fix Schema Issues and Create User Profile
-- Run this in Supabase SQL Editor

-- Add missing columns to profiles table
ALTER TABLE api.profiles
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Create profile for existing user (oakfarmsgroup@gmail.com)
INSERT INTO api.profiles (id, email, full_name, username, verified, role)
VALUES (
  'd95b4727-9aff-49da-a743-d0096ba23672'::uuid,
  'oakfarmsgroup@gmail.com',
  'Sabio Beatz',
  'sabiobeatz',
  false,
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  role = EXCLUDED.role;

-- Create user_settings for this user
INSERT INTO api.user_settings (user_id)
VALUES ('d95b4727-9aff-49da-a743-d0096ba23672'::uuid)
ON CONFLICT (user_id) DO NOTHING;

-- Add some sample data for testing
-- Sample posts
INSERT INTO api.posts (user_id, content, likes_count, comments_count, created_at)
VALUES
  ('d95b4727-9aff-49da-a743-d0096ba23672'::uuid, 'Just finished an amazing recording session! <µ', 5, 2, NOW() - INTERVAL '2 hours'),
  ('d95b4727-9aff-49da-a743-d0096ba23672'::uuid, 'New track dropping soon! Stay tuned =%', 10, 5, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Sample event
INSERT INTO api.events (name, description, date, time, location, max_attendees, current_attendees, created_by, created_at)
VALUES
  ('Open Mic Night', 'Join us for an evening of music and creativity', CURRENT_DATE + INTERVAL '7 days', '19:00', 'Booth 33 Studio', 50, 12, 'd95b4727-9aff-49da-a743-d0096ba23672'::uuid, NOW())
ON CONFLICT DO NOTHING;

-- Sample booking
INSERT INTO api.bookings (user_id, session_type, date, time, duration, price, status, notes, created_at)
VALUES
  ('d95b4727-9aff-49da-a743-d0096ba23672'::uuid, 'music', CURRENT_DATE + INTERVAL '3 days', '14:00', 2, 150.00, 'confirmed', 'Need to record vocals', NOW())
ON CONFLICT DO NOTHING;

COMMENT ON COLUMN api.profiles.verified IS 'Whether the user is a verified artist/creator';
COMMENT ON COLUMN api.profiles.follower_count IS 'Number of followers (denormalized for performance)';
COMMENT ON COLUMN api.profiles.following_count IS 'Number of users this user follows';
