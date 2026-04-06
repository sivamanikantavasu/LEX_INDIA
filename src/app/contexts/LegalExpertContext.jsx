import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const LegalExpertContext = createContext();

export const useLegalExpert = () => {
  const context = useContext(LegalExpertContext);
  if (!context) {
    throw new Error('useLegalExpert must be used within LegalExpertProvider');
  }
  return context;
};

export const LegalExpertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [advisoryRequests, setAdvisoryRequests] = useState([]);

  useEffect(() => {
    fetchExpertData();
  }, []);

  async function fetchExpertData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*, categories(name)')
        .order('updated_at', { ascending: false });
      
      setArticles(articlesData || []);

      // Fetch Advisory Requests
      const { data: advisoryData } = await supabase
        .from('advisory_requests')
        .select('*, profiles!citizen_id(full_name)')
        .order('created_at', { ascending: false });
      
      setAdvisoryRequests(advisoryData?.map(r => ({
        id: r.id,
        citizen_id: r.citizen_id,
        citizen_name: r.profiles?.full_name || 'Anonymous',
        subject: r.subject,
        query: r.query,
        response: r.response,
        status: r.status,
        created_at: r.created_at,
        replied_at: r.replied_at
      })) || []);

    } catch (error) {
      console.error('Error fetching expert data:', error);
    } finally {
      setLoading(false);
    }
  }

  const publishInsight = async (insightData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('articles').insert([{
        title: insightData.title,
        content: insightData.content,
        category_id: insightData.category_id,
        author_id: user.id,
        status: insightData.status || 'under_review'
      }]);

      if (error) throw error;
      await fetchExpertData();
    } catch (error) {
      console.error('Error publishing insight:', error);
      throw error;
    }
  };

  const respondToAdvisory = async (requestId, responseText) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('advisory_requests')
        .update({
          response: responseText,
          status: 'replied',
          expert_id: user.id,
          replied_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      await fetchExpertData();
    } catch (error) {
      console.error('Error responding to advisory:', error);
      throw error;
    }
  };

  const value = {
    loading,
    articles,
    advisoryRequests,
    publishInsight,
    respondToAdvisory,
    refreshData: fetchExpertData
  };

  return (
    <LegalExpertContext.Provider value={value}>
      {children}
    </LegalExpertContext.Provider>
  );
};
