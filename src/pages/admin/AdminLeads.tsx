
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
} from "@/components/ui/dialog";
import AddLeadForm from '@/components/admin/AddLeadForm';
import { Plus } from 'lucide-react';

const AdminLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [locationData, setLocationData] = useState({
    states: [
      {
        id: 'state-1',
        name: 'Maharashtra',
        districts: [
          {
            id: 'district-1',
            name: 'Mumbai',
            cities: [
              { id: 'city-1', name: 'Mumbai City' },
              { id: 'city-2', name: 'Navi Mumbai' }
            ]
          },
          {
            id: 'district-2',
            name: 'Pune',
            cities: [
              { id: 'city-3', name: 'Pune City' },
              { id: 'city-4', name: 'Pimpri-Chinchwad' }
            ]
          }
        ]
      },
      {
        id: 'state-2',
        name: 'Karnataka',
        districts: [
          {
            id: 'district-3',
            name: 'Bangalore',
            cities: [
              { id: 'city-5', name: 'Bangalore City' },
              { id: 'city-6', name: 'Electronic City' }
            ]
          }
        ]
      }
    ]
  });
  
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
    try {
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const parsedLeads = JSON.parse(storedLeads);
        setLeads(parsedLeads);
      } else {
        // Add createdAt to mockLeads if it doesn't exist
        const leadsWithCreatedAt = mockLeads.map(lead => ({
          ...lead,
          createdAt: lead.createdAt || new Date()
        }));
        setLeads(leadsWithCreatedAt);
        localStorage.setItem('mockLeads', JSON.stringify(leadsWithCreatedAt));
      }
    } catch (error) {
      console.error("Error parsing stored leads:", error);
      const leadsWithCreatedAt = mockLeads.map(lead => ({
        ...lead,
        createdAt: lead.createdAt || new Date()
      }));
      setLeads(leadsWithCreatedAt);
      localStorage.setItem('mockLeads', JSON.stringify(leadsWithCreatedAt));
    }
    
    // Get location data from localStorage or use default
    try {
      const storedLocationData = localStorage.getItem('locationData');
      if (storedLocationData) {
        setLocationData(JSON.parse(storedLocationData));
      } else {
        localStorage.setItem('locationData', JSON.stringify(locationData));
      }
    } catch (error) {
      console.error("Error parsing location data:", error);
      localStorage.setItem('locationData', JSON.stringify(locationData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleAddLead = (newLead: Lead) => {
    // Generate unique IDs for the lead and verification
    const leadId = `lead-${Date.now()}`;
    const verificationId = `verification-${Date.now()}`;
    
    // Create a properly formatted lead with all required fields
    const completeNewLead = {
      ...newLead,
      id: leadId,
      verification: {
        ...newLead.verification,
        id: verificationId,
        leadId: leadId,
        status: 'Not Started',
        photos: [],
        documents: [],
        notes: newLead.verification?.notes || ''
      }
    };
    
    const updatedLeads = [...leads, completeNewLead];
    setLeads(updatedLeads);
    localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
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
                <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
                <p className="text-muted-foreground">
                  View and manage all verification leads
                </p>
              </div>
              <Button onClick={() => setIsAddLeadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Lead
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>All Leads</CardTitle>
                <CardDescription>
                  Complete list of all verification leads across all banks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadList 
                  leads={leads} 
                  currentUser={currentUser} 
                  isAdmin={true} 
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new verification lead
            </DialogDescription>
          </DialogHeader>
          <AddLeadForm 
            agents={mockUsers.filter(user => user.role === 'agent')} 
            banks={mockBanks}
            onAddLead={handleAddLead}
            onClose={() => setIsAddLeadDialogOpen(false)}
            locationData={locationData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;
