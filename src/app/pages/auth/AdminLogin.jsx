import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, UserCog, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showSetupButton, setShowSetupButton] = useState(false);

  const handleEmergencySetup = async () => {
    setLoading(true);
    try {
      const email = 'admin@123.com';
      const password = 'admin@123';

      // 1. Try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'System Admin',
            username: 'admin',
            role: 'admin'
          }
        }
      });

      if (signUpError && signUpError.message !== 'User already registered') {
        throw signUpError;
      }

      // 2. Ensure profile exists with admin role
      const userId = signUpData?.user?.id || (await supabase.auth.signInWithPassword({ email, password })).data.user.id;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: 'System Admin',
          role: 'admin',
          username: 'admin'
        });

      if (profileError) throw profileError;

      // 3. Log in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) throw loginError;
      
      alert('Admin account configured! Finalizing session...');
      // Force a slight delay to allow the AuthContext trigger/subscription to catch up
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    } catch (error) {
      alert('Setup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let email = formData.email;
      if (email === 'admin@123') email = 'admin@123.com'; // Auto-map their preferred ID

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: formData.password,
      });

      if (error) {
        setShowSetupButton(true);
        throw error;
      }

      if (data.user) {
        navigate('/admin');
      }
    } catch (error) {
      alert(error.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ashoka-bg p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0A1F44]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF9933]/5 rounded-full blur-3xl"></div>
        
        {/* Ashoka Chakra Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#0A1F44" strokeWidth="2" />
              <circle cx="100" cy="100" r="15" fill="#0A1F44" />
              {[...Array(24)].map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const x1 = 100 + 20 * Math.cos(rad);
                const y1 = 100 + 20 * Math.sin(rad);
                const x2 = 100 + 90 * Math.cos(rad);
                const y2 = 100 + 90 * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#0A1F44"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0A1F44] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="glass-white rounded-2xl p-8 md:p-10 shadow-2xl border border-[#0A1F44]/10">
          {/* Logo & Role Badge */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] flex items-center justify-center animate-pulse-glow mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A1F44]/5 border border-[#0A1F44]/20 rounded-full">
              <UserCog className="w-4 h-4 text-[#0A1F44]" />
              <span className="text-sm text-[#0A1F44]">Admin Portal</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 
              className="text-3xl text-[#0A1F44] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Admin Login
            </h1>
            <p className="text-[#64748B]">Access the administrative dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="floating-input">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] z-10" />
                <input
                  type="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-[#0A1F44]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent transition-all"
                  required
                />
                <label className="floating-label left-12">Admin Email Address</label>
              </div>
            </div>

            {/* Password */}
            <div className="floating-input">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3.5 bg-[#F8FAFC] border border-[#0A1F44]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent transition-all"
                  required
                />
                <label className="floating-label left-12">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0A1F44] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[#0A1F44]/20 text-[#0A1F44] focus:ring-[#0A1F44]"
                />
                <span className="text-[#64748B]">Remember me</span>
              </label>
              <a href="#" className="text-[#0A1F44] hover:text-[#1A3A6B] transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#0A1F44] to-[#1A3A6B] text-white rounded-lg hover:shadow-lg transition-all hover-lift disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Admin Portal'
              )}
            </button>

            {/* Emergency Setup Button */}
            {showSetupButton && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                type="button"
                onClick={handleEmergencySetup}
                className="w-full mt-4 py-2 px-4 border border-[#FF9933] text-[#FF9933] rounded-lg hover:bg-[#FF9933] hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Fix & Setup Admin Accounts
              </motion.button>
            )}
          </form>

          {/* Other Portals */}
          <div className="mt-8 pt-6 border-t border-[#0A1F44]/10">
            <p className="text-sm text-[#64748B] text-center mb-3">Access other portals:</p>
            <div className="grid grid-cols-3 gap-2">
              <Link to="/auth/educator/login" className="text-xs text-center py-2 px-2 bg-[#FF9933]/5 text-[#FF9933] rounded-lg hover:bg-[#FF9933]/10 transition-colors">
                Educator
              </Link>
              <Link to="/auth/legal-expert/login" className="text-xs text-center py-2 px-2 bg-[#138808]/5 text-[#138808] rounded-lg hover:bg-[#138808]/10 transition-colors">
                Legal Expert
              </Link>
              <Link to="/auth/citizen/login" className="text-xs text-center py-2 px-2 bg-[#1A3A6B]/5 text-[#1A3A6B] rounded-lg hover:bg-[#1A3A6B]/10 transition-colors">
                Citizen
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}