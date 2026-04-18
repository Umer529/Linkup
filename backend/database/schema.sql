-- Run this in your Supabase SQL editor to set up the schema

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  joined_date DATE DEFAULT CURRENT_DATE,
  activities_hosted INT DEFAULT 0,
  activities_joined INT DEFAULT 0,
  streak INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  count INT DEFAULT 0
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  city TEXT NOT NULL,
  location TEXT NOT NULL,
  banner_image TEXT, -- kept nullable; not used by the app, no upload feature
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_limit INT NOT NULL DEFAULT 10,
  current_participants INT NOT NULL DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'intense')) DEFAULT 'easy',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  safety_instructions TEXT,
  agenda TEXT[] DEFAULT '{}',
  rules TEXT[] DEFAULT '{}',
  required_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE TABLE saved_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Auto-update current_participants on join/leave
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE activities SET current_participants = current_participants + 1 WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE activities SET current_participants = current_participants - 1 WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_participant_count
AFTER INSERT OR DELETE ON participants
FOR EACH ROW EXECUTE FUNCTION update_participant_count();

-- Disable RLS on all tables (backend uses service_role key with its own auth middleware)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Chat messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Video calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('waiting', 'active', 'ended')) DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('offer', 'answer', 'candidate')) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE signals DISABLE ROW LEVEL SECURITY;
