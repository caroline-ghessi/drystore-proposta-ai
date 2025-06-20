
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import ProposalView from './pages/ProposalView';
import DeliveryControl from './pages/DeliveryControl';
import ClientPortal from './pages/ClientPortal';
import Clients from './pages/Clients';
import DeliveryTracking from './pages/DeliveryTracking';
import FollowUpManager from './pages/FollowUpManager';
import ProductManagement from './pages/ProductManagement';
import ZAPIConfiguration from './pages/admin/ZAPIConfiguration';
import CreateProposal from './pages/CreateProposal';
import ProposalUploadChoice from './pages/ProposalUploadChoice';
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
            path="/create-proposal"
            element={
              <RequireAuth>
                <CreateProposal />
              </RequireAuth>
            }
          />
          <Route
            path="/upload-choice"
            element={
              <RequireAuth>
                <ProposalUploadChoice />
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
            path="/clients"
            element={
              <RequireAuth>
                <Clients />
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
          <Route 
            path="/products" 
            element={
              <RequireAuth>
                <ProductManagement />
              </RequireAuth>
            } 
          />
          <Route 
            path="/admin/zapi-config" 
            element={
              <RequireAuth requiredRole="admin">
                <ZAPIConfiguration />
              </RequireAuth>
            } 
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

function RequireAuth({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

export default App;
