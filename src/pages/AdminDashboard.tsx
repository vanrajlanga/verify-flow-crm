import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lead, mockLeads, mockBanks } from '@/utils/mockData';
import { getLeadStats, getAgentPerformance } from '@/lib/supabase-queries';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadList from '@/components/dashboard/LeadList';
import { BarChart, BadgeCheck, Upload, Users, List, ArrowRight } from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  rejected: number;
}

interface AgentPerformance {
  id: string;
  name: string;
  district: string;
  totalVerifications: number;
  completionRate: number;
}

const AdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 });
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
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
    
    // Load data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats and agent performance
      const [statsData, agentsData] = await Promise.all([
        getLeadStats(),
        getAgentPerformance()
      ]);
      
      setStats(statsData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback data
      setStats({ total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 });
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const recentLeads = [...mockLeads].sort((a, b) => {
    const dateA = a.verification?.completionTime || new Date(0);
    const dateB = b.verification?.completionTime || new Date(0);
    return dateB.getTime() - dateA.getTime();
  }).slice(0, 5);

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Overview of all verification activities across the system
                </p>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Button onClick={() => navigate('/admin/leads')}>
                  <List className="mr-2 h-4 w-4" />
                  All Leads
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/agents')}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Agents
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    Total verification requests
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting verification
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully verified
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rejected}</div>
                  <p className="text-xs text-muted-foreground">
                    Failed verification
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                  <CardDescription>
                    Verification completion rates by agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-muted-foreground">Loading agent data...</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {agents.length > 0 ? agents.map((agent) => (
                        <div key={agent.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.district}</p>
                            </div>
                            <div className="text-sm font-medium">{agent.completionRate}%</div>
                          </div>
                          <div className="h-2 relative rounded-full overflow-hidden">
                            <Progress value={agent.completionRate} className="h-full" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {agent.totalVerifications} verifications completed
                          </p>
                        </div>
                      )) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No agent data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Bank Submission Status</CardTitle>
                  <CardDescription>
                    Total applicants by bank
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBanks.slice(0, 5).map((bank) => (
                      <div key={bank.id} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{bank.name}</p>
                          <p className="text-xs text-muted-foreground">{bank.totalApplications} applications</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recent Verification Submissions</CardTitle>
                <CardDescription>
                  Latest verification activities in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadList 
                  leads={recentLeads} 
                  currentUser={currentUser} 
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
