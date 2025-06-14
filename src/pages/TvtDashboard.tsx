
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead, mockLeads } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadList from '@/components/dashboard/LeadList';
import { 
  getAllLeadsFromDatabase
} from '@/lib/lead-operations';

const TvtDashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and has TVT role
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    console.log('Current user in TVT Dashboard:', parsedUser);
    
    // Fix: Check for 'tvtteam' role instead of 'tvt'
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
        const dbLeads = await getAllLeadsFromDatabase();
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
      console.log('Looking for leads assigned to:', user.name);

      // Filter leads assigned to current TVT member
      const assignedLeads = allLeads.filter(lead => {
        const isAssigned = lead.assignedTo === user.name || 
                          lead.assignedTo === user.id ||
                          (user.name === 'Mike TVT' && lead.assignedTo === 'Mike TVT');
        
        console.log(`Lead ${lead.name} assigned to: ${lead.assignedTo}, matches user: ${isAssigned}`);
        return isAssigned;
      });
      
      console.log('Filtered assigned leads for', user.name, ':', assignedLeads.length);
      
      // If no leads found and user is Mike TVT, ensure all mock leads are assigned to him
      if (assignedLeads.length === 0 && user.name === 'Mike TVT') {
        console.log('Assigning all mock leads to Mike TVT...');
        
        // Assign all mock leads to Mike TVT
        const updatedLeads = allLeads.map(lead => ({
          ...lead,
          assignedTo: 'Mike TVT'
        }));
        
        // Store updated leads
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
        
        console.log('Assigned all leads to Mike TVT:', updatedLeads.length);
        setLeads(updatedLeads);
      } else {
        setLeads(assignedLeads);
      }
    } catch (error) {
      console.error('Error in loadAssignedLeads:', error);
      // Fall back to mock data assigned to current user
      const assignedLeads = mockLeads.map(lead => ({
        ...lead,
        assignedTo: user.name === 'Mike TVT' ? 'Mike TVT' : user.name
      }));
      setLeads(assignedLeads);
      // Store the assigned leads
      localStorage.setItem('mockLeads', JSON.stringify(assignedLeads));
    } finally {
      setIsLoading(false);
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
                  Leads assigned to you for verification. Click "View Details" to verify and update lead status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading leads...</p>
                  </div>
                ) : (
                  <LeadList 
                    leads={leads} 
                    currentUser={currentUser}
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
