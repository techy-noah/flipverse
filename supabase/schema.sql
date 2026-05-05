-- ============================================
-- FlipVerse Bible Quiz - Supabase Schema
-- ============================================
-- Paste this entire file into Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE progress_status AS ENUM ('new', 'learning', 'mastered');
CREATE TYPE category_type AS ENUM (
  'old_testament',
  'new_testament',
  'life_of_jesus',
  'parables',
  'commandments',
  'apostles',
  'psalms_wisdom',
  'prophecy',
  'miracles',
  'general'
);

-- ============================================
-- TABLES
-- ============================================

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  reference TEXT NOT NULL,
  book TEXT NOT NULL,
  category category_type NOT NULL DEFAULT 'general',
  difficulty difficulty_level NOT NULL DEFAULT 'easy',
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decks table
CREATE TABLE decks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category category_type NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#6C5CE7',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deck-Questions junction table
CREATE TABLE deck_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE(deck_id, question_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  status progress_status NOT NULL DEFAULT 'new',
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Questions indexes
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_book ON questions(book);
CREATE INDEX idx_questions_category_difficulty ON questions(category, difficulty);

-- Decks indexes
CREATE INDEX idx_decks_category ON decks(category);

-- Deck-Questions indexes
CREATE INDEX idx_deck_questions_deck_id ON deck_questions(deck_id);
CREATE INDEX idx_deck_questions_question_id ON deck_questions(question_id);

-- User progress indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_question_id ON user_progress(question_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_user_status ON user_progress(user_id, status);
CREATE INDEX idx_user_progress_next_review ON user_progress(next_review) WHERE next_review IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Questions: public read
CREATE POLICY "Questions are publicly viewable"
  ON questions FOR SELECT
  USING (true);

-- Questions: only service role can modify (handled server-side)
CREATE POLICY "Questions are editable by authenticated users"
  ON questions FOR ALL
  USING (auth.role() = 'authenticated');

-- Decks: public read
CREATE POLICY "Decks are publicly viewable"
  ON decks FOR SELECT
  USING (true);

CREATE POLICY "Decks are editable by authenticated users"
  ON decks FOR ALL
  USING (auth.role() = 'authenticated');

-- Deck questions: public read
CREATE POLICY "Deck questions are publicly viewable"
  ON deck_questions FOR SELECT
  USING (true);

CREATE POLICY "Deck questions are editable by authenticated users"
  ON deck_questions FOR ALL
  USING (auth.role() = 'authenticated');

-- User progress: users can only see/edit own
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at on user_progress
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set next_review based on status
CREATE OR REPLACE FUNCTION set_next_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'mastered' THEN
    NEW.next_review = NOW() + INTERVAL '7 days';
  ELSIF NEW.status = 'learning' THEN
    NEW.next_review = NOW() + INTERVAL '1 day';
  ELSIF NEW.status = 'new' THEN
    NEW.next_review = NOW() + INTERVAL '12 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_progress_next_review
  BEFORE INSERT OR UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION set_next_review();

-- Handle new user signup - create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Helper function: get questions due for review
CREATE OR REPLACE FUNCTION get_due_questions(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  question_id UUID,
  question TEXT,
  answer TEXT,
  reference TEXT,
  book TEXT,
  category category_type,
  difficulty difficulty_level,
  explanation TEXT,
  status progress_status,
  correct_count INTEGER,
  wrong_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id AS question_id,
    q.question,
    q.answer,
    q.reference,
    q.book,
    q.category,
    q.difficulty,
    q.explanation,
    up.status,
    up.correct_count,
    up.wrong_count
  FROM user_progress up
  JOIN questions q ON q.id = up.question_id
  WHERE up.user_id = p_user_id
    AND up.next_review <= NOW()
  ORDER BY up.next_review ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: get deck stats for a user
CREATE OR REPLACE FUNCTION get_deck_stats(p_user_id UUID, p_deck_id UUID)
RETURNS TABLE (
  total_cards BIGINT,
  new_cards BIGINT,
  learning_cards BIGINT,
  mastered_cards BIGINT,
  total_attempts BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_cards,
    COUNT(*) FILTER (WHERE up.status = 'new') AS new_cards,
    COUNT(*) FILTER (WHERE up.status = 'learning') AS learning_cards,
    COUNT(*) FILTER (WHERE up.status = 'mastered') AS mastered_cards,
    COALESCE(SUM(up.correct_count + up.wrong_count), 0) AS total_attempts
  FROM deck_questions dq
  JOIN questions q ON q.id = dq.question_id
  LEFT JOIN user_progress up ON up.question_id = q.id AND up.user_id = p_user_id
  WHERE dq.deck_id = p_deck_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  streak_count INTEGER DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly viewable"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DAILY CHALLENGES TABLE
-- ============================================

CREATE TABLE daily_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  question_ids UUID[] NOT NULL,
  completed_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily challenges are publicly viewable"
  ON daily_challenges FOR SELECT
  USING (true);

CREATE POLICY "Daily challenges are editable by authenticated users"
  ON daily_challenges FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA: 20 Questions
-- ============================================

-- Insert decks
INSERT INTO decks (id, name, category, description, icon, color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Old Testament', 'old_testament', 'Key stories from Genesis to Malachi', 'book', '#6C5CE7'),
  ('00000000-0000-0000-0000-000000000002', 'Life of Jesus', 'life_of_jesus', 'The ministry and teachings of Christ', 'star', '#00B894'),
  ('00000000-0000-0000-0000-000000000003', 'Parables', 'parables', 'Stories Jesus told to teach truth', 'message', '#FDCB6E'),
  ('00000000-0000-0000-0000-000000000004', 'Commandments & Law', 'commandments', 'The Ten Commandments and biblical law', 'shield', '#FF6B6B'),
  ('00000000-0000-0000-0000-000000000005', 'Psalms & Wisdom', 'psalms_wisdom', 'Psalms, Proverbs, and wisdom literature', 'heart', '#A29BFE');

-- Insert questions
INSERT INTO questions (id, question, answer, reference, book, category, difficulty, explanation) VALUES
  -- Old Testament (4)
  ('00000000-0000-0000-0000-000000000101', 'Who built the ark according to Genesis?', 'Noah', 'Genesis 6:14', 'Genesis', 'old_testament', 'easy', 'God instructed Noah to build an ark to save his family and pairs of every animal from the great flood.'),
  ('00000000-0000-0000-0000-000000000102', 'What was the sign of God''s covenant with Noah?', 'The rainbow', 'Genesis 9:13', 'Genesis', 'old_testament', 'easy', 'After the flood, God set a rainbow in the sky as a sign of His covenant never to destroy the earth by flood again.'),
  ('00000000-0000-0000-0000-000000000103', 'Who led the Israelites out of Egypt?', 'Moses', 'Exodus 3:10', 'Exodus', 'old_testament', 'easy', 'God called Moses from a burning bush to lead the Israelites out of slavery in Egypt.'),
  ('00000000-0000-0000-0000-000000000104', 'What did David use to defeat Goliath?', 'A sling and a stone', '1 Samuel 17:49', '1 Samuel', 'old_testament', 'easy', 'Young David defeated the giant Goliath with a single stone from his sling, trusting in God rather than armor and weapons.'),

  -- Life of Jesus (4)
  ('00000000-0000-0000-0000-000000000201', 'Where was Jesus born?', 'Bethlehem', 'Matthew 2:1', 'Matthew', 'life_of_jesus', 'easy', 'Jesus was born in Bethlehem of Judea, in a manger, because there was no room in the inn.'),
  ('00000000-0000-0000-0000-000000000202', 'Who baptized Jesus?', 'John the Baptist', 'Matthew 3:13', 'Matthew', 'life_of_jesus', 'easy', 'John the Baptist baptized Jesus in the Jordan River. The Holy Spirit descended like a dove, and a voice from heaven declared Jesus as God''s Son.'),
  ('00000000-0000-0000-0000-000000000203', 'What was Jesus'' first miracle?', 'Turning water into wine at Cana', 'John 2:1-11', 'John', 'life_of_jesus', 'medium', 'At a wedding in Cana, Jesus turned six jars of water into wine, revealing His glory to His disciples.'),
  ('00000000-0000-0000-0000-000000000204', 'How many loaves and fish fed the 5,000?', 'Five loaves and two fish', 'Matthew 14:17', 'Matthew', 'life_of_jesus', 'medium', 'Jesus took five loaves and two fish, gave thanks, and miraculously fed over 5,000 people with leftovers remaining.'),

  -- Parables (4)
  ('00000000-0000-0000-0000-000000000301', 'In the Parable of the Good Samaritan, who helped the injured man?', 'A Samaritan', 'Luke 10:33', 'Luke', 'parables', 'easy', 'A Samaritan showed compassion to a wounded traveler when a priest and Levite passed by, teaching that our neighbor is anyone in need.'),
  ('00000000-0000-0000-0000-000000000302', 'What did the prodigal son ask his father for?', 'His share of the inheritance', 'Luke 15:12', 'Luke', 'parables', 'easy', 'The younger son asked for his inheritance early, left home, squandered it, and returned in repentance to a loving father.'),
  ('00000000-0000-0000-0000-000000000303', 'In the Parable of the Lost Sheep, how many sheep did the shepherd have?', 'One hundred', 'Luke 15:4', 'Luke', 'parables', 'medium', 'The shepherd left 99 sheep to find the one that was lost, showing God''s love for every individual.'),
  ('00000000-0000-0000-0000-000000000304', 'What was the wise builder''s house built on?', 'Rock', 'Matthew 7:24', 'Matthew', 'parables', 'easy', 'The wise builder built his house on rock, and it stood firm through storms, representing those who hear and obey God''s word.'),

  -- Commandments (4)
  ('00000000-0000-0000-0000-000000000401', 'What is the first commandment?', 'You shall have no other gods before Me', 'Exodus 20:3', 'Exodus', 'commandments', 'easy', 'The first commandment establishes exclusive worship of God, forming the foundation of all other commandments.'),
  ('00000000-0000-0000-0000-000000000402', 'What is the fifth commandment?', 'Honor your father and your mother', 'Exodus 20:12', 'Exodus', 'commandments', 'medium', 'This commandment promises long life and establishes the importance of respecting parental authority.'),
  ('00000000-0000-0000-0000-000000000403', 'What is the eighth commandment?', 'You shall not steal', 'Exodus 20:15', 'Exodus', 'commandments', 'easy', 'This commandment protects personal property and teaches respect for what belongs to others.'),
  ('00000000-0000-0000-0000-000000000404', 'What did Jesus say is the greatest commandment?', 'Love the Lord your God with all your heart, soul, and mind', 'Matthew 22:37-38', 'Matthew', 'commandments', 'medium', 'Jesus identified loving God completely as the greatest commandment, with loving your neighbor as second.'),

  -- Psalms & Wisdom (4)
  ('00000000-0000-0000-0000-000000000501', 'Complete: "The Lord is my shepherd; I shall not ___."', 'Want', 'Psalm 23:1', 'Psalms', 'psalms_wisdom', 'easy', 'Psalm 23 is David''s declaration of trust in God as his provider and protector.'),
  ('00000000-0000-0000-0000-000000000502', 'What is the longest chapter in the Bible?', 'Psalm 119', 'Psalm 119', 'Psalms', 'psalms_wisdom', 'medium', 'Psalm 119 has 176 verses and is an acrostic poem celebrating the Word of God, with each section starting with a different Hebrew letter.'),
  ('00000000-0000-0000-0000-000000000503', 'Complete: "Trust in the Lord with all your heart and lean not on your own ___."', 'Understanding', 'Proverbs 3:5', 'Proverbs', 'psalms_wisdom', 'easy', 'This verse teaches complete reliance on God rather than human wisdom alone.'),
  ('00000000-0000-0000-0000-000000000504', 'What does Proverbs say is the beginning of wisdom?', 'The fear of the Lord', 'Proverbs 9:10', 'Proverbs', 'psalms_wisdom', 'easy', 'Reverence and awe of God is the foundation of all true knowledge and wisdom.');

-- Insert deck_questions mappings
INSERT INTO deck_questions (deck_id, question_id) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000201'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000202'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000203'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000204'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000301'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000302'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000303'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000304'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000401'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000402'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000403'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000404'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000501'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000502'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000503'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000504');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Verify seed data
-- SELECT COUNT(*) AS total_questions FROM questions;
-- SELECT category, COUNT(*) FROM questions GROUP BY category;
-- SELECT d.name, COUNT(dq.question_id) AS question_count FROM decks d JOIN deck_questions dq ON d.id = dq.deck_id GROUP BY d.name;
