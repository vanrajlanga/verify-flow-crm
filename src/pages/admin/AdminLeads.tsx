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
import EditLeadForm from '@/components/admin/EditLeadForm';
import { Plus } from 'lucide-react';

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
        setLeads(mockLeads);
        localStorage.setItem('mockLeads', JSON.stringify(mockLeads));
      }
    } else {
      setLeads(mockLeads);
      localStorage.setItem('mockLeads', JSON.stringify(mockLeads));
    }

    // Get ALL agents from localStorage (including newly created ones)
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        const filteredAgents = parsedUsers.filter((user: User) => user.role === 'agent');
        setAgents(filteredAgents);
      } catch (error) {
        console.error("Error parsing stored users:", error);
        const filteredAgents = mockUsers.filter(user => user.role === 'agent');
        setAgents(filteredAgents);
      }
    } else {
      const filteredAgents = mockUsers.filter(user => user.role === 'agent');
      setAgents(filteredAgents);
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    }

    // Get location data from localStorage or initialize empty structure
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
  }, [navigate]);

  // Function to initialize default location data
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

  // Save location data to localStorage whenever it changes
  useEffect(() => {
    if (locationData.states.length > 0) {
      localStorage.setItem('locationData', JSON.stringify(locationData));
    }
  }, [locationData]);

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

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleUpdateLeadData = (updatedLead: Lead) => {
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

  const handleBulkDelete = (leadIds: string[]) => {
    const updatedLeads = leads.filter(lead => !leadIds.includes(lead.id));
    setLeads(updatedLeads);
    localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

    toast({
      title: "Leads deleted",
      description: `${leadIds.length} leads have been removed.`,
    });
  };

  const handleAssignLead = (leadId: string, agentId: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          assignedTo: agentId,
          verification: {
            ...lead.verification,
            agentId: agentId,
            status: 'Not Started'
          }
        } as Lead;
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

    toast({
      title: "Lead assigned",
      description: "Lead has been assigned to the selected agent.",
    });
  };

  const handleExport = (format: 'csv' | 'xls') => {
    const headers = [
      'Agency File No', 'Customer Name', 'Phone', 'Address Type', 'Product Type',
      'Residence Address', 'Office Address', 'FI Date', 'Status', 'Assigned Agent',
      'Loan Amount', 'Asset Make', 'Asset Model'
    ];

    const csvContent = [
      headers.join(','),
      ...leads.map(lead => {
        const officeAddress = lead.additionalDetails?.addresses?.find(addr => addr.type === 'Office');
        
        return [
          lead.additionalDetails?.agencyFileNo || '',
          lead.name,
          lead.additionalDetails?.phoneNumber || '',
          lead.visitType,
          lead.additionalDetails?.leadType || '',
          `"${lead.address.street}, ${lead.address.city}, ${lead.address.state}"`,
          officeAddress ? `"${officeAddress.street}, ${officeAddress.city}, ${officeAddress.state}"` : 'N/A',
          lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '',
          lead.status,
          agents.find(agent => agent.id === lead.assignedTo)?.name || 'Unassigned',
          lead.additionalDetails?.loanAmount || 'N/A',
          lead.additionalDetails?.vehicleBrandName || 'N/A',
          lead.additionalDetails?.vehicleModelName || 'N/A'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        const importedLeads: Lead[] = [];
        
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
    reader.readAsText(file);
  };

  const handleUpdateLocationData = (newLocationData: LocationData) => {
    setLocationData(newLocationData);
    localStorage.setItem('locationData', JSON.stringify(newLocationData));
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  };

  const simplifiedLocationData = {
    states: locationData.states.map(state => state.name),
    districts: locationData.states.flatMap(state => 
      state.districts.map(district => district.name)
    ),
    cities: locationData.states.flatMap(state => 
      state.districts.flatMap(district => 
        district.cities.map(city => city.name)
      )
    )
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
                <DialogContent className="sm:max-w-5xl w-full">
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

      {/* Edit Lead Dialog */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="sm:max-w-5xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update lead information and details.
            </DialogDescription>
          </DialogHeader>
          {editingLead && (
            <EditLeadForm 
              lead={editingLead}
              agents={agents}
              banks={mockBanks}
              onUpdate={handleUpdateLeadData}
              onClose={() => setEditingLead(null)}
              locationData={locationData}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;
