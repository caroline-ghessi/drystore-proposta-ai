
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import CreateProposal from './pages/CreateProposal';
import ProposalView from './pages/ProposalView';
import ProposalPreview from './pages/ProposalPreview';
import UploadDocument from './pages/UploadDocument';
import EditProposal from './pages/EditProposal';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
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
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/create-proposal" element={<ProtectedRoute><CreateProposal /></ProtectedRoute>} />
              <Route path="/proposal/:id" element={<ProtectedRoute><ProposalView /></ProtectedRoute>} />
              <Route path="/proposal-preview" element={<ProtectedRoute><ProposalPreview /></ProtectedRoute>} />
              <Route path="/upload-document" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
              <Route path="/edit-proposal" element={<ProtectedRoute><EditProposal /></ProtectedRoute>} />
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
