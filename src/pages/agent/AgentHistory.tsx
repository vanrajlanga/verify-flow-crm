
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Lead } from '@/utils/mockData';
import { getLeadsByAgentId } from '@/lib/supabase-queries';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Calendar, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

const AgentHistory = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLeads, setCompletedLeads] = useState<Lead[]>([]);
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
    
    // Fetch completed leads for the agent
    const fetchCompletedLeads = async () => {
      try {
        const agentLeads = await getLeadsByAgentId(parsedUser.id);
        const completed = agentLeads.filter(lead => 
          lead.status === 'Completed' || lead.status === 'Rejected'
        );
        setCompletedLeads(completed);
      } catch (error) {
        console.error('Error fetching agent leads:', error);
        setCompletedLeads([]);
      }
    };
    
    fetchCompletedLeads();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReviewStatus = (lead: Lead) => {
    if (!lead.verification?.reviewedBy) return 'Pending Review';
    return lead.verification?.status === 'Rejected' ? 'Rejected' : 'Approved';
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Verification History</h1>
                <p className="text-muted-foreground">
                  Records of all your completed verifications
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Completed Verifications</CardTitle>
                <CardDescription>
                  History of all verifications you have completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Date Completed</TableHead>
                        <TableHead>Time Taken</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No completed verifications yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        completedLeads.map((lead) => {
                          const verification = lead.verification;
                          let timeTaken = '—';
                          
                          if (verification?.startTime && verification?.completionTime) {
                            const startTime = new Date(verification.startTime).getTime();
                            const endTime = new Date(verification.completionTime).getTime();
                            const diffMs = endTime - startTime;
                            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            
                            timeTaken = `${diffHrs > 0 ? `${diffHrs}h ` : ''}${diffMins}m`;
                          }
                          
                          return (
                            <TableRow key={lead.id}>
                              <TableCell className="font-medium">{lead.name}</TableCell>
                              <TableCell>
                                {verification?.completionTime 
                                  ? format(verification.completionTime, 'MMM d, yyyy h:mm a')
                                  : '—'}
                              </TableCell>
                              <TableCell>{timeTaken}</TableCell>
                              <TableCell>{getStatusBadge(lead.status)}</TableCell>
                              <TableCell>
                                {verification?.reviewedBy ? (
                                  verification.status === 'Rejected' ? (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                      Rejected
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                      Approved
                                    </Badge>
                                  )
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    Pending Review
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/agent/leads/${lead.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Verification Statistics</CardTitle>
                <CardDescription>
                  Performance metrics for your verification tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="bg-blue-100 text-blue-500 p-2 rounded-full">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{completedLeads.length}</h3>
                    <p className="text-sm text-muted-foreground">Completed Verifications</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="bg-green-100 text-green-500 p-2 rounded-full">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">
                      {completedLeads.filter(l => l.verification?.reviewedBy && l.verification.status === 'Completed').length}
                    </h3>
                    <p className="text-sm text-muted-foreground">Approved Verifications</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="bg-yellow-100 text-yellow-500 p-2 rounded-full">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">
                      {currentUser && currentUser.completionRate ? `${currentUser.completionRate}%` : '0%'}
                    </h3>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentHistory;
