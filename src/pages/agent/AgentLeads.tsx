import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Lead, getLeadsByAgentId, compareDates } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { CalendarDays, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';

const AgentLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    
    // Get leads from localStorage
    const storedLeads = localStorage.getItem('mockLeads');
    if (storedLeads) {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        
        // Filter leads assigned to this agent
        const agentLeads = parsedLeads.filter((lead: Lead) => lead.assignedTo === parsedUser.id);
        
        // Sort leads by creation date
        agentLeads.sort((a: Lead, b: Lead) => {
          return compareDates(b.createdAt, a.createdAt);
        });
        
        setLeads(agentLeads);
        setFilteredLeads(agentLeads);
      } catch (error) {
        console.error("Error loading leads:", error);
        setLeads([]);
        setFilteredLeads([]);
      }
    } else {
      // Fallback to using the utility function
      const agentLeads = getLeadsByAgentId(parsedUser.id);
      setLeads(agentLeads);
      setFilteredLeads(agentLeads);
    }
  }, [navigate]);

  useEffect(() => {
    // Apply filters whenever search term or status filter changes
    let results = leads;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(lead => 
        lead.name.toLowerCase().includes(term) || 
        lead.address.city.toLowerCase().includes(term) ||
        lead.bank.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(lead => lead.status === statusFilter);
    }
    
    setFilteredLeads(results);
  }, [searchTerm, statusFilter, leads]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleStartVerification = (leadId: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = { ...lead };
        updatedLead.status = 'In Progress';
        
        if (!updatedLead.verification) {
          updatedLead.verification = {
            id: `v-${Date.now()}`,
            agentId: currentUser?.id || '',
            status: 'In Progress',
            startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
          };
        } else {
          updatedLead.verification = {
            ...updatedLead.verification,
            status: 'In Progress',
            startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
          };
        }
        
        return updatedLead;
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    setFilteredLeads(updatedLeads.filter(lead => {
      if (statusFilter !== 'all') {
        return lead.status === statusFilter;
      }
      return true;
    }));
    
    // Update in localStorage
    try {
      const allLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedAllLeads = allLeads.map((lead: Lead) => {
        if (lead.id === leadId) {
          const updatedLead = { ...lead };
          updatedLead.status = 'In Progress';
          
          if (!updatedLead.verification) {
            updatedLead.verification = {
              id: `v-${Date.now()}`,
              agentId: currentUser?.id || '',
              status: 'In Progress',
              startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
            };
          } else {
            updatedLead.verification = {
              ...updatedLead.verification,
              status: 'In Progress',
              startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
            };
          }
          
          return updatedLead;
        }
        return lead;
      });
      
      localStorage.setItem('mockLeads', JSON.stringify(updatedAllLeads));
      
      toast({
        title: "Verification Started",
        description: "You've started the verification process.",
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">My Leads</h1>
                <p className="text-muted-foreground">
                  Manage and track your assigned verification leads
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <CardDescription>Awaiting your action</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leads.filter(lead => lead.status === 'Pending').length}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    Pending
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <CardDescription>Currently being verified</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leads.filter(lead => lead.status === 'In Progress').length}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    In Progress
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CardDescription>Successfully verified</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leads.filter(lead => lead.status === 'Completed').length}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completed
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>My Assigned Leads</CardTitle>
                <CardDescription>
                  View and manage your verification tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, location or bank..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-[180px]">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Visit Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">
                              <div>{lead.name}</div>
                              <div className="text-xs text-muted-foreground">{lead.bank}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>{lead.address.city}, {lead.address.state}</span>
                              </div>
                            </TableCell>
                            <TableCell>{lead.visitType}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(lead.status) as any}>
                                {lead.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/agent/lead/${lead.id}`)}
                                >
                                  View
                                </Button>
                                {lead.status === 'Pending' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleStartVerification(lead.id)}
                                  >
                                    Start
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No leads found.
                          </TableCell>
                        </TableRow>
                      )}
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

export default AgentLeads;
