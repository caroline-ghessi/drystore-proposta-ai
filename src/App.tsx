import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import SessionTimeoutWarning from '@/components/security/SessionTimeoutWarning';
import { useAuth } from '@/contexts/AuthContext';
import { AppLoadingFallback } from '@/components/loading/AppLoadingFallback';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

// Lazy load all route components for better performance
const Index = React.lazy(() => import('@/pages/Index'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const UserRegistration = React.lazy(() => import('@/pages/UserRegistration'));
const ClientPortalBySlug = React.lazy(() => import('@/pages/ClientPortalBySlug'));
const SecureClientPortalBySlug = React.lazy(() => import('@/pages/SecureClientPortalBySlug'));
const ProposalDetails = React.lazy(() => import('@/pages/ProposalDetails'));
const ProposalView = React.lazy(() => import('@/pages/ProposalView'));
const SecurityManagement = React.lazy(() => import('@/pages/admin/SecurityManagement'));
const ClientLogin = React.lazy(() => import('@/pages/ClientLogin'));
const ClientPortal = React.lazy(() => import('@/pages/ClientPortal'));
const CreateProposal = React.lazy(() => import('@/pages/CreateProposal'));
const SolarInputChoice = React.lazy(() => import('@/pages/SolarInputChoice'));
const SolarBillUpload = React.lazy(() => import('@/pages/SolarBillUpload'));
const SolarDataValidation = React.lazy(() => import('@/pages/SolarDataValidation'));
const SolarSystemValidation = React.lazy(() => import('@/pages/SolarSystemValidation'));
const SolarProposalForm = React.lazy(() => import('@/pages/SolarProposalForm'));
const ProductUploadChoice = React.lazy(() => import('@/pages/ProductUploadChoice'));
const ProposalUploadChoice = React.lazy(() => import('@/pages/ProposalUploadChoice'));
const ProposalBuilder = React.lazy(() => import('@/pages/ProposalBuilder'));
const ContentManagement = React.lazy(() => import('./pages/admin/ContentManagement'));
const ProposalLayoutsViewer = React.lazy(() => import('@/pages/admin/ProposalLayoutsViewer'));
const SolarProductsManagement = React.lazy(() => import('@/pages/admin/SolarProductsManagement'));
const ProposalAcceptedThanks = React.lazy(() => import('@/pages/ProposalAcceptedThanks'));
const ProposalWithExtrasConfirmation = React.lazy(() => import('@/pages/ProposalWithExtrasConfirmation'));
const ProposalFinalThanks = React.lazy(() => import('@/pages/ProposalFinalThanks'));
const PaymentOptions = React.lazy(() => import('@/pages/PaymentOptions'));
const PaymentManagement = React.lazy(() => import('@/pages/admin/PaymentManagement'));
const Proposals = React.lazy(() => import('@/pages/Proposals'));

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
        <Route 
          path="/" 
          element={
            <Suspense fallback={<AppLoadingFallback type="spinner" message="Carregando página inicial..." />}>
              <Index />
            </Suspense>
          } 
        />
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<AppLoadingFallback type="form" />}>
              <Login />
            </Suspense>
          } 
        />
        <Route 
          path="/register" 
          element={
            <Suspense fallback={<AppLoadingFallback type="form" />}>
              <Register />
            </Suspense>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <Suspense fallback={<AppLoadingFallback type="form" />}>
              <ForgotPassword />
            </Suspense>
          } 
        />
        <Route 
          path="/reset-password/:token" 
          element={
            <Suspense fallback={<AppLoadingFallback type="form" />}>
              <ResetPassword />
            </Suspense>
          } 
        />
        <Route 
          path="/client-login" 
          element={
            <Suspense fallback={<AppLoadingFallback type="form" />}>
              <ClientLogin />
            </Suspense>
          } 
        />
        <Route 
          path="/client-portal" 
          element={
            <Suspense fallback={<AppLoadingFallback type="dashboard" />}>
              <ClientPortal />
            </Suspense>
          } 
        />
        <Route 
          path="/client/:clientSlug" 
          element={
            <Suspense fallback={<AppLoadingFallback type="dashboard" />}>
              <ClientPortalBySlug />
            </Suspense>
          } 
        />
        <Route 
          path="/secure/client/:clientSlug" 
          element={
            <Suspense fallback={<AppLoadingFallback type="dashboard" />}>
              <SecureClientPortalBySlug />
            </Suspense>
          } 
        />
        <Route 
          path="/proposal/:linkAccess" 
          element={
            <Suspense fallback={<AppLoadingFallback type="proposal" />}>
              <ProposalDetails />
            </Suspense>
          } 
        />
        <Route 
          path="/proposal-view/:id" 
          element={
            <Suspense fallback={<AppLoadingFallback type="proposal" />}>
              <ProposalView />
            </Suspense>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="dashboard" />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/proposals" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="table" />}>
                <Proposals />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-proposal" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <CreateProposal />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-proposal/energia-solar/input-choice" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <SolarInputChoice />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-proposal/energia-solar/upload" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <SolarBillUpload />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-proposal/energia-solar/validate" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <SolarDataValidation />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-proposal/energia-solar/technical-validation" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <SolarSystemValidation />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-proposal/energia-solar/manual" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <SolarProposalForm />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-proposal/upload-choice/:productGroup" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <ProductUploadChoice />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/proposal-upload-choice" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <ProposalUploadChoice />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/proposal-builder" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <ProposalBuilder />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <AdminRoute>
              <Suspense fallback={<AppLoadingFallback type="table" />}>
                <PaymentManagement />
              </Suspense>
            </AdminRoute>
          } 
        />
        <Route 
          path="/register-user" 
          element={
            <AdminRoute>
              <Suspense fallback={<AppLoadingFallback type="form" />}>
                <UserRegistration />
              </Suspense>
            </AdminRoute>
          } 
        />
        <Route 
          path="/security-management" 
          element={
            <AdminRoute>
              <Suspense fallback={<AppLoadingFallback type="table" />}>
                <SecurityManagement />
              </Suspense>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/content-management" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<AppLoadingFallback type="table" />}>
                <ContentManagement />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/proposal-layouts" 
          element={
            <AdminRoute>
              <Suspense fallback={<AppLoadingFallback type="table" />}>
                <ProposalLayoutsViewer />
              </Suspense>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/solar-products" 
          element={
            <AdminRoute>
              <Suspense fallback={<AppLoadingFallback type="table" />}>
                <SolarProductsManagement />
              </Suspense>
            </AdminRoute>
          } 
        />
        <Route 
          path="/proposal-accepted/:proposalId" 
          element={
            <Suspense fallback={<AppLoadingFallback type="form" />}>
              <ProposalAcceptedThanks />
            </Suspense>
          } 
        />
        <Route 
          path="/proposal-extras-confirmation/:proposalId" 
          element={
            <Suspense fallback={<AppLoadingFallback type="form" />}>
              <ProposalWithExtrasConfirmation />
            </Suspense>
          } 
        />
        <Route 
          path="/proposal-final-thanks/:proposalId" 
          element={
            <Suspense fallback={<AppLoadingFallback type="form" />}>
              <ProposalFinalThanks />
            </Suspense>
          } 
        />
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
        staleTime: 5 * 60 * 1000, // 5 minutes - optimized for better caching
        gcTime: 10 * 60 * 1000, // 10 minutes - keep data in cache longer
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Suspense fallback={<AppLoadingFallback type="spinner" message="Inicializando aplicação..." />}>
              <AppContent />
            </Suspense>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
