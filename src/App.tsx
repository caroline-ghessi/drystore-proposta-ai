import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import ProposalView from './pages/ProposalView';
import DeliveryControl from './pages/DeliveryControl';
import ClientPortal from './pages/ClientPortal';
import DeliveryTracking from './pages/DeliveryTracking';
import FollowUpManager from './pages/FollowUpManager';
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/proposals"
            element={
              <RequireAuth>
                <Proposals />
              </RequireAuth>
            }
          />
          <Route
            path="/proposal/:id"
            element={
              <RequireAuth>
                <ProposalView />
              </RequireAuth>
            }
          />
          <Route
            path="/delivery-control/:proposalId"
            element={
              <RequireAuth>
                <DeliveryControl />
              </RequireAuth>
            }
          />
          <Route
            path="/client-portal"
            element={
              <RequireAuth>
                <ClientPortal />
              </RequireAuth>
            }
          />
          <Route
            path="/delivery-tracking/:proposalId"
            element={
              <RequireAuth>
                <DeliveryTracking />
              </RequireAuth>
            }
          />
          <Route path="/follow-up-manager" element={<FollowUpManager />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export default App;
