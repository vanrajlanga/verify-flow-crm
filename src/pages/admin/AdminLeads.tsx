
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead, mockLeads, mockUsers, mockBanks } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadList from '@/components/dashboard/LeadList';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import AddLeadForm from '@/components/admin/AddLeadForm';
import { Plus } from 'lucide-react';

const AdminLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);

    // Get leads from localStorage or use mockLeads
    const storedLeads = localStorage.getItem('mockLeads');
    if (storedLeads) {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        setLeads(parsedLeads);
      } catch (error) {
        console.error("Error parsing stored leads:", error);
        // Fallback to mock data
        setLeads(mockLeads);
        localStorage.setItem('mockLeads', JSON.stringify(mockLeads));
      }
    } else {
      setLeads(mockLeads);
      localStorage.setItem('mockLeads', JSON.stringify(mockLeads));
    }

    // Get agents
    const storedAgents = localStorage.getItem('mockUsers');
    if (storedAgents) {
      try {
        const parsedUsers = JSON.parse(storedAgents);
        setAgents(parsedUsers.filter((user: User) => user.role === 'agent'));
      } catch (error) {
        console.error("Error parsing stored users:", error);
        const filteredAgents = mockUsers.filter(user => user.role === 'agent');
        setAgents(filteredAgents);
      }
    } else {
      const filteredAgents = mockUsers.filter(user => user.role === 'agent');
      setAgents(filteredAgents);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleUpdateLead = (leadId: string, newStatus: Lead['status']) => {
    const updatedLeads = leads.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

    toast({
      title: "Lead updated",
      description: `Lead ${leadId} status updated to ${newStatus}.`,
    });
  };

  const handleAddLead = (newLead: Lead) => {
    const updatedLeads = [...leads, newLead];
    setLeads(updatedLeads);
    localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

    toast({
      title: "Lead added",
      description: `New lead ${newLead.name} has been created.`,
    });
  };

  const handleDeleteLead = (leadId: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);
    localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

    toast({
      title: "Lead deleted",
      description: `Lead ${leadId} has been removed.`,
    });
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Fix the district properties checks with proper null handling
  const locationData = {
    states: [...new Set(agents.map(agent => {
      const district = agent.district;
      // Ensure district is not null/undefined before accessing properties
      if (district && typeof district === 'object') {
        return district.state || '';
      }
      return '';
    }).filter(Boolean))],
    districts: [...new Set(agents.map(agent => {
      const district = agent.district;
      // Ensure district is not null/undefined before accessing properties
      if (district && typeof district === 'object') {
        return district.name || '';
      }
      return '';
    }).filter(Boolean))],
    cities: [...new Set(agents.map(agent => {
      const district = agent.district;
      // Ensure district is not null/undefined before accessing properties
      if (district && typeof district === 'object') {
        return district.city || '';
      }
      return '';
    }).filter(Boolean))]
  };

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
                <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
                <p className="text-muted-foreground">
                  Manage leads and track verification progress
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                      Create a new lead for verification.
                    </DialogDescription>
                  </DialogHeader>
                  <AddLeadForm 
                    agents={agents}
                    banks={mockBanks}
                    onAddLead={handleAddLead}
                    onClose={() => document.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click()}
                    locationData={locationData}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Leads List</CardTitle>
                <CardDescription>
                  A comprehensive list of all leads in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadList 
                  leads={leads} 
                  currentUser={currentUser}
                  isAdmin={true}
                  onUpdate={(lead) => {
                    // Fix: Adapter function to match expected signature
                    if (lead && lead.id && lead.status) {
                      handleUpdateLead(lead.id, lead.status);
                    }
                  }}
                  onDelete={handleDeleteLead}
                  availableAgents={agents}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeads;
