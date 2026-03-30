import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminDataContext = createContext();

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
};

export const AdminDataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pendingContent, setPendingContent] = useState([]);
  const [totalApproved, setTotalApproved] = useState(0);
  const [systemLogs, setSystemLogs] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalPageViews: 0,
    activeUsers: 0,
    quizCompletions: 0,
    avgSessionTime: '0m 0s',
    topArticles: []
  });

  const [roles] = useState([
    { id: 'admin', name: 'Administrator', permissions: ['All'], color: 'from-[#0A1F44] to-[#1A3A6B]' },
    { id: 'educator', name: 'Educator', permissions: ['Create Content'], color: 'from-[#FF9933] to-[#FFB366]' },
    { id: 'legal-expert', name: 'Legal Expert', permissions: ['Advisory'], color: 'from-[#138808] to-[#1ea712]' },
    { id: 'citizen', name: 'Citizen', permissions: ['Learn'], color: 'from-[#1A3A6B] to-[#0A1F44]' }
  ]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    try {
      // Fetch users
      const { data: profiles } = await supabase.from('profiles').select('*');
      setUsers(profiles?.map(p => ({
        id: p.id,
        name: p.full_name || p.username || 'Anonymous',
        email: p.username || '', // Note: Supabase username field used as email placeholder
        role: p.role,
        status: 'Active',
        joinedDate: new Date(p.updated_at).toLocaleDateString()
      })) || []);

      // Fetch pending content (under_review status)
      const { data: pending } = await supabase
        .from('articles')
        .select('*, profiles(full_name)')
        .eq('status', 'under_review');
      
      setPendingContent(pending?.map(a => ({
        id: a.id,
        title: a.title,
        author: a.profiles?.full_name || 'Anonymous',
        submittedDate: new Date(a.created_at).toLocaleDateString(),
        type: 'Article'
      })) || []);

      // Fetch total approved
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      setTotalApproved(count || 0);

      // Fetch total views
      const { data: viewsData } = await supabase.from('articles').select('views');
      const totalViews = viewsData?.reduce((sum, a) => sum + (Number(a.views) || 0), 0) || 0;
      
      setAnalytics(prev => ({
        ...prev,
        totalPageViews: totalViews,
        activeUsers: profiles?.length || 0
      }));

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  const approveContent = async (contentId) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: 'published' })
        .eq('id', contentId);
      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  const rejectContent = async (contentId) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: 'draft' }) // Send back to draft
        .eq('id', contentId);
      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  const value = {
    loading,
    users,
    pendingContent,
    totalApproved,
    analytics,
    roles,
    approveContent,
    rejectContent,
    refreshData: fetchAdminData,
    systemLogs: [] // Mocked for now
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};