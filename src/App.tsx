import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// UI Components
import { Toaster } from '@/components/ui/toaster';
import { AppLoadingFallback } from '@/components/loading/AppLoadingFallback';
import SessionTimeoutWarning from '@/components/security/SessionTimeoutWarning';

// Context Providers
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

// Route Guards
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

// Hooks
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

// ============= LAZY LOADED COMPONENTS =============

// Public Pages
const Index = React.lazy(() => import('@/pages/Index'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));

// Client Pages
const ClientLogin = React.lazy(() => import('@/pages/ClientLogin'));
const ClientPortal = React.lazy(() => import('@/pages/ClientPortal'));
const ClientPortalBySlug = React.lazy(() => import('@/pages/ClientPortalBySlug'));
const SecureClientPortalBySlug = React.lazy(() => import('@/pages/SecureClientPortalBySlug'));

// Proposal Pages
const ProposalDetails = React.lazy(() => import('@/pages/ProposalDetails'));
const ProposalView = React.lazy(() => import('@/pages/ProposalView'));
const ProposalAcceptedThanks = React.lazy(() => import('@/pages/ProposalAcceptedThanks'));
const ProposalWithExtrasConfirmation = React.lazy(() => import('@/pages/ProposalWithExtrasConfirmation'));
const ProposalFinalThanks = React.lazy(() => import('@/pages/ProposalFinalThanks'));

// Protected Main Pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Proposals = React.lazy(() => import('@/pages/Proposals'));
const Clients = React.lazy(() => import('@/pages/Clients'));
const ProductManagement = React.lazy(() => import('@/pages/ProductManagement'));
const ApprovalManagement = React.lazy(() => import('@/pages/ApprovalManagement'));
const DeliveryControl = React.lazy(() => import('@/pages/DeliveryControl'));
const CRMDashboard = React.lazy(() => import('@/pages/CRMDashboard'));
const FollowUpManager = React.lazy(() => import('@/pages/FollowUpManager'));
const Gamification = React.lazy(() => import('@/pages/Gamification'));
const AnalyticsDashboard = React.lazy(() => import('@/pages/AnalyticsDashboard'));

// Proposal Creation Flow
const CreateProposal = React.lazy(() => import('@/pages/CreateProposal'));
const ProposalBuilder = React.lazy(() => import('@/pages/ProposalBuilder'));
const ProposalUploadChoice = React.lazy(() => import('@/pages/ProposalUploadChoice'));
const ProductUploadChoice = React.lazy(() => import('@/pages/ProductUploadChoice'));

// Solar Energy Flow
const SolarInputChoice = React.lazy(() => import('@/pages/SolarInputChoice'));
const SolarBillUpload = React.lazy(() => import('@/pages/SolarBillUpload'));
const SolarDataValidation = React.lazy(() => import('@/pages/SolarDataValidation'));
const SolarSystemValidation = React.lazy(() => import('@/pages/SolarSystemValidation'));
const SolarProposalForm = React.lazy(() => import('@/pages/SolarProposalForm'));

// Admin Pages
const UserRegistration = React.lazy(() => import('@/pages/UserRegistration'));
const SecurityManagement = React.lazy(() => import('@/pages/admin/SecurityManagement'));
const PaymentManagement = React.lazy(() => import('@/pages/admin/PaymentManagement'));
const ContentManagement = React.lazy(() => import('./pages/admin/ContentManagement'));
const ProposalLayoutsViewer = React.lazy(() => import('@/pages/admin/ProposalLayoutsViewer'));
const SolarProductsManagement = React.lazy(() => import('@/pages/admin/SolarProductsManagement'));

// Payment Pages
const PaymentOptions = React.lazy(() => import('@/pages/PaymentOptions'));

// ============= ROUTE COMPONENTS =============

interface RouteConfig {
  path: string;
  element: React.ComponentType;
  fallbackType?: 'spinner' | 'form' | 'table' | 'dashboard' | 'proposal';
  fallbackMessage?: string;
}

const createSuspenseRoute = (config: RouteConfig) => (
  <Suspense 
    fallback={
      <AppLoadingFallback 
        type={config.fallbackType || 'spinner'} 
        message={config.fallbackMessage}
      />
    }
  >
    <config.element />
  </Suspense>
);

const createProtectedRoute = (config: RouteConfig) => (
  <ProtectedRoute>
    {createSuspenseRoute(config)}
  </ProtectedRoute>
);

const createAdminRoute = (config: RouteConfig) => (
  <AdminRoute>
    {createSuspenseRoute(config)}
  </AdminRoute>
);

// ============= MAIN APP CONTENT =============

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
        {/* ============= PUBLIC ROUTES ============= */}
        <Route 
          path="/" 
          element={createSuspenseRoute({ 
            path: '/', 
            element: Index, 
            fallbackType: 'spinner', 
            fallbackMessage: 'Carregando página inicial...' 
          })} 
        />
        <Route 
          path="/login" 
          element={createSuspenseRoute({ path: '/login', element: Login, fallbackType: 'form' })} 
        />
        <Route 
          path="/register" 
          element={createSuspenseRoute({ path: '/register', element: Register, fallbackType: 'form' })} 
        />
        <Route 
          path="/forgot-password" 
          element={createSuspenseRoute({ path: '/forgot-password', element: ForgotPassword, fallbackType: 'form' })} 
        />
        <Route 
          path="/reset-password/:token" 
          element={createSuspenseRoute({ path: '/reset-password/:token', element: ResetPassword, fallbackType: 'form' })} 
        />

        {/* ============= CLIENT ROUTES ============= */}
        <Route 
          path="/client-login" 
          element={createSuspenseRoute({ path: '/client-login', element: ClientLogin, fallbackType: 'form' })} 
        />
        <Route 
          path="/client-portal" 
          element={createSuspenseRoute({ path: '/client-portal', element: ClientPortal, fallbackType: 'dashboard' })} 
        />
        <Route 
          path="/client/:clientSlug" 
          element={createSuspenseRoute({ path: '/client/:clientSlug', element: ClientPortalBySlug, fallbackType: 'dashboard' })} 
        />
        <Route 
          path="/secure/client/:clientSlug" 
          element={createSuspenseRoute({ path: '/secure/client/:clientSlug', element: SecureClientPortalBySlug, fallbackType: 'dashboard' })} 
        />

        {/* ============= PROPOSAL PUBLIC ROUTES ============= */}
        <Route 
          path="/proposal/:linkAccess" 
          element={createSuspenseRoute({ path: '/proposal/:linkAccess', element: ProposalDetails, fallbackType: 'proposal' })} 
        />
        <Route 
          path="/proposal-view/:id" 
          element={createSuspenseRoute({ path: '/proposal-view/:id', element: ProposalView, fallbackType: 'proposal' })} 
        />
        <Route 
          path="/proposal-accepted/:proposalId" 
          element={createSuspenseRoute({ path: '/proposal-accepted/:proposalId', element: ProposalAcceptedThanks, fallbackType: 'form' })} 
        />
        <Route 
          path="/proposal-extras-confirmation/:proposalId" 
          element={createSuspenseRoute({ path: '/proposal-extras-confirmation/:proposalId', element: ProposalWithExtrasConfirmation, fallbackType: 'form' })} 
        />
        <Route 
          path="/proposal-final-thanks/:proposalId" 
          element={createSuspenseRoute({ path: '/proposal-final-thanks/:proposalId', element: ProposalFinalThanks, fallbackType: 'form' })} 
        />

        {/* ============= PROTECTED MAIN ROUTES ============= */}
        <Route 
          path="/dashboard" 
          element={createProtectedRoute({ path: '/dashboard', element: Dashboard, fallbackType: 'dashboard' })} 
        />
        <Route 
          path="/proposals" 
          element={createProtectedRoute({ path: '/proposals', element: Proposals, fallbackType: 'table' })} 
        />
        <Route 
          path="/clients" 
          element={createProtectedRoute({ path: '/clients', element: Clients, fallbackType: 'table' })} 
        />
        <Route 
          path="/products" 
          element={createProtectedRoute({ path: '/products', element: ProductManagement, fallbackType: 'table' })} 
        />
        <Route 
          path="/approvals" 
          element={createProtectedRoute({ path: '/approvals', element: ApprovalManagement, fallbackType: 'table' })} 
        />
        <Route 
          path="/deliveries" 
          element={createProtectedRoute({ path: '/deliveries', element: DeliveryControl, fallbackType: 'dashboard' })} 
        />
        <Route
          path="/crm" 
          element={createProtectedRoute({ path: '/crm', element: CRMDashboard, fallbackType: 'dashboard' })} 
        />
        <Route 
          path="/followup" 
          element={createProtectedRoute({ path: '/followup', element: FollowUpManager, fallbackType: 'dashboard' })} 
        />
        <Route 
          path="/gamification" 
          element={createProtectedRoute({ path: '/gamification', element: Gamification, fallbackType: 'dashboard' })} 
        />
        <Route 
          path="/analytics" 
          element={createProtectedRoute({ path: '/analytics', element: AnalyticsDashboard, fallbackType: 'dashboard' })} 
        />

        {/* ============= PROPOSAL CREATION FLOW ============= */}
        <Route 
          path="/create-proposal" 
          element={createProtectedRoute({ path: '/create-proposal', element: CreateProposal, fallbackType: 'form' })} 
        />
        <Route 
          path="/proposal-builder" 
          element={createProtectedRoute({ path: '/proposal-builder', element: ProposalBuilder, fallbackType: 'form' })} 
        />
        <Route 
          path="/proposal-upload-choice" 
          element={createProtectedRoute({ path: '/proposal-upload-choice', element: ProposalUploadChoice, fallbackType: 'form' })} 
        />
        <Route 
          path="/create-proposal/upload-choice/:productGroup" 
          element={createProtectedRoute({ path: '/create-proposal/upload-choice/:productGroup', element: ProductUploadChoice, fallbackType: 'form' })} 
        />

        {/* ============= SOLAR ENERGY FLOW ============= */}
        <Route 
          path="/create-proposal/energia-solar/input-choice" 
          element={createProtectedRoute({ path: '/create-proposal/energia-solar/input-choice', element: SolarInputChoice, fallbackType: 'form' })} 
        />
        <Route 
          path="/create-proposal/energia-solar/upload" 
          element={createProtectedRoute({ path: '/create-proposal/energia-solar/upload', element: SolarBillUpload, fallbackType: 'form' })} 
        />
        <Route 
          path="/create-proposal/energia-solar/validate" 
          element={createProtectedRoute({ path: '/create-proposal/energia-solar/validate', element: SolarDataValidation, fallbackType: 'form' })} 
        />
        <Route 
          path="/create-proposal/energia-solar/technical-validation" 
          element={createProtectedRoute({ path: '/create-proposal/energia-solar/technical-validation', element: SolarSystemValidation, fallbackType: 'form' })} 
        />
        <Route 
          path="/create-proposal/energia-solar/manual" 
          element={createProtectedRoute({ path: '/create-proposal/energia-solar/manual', element: SolarProposalForm, fallbackType: 'form' })} 
        />

        {/* ============= ADMIN ROUTES ============= */}
        <Route 
          path="/register-user" 
          element={createAdminRoute({ path: '/register-user', element: UserRegistration, fallbackType: 'form' })} 
        />
        <Route 
          path="/security-management" 
          element={createAdminRoute({ path: '/security-management', element: SecurityManagement, fallbackType: 'table' })} 
        />
        <Route 
          path="/payments" 
          element={createAdminRoute({ path: '/payments', element: PaymentManagement, fallbackType: 'table' })} 
        />
        <Route 
          path="/admin/proposal-layouts" 
          element={createAdminRoute({ path: '/admin/proposal-layouts', element: ProposalLayoutsViewer, fallbackType: 'table' })} 
        />
        <Route 
          path="/admin/solar-products" 
          element={createAdminRoute({ path: '/admin/solar-products', element: SolarProductsManagement, fallbackType: 'table' })} 
        />

        {/* ============= PROTECTED ADMIN ROUTES ============= */}
        <Route 
          path="/admin/content-management" 
          element={createProtectedRoute({ path: '/admin/content-management', element: ContentManagement, fallbackType: 'table' })} 
        />
      </Routes>
      
      {/* ============= SESSION TIMEOUT WARNING ============= */}
      {isAuthenticated && showWarning && (
        <SessionTimeoutWarning 
          timeLeft={timeLeft} 
          onExtend={extendSession} 
        />
      )}
      
      {/* ============= TOAST NOTIFICATIONS ============= */}
      <Toaster />
    </>
  );
};

// ============= QUERY CLIENT CONFIGURATION =============

const createQueryClient = () => new QueryClient({
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

// ============= MAIN APP COMPONENT =============

function App() {
  const queryClient = createQueryClient();

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