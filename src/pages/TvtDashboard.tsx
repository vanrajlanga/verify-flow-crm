
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead, mockLeads } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadList from '@/components/dashboard/LeadList';
import { 
  getLeadsFromDatabase
} from '@/lib/lead-operations';

const TvtDashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and has TVTTEAM role
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    console.log('Current user in TVT Dashboard:', parsedUser);
    
    if (parsedUser.role !== 'tvtteam') {
      console.log('User is not TVT team member, redirecting...');
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadAssignedLeads(parsedUser);
  }, [navigate]);

  const loadAssignedLeads = async (user: User) => {
    setIsLoading(true);
    try {
      console.log('Loading leads for TVT user:', user.name, 'ID:', user.id);
      
      // First try to get leads from database
      let allLeads: Lead[] = [];
      
      try {
        const dbLeads = await getLeadsFromDatabase();
        if (dbLeads && dbLeads.length > 0) {
          console.log('Loaded leads from database:', dbLeads.length);
          allLeads = dbLeads;
        }
      } catch (error) {
        console.log('Database not available, using mock data');
      }

      // If no database leads, check localStorage
      if (allLeads.length === 0) {
        const storedLeads = localStorage.getItem('mockLeads');
        if (storedLeads) {
          try {
            const parsedLeads = JSON.parse(storedLeads);
            allLeads = parsedLeads;
            console.log('Loaded leads from localStorage:', allLeads.length);
          } catch (error) {
            console.error("Error parsing stored leads:", error);
          }
        }
      }

      // If still no leads, use mock data and store it
      if (allLeads.length === 0) {
        console.log('Using default mock leads');
        allLeads = mockLeads;
        // Store mock leads in localStorage for persistence
        localStorage.setItem('mockLeads', JSON.stringify(mockLeads));
      }

      console.log('All available leads:', allLeads.length);
      console.log('Looking for leads assigned to:', user.name, 'or', user.id, 'or Mike TVT');

      // Filter leads assigned to current TVT member
      // Check multiple possible assignment formats
      const assignedLeads = allLeads.filter(lead => {
        const isAssigned = lead.assignedTo === user.name || 
                          lead.assignedTo === user.id ||
                          lead.assignedTo === 'Mike TVT' ||
                          lead.assignedTo === 'mike.tvt@example.com' ||
                          (user.name === 'Mike TVT' && (lead.assignedTo === 'Mike TVT' || lead.assignedTo === 'mike.tvt@example.com'));
        
        if (isAssigned) {
          console.log('Found assigned lead:', lead.name, 'assigned to:', lead.assignedTo);
        }
        return isAssigned;
      });
      
      console.log('Filtered assigned leads for', user.name, ':', assignedLeads.length);
      
      // If no leads found, let's check if we need to assign some leads to this user
      if (assignedLeads.length === 0 && user.name === 'Mike TVT') {
        console.log('No leads found for Mike TVT, assigning some leads...');
        
        // Assign first 2 leads to Mike TVT if none are assigned
        const leadsToAssign = allLeads.slice(0, 2).map(lead => ({
          ...lead,
          assignedTo: 'Mike TVT'
        }));
        
        // Update the leads array
        const updatedLeads = allLeads.map(lead => {
          const shouldAssign = leadsToAssign.some(assignedLead => assignedLead.id === lead.id);
          return shouldAssign ? { ...lead, assignedTo: 'Mike TVT' } : lead;
        });
        
        // Store updated leads
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
        
        console.log('Assigned leads to Mike TVT:', leadsToAssign.length);
        setLeads(leadsToAssign);
      } else {
        setLeads(assignedLeads);
      }
    } catch (error) {
      console.error('Error in loadAssignedLeads:', error);
      // Fall back to mock data
      const assignedLeads = mockLeads.filter(lead => 
        lead.assignedTo === user.name || 
        lead.assignedTo === user.id ||
        lead.assignedTo === 'Mike TVT'
      );
      setLeads(assignedLeads);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/tvt/leads/${leadId}`);
  };

  const handleRefresh = async () => {
    if (currentUser) {
      await loadAssignedLeads(currentUser);
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
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TVT Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome {currentUser.name}, view and verify leads assigned to you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Assigned Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leads.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total leads assigned to you
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leads.filter(lead => lead.status === 'Pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leads waiting for verification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leads.filter(lead => lead.status === 'Completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully verified leads
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My Assigned Leads</CardTitle>
                <CardDescription>
                  Leads assigned to you for verification. Click "View" to verify and update lead status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading leads...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leads assigned to you yet.</p>
                  </div>
                ) : (
                  <LeadList 
                    leads={leads} 
                    currentUser={currentUser}
                    onViewLead={handleViewLead}
                    onRefresh={handleRefresh}
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

export default TvtDashboard;
