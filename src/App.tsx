import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PermissionGuard from "@/components/PermissionGuard";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import CreateProposal from "./pages/CreateProposal";
import ProposalUploadChoice from "./pages/ProposalUploadChoice";
import ProposalBuilder from "./pages/ProposalBuilder";
import EditProposal from "./pages/EditProposal";
import UploadDocument from "./pages/UploadDocument";
import SelectSystems from "./pages/SelectSystems";
import TechnicalAnalysis from "./pages/TechnicalAnalysis";
import TechnicalTable from "./pages/TechnicalTable";
import Proposals from "./pages/Proposals";
import ProposalView from "./pages/ProposalView";
import ProposalPreview from "./pages/ProposalPreview";
import Clients from "./pages/Clients";
import ProductManagement from "./pages/ProductManagement";
import Reports from "./pages/Reports";
import UserRegistration from "./pages/UserRegistration";
import ClientLogin from "./pages/ClientLogin";
import ClientPortal from "./pages/ClientPortal";
import ClientPortalBySlug from "./pages/ClientPortalBySlug";
import ProposalClientView from "./pages/ProposalClientView";
import DeliveryTracking from "./pages/DeliveryTracking";
import DeliveryControl from "./pages/DeliveryControl";
import PaymentOptions from "./pages/PaymentOptions";
import Gamification from "./pages/Gamification";
import SmartScheduler from "./pages/SmartScheduler";
import FollowUpManager from "./pages/FollowUpManager";
import AICenter from "./pages/AICenter";
import CRMDashboard from "./pages/CRMDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ApprovalWorkflow from "./pages/ApprovalWorkflow";
import ApprovalManagement from "./pages/ApprovalManagement";
import ProposalManagement from "./pages/ProposalManagement";
import UploadPDF from "./pages/UploadPDF";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AIPromptTester from "./pages/admin/AIPromptTester";
import RecommendationRules from "./pages/admin/RecommendationRules";
import ExportData from "./pages/admin/ExportData";
import TechnicalDebug from "./pages/admin/TechnicalDebug";
import SalesTargets from './pages/SalesTargets';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/client-login" element={<ClientLogin />} />
                <Route path="/client-portal" element={<ClientPortal />} />
                <Route path="/client-portal/:clientSlug" element={<ClientPortalBySlug />} />
                <Route path="/proposal-client/:linkAccess" element={<ProposalClientView />} />
                <Route path="/user-registration" element={<UserRegistration />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/create-proposal" element={<ProtectedRoute><CreateProposal /></ProtectedRoute>} />
                <Route path="/proposal-upload-choice" element={<ProtectedRoute><ProposalUploadChoice /></ProtectedRoute>} />
                <Route path="/proposal-builder" element={<ProtectedRoute><ProposalBuilder /></ProtectedRoute>} />
                <Route path="/edit-proposal/:id?" element={<ProtectedRoute><EditProposal /></ProtectedRoute>} />
                <Route path="/upload-document" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
                <Route path="/select-systems" element={<ProtectedRoute><SelectSystems /></ProtectedRoute>} />
                <Route path="/technical-analysis" element={<ProtectedRoute><TechnicalAnalysis /></ProtectedRoute>} />
                <Route path="/technical-table" element={<ProtectedRoute><TechnicalTable /></ProtectedRoute>} />
                <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
                <Route path="/proposal/:id" element={<ProtectedRoute><ProposalView /></ProtectedRoute>} />
                <Route path="/proposal-preview" element={<ProtectedRoute><ProposalPreview /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/delivery-tracking" element={<ProtectedRoute><DeliveryTracking /></ProtectedRoute>} />
                <Route path="/delivery-control" element={<ProtectedRoute><DeliveryControl /></ProtectedRoute>} />
                <Route path="/payment-options" element={<ProtectedRoute><PaymentOptions /></ProtectedRoute>} />
                <Route path="/gamification" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
                <Route path="/smart-scheduler" element={<ProtectedRoute><SmartScheduler /></ProtectedRoute>} />
                <Route path="/follow-up" element={<ProtectedRoute><FollowUpManager /></ProtectedRoute>} />
                <Route path="/ai-center" element={<ProtectedRoute><AICenter /></ProtectedRoute>} />
                <Route path="/crm" element={<ProtectedRoute><CRMDashboard /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/approval-workflow" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
                <Route path="/approval-management" element={<ProtectedRoute><ApprovalManagement /></ProtectedRoute>} />
                <Route path="/proposal-management" element={<ProtectedRoute><ProposalManagement /></ProtectedRoute>} />
                <Route path="/upload-pdf" element={<ProtectedRoute><UploadPDF /></ProtectedRoute>} />

                {/* Admin Routes - Consolidated Debug */}
                <Route path="/admin/ai-prompt-tester" element={<ProtectedRoute><AIPromptTester /></ProtectedRoute>} />
                <Route path="/admin/recommendation-rules" element={<ProtectedRoute><RecommendationRules /></ProtectedRoute>} />
                <Route path="/admin/export-data" element={<ProtectedRoute><ExportData /></ProtectedRoute>} />
                <Route path="/admin/technical-debug" element={<ProtectedRoute><TechnicalDebug /></ProtectedRoute>} />
                
                {/* Legacy redirects - redirect old pages to unified debug */}
                <Route path="/email-diagnostic" element={<ProtectedRoute><TechnicalDebug /></ProtectedRoute>} />
                <Route path="/admin/zapi-config" element={<ProtectedRoute><TechnicalDebug /></ProtectedRoute>} />
                <Route path="/signup-test" element={<ProtectedRoute><TechnicalDebug /></ProtectedRoute>} />

                {/* Sales Targets */}
                <Route 
                  path="/sales-targets" 
                  element={
                    <ProtectedRoute>
                      <PermissionGuard requiredRole={['admin']}>
                        <SalesTargets />
                      </PermissionGuard>
                    </ProtectedRoute>
                  } 
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
