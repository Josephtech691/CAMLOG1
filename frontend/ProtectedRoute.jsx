import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

function ProtectedRoute() {
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/login" />;
}

export default ProtectedRoute;