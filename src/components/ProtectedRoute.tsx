
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiredAuth = true 
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, redirect to login
  if (requiredAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If auth is not required but user is authenticated, redirect to home
  if (!requiredAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the children
  return <>{children}</>;
};
