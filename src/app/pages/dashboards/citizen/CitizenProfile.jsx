import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  LayoutDashboard, BookOpen, Scale, Heart, Settings, Bell, 
  Bookmark, User, Mail, Phone, MapPin, Calendar, Award, 
  BookOpen as BookIcon, Clock, TrendingUp, Save, Edit2, X
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CitizenProfile() {
  const { user, updateProfile: authUpdateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinedDate: '',
    bio: '',
    stats: {
      articlesRead: 0,
      bookmarks: 0,
      quizScore: 0,
      hoursSpent: 0
    }
  });

  const [editData, setEditData] = useState(profileData);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        // Fetch bookmarks count
        const { count: bookmarkCount } = await supabase
          .from('bookmarks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const mappedData = {
          name: profile.full_name || 'LexIndia Citizen',
          email: user.email || '',
          phone: profile.phone || '',
          location: profile.city ? `${profile.city}, ${profile.state}` : '',
          joinedDate: new Date(profile.created_at).toLocaleDateString(),
          bio: profile.bio || '',
          stats: {
            articlesRead: 12, // Simulated for now
            bookmarks: bookmarkCount || 0,
            quizScore: profile.metadata?.total_quiz_score || 0,
            hoursSpent: 5
          }
        };
        setProfileData(mappedData);
        setEditData(mappedData);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    const [city, state] = editData.location.split(',').map(s => s.trim());
    try {
      await authUpdateProfile({
        full_name: editData.name,
        phone: editData.phone,
        city: city || '',
        state: state || '',
        bio: editData.bio
      });
      setProfileData(editData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  };

  const navigationItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/citizen' },
    { label: 'Explore Constitution', icon: BookOpen, path: '/citizen/explore' },
    { label: 'Fundamental Rights', icon: Scale, path: '/citizen/rights' },
    { label: 'Fundamental Duties', icon: Heart, path: '/citizen/duties' },
    { label: 'Bookmarks', icon: Bookmark, path: '/citizen/bookmarks' },
    { label: 'Notifications', icon: Bell, path: '/citizen/notifications' },
    { label: 'Settings', icon: Settings, path: '/citizen/settings' },
  ];

  return (
    <DashboardLayout navigationItems={navigationItems} title="Profile" role="Citizen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl text-[#0A1F44] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            My Profile
          </h1>
          <p className="text-[#64748B] text-lg">View and manage your profile information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#FF9933] text-white rounded-lg hover:bg-[#E87F1F] transition-all"
          >
            <Edit2 className="w-5 h-5" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-[#138808] text-white rounded-lg hover:bg-[#0f6c06] transition-all"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        )}
      </motion.div>

      <div className="space-y-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-white rounded-xl p-8 card-elevated"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF9933] to-[#FFB366] flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {!isEditing ? (
                <>
                  <h2 className="text-3xl text-[#0A1F44] mb-2 font-serif">{profileData.name}</h2>
                  <p className="text-[#64748B] mb-4">{profileData.bio || 'Sharing insights and learning about the Indian Constitution.'}</p>
                </>
              ) : (
                <div className="space-y-4 max-w-xl">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Full Name"
                  />
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg resize-none"
                    placeholder="Tell us about yourself..."
                    rows={2}
                  />
                </div>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[#64748B]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profileData.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: BookIcon, label: 'Articles Read', value: profileData.stats.articlesRead, color: 'from-[#FF9933] to-[#FFB366]' },
            { icon: Bookmark, label: 'Bookmarks', value: profileData.stats.bookmarks, color: 'from-[#0A1F44] to-[#1A3A6B]' },
            { icon: Award, label: 'Quiz Score', value: profileData.stats.quizScore, color: 'from-[#138808] to-[#1ea712]' },
            { icon: Clock, label: 'Learning Level', value: 'Lv.4', color: 'from-[#1A3A6B] to-[#2A4A7B]' }
          ].map((stat, i) => (
            <div key={i} className="glass-white rounded-xl p-6 text-center">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl text-[#0A1F44] mb-1 font-serif">{stat.value}</div>
              <div className="text-sm text-[#64748B]">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Details */}
          <div className="glass-white rounded-xl p-6 card-elevated">
            <h3 className="text-xl text-[#0A1F44] mb-6 font-serif">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-[#64748B]" />
                <div className="flex-1">
                  <div className="text-xs text-[#64748B]">Phone Number</div>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full border-b focus:border-[#FF9933] outline-none py-1"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    />
                  ) : (
                    <div className="text-[#0A1F44]">{profileData.phone || 'Not Provided'}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-[#64748B]" />
                <div className="flex-1">
                  <div className="text-xs text-[#64748B]">Location</div>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full border-b focus:border-[#FF9933] outline-none py-1"
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      placeholder="City, State"
                    />
                  ) : (
                    <div className="text-[#0A1F44]">{profileData.location || 'Not Provided'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Learning Progress (Visual only) */}
          <div className="glass-white rounded-xl p-6 card-elevated">
            <h3 className="text-xl text-[#0A1F44] mb-6 font-serif">Learning Insights</h3>
            <div className="space-y-4">
              {[
                { label: 'Fundamental Rights', progress: 85 },
                { label: 'Fundamental Duties', progress: 40 },
                { label: 'Directive Principles', progress: 20 },
                { label: 'Union Government', progress: 10 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B]">{item.label}</span>
                    <span className="text-sm text-[#0A1F44]">{item.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF9933] to-[#FFB366]"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
