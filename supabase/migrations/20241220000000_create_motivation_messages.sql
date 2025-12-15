-- Create motivation_messages table
CREATE TABLE IF NOT EXISTS motivation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'fitness', 'nutrition', 'mental_health')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample motivation messages
INSERT INTO motivation_messages (message, category) VALUES
  ('The secret of getting ahead is getting started.', 'general'),
  ('Your only limit is your mind.', 'general'),
  ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'general'),
  ('The only way to do great work is to love what you do.', 'general'),
  ('Don''t watch the clock; do what it does. Keep going.', 'general'),
  ('The future belongs to those who believe in the beauty of their dreams.', 'general'),
  ('It''s not whether you get knocked down, it''s whether you get up.', 'general'),
  ('The way to get started is to quit talking and begin doing.', 'general'),
  ('Life is what happens to you while you''re busy making other plans.', 'general'),
  ('The only impossible journey is the one you never begin.', 'general'),
  ('Every workout counts. Every meal matters. Every choice shapes your future.', 'fitness'),
  ('Strength doesn''t come from what you can do. It comes from overcoming the things you once thought you couldn''t.', 'fitness'),
  ('The body achieves what the mind believes.', 'fitness'),
  ('Fitness is not about being better than someone else. It''s about being better than you used to be.', 'fitness'),
  ('You don''t have to be great to get started, but you have to get started to be great.', 'fitness'),
  ('The pain you feel today will be the strength you feel tomorrow.', 'fitness'),
  ('Your body can do it. It''s your mind that you have to convince.', 'fitness'),
  ('The only bad workout is the one that didn''t happen.', 'fitness'),
  ('You are stronger than you think and more capable than you imagine.', 'fitness'),
  ('Progress, not perfection.', 'fitness'),
  ('You are what you eat, so don''t be fast, cheap, easy, or fake.', 'nutrition'),
  ('Let food be thy medicine and medicine be thy food.', 'nutrition'),
  ('The groundwork for all happiness is good health.', 'nutrition'),
  ('Take care of your body. It''s the only place you have to live.', 'nutrition'),
  ('Healthy eating is a way of life, so it''s important to establish routines that are simple, realistically, and ultimately livable.', 'nutrition'),
  ('The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison.', 'nutrition'),
  ('You don''t have to eat less, you just have to eat right.', 'nutrition'),
  ('Good nutrition is a responsibility, not a restriction.', 'nutrition'),
  ('Your diet is a bank account. Good food choices are good investments.', 'nutrition'),
  ('The groundwork for all happiness is good health.', 'nutrition'),
  ('Peace comes from within. Do not seek it without.', 'mental_health'),
  ('The mind is everything. What you think you become.', 'mental_health'),
  ('You have been assigned this mountain to show others it can be moved.', 'mental_health'),
  ('Mental health is not a destination, but a process. It''s about how you drive, not where you''re going.', 'mental_health'),
  ('You are not your thoughts. You are the observer of your thoughts.', 'mental_health'),
  ('The present moment is the only time over which we have dominion.', 'mental_health'),
  ('You yourself, as much as anybody in the entire universe, deserve your love and affection.', 'mental_health'),
  ('The mind is like water. When agitated, it becomes difficult to see. When calm, everything becomes clear.', 'mental_health'),
  ('You are enough. You are so enough. It is unbelievable how enough you are.', 'mental_health'),
  ('Self-care is not selfish. You cannot serve from an empty vessel.', 'mental_health');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_motivation_messages_updated_at 
  BEFORE UPDATE ON motivation_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
