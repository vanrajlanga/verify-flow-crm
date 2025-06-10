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
import { Plus, Download, Upload } from 'lucide-react';
import { 
  getLeadsFromDatabase, 
  updateLeadInDatabase, 
  deleteLeadFromDatabase 
} from '@/lib/lead-operations';
import { supabase } from '@/integrations/supabase/client';
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
    loadLeadsAndAgents();
    loadLocationData();
  }, [navigate]);

  const loadLeadsAndAgents = async () => {
    try {
      // Load leads from database
      const dbLeads = await getLeadsFromDatabase();
      if (dbLeads.length > 0) {
        console.log('Loaded leads from database:', dbLeads.length);
        setLeads(dbLeads);
      } else {
        // Fall back to localStorage if no database leads
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
          setLeads([]);
        }
      }

      // Load agents from database
      try {
        const { data: dbAgents, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'agent');

        if (!error && dbAgents && dbAgents.length > 0) {
          const transformedAgents = dbAgents.map((agent: any) => ({
            id: agent.id,
            name: agent.name,
            role: agent.role,
            email: agent.email,
            phone: agent.phone || '',
            district: agent.district || '',
            status: agent.status || 'Active',
            state: agent.state,
            city: agent.city,
            baseLocation: agent.base_location,
            maxTravelDistance: agent.max_travel_distance,
            extraChargePerKm: agent.extra_charge_per_km,
            profilePicture: agent.profile_picture,
            totalVerifications: agent.total_verifications || 0,
            completionRate: agent.completion_rate || 0,
            password: agent.password
          }));
          setAgents(transformedAgents);
        } else {
          // Fall back to localStorage for agents
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
          } else {
            setAgents([]);
          }
        }
      } catch (error) {
        console.error('Error loading agents from database:', error);
        // Fall back to localStorage
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
        } else {
          setAgents([]);
        }
      }
    } catch (error) {
      console.error('Error in loadLeadsAndAgents:', error);
    }
  };

  const loadLocationData = () => {
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
  };

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

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleUpdateLead = async (leadId: string, newStatus: Lead['status']) => {
    try {
      // Update in database
      await updateLeadInDatabase(leadId, { status: newStatus });
      
      // Update local state
      const updatedLeads = leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      );
      setLeads(updatedLeads);

      toast({
        title: "Lead updated",
        description: `Lead ${leadId} status updated to ${newStatus}.`,
      });

      // Reload data from database
      loadLeadsAndAgents();
    } catch (error) {
      console.error('Error updating lead:', error);
      
      // Fall back to localStorage update
      const updatedLeads = leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      );
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Lead updated",
        description: `Lead ${leadId} status updated to ${newStatus} (saved locally).`,
        variant: "destructive"
      });
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleUpdateLeadData = async (updatedLead: Lead) => {
    try {
      // Update in database
      await updateLeadInDatabase(updatedLead.id, updatedLead);
      
      // Update local state
      const updatedLeads = leads.map(lead =>
        lead.id === updatedLead.id ? updatedLead : lead
      );
      setLeads(updatedLeads);

      toast({
        title: "Lead updated",
        description: `Lead ${updatedLead.name} has been updated successfully.`,
      });
      setEditingLead(null);
      
      // Reload data from database
      loadLeadsAndAgents();
    } catch (error) {
      console.error('Error updating lead data:', error);
      
      // Fall back to localStorage update
      const updatedLeads = leads.map(lead =>
        lead.id === updatedLead.id ? updatedLead : lead
      );
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Lead updated",
        description: `Lead ${updatedLead.name} has been updated successfully (saved locally).`,
        variant: "destructive"
      });
      setEditingLead(null);
    }
  };

  const handleAddNewLead = () => {
    navigate('/admin/leads/new');
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      // Delete from database
      await deleteLeadFromDatabase(leadId);
      
      // Update local state
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      setLeads(updatedLeads);

      toast({
        title: "Lead deleted",
        description: `Lead ${leadId} has been removed.`,
      });

      // Reload data from database
      loadLeadsAndAgents();
    } catch (error) {
      console.error('Error deleting lead:', error);
      
      // Fall back to localStorage delete
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Lead deleted",
        description: `Lead ${leadId} has been removed (saved locally).`,
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    try {
      console.log('Bulk deleting leads:', leadIds);
      
      // Delete from database one by one
      for (const leadId of leadIds) {
        try {
          await deleteLeadFromDatabase(leadId);
          console.log('Deleted lead from database:', leadId);
        } catch (error) {
          console.error('Error deleting lead from database:', leadId, error);
        }
      }
      
      // Update local state by filtering out deleted leads
      const updatedLeads = leads.filter(lead => !leadIds.includes(lead.id));
      setLeads(updatedLeads);
      
      // Update localStorage as well
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      console.log('Bulk delete completed. Remaining leads:', updatedLeads.length);

      toast({
        title: "Leads deleted",
        description: `${leadIds.length} leads have been permanently removed.`,
      });

      // Don't reload data automatically to prevent regeneration
      // loadLeadsAndAgents();
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
      console.log('Assigning lead in AdminLeads:', leadId, 'to agent:', agentId);
      
      // Update in database
      await updateLeadInDatabase(leadId, { 
        assignedTo: agentId, 
        status: 'Pending' as Lead['status'] 
      });
      
      // Update local state
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

      const agent = agents.find(a => a.id === agentId);
      toast({
        title: "Lead assigned",
        description: `Lead has been assigned to ${agent?.name || 'the selected agent'}.`,
      });

      // Reload data from database
      loadLeadsAndAgents();
    } catch (error) {
      console.error('Error assigning lead:', error);
      
      // Fall back to localStorage update
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
        description: `Lead has been assigned to ${agent?.name || 'the selected agent'} (saved locally).`,
        variant: "destructive"
      });
    }
  };

  const handleExport = (format: 'csv' | 'xls') => {
    // This is handled in LeadList component with enhanced functionality
  };

  const handleImport = async (file: File) => {
    try {
      const content = await file.text();
      let importedLeads: Lead[] = [];
      
      // Check if it's JSON (from our enhanced export) or CSV
      if (file.name.endsWith('.json') || content.startsWith('[')) {
        try {
          importedLeads = JSON.parse(content);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          throw new Error('Invalid JSON format');
        }
      } else {
        // Handle CSV import (existing logic)
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
          description: `${importedLeads.length} leads have been imported with complete data.`,
        });

        // Reload data from database
        loadLeadsAndAgents();
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

  const exportToCSV = () => {
    const headers = [
      'Name', 'Age', 'Job', 'Phone', 'Email', 'Street', 'City', 'District', 'State', 'Pincode',
      'Bank', 'Visit Type', 'Status', 'Assigned To', 'Company', 'Designation', 'Work Experience',
      'Property Type', 'Ownership Status', 'Property Age', 'Monthly Income', 'Annual Income',
      'Other Income', 'Agency File No', 'Application Barcode', 'Case ID', 'Scheme Description',
      'Bank Branch', 'Lead Type', 'Loan Amount', 'Loan Type', 'Vehicle Brand', 'Vehicle Model',
      'Additional Comments', 'Instructions', 'Created At'
    ];

    const csvData = filteredLeads.map(lead => [
      lead.name,
      lead.age,
      lead.job,
      lead.additionalDetails?.phoneNumber || '',
      lead.additionalDetails?.email || '',
      lead.address?.street || '',
      lead.address?.city || '',
      lead.address?.district || '',
      lead.address?.state || '',
      lead.address?.pincode || '',
      lead.bank,
      lead.visitType,
      lead.status,
      lead.assignedTo,
      lead.additionalDetails?.company || '',
      lead.additionalDetails?.designation || '',
      lead.additionalDetails?.workExperience || '',
      lead.additionalDetails?.propertyType || '',
      lead.additionalDetails?.ownershipStatus || '',
      lead.additionalDetails?.propertyAge || '',
      lead.additionalDetails?.monthlyIncome || '',
      lead.additionalDetails?.annualIncome || '',
      lead.additionalDetails?.otherIncome || '',
      lead.additionalDetails?.agencyFileNo || '',
      lead.additionalDetails?.applicationBarcode || '',
      lead.additionalDetails?.caseId || '',
      lead.additionalDetails?.schemeDesc || '',
      lead.additionalDetails?.bankBranch || '',
      lead.additionalDetails?.leadType || '',
      lead.additionalDetails?.loanAmount || '',
      lead.additionalDetails?.loanType || '',
      lead.additionalDetails?.vehicleBrandName || '',
      lead.additionalDetails?.vehicleModelName || '',
      lead.additionalDetails?.additionalComments || '',
      lead.instructions || '',
      lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `${filteredLeads.length} leads exported to CSV`
    });
  };

  const downloadSampleCSV = () => {
    const headers = [
      'Name', 'Age', 'Job', 'Phone', 'Email', 'Street', 'City', 'District', 'State', 'Pincode',
      'Bank', 'Visit Type', 'Status', 'Assigned To', 'Company', 'Designation', 'Work Experience',
      'Property Type', 'Ownership Status', 'Property Age', 'Monthly Income', 'Annual Income',
      'Other Income', 'Agency File No', 'Application Barcode', 'Case ID', 'Scheme Description',
      'Bank Branch', 'Lead Type', 'Loan Amount', 'Loan Type', 'Vehicle Brand', 'Vehicle Model',
      'Additional Comments', 'Instructions', 'Created At'
    ];

    const sampleData = [
      'John Doe', '30', 'Software Engineer', '+91 9876543210', 'john@example.com', '123 Main St',
      'Mumbai', 'Mumbai', 'Maharashtra', '400001', 'HDFC Bank', 'Residence', 'Pending',
      'Agent Name', 'Tech Corp', 'Senior Developer', '5 years', 'Apartment', 'Owned',
      '2 years', '75000', '900000', '50000', 'AGF123456', 'BC789', 'CS001', 'Home Loan Scheme',
      'HDFC Bandra', 'Home Loan', '2500000', 'Home Loan', '', '', 'Sample lead for testing',
      'Please verify during business hours', new Date().toLocaleDateString()
    ];

    const csvContent = [headers, sampleData]
      .map(row => Array.isArray(row) ? row.map(field => `"${field}"`).join(',') : row)
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_sample_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sample Data Downloaded",
      description: "Sample CSV file downloaded successfully"
    });
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const newLeads = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          
          return {
            id: `imported-lead-${Date.now()}-${index}`,
            name: values[0] || '',
            age: parseInt(values[1]) || 0,
            job: values[2] || '',
            address: {
              type: 'Residence' as const,
              street: values[5] || '',
              city: values[6] || '',
              district: values[7] || '',
              state: values[8] || '',
              pincode: values[9] || ''
            },
            additionalDetails: {
              phoneNumber: values[3] || '',
              email: values[4] || '',
              company: values[14] || '',
              designation: values[15] || '',
              workExperience: values[16] || '',
              propertyType: values[17] || '',
              ownershipStatus: values[18] || '',
              propertyAge: values[19] || '',
              monthlyIncome: values[20] || '',
              annualIncome: values[21] || '',
              otherIncome: values[22] || '',
              agencyFileNo: values[23] || '',
              applicationBarcode: values[24] || '',
              caseId: values[25] || '',
              schemeDesc: values[26] || '',
              bankBranch: values[27] || '',
              leadType: values[28] || '',
              loanAmount: values[29] || '',
              loanType: values[30] || '',
              vehicleBrandName: values[31] || '',
              vehicleModelName: values[32] || '',
              additionalComments: values[33] || '',
              addresses: []
            },
            status: (values[12] as 'Pending' | 'In Progress' | 'Completed' | 'Rejected') || 'Pending',
            bank: values[10] || '',
            visitType: (values[11] as 'Office' | 'Residence' | 'Both') || 'Residence',
            assignedTo: values[13] || '',
            createdAt: new Date(),
            documents: [],
            instructions: values[34] || ''
          };
        });

      const updatedLeads = [...leads, ...newLeads];
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Import Successful",
        description: `${newLeads.length} leads imported successfully`
      });
    };
    reader.readAsText(file);
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
                <p className="text-muted-foreground">
                  Manage and track all verification leads
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={downloadSampleCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample Data
                </Button>
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importFromCSV}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
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
                  A comprehensive list of all leads in the system with enhanced import/export
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
            <DialogTitle>Edit Complete Lead Data</DialogTitle>
            <DialogDescription>
              Update all lead information including personal details, addresses, financial data, and verification details.
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
