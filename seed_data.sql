-- LexIndia Professional Seed Data
-- Run this in your Supabase SQL Editor to populate your dashboard!

-- 1. Insert Categories
INSERT INTO categories (name, slug, description) VALUES
('Constitutional Law', 'constitutional-law', 'Exploring the foundation of Indian democracy and the supreme Law of the Land.'),
('Civil Rights', 'civil-rights', 'Protecting individual freedoms and ensuring equal opportunities for every citizen.'),
('Criminal Justice', 'criminal-justice', 'Understanding the legal framework that defines crimes and judicial processes.'),
('Family Law', 'family-law', 'Laws governing marriage, divorce, inheritance, and personal relationships.'),
('Environmental Law', 'environmental-law', 'Legal perspectives on protecting India''s natural heritage and ecosystem.');

-- 2. Insert Admin Profile (using a hardcoded ID for demo purposes)
-- Note: Replace the ID below with your actual admin ID if you know it!
INSERT INTO profiles (id, username, full_name, role)
SELECT id, 'admin', 'System Admin', 'admin' 
FROM auth.users 
WHERE email = 'admin@123.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 3. Insert Sample Articles
INSERT INTO articles (title, description, content, category_id, author_id, status, is_official)
SELECT 
  'Understanding Your Fundamental Rights', 
  'A clear guide to Part III of the Indian Constitution.',
  'Fundamental Rights are the basic human rights of all citizens as defined in Part III of the Constitution. They include the Right to Equality, Freedom, Against Exploitation, Religion, Culture, Education, and Constitutional Remedies.',
  c.id,
  p.id,
  'published',
  TRUE
FROM categories c, profiles p
WHERE c.slug = 'constitutional-law' AND p.username = 'admin'
LIMIT 1;

INSERT INTO articles (title, description, content, category_id, author_id, status, is_official)
SELECT 
  'New Judicial Reforms in 2024', 
  'Analyzing the latest changes in the legal system.',
  'Major reforms are being introduced to speed up the justice delivery system in India. These include digitization of courts, new sentencing guidelines, and expanded legal aid services.',
  c.id,
  p.id,
  'published',
  TRUE
FROM categories c, profiles p
WHERE c.slug = 'criminal-justice' AND p.username = 'admin'
LIMIT 1;

-- 4. Insert Quizzes
INSERT INTO quizzes (title, description, difficulty, category_id, author_id, time_limit_minutes)
SELECT 
  'Master the Preamble', 
  'Test your knowledge about the opening statement of the Constitution.',
  'Beginner',
  c.id,
  p.id,
  10
FROM categories c, profiles p
WHERE c.slug = 'constitutional-law' AND p.username = 'admin'
LIMIT 1;

-- 5. Insert Questions for "Master the Preamble"
INSERT INTO questions (quiz_id, question_text, options, correct_answer_index)
SELECT 
  q.id,
  'When was the Preamble adopted?',
  '["1947", "1949", "1950", "1952"]'::jsonb,
  1
FROM quizzes q WHERE q.title = 'Master the Preamble' LIMIT 1;

INSERT INTO questions (quiz_id, question_text, options, correct_answer_index)
SELECT 
  q.id,
  'Which word was NOT originally in the Preamble?',
  '["Sovereign", "Socialist", "Democratic", "Republic"]'::jsonb,
  1
FROM quizzes q WHERE q.title = 'Master the Preamble' LIMIT 1;

-- 6. Insert Achievements
INSERT INTO achievements (name, description, points_required, icon_url) VALUES
('Legal Scholar', 'Completed 5 constitutional quizzes.', 50, 'shield'),
('Civic Leader', 'Read all foundational articles.', 30, 'award'),
('Law Guardian', 'Achieved a perfect score in a criminal law quiz.', 100, 'star');
