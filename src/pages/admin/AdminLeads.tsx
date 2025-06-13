
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Lead } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { toast } from '@/components/ui/use-toast';
import { 
  Search, 
  Eye, 
  RefreshCw,
  Plus,
  MapPin,
  Building,
  Calendar,
  UserPlus,
  Phone
} from 'lucide-react';
import { getLeadsFromDatabase, updateLeadInDatabase } from '@/lib/lead-operations';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const AdminLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    loadAllData();
  }, [navigate]);

  // Auto-refresh every 3 seconds when page is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('AdminLeads: Auto-refresh from database...');
        loadAllData();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      console.log('AdminLeads: Loading all data from database...');
      
      // Load leads from database
      const dbLeads = await getLeadsFromDatabase(true);
      console.log('AdminLeads: Loaded leads from database:', dbLeads.length);
      setLeads(dbLeads);

      // Load agents from database
      const { data: dbAgents, error: agentsError } = await supabase
        .from('users')
        .select('*')
        .in('role', ['agent', 'tvtteam']);

      if (!agentsError && dbAgents) {
        const transformedAgents = dbAgents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          email: agent.email,
          phone: agent.phone || '',
          district: agent.district || '',
          status: agent.status || 'active',
          state: agent.state,
          city: agent.city,
          baseLocation: agent.base_location,
          maxTravelDistance: agent.max_travel_distance,
          extraChargePerKm: agent.extra_charge_per_km,
          profilePicture: agent.profile_picture,
          totalVerifications: agent.total_verifications || 0,
          completionRate: agent.completion_rate || 0,
          password: agent.password
        }));
        setAgents(transformedAgents);
      }

      // Load banks from database
      const { data: dbBanks, error: banksError } = await supabase
        .from('banks')
        .select('*');

      if (!banksError && dbBanks) {
        setBanks(dbBanks);
      }

    } catch (error) {
      console.error('AdminLeads: Error loading data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load data from database.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAllData();
      toast({
        title: "Data Refreshed",
        description: "All data refreshed from database successfully.",
      });
    } catch (error) {
      console.error('AdminLeads: Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data from database.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/admin/leads/${leadId}`);
  };

  const handleAssignAgent = async (leadId: string, agentId: string) => {
    try {
      await updateLeadInDatabase(leadId, { 
        assignedTo: agentId,
        status: 'Pending' as Lead['status']
      });
      
      await loadAllData(); // Refresh from database
      
      const agent = agents.find(a => a.id === agentId);
      toast({
        title: "Agent Assigned",
        description: `Lead assigned to ${agent?.name || 'agent'} successfully.`,
      });
    } catch (error) {
      console.error('Error assigning agent:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign agent to lead.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesBank = bankFilter === 'all' || lead.bank === bankFilter;
    
    return matchesSearch && matchesStatus && matchesBank;
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
                <p className="text-muted-foreground">
                  Database-driven lead management - {leads.length} leads loaded
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleManualRefresh} 
                  variant="outline" 
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh from DB
                </Button>
                <Button asChild>
                  <Link to="/admin/add-lead">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Lead
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin/leads-sheet">
                    View Sheet
                  </Link>
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={bankFilter} onValueChange={setBankFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Banks</SelectItem>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.name}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Leads List */}
            <Card>
              <CardHeader>
                <CardTitle>Leads ({filteredLeads.length})</CardTitle>
                <CardDescription>
                  Real-time data from database - Auto-refreshes every 3 seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading leads from database...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No leads found in database.</p>
                    <Button 
                      onClick={handleManualRefresh} 
                      variant="outline"
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh from Database
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLeads.map((lead) => (
                      <Card key={lead.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h3 className="font-semibold text-lg">{lead.name}</h3>
                                <Badge className={getStatusColor(lead.status)}>
                                  {lead.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  <span>{lead.bank}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{lead.address.city}, {lead.address.state}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <UserPlus className="h-4 w-4" />
                                  <span>{lead.assignedTo || 'Unassigned'}</span>
                                </div>
                              </div>
                              
                              {lead.additionalDetails?.phoneNumber && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4" />
                                  <span>{lead.additionalDetails.phoneNumber}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLead(lead.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>

                              <Select onValueChange={(agentId) => handleAssignAgent(lead.id, agentId)}>
                                <SelectTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Assign Agent
                                  </Button>
                                </SelectTrigger>
                                <SelectContent>
                                  {agents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                      {agent.name} ({agent.role})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeads;
