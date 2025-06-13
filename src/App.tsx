
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import AdminDashboard from '@/pages/AdminDashboard';
import AgentDashboard from '@/pages/AgentDashboard';
import TvtDashboard from '@/pages/TvtDashboard';
import TvtLeadDetail from '@/pages/TvtLeadDetail';
import LeadDetail from '@/pages/LeadDetail';
import AdminLeads from '@/pages/admin/AdminLeads';
import AdminAgents from '@/pages/admin/AdminAgents';
import AdminBanks from '@/pages/admin/AdminBanks';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminReports from '@/pages/admin/AdminReports';
import AdminVerifications from '@/pages/admin/AdminVerifications';
import AdminLeadsSheet from '@/pages/admin/AdminLeadsSheet';
import AddNewLead from '@/pages/admin/AddNewLead';
import BankProductModule from '@/pages/admin/BankProductModule';
import AgentLeads from '@/pages/agent/AgentLeads';
import AgentProfile from '@/pages/agent/AgentProfile';
import AgentHistory from '@/pages/agent/AgentHistory';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/leads/:leadId" element={<LeadDetail />} />
            <Route path="/lead/:leadId" element={<LeadDetail />} />
            <Route path="/admin/add-lead" element={<AddNewLead />} />
            <Route path="/admin/agents" element={<AdminAgents />} />
            <Route path="/admin/banks" element={<AdminBanks />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/verifications" element={<AdminVerifications />} />
            <Route path="/admin/leads-sheet" element={<AdminLeadsSheet />} />
            <Route path="/admin/bank-products" element={<BankProductModule />} />
            
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/agent/leads" element={<AgentLeads />} />
            <Route path="/agent/leads/:leadId" element={<LeadDetail />} />
            <Route path="/agent/profile" element={<AgentProfile />} />
            <Route path="/agent/history" element={<AgentHistory />} />
            
            <Route path="/tvt" element={<TvtDashboard />} />
            <Route path="/tvt/leads/:leadId" element={<TvtLeadDetail />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
