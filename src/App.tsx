import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import CreateProposal from './pages/CreateProposal';
import ProposalView from './pages/ProposalView';
import PaymentOptions from './pages/PaymentOptions';
import ProposalPreview from './pages/ProposalPreview';
import UploadDocument from './pages/UploadDocument';
import EditProposal from './pages/EditProposal';
import SmartScheduler from './pages/SmartScheduler';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CRMDashboard from './pages/CRMDashboard';
import AICenter from './pages/AICenter';
import Gamification from './pages/Gamification';
import Reports from './pages/Reports';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import UserRegistration from './pages/UserRegistration';
import ClientLogin from './pages/ClientLogin';
import ClientPortal from './pages/ClientPortal';
import Clients from './pages/Clients';
import Proposals from './pages/Proposals';
import ProductManagement from './pages/ProductManagement';
import FollowUpManager from './pages/FollowUpManager';
import ZAPIConfiguration from './pages/admin/ZAPIConfiguration';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionGuard from '@/components/PermissionGuard';
import IntegrationConfigPanel from '@/components/erp/IntegrationConfigPanel';
import RecommendationRules from '@/pages/admin/RecommendationRules';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/client-login" element={<ClientLogin />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/create-proposal" element={<ProtectedRoute><CreateProposal /></ProtectedRoute>} />
              <Route path="/proposal/:id" element={<ProtectedRoute><ProposalView /></ProtectedRoute>} />
              <Route path="/payment-options/:proposalId" element={<ProtectedRoute><PaymentOptions /></ProtectedRoute>} />
              <Route path="/proposal-preview" element={<ProtectedRoute><ProposalPreview /></ProtectedRoute>} />
              <Route path="/upload-document" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
              <Route path="/edit-proposal" element={<ProtectedRoute><EditProposal /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
              <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
              <Route path="/follow-up-manager" element={<ProtectedRoute><FollowUpManager /></ProtectedRoute>} />
              <Route 
                path="/smart-scheduler" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['vendedor_interno', 'representante', 'admin']}>
                      <SmartScheduler />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['vendedor_interno', 'representante', 'admin']}>
                      <AnalyticsDashboard />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/crm" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['vendedor_interno', 'representante', 'admin']}>
                      <CRMDashboard />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gamification" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['vendedor_interno', 'representante', 'admin']}>
                      <Gamification />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-center" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['admin']}>
                      <AICenter />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['admin']}>
                      <Reports />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/approval-workflow" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['admin']}>
                      <ApprovalWorkflow />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/user-registration" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['admin']}>
                      <UserRegistration />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/zapi-config" 
                element={
                  <ProtectedRoute>
                    <PermissionGuard requiredRole={['admin']}>
                      <ZAPIConfiguration />
                    </PermissionGuard>
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin/integrations" element={<ProtectedRoute><IntegrationConfigPanel /></ProtectedRoute>} />
              <Route path="/admin/recommendation-rules" element={<ProtectedRoute><RecommendationRules /></ProtectedRoute>} />
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
