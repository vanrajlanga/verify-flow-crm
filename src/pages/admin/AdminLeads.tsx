
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lead } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus, Download, Upload, FileDown, UserPlus, MoreVertical } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { getLeadsFromDatabase, updateLeadInDatabase, deleteLeadFromDatabase } from '@/lib/lead-operations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Simple search criteria interface
interface SearchCriteria {
  status?: string;
  bank?: string;
  assignedTo?: string;
}

const AdminLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
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
    loadLeads();
  }, [navigate]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      // Try to get leads from database first
      const dbLeads = await getLeadsFromDatabase();
      
      if (dbLeads && dbLeads.length > 0) {
        setLeads(dbLeads);
        return;
      }
    } catch (error) {
      console.error('Error loading leads from database:', error);
      toast({
        title: "Error",
        description: "Failed to load leads from database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }

    // Fall back to localStorage
    const storedLeads = localStorage.getItem('mockLeads');
    if (storedLeads) {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        setLeads(parsedLeads);
      } catch (error) {
        console.error("Error parsing stored leads:", error);
        setLeads([]);
      }
    } else {
      setLeads([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleAddLead = () => {
    navigate('/admin/add-lead');
  };

  const handleEditLead = (leadId: string) => {
    navigate(`/admin/add-lead/${leadId}`);
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/lead/${leadId}`);
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLeadFromDatabase(leadId);
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      setLeads(updatedLeads);
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      toast({
        title: "Lead deleted",
        description: "Lead has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead.",
        variant: "destructive",
      });
    }
  };

  const handleAssignLead = (leadId: string, agentId: string) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, assignedTo: agentId, status: 'Assigned' as Lead['status'] }
        : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
    
    toast({
      title: "Lead assigned",
      description: "Lead has been assigned successfully.",
    });
  };

  const openAssignDialog = (leadId: string) => {
    setLeadToAssign(leadId);
    setAssignDialogOpen(true);
  };

  const confirmAssignment = () => {
    if (!selectedAgent) {
      toast({
        title: "No agent selected",
        description: "Please select an agent to assign the lead",
        variant: "destructive",
      });
      return;
    }

    handleAssignLead(leadToAssign, selectedAgent);
    setAssignDialogOpen(false);
    setLeadToAssign('');
    setSelectedAgent('');
  };

  const getAvailableAgents = () => {
    try {
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        return users.filter((user: User) => user.role === 'agent');
      }
    } catch (error) {
      console.error('Error getting agents:', error);
    }
    return [];
  };

  const getAgentName = (agentId: string) => {
    const agents = getAvailableAgents();
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unassigned';
  };

  const getBankName = (bankId: string) => {
    try {
      const storedBanks = localStorage.getItem('mockBanks');
      if (storedBanks) {
        const banks = JSON.parse(storedBanks);
        const bank = banks.find((b: any) => b.id === bankId);
        return bank ? bank.name : bankId;
      }
    } catch (error) {
      console.error('Error getting bank name:', error);
    }
    return bankId;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
      case 'Assigned':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return `${address.street || ''}, ${address.city || ''}, ${address.district || ''}, ${address.state || ''} - ${address.pincode || ''}`.replace(/^,\s*|,\s*$/g, '');
  };

  const exportToCSV = () => {
    const headers = [
      'Lead ID', 'Agency File No', 'Application Barcode', 'Case ID', 'Customer Name', 
      'Age', 'Job/Designation', 'Phone', 'Email', 'Date of Birth', 'Gender', 'Marital Status',
      'Father Name', 'Mother Name', 'Spouse Name', 'Company', 'Work Experience', 
      'Property Type', 'Ownership Status', 'Property Age', 'Monthly Income', 'Annual Income', 
      'Other Income', 'Lead Type', 'Loan Amount', 'Loan Type', 'Vehicle Brand', 'Vehicle Model',
      'Bank', 'Branch', 'Status', 'Visit Type', 'Assigned Agent', 'Created Date',
      'Residence Address', 'Office Address', 'Scheme Description', 'Instructions',
      'Additional Comments', 'Verification Status', 'Verification Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...leads.map(lead => {
        const officeAddress = lead.additionalDetails?.addresses?.find(addr => addr.type === 'Office');
        return [
          lead.id,
          lead.additionalDetails?.agencyFileNo || '',
          lead.additionalDetails?.applicationBarcode || '',
          lead.additionalDetails?.caseId || '',
          lead.name,
          lead.age || '',
          lead.additionalDetails?.designation || lead.job || '',
          lead.additionalDetails?.phoneNumber || '',
          lead.additionalDetails?.email || '',
          lead.additionalDetails?.dateOfBirth || '',
          lead.additionalDetails?.gender || '',
          lead.additionalDetails?.maritalStatus || '',
          lead.additionalDetails?.fatherName || '',
          lead.additionalDetails?.motherName || '',
          lead.additionalDetails?.spouseName || '',
          lead.additionalDetails?.company || '',
          lead.additionalDetails?.workExperience || '',
          lead.additionalDetails?.propertyType || '',
          lead.additionalDetails?.ownershipStatus || '',
          lead.additionalDetails?.propertyAge || '',
          lead.additionalDetails?.monthlyIncome || '',
          lead.additionalDetails?.annualIncome || '',
          lead.additionalDetails?.otherIncome || '',
          lead.additionalDetails?.leadType || '',
          lead.additionalDetails?.loanAmount || '',
          lead.additionalDetails?.loanType || '',
          lead.additionalDetails?.vehicleBrandName || '',
          lead.additionalDetails?.vehicleModelName || '',
          getBankName(lead.bank || ''),
          lead.additionalDetails?.bankBranch || '',
          lead.status,
          lead.visitType,
          getAgentName(lead.assignedTo || ''),
          formatDate(lead.createdAt),
          `"${formatAddress(lead.address)}"`,
          `"${formatAddress(officeAddress)}"`,
          lead.additionalDetails?.schemeDesc || '',
          lead.instructions || '',
          lead.additionalDetails?.additionalComments || '',
          lead.verification?.status || 'Not Started',
          lead.verification?.notes || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Export completed",
      description: "Lead data exported successfully.",
    });
  };

  const downloadSampleCSV = () => {
    const sampleHeaders = [
      'Lead ID', 'Agency File No', 'Application Barcode', 'Case ID', 'Customer Name', 
      'Age', 'Job/Designation', 'Phone', 'Email', 'Date of Birth', 'Gender', 'Marital Status',
      'Father Name', 'Mother Name', 'Spouse Name', 'Company', 'Work Experience', 
      'Property Type', 'Ownership Status', 'Property Age', 'Monthly Income', 'Annual Income', 
      'Other Income', 'Lead Type', 'Loan Amount', 'Loan Type', 'Vehicle Brand', 'Vehicle Model',
      'Bank', 'Branch', 'Status', 'Visit Type', 'Assigned Agent', 'Created Date',
      'Residence Address', 'Office Address', 'Scheme Description', 'Instructions',
      'Additional Comments', 'Verification Status', 'Verification Notes'
    ];

    const sampleData = [
      'LEAD001', 'AGN-123456', 'BC123456', 'CASE001', 'John Doe',
      '30', 'Software Engineer', '9876543210', 'john@example.com', '1993-01-15', 'Male', 'Single',
      'Father Name', 'Mother Name', '', 'Tech Corp', '5 years',
      'Apartment', 'Owned', '5 years', '50000', '600000',
      '10000', 'Auto Loan', '500000', 'Vehicle Loan', 'Toyota', 'Camry',
      'HDFC Bank', 'Main Branch', 'Pending', 'Residence', 'Agent Name', '2024-01-15',
      '123 Main St, City, District, State - 123456', '456 Office St, City, District, State - 123456',
      'Standard Scheme', 'Please verify documents', 'No additional comments', 'Not Started', ''
    ];

    const csvContent = [sampleHeaders.join(','), sampleData.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_lead_format.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Sample downloaded",
      description: "Sample CSV format downloaded successfully.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        const importedLeads: Lead[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 5 && values[4].trim()) {
            const newLead: Lead = {
              id: values[0] || `imported-lead-${Date.now()}-${i}`,
              name: values[4].trim(),
              age: parseInt(values[5]) || 30,
              job: values[6] || 'Not specified',
              address: {
                id: `addr-imported-${i}`,
                type: 'Residence',
                street: values[34] ? values[34].replace(/"/g, '') : '',
                city: 'Imported',
                district: 'Imported',
                state: 'Imported',
                pincode: '000000'
              },
              additionalDetails: {
                agencyFileNo: values[1] || '',
                applicationBarcode: values[2] || '',
                caseId: values[3] || '',
                phoneNumber: values[7] || '',
                email: values[8] || '',
                dateOfBirth: values[9] || '',
                gender: values[10] || 'Male',
                maritalStatus: values[11] || 'Single',
                fatherName: values[12] || '',
                motherName: values[13] || '',
                spouseName: values[14] || '',
                company: values[15] || '',
                workExperience: values[16] || '',
                propertyType: values[17] || '',
                ownershipStatus: values[18] || '',
                propertyAge: values[19] || '',
                monthlyIncome: values[20] || '',
                annualIncome: values[21] || '',
                otherIncome: values[22] || '',
                leadType: values[23] || '',
                loanAmount: values[24] || '',
                loanType: values[25] || '',
                vehicleBrandName: values[26] || '',
                vehicleModelName: values[27] || '',
                bankBranch: values[29] || '',
                schemeDesc: values[36] || '',
                additionalComments: values[38] || '',
                designation: values[6] || '',
                addresses: [],
                phoneNumbers: []
              },
              status: (values[30] as Lead['status']) || 'Pending',
              bank: values[28] || 'bank-1',
              visitType: (values[31] as Lead['visitType']) || 'Residence',
              assignedTo: '',
              createdAt: values[33] ? new Date(values[33]) : new Date(),
              documents: [],
              instructions: values[37] || '',
            };
            importedLeads.push(newLead);
          }
        }
        
        if (importedLeads.length > 0) {
          const updatedLeads = [...leads, ...importedLeads];
          setLeads(updatedLeads);
          localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
          
          toast({
            title: "Import successful",
            description: `${importedLeads.length} leads imported successfully.`,
          });
        } else {
          toast({
            title: "Import failed",
            description: "No valid leads found in the file.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import failed",
          description: "Error reading the file. Please check the format and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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
          <div className="container mx-auto max-w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Lead Management</h1>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                  id="import-leads"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-leads')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Sample CSV
                </Button>
                <Button onClick={handleAddLead} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Lead
                </Button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
                <CardDescription>Find leads using various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select onValueChange={(value) => setSearchCriteria({...searchCriteria, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="bank-filter">Bank</Label>
                    <Select onValueChange={(value) => setSearchCriteria({...searchCriteria, bank: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All banks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Banks</SelectItem>
                        <SelectItem value="SBI">State Bank of India</SelectItem>
                        <SelectItem value="HDFC">HDFC Bank</SelectItem>
                        <SelectItem value="ICICI">ICICI Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="search-name">Customer Name</Label>
                    <Input 
                      id="search-name" 
                      placeholder="Search by name..." 
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive Leads Table */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <p>Loading leads...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead ID</TableHead>
                      <TableHead>Agency File No</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Lead Type</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Agent</TableHead>
                      <TableHead>Visit Type</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={14} className="h-24 text-center">
                          No leads found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.id}</TableCell>
                          <TableCell>{lead.additionalDetails?.agencyFileNo || 'N/A'}</TableCell>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.age || 'N/A'}</TableCell>
                          <TableCell>{lead.additionalDetails?.phoneNumber || 'N/A'}</TableCell>
                          <TableCell>{lead.additionalDetails?.email || 'N/A'}</TableCell>
                          <TableCell>{lead.additionalDetails?.leadType || 'N/A'}</TableCell>
                          <TableCell>{lead.additionalDetails?.loanAmount ? `₹${lead.additionalDetails.loanAmount}` : 'N/A'}</TableCell>
                          <TableCell>{getBankName(lead.bank || '')}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(lead.status)}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{getAgentName(lead.assignedTo || '')}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{lead.visitType}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(lead.createdAt)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditLead(lead.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openAssignDialog(lead.id)}>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Assign Agent
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Assign Agent Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead to Agent</DialogTitle>
            <DialogDescription>
              Select an agent to assign this lead to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Agents</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableAgents().map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.district || 'No district'} ({agent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAssignment} disabled={!selectedAgent}>
                Assign Lead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;
