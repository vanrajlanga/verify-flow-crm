import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';
import { Lead, User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadsTable from '@/components/admin/LeadsTable';
import { getAllLeadsFromDatabase, getLeadsByBankFromDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';

const AdminLeads = () => {
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
      if (user.role === 'manager' && user.managedBankId) {
        console.log('Manager loading leads for bank:', user.managedBankId);
        leadsData = await getLeadsByBankFromDatabase(user.managedBankId);
      } else {
        // Admin can see all leads
        console.log('Admin loading all leads');
        leadsData = await getAllLeadsFromDatabase();
      }

      // --------- NEW LOG --------
      console.log('[DEBUG] AdminLeads: Leads loaded from database:', leadsData);
      // --------- END LOG --------

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
    // Navigate to edit form, not just view
    navigate(`/admin/leads/edit/${leadId}`);
  };

  const handleViewLead = (leadId: string) => {
    // Navigate to view/details page
    navigate(`/admin/leads/${leadId}`);
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
                  Database-Driven Leads Management
                </h1>
                <p className="text-muted-foreground">
                  {currentUser.role === 'manager' 
                    ? `Manage leads for your bank (${currentUser.managedBankId?.toUpperCase() || 'Unknown Bank'})`
                    : 'Standard leads management interface for viewing and managing verification leads'
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
              <CardHeader className="sticky top-0 bg-white z-10 border-b">
                <CardTitle>
                  {currentUser.role === 'manager' ? 'Your Bank Leads' : 'All Leads'}
                </CardTitle>
                <CardDescription>
                  {loading 
                    ? 'Loading leads...' 
                    : `Total leads: ${leads.length} | Standard management view with view/edit actions`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-32 p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Loading leads...</h3>
                      <p className="text-muted-foreground">Please wait while we fetch the leads.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <LeadsTable 
                      leads={leads} 
                      onViewLead={handleViewLead}
                      onEditLead={handleEditLead}
                      showActions={true}
                      title="Standard Leads View"
                      description="View and manage individual leads with basic actions"
                      enableInlineEdit={false}
                      enableBulkSelect={false}
                      visibleColumns={[
                        'leadId',
                        'name', 
                        'bank',
                        'visitType',
                        'city',
                        'phone',
                        'company',
                        'bankProduct',
                        'initiatedBranch',
                        'assignedTo',
                        'createdDate',
                        'actions'
                      ]}
                    />
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

export default AdminLeads;
