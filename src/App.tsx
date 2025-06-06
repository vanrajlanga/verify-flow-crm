
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LeadDetail from "./pages/LeadDetail";

// Admin pages
import AdminLeads from "./pages/admin/AdminLeads";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminBanks from "./pages/admin/AdminBanks";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRoles from "./pages/admin/AdminRoles";
import AddNewLead from "./pages/admin/AddNewLead";

// Agent pages
import AgentLeads from "./pages/agent/AgentLeads";
import AgentHistory from "./pages/agent/AgentHistory";
import AgentProfile from "./pages/agent/AgentProfile";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Agent Routes */}
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/agent/leads" element={<AgentLeads />} />
            <Route path="/agent/leads/:leadId" element={<LeadDetail />} />
            <Route path="/agent/history" element={<AgentHistory />} />
            <Route path="/agent/profile" element={<AgentProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/leads/new" element={<AddNewLead />} />
            <Route path="/admin/leads/:leadId" element={<LeadDetail />} />
            <Route path="/admin/verifications" element={<AdminVerifications />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/agents" element={<AdminAgents />} />
            <Route path="/admin/banks" element={<AdminBanks />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            
            {/* Generic lead detail route for both admin and agent */}
            <Route path="/lead/:leadId" element={<LeadDetail />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
