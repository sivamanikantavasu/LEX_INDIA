import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null); // null = checking, true = authorized, false = not authorized

  useEffect(() => {
    // Check if user is authenticated (check localStorage for persistent sessions)
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');

    console.log('ProtectedRoute check:', {
      isAuthenticated,
      userRole,
      requiredRole,
      currentPath: location.pathname
    });

    // If not authenticated or wrong role, redirect to appropriate login
    if (!isAuthenticated || (requiredRole && userRole !== requiredRole)) {
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
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [navigate, requiredRole, location.pathname]);

  // Show loading state while checking authorization
  if (isAuthorized === null) {
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