import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserRole(session.user.id, session.user.email);
      } else {
        setRole(null);
        setRoleLoading(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId, email, retries = 3) {
    setRoleLoading(true);
    try {
      // Hardcoded fallback for master admin
      if (email === 'admin@123@lexindia.com' || email === 'admin@123.com' || email === 'admin@123') {
        console.log('Detected Admin email, applying bypass...');
        setRole('admin');
        setRoleLoading(false);
        setLoading(false);
        return;
      }

      console.log(`Fetching role for user ${userId}, attempt ${4 - retries}...`);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); // Better than .single() as it doesn't throw on missing
      
      if (error) throw error;

      if (data) {
        console.log('Role found:', data.role);
        setRole(data.role);
        setRoleLoading(false);
        setLoading(false);
      } else if (retries > 0) {
        console.log(`Profile not found, retrying in 1s... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUserRole(userId, email, retries - 1);
      } else {
        console.warn('Profile not found after retries. Defaulting to citizen.');
        setRole('citizen'); // Safe default
        setRoleLoading(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUserRole(userId, email, retries - 1);
      }
      setRole(null);
      setRoleLoading(false);
      setLoading(false);
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No active session');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          username: profileData.username,
          phone: profileData.phone,
          city: profileData.city,
          state: profileData.state,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    role,
    loading,
    roleLoading,
    updateProfile,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
