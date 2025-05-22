import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Lead, getLeadStats, getAgentPerformance } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { BarChart, CalendarDays, CheckCircle2, CircleDollarSign, User2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leadStats, setLeadStats] = useState({ total: 0, pending: 0, completed: 0, inProgress: 0 });
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
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
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    
    // Fetch lead stats
    const stats = getLeadStats();
    setLeadStats(stats);
    
    // Fetch agent performance
    const performance = getAgentPerformance();
    setAgentPerformance(performance);
    
    // Get leads from localStorage
    const storedLeads = localStorage.getItem('mockLeads');
    if (storedLeads) {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        
        // Sort leads by creation date
        parsedLeads.sort((a: Lead, b: Lead) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <CardDescription>All submitted verification requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadStats.total}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User2 className="mr-2 h-4 w-4" />
                    Total Leads
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <CardDescription>Awaiting agent assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadStats.pending}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Pending
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verifications In Progress</CardTitle>
                  <CardDescription>Currently being processed by agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadStats.inProgress}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BarChart className="mr-2 h-4 w-4" />
                    In Progress
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Verifications</CardTitle>
                  <CardDescription>Successfully verified submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadStats.completed}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completed
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>
                  Newly submitted verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.slice(0, 5).map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.bank}</TableCell>
                          <TableCell>{format(new Date(lead.createdAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{lead.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>
                  Verification completion rates by agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Verifications</TableHead>
                        <TableHead>Completion Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agentPerformance.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.name}</TableCell>
                          <TableCell>{agent.totalVerifications}</TableCell>
                          <TableCell>{agent.completionRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
