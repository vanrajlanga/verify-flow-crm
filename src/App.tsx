
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import TvtDashboard from "./pages/TvtDashboard";
import LeadDetail from "./pages/LeadDetail";
import TvtLeadDetail from "./pages/TvtLeadDetail";
import TvtLeadVerification from "./pages/TvtLeadVerification";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLeads from "./pages/admin/AdminLeads";
import AdminLeadsSheet from "./pages/admin/AdminLeadsSheet";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminBanks from "./pages/admin/AdminBanks";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AddNewLead from "./pages/admin/AddNewLead";
import BankProductModule from "./pages/admin/BankProductModule";
import EditLead from "./pages/admin/EditLead";

// Agent pages
import AgentLeads from "./pages/agent/AgentLeads";
import AgentProfile from "./pages/agent/AgentProfile";
import AgentHistory from "./pages/agent/AgentHistory";
import AgentLeadDetail from "./pages/agent/AgentLeadDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Admin routes with redirect */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/leads/:leadId" element={<LeadDetail />} />
            <Route path="/admin/leads/edit/:leadId" element={<EditLead />} />
            <Route path="/admin/leads-sheet" element={<AdminLeadsSheet />} />
            <Route path="/admin/agents" element={<AdminAgents />} />
            <Route path="/admin/banks" element={<AdminBanks />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/verifications" element={<AdminVerifications />} />
            <Route path="/admin/add-lead" element={<AddNewLead />} />
            <Route path="/admin/bank-products" element={<BankProductModule />} />
            
            {/* Agent routes */}
            <Route path="/agent" element={<Navigate to="/agent/leads" replace />} />
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/leads" element={<AgentLeads />} />
            <Route path="/agent/leads/:leadId" element={<AgentLeadDetail />} />
            <Route path="/agent/profile" element={<AgentProfile />} />
            <Route path="/agent/history" element={<AgentHistory />} />
            
            {/* TVT routes */}
            <Route path="/tvt" element={<Navigate to="/tvt/dashboard" replace />} />
            <Route path="/tvt/dashboard" element={<TvtDashboard />} />
            <Route path="/tvt/leads/:leadId" element={<TvtLeadDetail />} />
            <Route path="/tvt/verify/:leadId" element={<TvtLeadVerification />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
