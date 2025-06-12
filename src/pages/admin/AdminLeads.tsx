
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead, mockBanks } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadList from '@/components/dashboard/LeadList';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import EditLeadForm from '@/components/admin/EditLeadForm';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LocationData {
  states: {
    id: string;
    name: string;
    districts: {
      id: string;
      name: string;
      cities: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
}

const AdminLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [locationData, setLocationData] = useState<LocationData>({
    states: []
  });
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initializeAdminLeads();
  }, [navigate]);

  const initializeAdminLeads = async () => {
    try {
      console.log('Initializing Admin Leads page...');
      
      // Check if user is logged in
      const storedUser = localStorage.getItem('kycUser');
      if (!storedUser) {
        console.log('No user found, redirecting to login');
        navigate('/');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      console.log('Current user:', parsedUser);
      
      if (parsedUser.role !== 'admin') {
        console.log('User is not admin, redirecting');
        navigate('/');
        return;
      }

      setCurrentUser(parsedUser);
      
      // Load data with timeout fallback
      await Promise.race([
        loadAllData(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Data loading timeout')), 5000)
        )
      ]);
      
    } catch (error) {
      console.error('Error initializing Admin Leads:', error);
      // Continue with localStorage data even if database fails
      loadLocalStorageData();
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    try {
      // Load leads from localStorage first for immediate display
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        try {
          const parsedLeads = JSON.parse(storedLeads);
          console.log('Loaded leads from localStorage:', parsedLeads.length);
          setLeads(parsedLeads);
        } catch (error) {
          console.error("Error parsing stored leads:", error);
          setLeads([]);
        }
      } else {
        console.log('No leads found in localStorage');
        setLeads([]);
      }

      // Load agents from localStorage
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          const filteredAgents = parsedUsers.filter((user: User) => user.role === 'agent');
          console.log('Loaded agents from localStorage:', filteredAgents.length);
          setAgents(filteredAgents);
        } catch (error) {
          console.error("Error parsing stored users:", error);
          setAgents([]);
        }
      }

      // Load location data
      loadLocationData();
      
    } catch (error) {
      console.error('Error in loadAllData:', error);
      throw error;
    }
  };

  const loadLocalStorageData = () => {
    console.log('Loading data from localStorage as fallback...');
    
    // Load leads
    const storedLeads = localStorage.getItem('mockLeads');
    if (storedLeads) {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        setLeads(parsedLeads);
      } catch (error) {
        console.error("Error parsing stored leads:", error);
        setLeads([]);
      }
    }

    // Load agents
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        const filteredAgents = parsedUsers.filter((user: User) => user.role === 'agent');
        setAgents(filteredAgents);
      } catch (error) {
        console.error("Error parsing stored users:", error);
        setAgents([]);
      }
    }

    loadLocationData();
  };

  const loadLocationData = () => {
    const storedLocationData = localStorage.getItem('locationData');
    if (storedLocationData) {
      try {
        const parsedLocationData = JSON.parse(storedLocationData);
        setLocationData(parsedLocationData);
      } catch (error) {
        console.error("Error parsing stored location data:", error);
        initializeDefaultLocationData();
      }
    } else {
      initializeDefaultLocationData();
    }
  };

  const initializeDefaultLocationData = () => {
    const defaultLocationData = {
      states: [
        {
          id: 'state-1',
          name: 'Karnataka',
          districts: [
            {
              id: 'district-1',
              name: 'Bangalore Urban',
              cities: [
                { id: 'city-1', name: 'Bangalore' },
                { id: 'city-2', name: 'Electronic City' }
              ]
            }
          ]
        },
        {
          id: 'state-2',
          name: 'Maharashtra',
          districts: [
            {
              id: 'district-2',
              name: 'Mumbai',
              cities: [
                { id: 'city-3', name: 'Mumbai' },
                { id: 'city-4', name: 'Navi Mumbai' }
              ]
            }
          ]
        }
      ]
    };
    setLocationData(defaultLocationData);
    localStorage.setItem('locationData', JSON.stringify(defaultLocationData));
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleUpdateLead = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const updatedLeads = leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      );
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Lead updated",
        description: `Lead status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error updating lead",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleUpdateLeadData = async (updatedLead: Lead) => {
    try {
      const updatedLeads = leads.map(lead =>
        lead.id === updatedLead.id ? updatedLead : lead
      );
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Lead updated",
        description: `Lead ${updatedLead.name} has been updated successfully.`,
      });
      setEditingLead(null);
    } catch (error) {
      console.error('Error updating lead data:', error);
      toast({
        title: "Error updating lead",
        description: "Please try again.",
        variant: "destructive"
      });
      setEditingLead(null);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Lead deleted",
        description: `Lead has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error deleting lead",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    try {
      console.log('Bulk deleting leads:', leadIds);
      
      const updatedLeads = leads.filter(lead => !leadIds.includes(lead.id));
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      console.log('Bulk delete completed. Remaining leads:', updatedLeads.length);

      toast({
        title: "Leads deleted",
        description: `${leadIds.length} leads have been permanently removed.`,
      });
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      
      toast({
        title: "Bulk delete failed",
        description: "Some leads could not be deleted. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAssignLead = async (leadId: string, agentId: string) => {
    try {
      console.log('Assigning lead:', leadId, 'to agent:', agentId);
      
      const updatedLeads = leads.map(lead => {
        if (lead.id === leadId) {
          const updatedLead = {
            ...lead,
            assignedTo: agentId,
            status: 'Pending' as Lead['status'],
            verification: {
              ...lead.verification,
              agentId: agentId,
              status: 'Not Started'
            }
          } as Lead;
          return updatedLead;
        }
        return lead;
      });
      
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      const agent = agents.find(a => a.id === agentId);
      toast({
        title: "Lead assigned",
        description: `Lead has been assigned to ${agent?.name || 'the selected agent'}.`,
      });
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast({
        title: "Error assigning lead",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExport = (format: 'csv' | 'xls') => {
    // This is handled in LeadList component
  };

  const handleImport = async (file: File) => {
    try {
      console.log('Importing file:', file.name);
      
      const content = await file.text();
      let importedLeads: Lead[] = [];
      
      if (file.name.endsWith('.json') || content.startsWith('[')) {
        try {
          importedLeads = JSON.parse(content);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          throw new Error('Invalid JSON format');
        }
      } else {
        // Handle CSV import
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 3 && values[1].trim()) {
            const newLead: Lead = {
              id: `imported-lead-${Date.now()}-${i}`,
              name: values[1].trim(),
              age: 30,
              job: values[3] || 'Not specified',
              address: {
                street: values[5] || '',
                city: 'Not specified',
                district: 'Not specified',
                state: 'Not specified',
                pincode: '000000'
              },
              additionalDetails: {
                agencyFileNo: values[0] || '',
                phoneNumber: values[2] || '',
                company: '',
                designation: '',
                workExperience: '',
                propertyType: '',
                ownershipStatus: '',
                propertyAge: '',
                monthlyIncome: '',
                annualIncome: '',
                otherIncome: '',
                addresses: []
              },
              status: 'Pending',
              bank: 'bank-1',
              visitType: 'Residence',
              assignedTo: '',
              createdAt: new Date(),
              documents: [],
              instructions: ''
            };
            importedLeads.push(newLead);
          }
        }
      }
      
      if (importedLeads.length > 0) {
        const updatedLeads = [...leads, ...importedLeads];
        setLeads(updatedLeads);
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
        
        toast({
          title: "Import successful",
          description: `${importedLeads.length} leads have been imported.`,
        });
      } else {
        toast({
          title: "Import failed",
          description: "No valid leads found in the file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "Error reading the file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (loading) {
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
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading leads data...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
                <p className="text-muted-foreground">
                  Manage and track all verification leads ({leads.length} total)
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button asChild>
                  <Link to="/admin/add-lead">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Lead
                  </Link>
                </Button>
              </div>
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
                    if (lead && lead.id && lead.status) {
                      handleUpdateLead(lead.id, lead.status);
                    }
                  }}
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                  onBulkDelete={handleBulkDelete}
                  onAssignLead={handleAssignLead}
                  onExport={handleExport}
                  onImport={handleImport}
                  availableAgents={agents}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {editingLead && (
        <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
          <DialogContent className="sm:max-w-5xl w-full">
            <DialogHeader>
              <DialogTitle>Edit Complete Lead Data</DialogTitle>
              <DialogDescription>
                Update all lead information including personal details, addresses, financial data, and verification details.
              </DialogDescription>
            </DialogHeader>
            <EditLeadForm 
              lead={editingLead}
              agents={agents}
              banks={mockBanks}
              onUpdate={handleUpdateLeadData}
              onClose={() => setEditingLead(null)}
              locationData={locationData}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminLeads;
