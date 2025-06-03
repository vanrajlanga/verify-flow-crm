
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  mockLeads, 
  mockUsers, 
  mockBanks,
  getAgentPerformance 
} from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays } from 'date-fns';

interface AgentPerformance {
  id: string;
  name: string;
  district: string;
  totalVerifications: number;
  completionRate: number;
}

const AdminReports = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    loadAgentData();
  }, [navigate]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const agentData = await getAgentPerformance();
      setAgents(agentData);
    } catch (error) {
      console.error('Error loading agent data:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  // Prepare data for charts
  const statusData = [
    { name: 'Pending', value: mockLeads.filter(l => l.status === 'Pending').length },
    { name: 'In Progress', value: mockLeads.filter(l => l.status === 'In Progress').length },
    { name: 'Completed', value: mockLeads.filter(l => l.status === 'Completed').length },
    { name: 'Rejected', value: mockLeads.filter(l => l.status === 'Rejected').length },
  ];

  const bankData = mockBanks.slice(0, 5).map(bank => ({
    name: bank.name,
    applications: bank.totalApplications
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FEF'];

  // Generate daily verification data (mock data)
  const today = new Date();
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return {
      date: format(date, 'MMM d'),
      verifications: Math.floor(Math.random() * 10) + 1
    };
  });

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
                <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">
                  Analytics and insights for verification activities
                </p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => window.print()}>
                  Export Report
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="agents">Agent Performance</TabsTrigger>
                <TabsTrigger value="banks">Bank Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification Status</CardTitle>
                      <CardDescription>
                        Distribution of verification requests by status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Verifications</CardTitle>
                      <CardDescription>
                        Number of verifications completed per day
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="verifications" fill="#8884d8" name="Verifications" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="agents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Performance</CardTitle>
                    <CardDescription>
                      Verification completion rates and metrics by agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-muted-foreground">Loading agent data...</div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {agents.length > 0 ? agents.map((agent) => (
                          <div key={agent.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <h3 className="font-medium">{agent.name}</h3>
                                <p className="text-sm text-muted-foreground">{agent.district}</p>
                              </div>
                              <div className="text-sm font-medium">{agent.completionRate}%</div>
                            </div>
                            <div className="h-2 relative rounded-full overflow-hidden">
                              <Progress value={agent.completionRate} className="h-full" />
                            </div>
                            <p className="text-sm text-muted-foreground">
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
              </TabsContent>
              
              <TabsContent value="banks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank Applications</CardTitle>
                    <CardDescription>
                      Total verification applications by bank
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bankData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReports;
