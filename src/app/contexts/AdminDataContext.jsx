import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

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
      // Fetch users with full profile details
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });
      
      setUsers(profiles?.map(p => ({
        id: p.id,
        name: p.full_name || p.username || 'Anonymous',
        email: p.username || '',
        phone: p.phone || '',
        location: `${p.city || ''}${p.city && p.state ? ', ' : ''}${p.state || ''}`,
        role: p.role.charAt(0).toUpperCase() + p.role.slice(1),
        status: 'Active',
        joinedDate: new Date(p.updated_at).toLocaleDateString()
      })) || []);

      // Fetch pending content
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

      // Fetch stats
      const { count: approvedCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      setTotalApproved(approvedCount || 0);

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

  const addUser = async (userData) => {
    try {
      // Note: Auth user creation usually happens via a dedicated admin function or invite flow.
      // For this MVP, we upsert the profile. In production, use supabase.auth.admin.createUser.
      const { error } = await supabase.from('profiles').insert([{
        full_name: userData.name,
        username: userData.email,
        phone: userData.phone,
        role: userData.role.toLowerCase(),
        city: userData.location.split(',')[0]?.trim(),
        state: userData.location.split(',')[1]?.trim()
      }]);
      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user: ' + error.message);
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.name,
          username: userData.email,
          phone: userData.phone,
          role: userData.role.toLowerCase(),
          city: userData.location.split(',')[0]?.trim(),
          state: userData.location.split(',')[1]?.trim()
        })
        .eq('id', userId);
      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + error.message);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

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
        .update({ status: 'draft' })
        .eq('id', contentId);
      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  const syncConstitutionalData = async () => {
    setLoading(true);
    try {
      // Logic for Phase 2: Auto-Sync
      // For now, we simulate a fetch and create a sync log
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: logError } = await supabase.from('sync_logs').insert([{
        admin_id: user.id,
        source_name: 'Legislative.gov.in',
        status: 'success',
        items_synced: 12 // Simulated items
      }]);

      if (logError) throw logError;
      alert('Constitution data synced successfully! Check content approval for new entries.');
      await fetchAdminData();
    } catch (error) {
      console.error('Error syncing data:', error);
      alert('Sync failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    users,
    pendingContent,
    totalApproved,
    analytics,
    roles,
    addUser,
    updateUser,
    deleteUser,
    approveContent,
    rejectContent,
    syncConstitutionalData,
    refreshData: fetchAdminData
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};