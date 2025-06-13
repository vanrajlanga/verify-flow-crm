
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Lead } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { toast } from '@/components/ui/use-toast';
import { Save, Edit, RefreshCw } from 'lucide-react';
import { getLeadsFromDatabase, updateLeadInDatabase } from '@/lib/lead-operations';
import { supabase } from '@/integrations/supabase/client';

const AdminLeadsSheet = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [editingCell, setEditingCell] = useState<{leadId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
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

  // Super aggressive refresh for sheet page - every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('AdminLeadsSheet: Ultra-aggressive refresh from database...');
        loadAllData();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      console.log('AdminLeadsSheet: Loading all data from database...');
      
      // Load leads from database
      const dbLeads = await getLeadsFromDatabase(true);
      console.log('AdminLeadsSheet: Loaded leads from database:', dbLeads.length);
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

    } catch (error) {
      console.error('AdminLeadsSheet: Error loading data:', error);
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
        title: "Sheet Refreshed",
        description: "Sheet data refreshed from database successfully.",
      });
    } catch (error) {
      console.error('AdminLeadsSheet: Error refreshing sheet:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh sheet data from database.",
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

  const handleCellEdit = (leadId: string, field: string, currentValue: string) => {
    setEditingCell({ leadId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    try {
      const leadToUpdate = leads.find(l => l.id === editingCell.leadId);
      if (!leadToUpdate) return;

      const updatedLead = { ...leadToUpdate };
      
      // Handle different field types
      switch (editingCell.field) {
        case 'name':
          updatedLead.name = editValue;
          break;
        case 'age':
          updatedLead.age = parseInt(editValue) || 0;
          break;
        case 'job':
          updatedLead.job = editValue;
          break;
        case 'status':
          updatedLead.status = editValue as Lead['status'];
          break;
        case 'visitType':
          updatedLead.visitType = editValue as Lead['visitType'];
          break;
        case 'assignedTo':
          updatedLead.assignedTo = editValue;
          break;
        case 'instructions':
          updatedLead.instructions = editValue;
          break;
        case 'phoneNumber':
          if (!updatedLead.additionalDetails) updatedLead.additionalDetails = {} as any;
          updatedLead.additionalDetails.phoneNumber = editValue;
          break;
        case 'email':
          if (!updatedLead.additionalDetails) updatedLead.additionalDetails = {} as any;
          updatedLead.additionalDetails.email = editValue;
          break;
        case 'company':
          if (!updatedLead.additionalDetails) updatedLead.additionalDetails = {} as any;
          updatedLead.additionalDetails.company = editValue;
          break;
        case 'designation':
          if (!updatedLead.additionalDetails) updatedLead.additionalDetails = {} as any;
          updatedLead.additionalDetails.designation = editValue;
          break;
        case 'loanAmount':
          if (!updatedLead.additionalDetails) updatedLead.additionalDetails = {} as any;
          updatedLead.additionalDetails.loanAmount = editValue;
          break;
        case 'monthlyIncome':
          if (!updatedLead.additionalDetails) updatedLead.additionalDetails = {} as any;
          updatedLead.additionalDetails.monthlyIncome = editValue;
          break;
        case 'annualIncome':
          if (!updatedLead.additionalDetails) updatedLead.additionalDetails = {} as any;
          updatedLead.additionalDetails.annualIncome = editValue;
          break;
        case 'street':
          updatedLead.address.street = editValue;
          break;
        case 'city':
          updatedLead.address.city = editValue;
          break;
        case 'state':
          updatedLead.address.state = editValue;
          break;
        case 'pincode':
          updatedLead.address.pincode = editValue;
          break;
        default:
          break;
      }

      // Update in database
      await updateLeadInDatabase(editingCell.leadId, updatedLead);

      toast({
        title: "Cell Updated",
        description: "Lead data updated in database successfully.",
      });

      setEditingCell(null);
      setEditValue('');
      
      // Force refresh from database
      await loadAllData();
    } catch (error) {
      console.error('AdminLeadsSheet: Error updating cell:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update cell in database.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unassigned';
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

  const renderEditableCell = (lead: Lead, field: string, value: string, type: 'text' | 'select' = 'text', options?: string[]) => {
    const isEditing = editingCell?.leadId === lead.id && editingCell?.field === field;
    
    if (isEditing) {
      if (type === 'select' && options) {
        return (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8 min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleSaveEdit}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              ×
            </Button>
          </div>
        );
      }
      
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 min-w-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleSaveEdit}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
            ×
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1 min-h-[32px]"
        onClick={() => handleCellEdit(lead.id, field, value)}
      >
        <span className="truncate">{value || 'N/A'}</span>
        <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
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
          <div className="max-w-full mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Lead Management Sheet</h1>
                <p className="text-muted-foreground">
                  Real-time database sheet - {leads.length} leads (Auto-refreshes every 2 seconds)
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleManualRefresh} 
                  variant="outline" 
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh from DB
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/leads')}>
                  Back to Leads List
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Database Sheet</CardTitle>
                <CardDescription>
                  Click any cell to edit. All changes save directly to database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="text-center py-8">Loading sheet data from database...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Lead ID</TableHead>
                          <TableHead className="w-[150px]">Customer Name</TableHead>
                          <TableHead className="w-[80px]">Age</TableHead>
                          <TableHead className="w-[120px]">Job/Designation</TableHead>
                          <TableHead className="w-[120px]">Phone</TableHead>
                          <TableHead className="w-[150px]">Email</TableHead>
                          <TableHead className="w-[120px]">Company</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[100px]">Visit Type</TableHead>
                          <TableHead className="w-[130px]">Assigned Agent</TableHead>
                          <TableHead className="w-[150px]">Street Address</TableHead>
                          <TableHead className="w-[100px]">City</TableHead>
                          <TableHead className="w-[100px]">State</TableHead>
                          <TableHead className="w-[100px]">Pincode</TableHead>
                          <TableHead className="w-[120px]">Loan Amount</TableHead>
                          <TableHead className="w-[120px]">Monthly Income</TableHead>
                          <TableHead className="w-[120px]">Annual Income</TableHead>
                          <TableHead className="w-[200px]">Instructions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={18} className="text-center py-8">
                              <div className="flex flex-col items-center gap-4">
                                <p className="text-muted-foreground">No leads found in database.</p>
                                <Button 
                                  onClick={handleManualRefresh} 
                                  variant="outline"
                                  disabled={isRefreshing}
                                >
                                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                  Refresh from Database
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          leads.map((lead) => (
                            <TableRow key={lead.id} className="group">
                              <TableCell className="font-mono text-xs">{lead.id}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'name', lead.name)}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'age', lead.age?.toString() || '')}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'designation', lead.additionalDetails?.designation || lead.job || '')}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'phoneNumber', lead.additionalDetails?.phoneNumber || '')}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'email', lead.additionalDetails?.email || '')}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'company', lead.additionalDetails?.company || '')}</TableCell>
                              <TableCell>
                                {editingCell?.leadId === lead.id && editingCell?.field === 'status' ? (
                                  renderEditableCell(lead, 'status', lead.status, 'select', ['Pending', 'In Progress', 'Completed', 'Rejected'])
                                ) : (
                                  <div onClick={() => handleCellEdit(lead.id, 'status', lead.status)}>
                                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {renderEditableCell(lead, 'visitType', lead.visitType, 'select', ['Residence', 'Office', 'Both'])}
                              </TableCell>
                              <TableCell>
                                {editingCell?.leadId === lead.id && editingCell?.field === 'assignedTo' ? (
                                  renderEditableCell(lead, 'assignedTo', lead.assignedTo || '', 'select', ['', ...agents.map(a => a.id)])
                                ) : (
                                  <div onClick={() => handleCellEdit(lead.id, 'assignedTo', lead.assignedTo || '')}>
                                    <Badge variant="outline">{getAgentName(lead.assignedTo || '')}</Badge>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{renderEditableCell(lead, 'street', lead.address.street)}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'city', lead.address.city)}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'state', lead.address.state)}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'pincode', lead.address.pincode)}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'loanAmount', lead.additionalDetails?.loanAmount || '')}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'monthlyIncome', lead.additionalDetails?.monthlyIncome || '')}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'annualIncome', lead.additionalDetails?.annualIncome || '')}</TableCell>
                              <TableCell>{renderEditableCell(lead, 'instructions', lead.instructions || '')}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeadsSheet;
