import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Component bảo vệ routes
 * - requireAdmin=false: chỉ cần đăng nhập (mặc định)
 * - requireAdmin=true: phải là admin
 */
export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  console.log('🛡️ ProtectedRoute:', { isAuthenticated, isAdmin, isLoading, requireAdmin });

  if (isLoading) {
    console.log('⏳ ProtectedRoute: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-[#1ed760] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Nếu không authenticated, redirect về auth
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Nếu route yêu cầu admin nhưng user không phải admin, redirect về home
  if (requireAdmin && !isAdmin) {
    console.log('❌ ProtectedRoute: Not admin, redirecting to /home');
    return <Navigate to="/home" replace />;
  }

  console.log('✅ ProtectedRoute: Allowing access');
  return <>{children}</>;
};
