import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead } from '@/utils/mockData';
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
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and has TVTTEAM role
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'tvtteam') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadAssignedLeads(parsedUser.id);
  }, [navigate]);

  const loadAssignedLeads = async (userId: string) => {
    try {
      // Load leads from database
      const dbLeads = await getLeadsFromDatabase();
      if (dbLeads.length > 0) {
        // Filter leads assigned to current TVT member
        const assignedLeads = dbLeads.filter(lead => lead.assignedTo === userId);
        console.log('Loaded assigned leads from database:', assignedLeads.length);
        setLeads(assignedLeads);
      } else {
        // Fall back to localStorage if no database leads
        const storedLeads = localStorage.getItem('mockLeads');
        if (storedLeads) {
          try {
            const parsedLeads = JSON.parse(storedLeads);
            const assignedLeads = parsedLeads.filter((lead: Lead) => lead.assignedTo === userId);
            console.log('Loaded assigned leads from localStorage:', assignedLeads.length);
            setLeads(assignedLeads);
          } catch (error) {
            console.error("Error parsing stored leads:", error);
            setLeads([]);
          }
        } else {
          setLeads([]);
        }
      }
    } catch (error) {
      console.error('Error in loadAssignedLeads:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/tvt/leads/${leadId}`);
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
                View and verify leads assigned to you
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
                  Leads assigned to you for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadList 
                  leads={leads} 
                  currentUser={currentUser}
                  onViewLead={handleViewLead}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TvtDashboard;
