import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    console.log('ProtectedRoute check:', {
      user: !!user,
      role,
      requiredRole,
      currentPath: location.pathname
    });

    // If not authenticated or wrong role, redirect to appropriate login
    if (!user || (requiredRole && role !== requiredRole)) {
      // Map roles to their login pages
      const loginRoutes = {
        admin: '/auth/admin/login',
        educator: '/auth/educator/login',
        'legal-expert': '/auth/legal-expert/login',
        citizen: '/auth/citizen/login',
      };

      const loginRoute = loginRoutes[requiredRole] || '/';
      console.log('Redirecting to:', loginRoute);
      navigate(loginRoute, { replace: true });
    }
  }, [navigate, requiredRole, location.pathname, user, role, loading]);

  // Show loading state while checking authorization
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ashoka-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null;
  }

  return children;
}