-- LexIndia "Perfect" Seed Data
-- Run this in your Supabase SQL Editor to populate your dashboard!

-- 1. Categories
INSERT INTO public.categories (name, slug, description) VALUES
('Constitutional Law', 'constitutional-law', 'The bedrock of Indian democracy: exploring rights, duties, and the framework of the nation.'),
('Criminal Justice', 'criminal-justice', 'Understanding procedures, penalties, and the path to legal recourse.'),
('Civil Rights', 'civil-rights', 'Exploring the protections and freedoms afforded to every individual under the law.'),
('Digital Jurisprudence', 'digital-law', 'Legal perspectives on the evolving landscape of technology, privacy, and cyber laws.'),
('Environmental Protection', 'environmental-law', 'The legal journey towards a sustainable future and protecting our natural heritage.');

-- 2. Professional Articles
-- Note: Replace 'admin' username check with your actual setup if needed.
INSERT INTO public.articles (title, description, content, excerpt, category_id, status, is_official)
SELECT 
  'The Evolution of the Preamble', 
  'A deep dive into the philosophy and history of the Indian Preamble.',
  'The Preamble to the Constitution of India is a brief introductory statement that sets out guidelines, which guide the people of the nation, and to present the principles of the Constitution and to indicate the source from which the document derives its authority, meaning, the people. The hopes and aspirations of the people as well as the ideals before our nation are described in the preamble in clear words.',
  'The hopes and aspirations of the people as well as the ideals before our nation...',
  c.id,
  'published',
  TRUE
FROM public.categories c WHERE c.slug = 'constitutional-law' LIMIT 1;

INSERT INTO public.articles (title, description, content, excerpt, category_id, status, is_official)
SELECT 
  'Cyber Laws: Navigating the IT Act', 
  'Essential knowledge for the digital age.',
  'The Information Technology Act, 2000 is the primary law in India dealing with cybercrime and electronic commerce. It is based on the UNCITRAL Model Law on Electronic Commerce 1996 (UNCITRAL Model) recommended by the General Assembly of United Nations by a resolution dated 30 January 1997.',
  'Everything you need to know about the IT Act and digital safety...',
  c.id,
  'published',
  TRUE
FROM public.categories c WHERE c.slug = 'digital-law' LIMIT 1;

-- 3. Interactive Quizzes
INSERT INTO public.quizzes (title, description, difficulty, category_id)
SELECT 
  'Constitution 101', 
  'Test your basic knowledge of the world''s longest written constitution.',
  'Beginner',
  c.id
FROM public.categories c WHERE c.slug = 'constitutional-law' LIMIT 1;

INSERT INTO public.quizzes (title, description, difficulty, category_id)
SELECT 
  'Citizen''s Duty Challenge', 
  'Do you know your fundamental duties as an Indian citizen?',
  'Intermediate',
  c.id
FROM public.categories c WHERE c.slug = 'civil-rights' LIMIT 1;

-- 4. Quiz Questions for "Constitution 101"
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer_index)
SELECT 
  q.id,
  'Who is known as the "Father of the Indian Constitution"?',
  '["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Sardar Patel"]'::jsonb,
  2
FROM public.quizzes q WHERE q.title = 'Constitution 101' LIMIT 1;

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer_index)
SELECT 
  q.id,
  'The Indian Constitution was adopted on which date?',
  '["15 August 1947", "26 November 1949", "26 January 1950", "30 January 1948"]'::jsonb,
  1
FROM public.quizzes q WHERE q.title = 'Constitution 101' LIMIT 1;

-- 5. Achievements
INSERT INTO public.achievements (name, description, points_reward, icon_url) VALUES
('First Word', 'Read your first legal article on LexIndia.', 10, 'book'),
('Quiz Master', 'Scored a perfect 100% in any quiz.', 50, 'award'),
('Scholar', 'Completed 5 different quizzes.', 100, 'medal'),
('Early Guardian', 'Joined LexIndia during its foundational phase.', 100, 'shield');
