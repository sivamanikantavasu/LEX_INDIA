import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { 
  ArrowLeft, MessageSquare, ThumbsUp, MessageCircle, User,
  Clock, TrendingUp, Plus, Search, Filter, X, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DiscussionForum() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([
    { id: 'all', label: 'All Discussions' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [threads, setThreads] = useState([]);
  const [expandedThread, setExpandedThread] = useState(null);
  const [replies, setReplies] = useState({});
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category_id: ''
  });

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesData) {
          setCategories([
            { id: 'all', label: 'All Discussions' },
            ...categoriesData.map(c => ({ id: c.id, label: c.name }))
          ]);
        }

        await fetchThreads();
      } catch (error) {
        console.error('Error fetching forum data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [selectedCategory]);

  const fetchThreads = async () => {
    let query = supabase
      .from('forum_threads')
      .select('*, profiles(full_name), categories(name)')
      .order('created_at', { ascending: false });
    
    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;
    if (data) {
      setThreads(data.map(t => ({
        id: t.id,
        title: t.title,
        author: t.profiles?.full_name || 'Anonymous',
        category: t.categories?.name || 'General',
        likes: 0, // Mocked
        replies: 0, // Mocked
        time: new Date(t.created_at).toLocaleDateString(),
        preview: t.content.substring(0, 150) + '...',
        trending: false
      })));
    }
  };

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please login to post a discussion');
        return;
      }

      const { error } = await supabase
        .from('forum_threads')
        .insert([{
          title: newDiscussion.title,
          content: newDiscussion.content,
          category_id: newDiscussion.category_id || null,
          author_id: user.id
        }]);

      if (error) throw error;

      setNewDiscussion({ title: '', content: '', category_id: '' });
      setShowNewDiscussion(false);
      await fetchThreads();
    } catch (error) {
      alert('Error posting discussion: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#FF9933] animate-spin" />
          <p className="text-[#0A1F44] font-medium">Loading forum discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/citizen" 
              className="flex items-center gap-2 text-[#64748B] hover:text-[#0A1F44] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            
            <button 
              onClick={() => setShowNewDiscussion(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1A3A6B] transition-all"
            >
              <Plus className="w-5 h-5" />
              New Discussion
            </button>
          </div>
        </div>
      </div>
      
      {/* Page Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 
            className="text-5xl text-[#0A1F44] mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            Discussion Forum
          </h1>
          <p className="text-lg text-[#64748B]">
            Engage with fellow citizens, share insights, and learn together
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] sticky top-6">
              <h3 className="text-lg text-[#0A1F44] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm ${
                      selectedCategory === category.id
                        ? 'bg-[#FF9933] text-white font-medium'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#FF9933]/10 hover:text-[#FF9933]'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Discussions */}
          <div className="lg:col-span-3">
             <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent text-[#0A1F44] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            <div className="space-y-4">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9933] to-[#0A1F44] flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg text-[#0A1F44] font-medium hover:text-[#FF9933] transition-colors font-serif">
                          {thread.title}
                        </h3>
                        <span className="px-2 py-1 bg-[#F8FAFC] text-[#64748B] rounded text-xs">
                          {thread.category}
                        </span>
                      </div>

                      <p className="text-[#64748B] text-sm mb-4 line-clamp-2">
                        {thread.preview}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-[#64748B]">
                        <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{thread.author}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{thread.time}</span>
                        <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{thread.replies} replies</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {threads.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-[#E2E8F0]">
                  <MessageSquare className="w-16 h-16 text-[#CBD5E1] mx-auto mb-4" />
                  <h3 className="text-xl text-[#0A1F44] mb-2 font-medium">No discussions found</h3>
                  <p className="text-[#64748B]">Be the first to start a conversation!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Discussion Modal */}
      <AnimatePresence>
        {showNewDiscussion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A1F44]/80 backdrop-blur-sm"
              onClick={() => setShowNewDiscussion(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-8 py-6 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-3xl text-[#0A1F44] font-serif font-bold">New Discussion</h2>
                <button onClick={() => setShowNewDiscussion(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X className="w-6 h-6 text-[#64748B]" />
                </button>
              </div>

              <form onSubmit={handleSubmitDiscussion} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm text-[#0A1F44] mb-2 font-medium">Category</label>
                  <select
                    required
                    value={newDiscussion.category_id}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none"
                  >
                    <option value="">Select a Category</option>
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#0A1F44] mb-2 font-medium">Discussion Title</label>
                  <input
                    type="text"
                    required
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#0A1F44] mb-2 font-medium">Content</label>
                  <textarea
                    required
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    placeholder="Share your insights..."
                    rows="6"
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#E2E8F0]">
                  <button type="button" onClick={() => setShowNewDiscussion(false)} className="px-6 py-3 text-[#64748B]">Cancel</button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1A3A6B] transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Post Discussion'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}