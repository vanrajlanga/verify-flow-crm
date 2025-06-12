import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Index from '@/pages/Index';
import AdminDashboard from '@/pages/AdminDashboard';
import AgentDashboard from '@/pages/AgentDashboard';
import TVTDashboard from '@/pages/TVTDashboard';
import LeadDetail from '@/pages/LeadDetail';
import NotFound from '@/pages/NotFound';
import AdminLeads from '@/pages/admin/AdminLeads';
import AdminAgents from '@/pages/admin/AdminAgents';
import AdminBanks from '@/pages/admin/AdminBanks';
import AdminReports from '@/pages/admin/AdminReports';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminVerifications from '@/pages/admin/AdminVerifications';
import AddNewLead from '@/pages/admin/AddNewLead';
import AdminLeadsSheet from '@/pages/admin/AdminLeadsSheet';
import AgentLeads from '@/pages/agent/AgentLeads';
import AgentHistory from '@/pages/agent/AgentHistory';
import AgentProfile from '@/pages/agent/AgentProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/tvt" element={<TVTDashboard />} />
        <Route path="/admin/leads" element={<AdminLeads />} />
        <Route path="/admin/agents" element={<AdminAgents />} />
        <Route path="/admin/banks" element={<AdminBanks />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/roles" element={<AdminRoles />} />
        <Route path="/admin/verifications" element={<AdminVerifications />} />
        <Route path="/admin/add-lead" element={<AddNewLead />} />
        <Route path="/admin/leads-sheet" element={<AdminLeadsSheet />} />
        <Route path="/admin/leads/:leadId" element={<LeadDetail />} />
        <Route path="/agent/leads" element={<AgentLeads />} />
        <Route path="/agent/history" element={<AgentHistory />} />
        <Route path="/agent/profile" element={<AgentProfile />} />
        <Route path="/agent/leads/:leadId" element={<LeadDetail />} />
        <Route path="/tvt/leads/:leadId" element={<LeadDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
