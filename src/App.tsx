import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminLeadsSheet from "./pages/admin/AdminLeadsSheet";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminBanks from "./pages/admin/AdminBanks";
import BankProductModule from "./pages/admin/BankProductModule";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRoles from "./pages/admin/AdminRoles";
import AddNewLead from "./pages/admin/AddNewLead";
import AgentLeads from "./pages/agent/AgentLeads";
import AgentHistory from "./pages/agent/AgentHistory";
import AgentProfile from "./pages/agent/AgentProfile";
import LeadDetail from "./pages/LeadDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/leads-sheet" element={<AdminLeadsSheet />} />
          <Route path="/admin/leads/new" element={<AddNewLead />} />
          <Route path="/admin/add-lead" element={<AddNewLead />} />
          <Route path="/admin/leads/:id" element={<LeadDetail />} />
          <Route path="/admin/agents" element={<AdminAgents />} />
          <Route path="/admin/banks" element={<AdminBanks />} />
          <Route path="/admin/bank-product" element={<BankProductModule />} />
          <Route path="/admin/verifications" element={<AdminVerifications />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/roles" element={<AdminRoles />} />
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/leads" element={<AgentLeads />} />
          <Route path="/agent/leads/:id" element={<LeadDetail />} />
          <Route path="/agent/history" element={<AgentHistory />} />
          <Route path="/agent/profile" element={<AgentProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
