import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, hasAnyRole, status } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication status is being determined
  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has any of them
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      // User doesn't have required roles, redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required roles (if any)
  return children;
}
