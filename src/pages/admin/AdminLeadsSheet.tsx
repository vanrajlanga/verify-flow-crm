import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';
import { Lead, User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadsTable from '@/components/admin/LeadsTable';
import { getAllLeadsFromDatabase, getLeadsByBankFromDatabase, deleteLeadFromDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';

const AdminLeadsSheet = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    // Allow both admin and manager roles to access this page
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadLeads(parsedUser);
  }, [navigate]);

  const loadLeads = async (user: User) => {
    try {
      setLoading(true);
      console.log('Loading leads for user:', user);
      
      let leadsData: Lead[];
      
      // If user is a manager, only show leads for their managed bank
      if (user.role === 'manager' && user.managedBankId) {
        console.log('Manager loading leads for bank:', user.managedBankId);
        leadsData = await getLeadsByBankFromDatabase(user.managedBankId);
      } else {
        // Admin can see all leads
        console.log('Admin loading all leads');
        leadsData = await getAllLeadsFromDatabase();
      }
      
      setLeads(leadsData);
      console.log(`Loaded ${leadsData.length} leads`);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: "Error loading leads",
        description: "Failed to load leads from database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleEditLead = (leadId: string) => {
    navigate(`/admin/leads/${leadId}`);
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLeadFromDatabase();
      
      // Also remove from local state
      setLeads(leads.filter(lead => lead.id !== leadId));
      
      toast({
        title: "Lead deleted",
        description: "Lead has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error deleting lead",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    }
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentUser.role === 'manager' ? 'Bank Leads Management' : 'Leads Management'}
                </h1>
                <p className="text-muted-foreground">
                  {currentUser.role === 'manager' 
                    ? `Manage leads for your bank (${currentUser.managedBankId?.toUpperCase() || 'Unknown Bank'})`
                    : 'Manage and track all verification leads'
                  }
                </p>
              </div>
              {/* Only show Add Lead button for admins */}
              {currentUser.role === 'admin' && (
                <Button onClick={() => navigate('/admin/add-lead')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Lead
                </Button>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {currentUser.role === 'manager' ? 'Your Bank Leads' : 'All Leads'}
                </CardTitle>
                <CardDescription>
                  {loading 
                    ? 'Loading leads...' 
                    : `Total leads: ${leads.length}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Loading leads...</h3>
                      <p className="text-muted-foreground">Please wait while we fetch the leads.</p>
                    </div>
                  </div>
                ) : (
                  <LeadsTable 
                    leads={leads} 
                    showActions={currentUser.role === 'admin'} // Only admins can edit/delete
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeadsSheet;
