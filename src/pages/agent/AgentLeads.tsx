
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead, getLeadsByAgentId } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadList from '@/components/dashboard/LeadList';
import { toast } from '@/components/ui/use-toast';
import CheckInOut from '@/components/agent/CheckInOut';

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
    
    // Check if agent is on leave for today
    checkAgentLeaveStatus(parsedUser.id);
    
    // Fetch leads for the agent
    try {
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const allLeads = JSON.parse(storedLeads);
        
        // Filter leads assigned to this agent
        const agentLeads = allLeads
          .filter((lead: Lead) => lead.assignedTo === parsedUser.id)
          .map((lead: any) => {
            // Ensure verification object exists and has proper structure
            if (!lead.verification) {
              lead.verification = {
                id: `verification-${lead.id}`,
                leadId: lead.id,
                status: "Not Started" as "Not Started" | "In Progress" | "Completed" | "Rejected",
                agentId: parsedUser.id,
                photos: [],
                documents: [],
                notes: ""
              };
            } else {
              // Normalize verification status to one of the allowed types
              if (!["Not Started", "In Progress", "Completed", "Rejected"].includes(lead.verification.status)) {
                lead.verification.status = "Not Started";
              }
              // Explicit type assertion for the status
              lead.verification.status = lead.verification.status as "Not Started" | "In Progress" | "Completed" | "Rejected";
              
              // Ensure photos and documents arrays exist
              if (!lead.verification.photos) {
                lead.verification.photos = [];
              }
              
              if (!lead.verification.documents) {
                lead.verification.documents = [];
              }
            }
            
            // Ensure lead status is one of the allowed types
            if (!["Pending", "In Progress", "Completed", "Rejected"].includes(lead.status)) {
              lead.status = "Pending";
            }
            
            return lead as Lead;
          });
          
        setLeads(agentLeads);
        
        // Update local storage with normalized leads
        localStorage.setItem('mockLeads', JSON.stringify(allLeads));
        
        // Log to help with debugging
        console.log(`Found ${agentLeads.length} leads for agent ${parsedUser.id}`);
      } else {
        // No leads in localStorage, use the utility function
        const agentLeads = getLeadsByAgentId(parsedUser.id)
          .map(lead => {
            // Ensure verification object exists and has proper structure
            if (!lead.verification) {
              lead.verification = {
                id: `verification-${lead.id}`,
                leadId: lead.id,
                status: "Not Started" as "Not Started" | "In Progress" | "Completed" | "Rejected",
                agentId: parsedUser.id,
                photos: [],
                documents: [],
                notes: ""
              };
            } else {
              // Normalize verification status
              if (!["Not Started", "In Progress", "Completed", "Rejected"].includes(lead.verification.status)) {
                lead.verification.status = "Not Started";
              }
              
              // Explicit type assertion
              lead.verification.status = lead.verification.status as "Not Started" | "In Progress" | "Completed" | "Rejected";
              
              // Ensure photos and documents arrays exist
              if (!lead.verification.photos) {
                lead.verification.photos = [];
              }
              
              if (!lead.verification.documents) {
                lead.verification.documents = [];
              }
            }
            
            if (!["Pending", "In Progress", "Completed", "Rejected"].includes(lead.status)) {
              lead.status = "Pending";
            }
            
            return lead;
          });
        
        setLeads(agentLeads);
        
        // Store in localStorage
        localStorage.setItem('mockLeads', JSON.stringify([...agentLeads]));
        
        console.log(`Using mock data: Found ${agentLeads.length} leads for agent ${parsedUser.id}`);
      }
    } catch (error) {
      console.error("Error loading agent leads:", error);
      // Fallback to the utility function
      const agentLeads = getLeadsByAgentId(parsedUser.id);
      setLeads(agentLeads);
      
      // Store in localStorage
      localStorage.setItem('mockLeads', JSON.stringify([...agentLeads]));
    }
  }, [navigate]);
  
  const checkAgentLeaveStatus = (agentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if agent is on leave
    const storedLeaves = localStorage.getItem('agentLeaves');
    if (storedLeaves) {
      try {
        const allLeaves = JSON.parse(storedLeaves);
        const activeLeave = allLeaves.find(
          (leave: any) => 
            leave.agentId === agentId && 
            leave.status === 'Approved' &&
            new Date(leave.fromDate).toISOString().split('T')[0] <= today &&
            new Date(leave.toDate).toISOString().split('T')[0] >= today
        );
        
        if (activeLeave) {
          toast({
            title: "On Leave Today",
            description: "You are on approved leave today. No new tasks will be assigned.",
            variant: "destructive", // Using destructive for visual prominence
          });
        }
      } catch (error) {
        console.error("Error checking leave status:", error);
      }
    }
  };

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
            
            <CheckInOut user={currentUser} />
            
            <Card>
              <CardHeader>
                <CardTitle>All Assigned Leads</CardTitle>
                <CardDescription>
                  Complete list of verification tasks assigned to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leads.length > 0 ? (
                  <LeadList 
                    leads={leads} 
                    currentUser={currentUser} 
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You don't have any assigned leads yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentLeads;
