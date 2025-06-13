
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Lead, mockBanks } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { toast } from '@/components/ui/use-toast';
import { Save, Edit, Download, Upload, FileDown, FileUp, RefreshCw } from 'lucide-react';
import { getLeadsFromDatabase, updateLeadInDatabase } from '@/lib/lead-operations';

const AdminLeadsSheet = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [editingCell, setEditingCell] = useState<{leadId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    loadData();
  }, [navigate]);

  // Enhanced auto-refresh for sheet page
  useEffect(() => {
    const handleFocus = () => {
      console.log('Sheet page focused, refreshing data...');
      loadData();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Sheet page became visible, refreshing data...');
        loadData();
      }
    };

    // Listen for focus and visibility change events
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up aggressive refresh every 5 seconds for sheet view
    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('Sheet auto-refresh: Loading data...');
        loadData();
      }
    }, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading data for leads sheet...');
      
      // Always prioritize database data
      const dbLeads = await getLeadsFromDatabase();
      console.log('Database leads loaded for sheet:', dbLeads.length);
      
      if (dbLeads && dbLeads.length >= 0) {
        setLeads(dbLeads);
        console.log('Sheet updated with database leads:', dbLeads.length);
      }

      // Load agents
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        setAgents(users.filter((user: User) => user.role === 'agent'));
      }
    } catch (error) {
      console.error('Error loading data for sheet:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load latest data for the sheet.",
        variant: "destructive"
      });
    }
  };

  // Manual refresh with loading state
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
      toast({
        title: "Sheet Refreshed",
        description: "Lead sheet data has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Error refreshing sheet:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh sheet data. Please try again.",
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
      const updatedLeads = leads.map(lead => {
        if (lead.id === editingCell.leadId) {
          const updatedLead = { ...lead };
          
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
          
          return updatedLead;
        }
        return lead;
      });

      setLeads(updatedLeads);
      
      // Update in database
      const leadToUpdate = updatedLeads.find(l => l.id === editingCell.leadId);
      if (leadToUpdate) {
        await updateLeadInDatabase(editingCell.leadId, leadToUpdate);
      }
      
      // Also update localStorage as fallback
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Cell updated",
        description: "Lead data has been updated successfully.",
      });

      setEditingCell(null);
      setEditValue('');
      
      // Refresh data to ensure consistency
      loadData();
    } catch (error) {
      console.error('Error updating cell:', error);
      toast({
        title: "Update failed",
        description: "Failed to update the cell. Please try again.",
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
                  Spreadsheet-like interface for bulk lead editing - {leads.length} leads loaded (Real-time updates)
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
                  Refresh Sheet
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/leads')}>
                  Back to Lead List
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Lead Data Sheet</CardTitle>
                <CardDescription>
                  Click on any cell to edit. Press Enter to save or Escape to cancel. Data auto-refreshes every 5 seconds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
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
                              <p className="text-muted-foreground">No leads found in the database.</p>
                              <Button 
                                onClick={handleManualRefresh} 
                                variant="outline"
                                disabled={isRefreshing}
                              >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh to check for leads
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
