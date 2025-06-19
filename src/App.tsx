
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateProposal from "./pages/CreateProposal";
import UploadPDF from "./pages/UploadPDF";
import UploadDocument from "./pages/UploadDocument";
import SelectSystems from "./pages/SelectSystems";
import ProposalPreview from "./pages/ProposalPreview";
import EditProposal from "./pages/EditProposal";
import ProposalView from "./pages/ProposalView";
import ProposalManagement from "./pages/ProposalManagement";
import ExportData from "./pages/admin/ExportData";
import AIPromptTester from "./pages/admin/AIPromptTester";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import TechnicalAnalysis from "./pages/TechnicalAnalysis";
import TechnicalTable from "./pages/TechnicalTable";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-proposal" 
              element={
                <ProtectedRoute>
                  <CreateProposal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload-pdf" 
              element={
                <ProtectedRoute>
                  <UploadPDF />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload-document" 
              element={
                <ProtectedRoute>
                  <UploadDocument />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/technical-analysis" 
              element={
                <ProtectedRoute>
                  <TechnicalAnalysis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/technical-table" 
              element={
                <ProtectedRoute>
                  <TechnicalTable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/select-systems" 
              element={
                <ProtectedRoute>
                  <SelectSystems />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/proposal-preview" 
              element={
                <ProtectedRoute>
                  <ProposalPreview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-proposal/:id" 
              element={
                <ProtectedRoute>
                  <EditProposal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/proposal/:id" 
              element={<ProposalView />}
            />
            <Route 
              path="/proposals" 
              element={
                <ProtectedRoute>
                  <ProposalManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/export" 
              element={
                <ProtectedRoute>
                  <ExportData />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ai-prompts" 
              element={
                <ProtectedRoute>
                  <AIPromptTester />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
