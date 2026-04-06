import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const EducatorContext = createContext();

export const useEducator = () => {
  const context = useContext(EducatorContext);
  if (!context) {
    throw new Error('useEducator must be used within EducatorProvider');
  }
  return context;
};

export const EducatorProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchEducatorData();
  }, []);

  async function fetchEducatorData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Quizzes
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*, questions(count)')
        .eq('author_id', user.id);
      
      setQuizzes(quizData || []);

      // Fetch Sessions
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('*')
        .eq('educator_id', user.id)
        .order('scheduled_at', { ascending: true });
      
      setSessions(sessionData || []);

    } catch (error) {
      console.error('Error fetching educator data:', error);
    } finally {
      setLoading(false);
    }
  }

  const createQuiz = async (quizData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newQuiz, error } = await supabase
        .from('quizzes')
        .insert([{
          title: quizData.title,
          description: quizData.description,
          author_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (quizData.questions && quizData.questions.length > 0) {
        const questionsToInsert = quizData.questions.map(q => ({
          quiz_id: newQuiz.id,
          question_text: q.text,
          options: q.options,
          correct_answer_index: q.correctIndex,
          explanation: q.explanation
        }));
        await supabase.from('questions').insert(questionsToInsert);
      }

      await fetchEducatorData();
      return newQuiz;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  };

  const scheduleSession = async (sessionData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('sessions').insert([{
        educator_id: user.id,
        title: sessionData.title,
        description: sessionData.description,
        scheduled_at: sessionData.scheduled_at,
        meeting_link: sessionData.meeting_link
      }]);

      if (error) throw error;
      await fetchEducatorData();
    } catch (error) {
      console.error('Error scheduling session:', error);
      throw error;
    }
  };

  const deleteSession = async (id) => {
    try {
      await supabase.from('sessions').delete().eq('id', id);
      await fetchEducatorData();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  };

  const value = {
    loading,
    quizzes,
    sessions,
    createQuiz,
    scheduleSession,
    deleteSession,
    refreshData: fetchEducatorData
  };

  return (
    <EducatorContext.Provider value={value}>
      {children}
    </EducatorContext.Provider>
  );
};
