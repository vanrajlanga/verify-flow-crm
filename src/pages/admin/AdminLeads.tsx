import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Phone,
  Download,
  Upload,
  FileDown
} from 'lucide-react';
import { getLeadsFromDatabase, updateLeadInDatabase, saveLeadToDatabase } from '@/lib/lead-operations';
import { exportLeadsToCSV, parseCSVToLeads, generateSampleCSV, downloadFile } from '@/lib/csv-operations';
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
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // AGGRESSIVE Auto-refresh every 2 seconds when page is active to catch new database leads
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('AdminLeads: AGGRESSIVE Auto-refresh from database (2s)...');
        loadAllData();
      }
    }, 2000); // Changed from 3000 to 2000 for more aggressive refresh

    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      console.log('AdminLeads: FORCE Loading all data from database (bypassing cache)...');
      
      // FORCE fresh load from database with cache busting
      const timestamp = new Date().getTime();
      const dbLeads = await getLeadsFromDatabase(true); // Force refresh
      
      console.log(`AdminLeads: FRESH database load: ${dbLeads.length} leads found at ${new Date().toISOString()}`);
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
      console.error('AdminLeads: CRITICAL ERROR loading data from database:', error);
      toast({
        title: "Database Loading Error",
        description: "Failed to load data from database. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // CSV Export functionality
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      console.log('Starting CSV export...');
      const csvContent = exportLeadsToCSV(leads);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `leads-export-${timestamp}.csv`;
      
      downloadFile(csvContent, filename);
      
      toast({
        title: "Export Successful",
        description: `${leads.length} leads exported to ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export leads to CSV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Import functionality
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      console.log('Starting CSV import...');
      const fileContent = await file.text();
      const parsedLeads = parseCSVToLeads(fileContent);
      
      console.log(`Parsed ${parsedLeads.length} leads from CSV`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const leadData of parsedLeads) {
        try {
          // Convert partial lead to full lead with required fields
          const fullLead: Lead = {
            id: leadData.id || `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: leadData.name || 'Unknown',
            age: leadData.age || 0,
            job: leadData.job || '',
            address: leadData.address || {
              type: 'Residence',
              street: '',
              city: '',
              district: '',
              state: '',
              pincode: ''
            },
            additionalDetails: leadData.additionalDetails,
            status: leadData.status || 'Pending',
            bank: leadData.bank || '',
            visitType: leadData.visitType || 'Residence',
            assignedTo: leadData.assignedTo || '',
            createdAt: leadData.createdAt || new Date(),
            verificationDate: leadData.verificationDate,
            documents: [],
            instructions: leadData.instructions || ''
          };
          
          await saveLeadToDatabase(fullLead);
          successCount++;
        } catch (error) {
          console.error(`Error saving lead ${leadData.id}:`, error);
          errorCount++;
        }
      }
      
      // Refresh data after import
      await loadAllData();
      
      toast({
        title: "Import Completed",
        description: `Successfully imported ${successCount} leads. ${errorCount > 0 ? `${errorCount} leads failed to import.` : ''}`,
      });
      
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: "Import Failed",
        description: `Failed to import CSV: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    try {
      const sampleContent = generateSampleCSV();
      downloadFile(sampleContent, 'sample-leads-template.csv');
      
      toast({
        title: "Sample Downloaded",
        description: "Sample CSV template downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating sample CSV:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download sample CSV template.",
        variant: "destructive",
      });
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('AdminLeads: MANUAL FORCE refresh from database...');
      await loadAllData();
      toast({
        title: "Database Refreshed",
        description: `Refreshed ${leads.length} leads from database successfully.`,
      });
    } catch (error) {
      console.error('AdminLeads: Error during manual refresh:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data from database. Check connection.",
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
      console.log(`AdminLeads: Assigning agent ${agentId} to lead ${leadId} in database...`);
      
      await updateLeadInDatabase(leadId, { 
        assignedTo: agentId,
        status: 'Pending' as Lead['status']
      });
      
      // FORCE immediate refresh from database after assignment
      await loadAllData();
      
      const agent = agents.find(a => a.id === agentId);
      toast({
        title: "Agent Assigned",
        description: `Lead assigned to ${agent?.name || 'agent'} and saved to database.`,
      });
    } catch (error) {
      console.error('AdminLeads: Error assigning agent in database:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign agent to lead in database.",
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
                <h1 className="text-2xl font-bold tracking-tight">Database-Driven Leads Management</h1>
                <p className="text-muted-foreground">
                  100% Database Source - {leads.length} leads (Auto-refresh: 2s)
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
                  Force DB Refresh
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

            {/* CSV Import/Export Section */}
            <Card>
              <CardHeader>
                <CardTitle>CSV Import/Export Operations</CardTitle>
                <CardDescription>
                  Import leads from CSV or export all leads with comprehensive field mapping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={handleExportCSV}
                    disabled={isExporting || leads.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : `Export All Leads (${leads.length})`}
                  </Button>
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isImporting ? 'Importing...' : 'Import CSV'}
                  </Button>
                  
                  <Button 
                    onClick={handleDownloadSample}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    Download Sample CSV
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Export:</strong> Downloads all {leads.length} leads with complete field mapping including addresses, additional details, and verification data.</p>
                  <p><strong>Import:</strong> Upload CSV file with proper column headers. Use sample template for correct format.</p>
                  <p><strong>Sample CSV:</strong> Download template with sample data and proper column structure for import.</p>
                </div>
              </CardContent>
            </Card>

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
                <CardTitle>Database Leads ({filteredLeads.length})</CardTitle>
                <CardDescription>
                  Real-time database sync - Auto-refresh every 2 seconds | Last update: {new Date().toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="text-lg font-semibold mb-2">Loading leads from database...</div>
                    <div className="text-muted-foreground">Please wait while we fetch the latest data.</div>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No leads found in database.</p>
                    <Button 
                      onClick={handleManualRefresh} 
                      variant="outline"
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Force Database Refresh
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
                                <SelectTrigger className="w-[140px]">
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  <SelectValue placeholder="Assign Agent" />
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
