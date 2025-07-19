import { Navigate, Outlet } from 'react-router-dom';
import { isTokenValid, getUserFromToken } from '../utils/auth';

interface RequireAuthProps {
  allowedRoles?: ('admin' | 'user')[];
}

export default function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const token = localStorage.getItem('token');

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  const user = getUserFromToken(token);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.isAdmin;

  if (allowedRoles?.includes('admin') && !isAdmin) {
    return <Navigate to="/userprojects" replace />;
  }

  if (allowedRoles?.includes('user') && isAdmin) {
    return <Navigate to="/adminusers" replace />;
  }

  return <Outlet />;
}
