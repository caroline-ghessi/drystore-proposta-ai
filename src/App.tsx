
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import SessionTimeoutWarning from '@/components/security/SessionTimeoutWarning';
import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserRegistration from '@/pages/UserRegistration';
import ClientPortalBySlug from '@/pages/ClientPortalBySlug';
import SecureClientPortalBySlug from '@/pages/SecureClientPortalBySlug';
import ProposalDetails from '@/pages/ProposalDetails';
import AdminRoute from '@/components/AdminRoute';
import SecurityManagement from '@/pages/admin/SecurityManagement';
import ClientLogin from '@/pages/ClientLogin';
import ClientPortal from '@/pages/ClientPortal';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const { showWarning, timeLeft, extendSession } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5
  });

  useSecurityHeaders();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/client/:clientSlug" element={<ClientPortalBySlug />} />
        <Route path="/secure/client/:clientSlug" element={<SecureClientPortalBySlug />} />
        <Route path="/proposal/:linkAccess" element={<ProposalDetails />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/register-user" element={<AdminRoute><UserRegistration /></AdminRoute>} />
        <Route path="/security-management" element={<AdminRoute><SecurityManagement /></AdminRoute>} />
      </Routes>
      
      {isAuthenticated && showWarning && (
        <SessionTimeoutWarning 
          timeLeft={timeLeft} 
          onExtend={extendSession} 
        />
      )}
      
      <Toaster />
    </>
  );
};

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          return failureCount < 3;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
