import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAgentPerformance } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, LineChart } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const AdminReports = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("performance");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [leads, setLeads] = useState([]);
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
    
    // Fetch agent performance
    const performance = getAgentPerformance();
    setAgentPerformance(performance);
    
    // Get leads from localStorage
    const storedLeads = localStorage.getItem('mockLeads');
    if (storedLeads) {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        setLeads(parsedLeads);
      } catch (error) {
        console.error("Error loading leads:", error);
        setLeads([]);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  // Update the DateRangePicker to use the correct type
  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
  };

  // Calculate statistics for the selected date range
  const getFilteredLeads = () => {
    return leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= dateRange.from && leadDate <= dateRange.to;
    });
  };

  const getStatusDistribution = () => {
    const filteredLeads = getFilteredLeads();
    const statusCounts = {
      Pending: 0,
      'In Progress': 0,
      Completed: 0,
      Rejected: 0
    };
    
    filteredLeads.forEach(lead => {
      if (statusCounts.hasOwnProperty(lead.status)) {
        statusCounts[lead.status as keyof typeof statusCounts]++;
      }
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const getAgentCompletions = () => {
    const filteredLeads = getFilteredLeads();
    const agentCounts: Record<string, { completed: number, inProgress: number, name: string }> = {};
    
    filteredLeads.forEach(lead => {
      if (!lead.assignedTo) return;
      
      if (!agentCounts[lead.assignedTo]) {
        const agent = agentPerformance.find(a => a.id === lead.assignedTo);
        agentCounts[lead.assignedTo] = {
          completed: 0,
          inProgress: 0,
          name: agent ? agent.name : 'Unknown Agent'
        };
      }
      
      if (lead.status === 'Completed') {
        agentCounts[lead.assignedTo].completed++;
      } else if (lead.status === 'In Progress') {
        agentCounts[lead.assignedTo].inProgress++;
      }
    });
    
    return Object.values(agentCounts);
  };

  const getDailyVerifications = () => {
    const filteredLeads = getFilteredLeads();
    const dailyCounts: Record<string, number> = {};
    
    filteredLeads.forEach(lead => {
      const dateStr = format(new Date(lead.createdAt), 'yyyy-MM-dd');
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
    });
    
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({
        date: format(new Date(date), 'MMM dd'),
        count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
                <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
                <p className="text-muted-foreground">
                  View performance metrics and verification statistics
                </p>
              </div>
              
              <DateRangePicker
                date={dateRange}
                onDateChange={handleDateRangeChange}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  <span>Agent Performance</span>
                </TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Status Distribution</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span>Verification Trends</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Performance</CardTitle>
                    <CardDescription>
                      Verification completion rates by agent for the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={getAgentCompletions()}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#4ade80" />
                          <Bar dataKey="inProgress" name="In Progress" fill="#60a5fa" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="rounded-md border bg-white overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead>In Progress</TableHead>
                            <TableHead>Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getAgentCompletions().map((agent) => {
                            const agentData = agentPerformance.find(a => a.name === agent.name);
                            const total = agent.completed + agent.inProgress;
                            const rate = total > 0 ? Math.round((agent.completed / total) * 100) : 0;
                            
                            return (
                              <TableRow key={agent.name}>
                                <TableCell className="font-medium">{agent.name}</TableCell>
                                <TableCell>{agentData?.district || 'Not Assigned'}</TableCell>
                                <TableCell>{agent.completed}</TableCell>
                                <TableCell>{agent.inProgress}</TableCell>
                                <TableCell>{rate}%</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status Distribution</CardTitle>
                    <CardDescription>
                      Distribution of verification statuses for the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={getStatusDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getStatusDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {getStatusDistribution().map((status, index) => (
                        <Card key={status.name}>
                          <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div 
                              className="w-4 h-4 rounded-full mb-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="text-2xl font-bold">{status.value}</div>
                            <div className="text-sm text-muted-foreground">{status.name}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Verification Trends</CardTitle>
                    <CardDescription>
                      Number of verifications initiated per day
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={getDailyVerifications()}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Verifications" fill="#8884d8" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Total Verifications</div>
                            <div className="text-2xl font-bold">{getFilteredLeads().length}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Daily Average</div>
                            <div className="text-2xl font-bold">
                              {getDailyVerifications().length > 0 
                                ? (getFilteredLeads().length / getDailyVerifications().length).toFixed(1) 
                                : '0'}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Completion Rate</div>
                            <div className="text-2xl font-bold">
                              {getFilteredLeads().length > 0 
                                ? Math.round((getFilteredLeads().filter(l => l.status === 'Completed').length / getFilteredLeads().length) * 100) 
                                : 0}%
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Rejection Rate</div>
                            <div className="text-2xl font-bold">
                              {getFilteredLeads().length > 0 
                                ? Math.round((getFilteredLeads().filter(l => l.status === 'Rejected').length / getFilteredLeads().length) * 100) 
                                : 0}%
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => {
                // In a real app, this would generate and download a report
                alert('Report generation would be implemented here');
              }}>
                Export Report
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReports;
