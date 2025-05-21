
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead, getLeadsByAgentId } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadList from '@/components/dashboard/LeadList';

const AgentLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'agent') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    
    // Fetch leads for the agent
    try {
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const allLeads = JSON.parse(storedLeads);
        const agentLeads = allLeads
          .filter((lead: Lead) => lead.assignedTo === parsedUser.id)
          .map((lead: Lead) => {
            // Ensure verification object exists and has proper structure
            if (!lead.verification) {
              lead.verification = {
                id: `verification-${lead.id}`,
                leadId: lead.id,
                status: "Not Started",
                agentId: parsedUser.id,
                photos: [],
                documents: [],
                notes: ""
              };
            }
            
            // Ensure verification status is one of the allowed types
            if (!["Not Started", "In Progress", "Completed", "Rejected"].includes(lead.verification.status)) {
              lead.verification.status = "Not Started";
            }
            
            // Ensure lead status is one of the allowed types
            if (!["Pending", "In Progress", "Completed", "Rejected"].includes(lead.status)) {
              lead.status = "Pending";
            }
            
            return lead as Lead; // Explicit cast to Lead type
          });
        setLeads(agentLeads);
        
        // Update local storage with normalized leads
        localStorage.setItem('mockLeads', JSON.stringify(allLeads));
      } else {
        const agentLeads = getLeadsByAgentId(parsedUser.id)
          .map(lead => {
            // Ensure verification object exists and has proper structure
            if (!lead.verification) {
              lead.verification = {
                id: `verification-${lead.id}`,
                leadId: lead.id,
                status: "Not Started",
                agentId: parsedUser.id,
                photos: [],
                documents: [],
                notes: ""
              };
            }
            
            // Normalize statuses
            if (!["Not Started", "In Progress", "Completed", "Rejected"].includes(lead.verification.status)) {
              lead.verification.status = "Not Started";
            }
            
            if (!["Pending", "In Progress", "Completed", "Rejected"].includes(lead.status)) {
              lead.status = "Pending";
            }
            
            return lead;
          });
        setLeads(agentLeads);
        
        // Store in localStorage
        localStorage.setItem('mockLeads', JSON.stringify([...agentLeads]));
      }
    } catch (error) {
      console.error("Error loading agent leads:", error);
      // Fallback to the utility function
      const agentLeads = getLeadsByAgentId(parsedUser.id);
      setLeads(agentLeads);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar user={currentUser} isOpen={sidebarOpen} />
      
      <div className="flex flex-col flex-1">
        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">My Leads</h1>
                <p className="text-muted-foreground">
                  View and manage your assigned verification leads
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>All Assigned Leads</CardTitle>
                <CardDescription>
                  Complete list of verification tasks assigned to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadList 
                  leads={leads} 
                  currentUser={currentUser} 
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentLeads;
