
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lead } from '@/utils/mockData';
import { getLeadsByAgentId } from '@/lib/supabase-queries';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadList from '@/components/dashboard/LeadList';
import { BarChart, Clock, User as UserIcon, Home, List } from 'lucide-react';

const AgentDashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'agent') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    
    // Fetch leads for the agent - properly await the async function
    const fetchLeads = async () => {
      try {
        const agentLeads = await getLeadsByAgentId(parsedUser.id);
        setLeads(agentLeads);
      } catch (error) {
        console.error('Error fetching agent leads:', error);
        setLeads([]);
      }
    };
    
    fetchLeads();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  // Calculate stats
  const pendingLeads = leads.filter(lead => lead.status === 'Pending');
  const inProgressLeads = leads.filter(lead => lead.status === 'In Progress');
  const completedLeads = leads.filter(lead => lead.status === 'Completed');

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Welcome, {currentUser.name}</h1>
                <p className="text-muted-foreground">
                  Here's an overview of your verification tasks for today
                </p>
              </div>
              <Button onClick={() => navigate('/agent/leads')}>
                <List className="mr-2 h-4 w-4" />
                View All Leads
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingLeads.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingLeads.length > 0 
                      ? "Leads awaiting verification" 
                      : "No pending verifications"}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProgressLeads.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {inProgressLeads.length > 0 
                      ? "Currently working on these" 
                      : "No verifications in progress"}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedLeads.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedLeads.length > 0 
                      ? `${(completedLeads.length / Math.max(leads.length, 1) * 100).toFixed(0)}% completion rate` 
                      : "No completed verifications"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingLeads.length})</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress ({inProgressLeads.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedLeads.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-4">
                {pendingLeads.length === 0 ? (
                  <Card className="bg-white">
                    <CardContent className="pt-6 text-center py-10">
                      <div className="flex justify-center mb-4">
                        <div className="bg-muted rounded-full p-3">
                          <Home className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium">No pending verifications</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        You have no pending verification tasks at the moment.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <LeadList leads={pendingLeads} currentUser={currentUser} />
                )}
              </TabsContent>
              <TabsContent value="in-progress" className="space-y-4">
                {inProgressLeads.length === 0 ? (
                  <Card className="bg-white">
                    <CardContent className="pt-6 text-center py-10">
                      <div className="flex justify-center mb-4">
                        <div className="bg-muted rounded-full p-3">
                          <BarChart className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium">No in-progress verifications</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        You don't have any verifications in progress right now.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <LeadList leads={inProgressLeads} currentUser={currentUser} />
                )}
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                {completedLeads.length === 0 ? (
                  <Card className="bg-white">
                    <CardContent className="pt-6 text-center py-10">
                      <div className="flex justify-center mb-4">
                        <div className="bg-muted rounded-full p-3">
                          <UserIcon className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium">No completed verifications</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        You haven't completed any verifications yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <LeadList leads={completedLeads} currentUser={currentUser} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
