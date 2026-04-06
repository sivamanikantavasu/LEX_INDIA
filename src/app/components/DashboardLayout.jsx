import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { 
  Shield, Bell, Menu, X, LogOut, User, 
  ChevronDown, CheckCircle, Info, AlertTriangle
} from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children, navigationItems, title, role }) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  
  const userEmail = user?.email || 'user@lexindia.gov.in';
  const userName = role === 'Administrator' ? 'Administrator' : (user?.user_metadata?.full_name || 'User');

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) setNotifications(data);
    }
    fetchNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  const handleProfileClick = () => {
    setProfileMenuOpen(false);
    // Navigate to profile page based on role
    if (role === 'Administrator') {
      navigate('/admin/profile');
    } else if (role === 'Educator') {
      navigate('/educator/profile');
    } else if (role === 'Legal Expert') {
      navigate('/legal-expert/profile');
    } else if (role === 'Citizen') {
      navigate('/citizen/profile');
    }
  };

  const markAsRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] ashoka-pattern">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#0A1F44] to-[#051229] text-white z-50 overflow-y-auto"
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-0.5">
                  <div className="w-full h-full rounded-full bg-[#0A1F44] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                    LexIndia
                  </h1>
                  <p className="text-xs text-white/60">Constitution Platform</p>
                </div>
              </Link>
            </div>

            {/* Role Badge */}
            <div className="px-6 py-4">
              <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg px-4 py-3">
                <p className="text-xs text-white/60 mb-1">Welcome back</p>
                <p className="text-xs text-white/60 mb-1">Logged in as</p>
                <p className="text-[#FF9933]">{role}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="px-4 py-6 space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-white/10 ${
                      item.active ? 'bg-[#FF9933] text-white' : 'text-white/80'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-[#FF9933] text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button in Sidebar */}
            <div className="px-4 py-6 mt-auto border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 glass-white border-b border-[#0A1F44]/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
                >
                  {sidebarOpen ? <X className="w-6 h-6 text-[#0A1F44]" /> : <Menu className="w-6 h-6 text-[#0A1F44]" />}
                </button>
                <div>
                  <h2 className="text-2xl text-[#0A1F44]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {title}
                  </h2>
                  <p className="text-sm text-[#64748B]">Welcome to your dashboard</p>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <SearchBar role={roleKey} />

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors relative"
                  >
                    <Bell className="w-6 h-6 text-[#0A1F44]" />
                    {notifications.some(n => !n.is_read) && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 glass-white rounded-xl shadow-2xl border border-[#0A1F44]/10 overflow-hidden"
                      >
                        <div className="p-4 border-b border-[#0A1F44]/10 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-[#0A1F44]">Notifications</h3>
                          {notifications.length > 0 && (
                            <button className="text-[10px] text-[#FF9933] hover:underline">Mark all as read</button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <div 
                                key={n.id} 
                                className={`p-4 border-b border-[#0A1F44]/5 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-orange-50/30' : ''}`}
                                onClick={() => markAsRead(n.id)}
                              >
                                {n.type === 'success' && <CheckCircle className="w-5 h-5 text-[#138808] flex-shrink-0" />}
                                {n.type === 'info' && <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                                {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#FF9933] flex-shrink-0" />}
                                <div>
                                  <p className="text-sm text-[#0A1F44] font-medium leading-tight mb-1">{n.title}</p>
                                  <p className="text-xs text-[#64748B] line-clamp-2">{n.content}</p>
                                  <p className="text-[10px] text-[#94A3B8] mt-1">{new Date(n.created_at).toLocaleTimeString()}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-400">No new notifications</p>
                            </div>
                          )}
                        </div>
                   
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(!profileMenuOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9933] to-[#0A1F44] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 glass-white rounded-xl shadow-2xl border border-[#0A1F44]/10 overflow-hidden"
                      >
                        <div className="p-4 border-b border-[#0A1F44]/10">
                          <p className="text-sm text-[#0A1F44] font-medium">{userName}</p>
                          <p className="text-xs text-[#64748B]">{userEmail}</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#0A1F44]"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                        </div>
                        <div className="p-2 border-t border-[#0A1F44]/10">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}