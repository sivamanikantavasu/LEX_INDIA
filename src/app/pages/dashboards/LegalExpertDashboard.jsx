import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  LayoutDashboard, Scale, BookOpen, FileText, MessageCircle, 
  AlertCircle, Settings, Bell, Plus, Edit, CheckCircle, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LegalExpertDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState([]);
  const [recentAdvisory, setRecentAdvisory] = useState([]);
  
  useEffect(() => {
    fetchLegalExpertData();
  }, []);

  async function fetchLegalExpertData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch pending advisory requests count
      const { count: pendingAdvisory } = await supabase
        .from('advisory_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      setPendingCount(pendingAdvisory || 0);

      // Fetch recent advisory requests
      const { data: advisoryData } = await supabase
        .from('advisory_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      setRecentAdvisory(advisoryData || []);

      // Fetch articles updated by this expert (if they track it) or total articles
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      setStats([
        { 
          label: 'Total Articles', 
          value: (totalArticles || 0).toString(), 
          icon: Scale,
          color: 'from-[#0A1F44] to-[#1A3A6B]',
          path: '/legal-expert/articles'
        },
        { 
          label: 'Insights Shared', 
          value: '0', // Placeholder for now
          icon: BookOpen,
          color: 'from-[#FF9933] to-[#FFB366]',
          path: '/legal-expert/insights'
        },
        { 
          label: 'Cases Verified', 
          value: '0', // Placeholder for now
          icon: FileText,
          color: 'from-[#138808] to-[#1ea712]',
          path: '/legal-expert/cases'
        },
        { 
          label: 'Pending Advisory', 
          value: (pendingAdvisory || 0).toString(), 
          icon: MessageCircle,
          color: 'from-[#1A3A6B] to-[#0A1F44]',
          path: '/legal-expert/advisory'
        },
      ]);
    } catch (error) {
      console.error('Error fetching legal expert data:', error);
    } finally {
      setLoading(false);
    }
  }
  
  const recentUpdates = [];
  const recentAmendments = [];

  if (loading) {
    return (
      <DashboardLayout title="Legal Expert Dashboard" role="Legal Expert">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-[#FF9933] animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const navigationItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/legal-expert', active: true },
    { label: 'Articles', icon: Scale, path: '/legal-expert/articles' },
    { label: 'Legal Insights', icon: BookOpen, path: '/legal-expert/insights' },
    { label: 'Case References', icon: FileText, path: '/legal-expert/cases' },
    { label: 'Advisory Requests', icon: MessageCircle, path: '/legal-expert/advisory', badge: pendingCount > 0 ? String(pendingCount) : undefined },
    { label: 'Settings', icon: Settings, path: '/legal-expert/settings' },
  ];

  return (
    <DashboardLayout navigationItems={navigationItems} title="Legal Expert Dashboard" role="Legal Expert">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => navigate(stat.path)}
              className="glass-white rounded-xl p-6 hover-lift card-elevated cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl text-[#0A1F44] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stat.value}
              </h3>
              <p className="text-sm text-[#64748B]">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-xl text-[#0A1F44] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/legal-expert/insights')}
            className="p-4 bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] text-white rounded-xl hover-lift transition-all text-left group"
          >
            <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="mb-1">Add Legal Insight</h4>
            <p className="text-xs text-white/70">Share expert legal analysis</p>
          </button>
          <button 
            onClick={() => navigate('/legal-expert/articles')}
            className="p-4 bg-gradient-to-br from-[#FF9933] to-[#FFB366] text-white rounded-xl hover-lift transition-all text-left group"
          >
            <Edit className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="mb-1">Update Article</h4>
            <p className="text-xs text-white/70">Modify constitutional content</p>
          </button>
          <button 
            onClick={() => navigate('/legal-expert/cases')}
            className="p-4 bg-gradient-to-br from-[#138808] to-[#1ea712] text-white rounded-xl hover-lift transition-all text-left group"
          >
            <FileText className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="mb-1">Add Case Reference</h4>
            <p className="text-xs text-white/70">Link landmark judgments</p>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Updates */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-white rounded-xl p-6 card-elevated h-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-[#0A1F44]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Recent Updates
            </h3>
            <button className="text-[#FF9933] hover:text-[#E87F1F] transition-colors text-sm">
              View All
            </button>
          </div>
          {recentUpdates.length === 0 ? (
            <div className="p-8 text-center">
              <Scale className="w-12 h-12 text-[#0A1F44]/20 mx-auto mb-3" />
              <p className="text-[#64748B] text-sm">No recent updates yet</p>
              <p className="text-[#64748B] text-xs mt-1">Updates will appear here when you modify articles</p>
            </div>
          ) : (
             <div className="space-y-4">
               {/* Populate with real data if available */}
             </div>
          )}
        </motion.div>

        {/* Advisory Requests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-white rounded-xl p-6 card-elevated h-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-[#0A1F44]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Advisory Requests
            </h3>
            <span className="bg-[#FF9933] text-white text-xs px-2 py-1 rounded-full">
              {recentAdvisory.length} Recent
            </span>
          </div>
          {recentAdvisory.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-[#0A1F44]/20 mx-auto mb-3" />
              <p className="text-[#64748B] text-sm">No advisory requests yet</p>
              <p className="text-[#64748B] text-xs mt-1">Requests from users will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAdvisory.map((request, index) => (
                <div key={index} className="p-4 border border-[#0A1F44]/10 rounded-lg hover:border-[#FF9933] transition-all">
                  <h4 className="text-[#0A1F44] mb-2">{request.subject}</h4>
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-3">
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate('/legal-expert/advisory')}
                    className="w-full py-2 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1A3A6B] transition-colors text-sm font-medium"
                  >
                    Respond
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Amendments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-6 glass-white rounded-xl p-6 card-elevated"
      >
        <h3 className="text-xl text-[#0A1F44] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          Recent Constitutional Amendments
        </h3>
        {recentAmendments.length === 0 ? (
          <div className="p-8 text-center">
            <Edit className="w-12 h-12 text-[#0A1F44]/20 mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No amendments data yet</p>
            <p className="text-[#64748B] text-xs mt-1">Constitutional amendments will appear here when available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Populate when data is available */}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}