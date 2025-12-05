import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-deep text-ocean-300">Loading...</div>;
  
  return user ? <Outlet /> : <Navigate to="/" />;
};
