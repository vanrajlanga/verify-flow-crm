import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import AdminDashboard from '@/pages/AdminDashboard';
import TvtDashboard from '@/pages/TvtDashboard';
import AgentDashboard from '@/pages/AgentDashboard';
import NotFound from '@/pages/NotFound';
import LeadDetail from '@/pages/LeadDetail';
import TvtLeadDetail from '@/pages/TvtLeadDetail';
import AgentLeadDetail from '@/pages/agent/AgentLeadDetail';
import AgentLeads from '@/pages/agent/AgentLeads';
import AgentProfile from '@/pages/agent/AgentProfile';
import AgentHistory from '@/pages/agent/AgentHistory';
import AdminLeads from '@/pages/admin/AdminLeads';
import AdminLeadsSheet from '@/pages/admin/AdminLeadsSheet';
import AdminAgents from '@/pages/admin/AdminAgents';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminBanks from '@/pages/admin/AdminBanks';
import AdminReports from '@/pages/admin/AdminReports';
import AdminVerifications from '@/pages/admin/AdminVerifications';
import AddNewLead from '@/pages/admin/AddNewLead';
import BankProductModule from '@/pages/admin/BankProductModule';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/leads-sheet" element={<AdminLeadsSheet />} />
          <Route path="/admin/leads/:leadId" element={<LeadDetail />} />
          <Route path="/admin/add-lead" element={<AddNewLead />} />
          <Route path="/admin/agents" element={<AdminAgents />} />
          <Route path="/admin/roles" element={<AdminRoles />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/banks" element={<AdminBanks />} />
          <Route path="/admin/bank-products" element={<BankProductModule />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/verifications" element={<AdminVerifications />} />
          <Route path="/tvt" element={<TvtDashboard />} />
          <Route path="/tvt/dashboard" element={<TvtDashboard />} />
          <Route path="/tvt/leads/:leadId" element={<TvtLeadDetail />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/leads" element={<AgentLeads />} />
          <Route path="/agent/leads/:leadId" element={<AgentLeadDetail />} />
          <Route path="/agent/profile" element={<AgentProfile />} />
          <Route path="/agent/history" element={<AgentHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
