-- Create api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Move tables from public to api schema
ALTER TABLE IF EXISTS public.profiles SET SCHEMA api;
ALTER TABLE IF EXISTS public.bookings SET SCHEMA api;
ALTER TABLE IF EXISTS public.posts SET SCHEMA api;
ALTER TABLE IF EXISTS public.likes SET SCHEMA api;
ALTER TABLE IF EXISTS public.comments SET SCHEMA api;
ALTER TABLE IF EXISTS public.follows SET SCHEMA api;
ALTER TABLE IF EXISTS public.reviews SET SCHEMA api;
ALTER TABLE IF EXISTS public.messages SET SCHEMA api;
ALTER TABLE IF EXISTS public.events SET SCHEMA api;
ALTER TABLE IF EXISTS public.event_rsvps SET SCHEMA api;
ALTER TABLE IF EXISTS public.notifications SET SCHEMA api;

-- Update function schema references
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
CREATE OR REPLACE FUNCTION api.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO api.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION api.handle_new_user();

-- Recreate triggers with correct schema
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
  AFTER INSERT OR DELETE ON api.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION api.update_event_attendees_count();

-- Move functions to api schema
ALTER FUNCTION IF EXISTS public.update_post_likes_count SET SCHEMA api;
ALTER FUNCTION IF EXISTS public.update_post_comments_count SET SCHEMA api;
ALTER FUNCTION IF EXISTS public.update_event_attendees_count SET SCHEMA api;
