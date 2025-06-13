
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, User } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MapPin, Calendar, Clock, User as UserIcon, Building, Phone, CreditCard, Edit, Trash2, UserPlus, MoreVertical, Download, Upload, FileDown, FileUp, Mail, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface LeadListProps {
  leads: Lead[];
  currentUser: User;
  isAdmin?: boolean;
  onUpdate?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onBulkDelete?: (leadIds: string[]) => void;
  onAssignLead?: (leadId: string, agentId: string) => void;
  onExport?: (format: 'csv' | 'xls') => void;
  onImport?: (file: File) => void;
  availableAgents?: User[];
}

const LeadList = ({ 
  leads, 
  currentUser, 
  isAdmin = false,
  onUpdate,
  onEdit,
  onDelete,
  onBulkDelete,
  onAssignLead,
  onExport,
  onImport,
  availableAgents = []
}: LeadListProps) => {
  const navigate = useNavigate();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  // Get bank data for display
  const [bankData, setBankData] = useState<any>({});

  const loadBankData = () => {
    try {
      const storedBanks = localStorage.getItem('banks');
      const storedProducts = localStorage.getItem('bankProducts');
      const storedBranches = localStorage.getItem('bankBranches');
      
      if (storedBanks && storedProducts && storedBranches) {
        const banks = JSON.parse(storedBanks);
        const products = JSON.parse(storedProducts);
        const branches = JSON.parse(storedBranches);
        
        setBankData({ banks, products, branches });
      }
    } catch (error) {
      console.error('Error loading bank data:', error);
    }
  };

  useState(() => {
    loadBankData();
  });

  // Get all agents from localStorage to ensure we have the latest data
  const getAllAgents = () => {
    try {
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        return users.filter((user: User) => user.role === 'agent');
      }
    } catch (error) {
      console.error('Error getting agents:', error);
    }
    return availableAgents;
  };

  const allAvailableAgents = getAllAgents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVerificationStatus = (lead: Lead) => {
    if (!lead.verification) return 'Not Started';
    return lead.verification.status;
  };

  const getBankName = (bankId: string) => {
    const bank = bankData.banks?.find((b: any) => b.id === bankId);
    return bank ? bank.name : bankId;
  };

  const getProductName = (productId: string) => {
    const product = bankData.products?.find((p: any) => p.id === productId);
    return product ? product.name : productId;
  };

  const getBranchName = (branchId: string) => {
    const branch = bankData.branches?.find((b: any) => b.id === branchId);
    return branch ? branch.name : branchId;
  };

  const getAddressString = (address: any) => {
    if (!address) return 'N/A';
    return `${address.street || ''}, ${address.city || ''}, ${address.district || ''}, ${address.state || ''} - ${address.pincode || ''}`.replace(/^,\s*|,\s*$/g, '');
  };

  const getResidenceAddress = (lead: Lead) => {
    const residenceAddr = lead.additionalDetails?.addresses?.find((addr: any) => addr.type === 'Residence');
    return residenceAddr ? getAddressString(residenceAddr) : getAddressString(lead.address);
  };

  const getOfficeAddress = (lead: Lead) => {
    if (!lead.additionalDetails?.addresses) return 'N/A';
    const officeAddress = lead.additionalDetails.addresses.find((addr: any) => addr.type === 'Office');
    return officeAddress ? getAddressString(officeAddress) : 'N/A';
  };

  const getAgentName = (agentId: string) => {
    const agent = allAvailableAgents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unassigned';
  };

  const getFIDate = (lead: Lead) => {
    return lead.createdAt ? format(new Date(lead.createdAt), 'dd/MM/yyyy') : 'N/A';
  };

  const getFITime = (lead: Lead) => {
    return lead.createdAt ? format(new Date(lead.createdAt), 'HH:mm') : 'N/A';
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select leads to delete",
        variant: "destructive",
      });
      return;
    }

    if (onBulkDelete) {
      try {
        await onBulkDelete(selectedLeads);
        setSelectedLeads([]);
        toast({
          title: "Leads deleted",
          description: `${selectedLeads.length} leads have been deleted successfully.`,
        });
      } catch (error) {
        console.error('Error in bulk delete:', error);
        toast({
          title: "Delete failed",
          description: "Some leads could not be deleted. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAssignLead = (leadId: string) => {
    setLeadToAssign(leadId);
    setSelectedAgent('');
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

    console.log('Assigning lead:', leadToAssign, 'to agent:', selectedAgent);
    
    if (onAssignLead) {
      onAssignLead(leadToAssign, selectedAgent);
      
      try {
        const storedLeads = localStorage.getItem('mockLeads');
        if (storedLeads) {
          const allLeads = JSON.parse(storedLeads);
          const updatedLeads = allLeads.map((lead: Lead) => 
            lead.id === leadToAssign 
              ? { 
                  ...lead, 
                  assignedTo: selectedAgent,
                  status: 'Pending' as Lead['status']
                }
              : lead
          );
          localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
        }
      } catch (error) {
        console.error('Error updating lead assignment:', error);
      }
      
      const selectedAgentInfo = allAvailableAgents.find(a => a.id === selectedAgent);
      toast({
        title: "Lead assigned successfully",
        description: `Lead has been assigned to ${selectedAgentInfo?.name || 'the selected agent'}.`,
      });
    }
    
    setAssignDialogOpen(false);
    setLeadToAssign('');
    setSelectedAgent('');
  };

  const handleExport = (format: 'csv' | 'xls') => {
    const headers = [
      'Lead ID', 'Customer Name', 'Phone', 'Email', 'Age', 'Bank Name', 'Bank Product', 
      'Initiated Branch', 'Build Branch', 'Residence Address', 'Office Address', 
      'Monthly Income', 'Annual Income', 'Company', 'Designation', 'Work Experience',
      'Property Type', 'Ownership Status', 'Has Co-Applicant', 'Co-Applicant Name',
      'Co-Applicant Phone', 'Co-Applicant Email', 'Co-Applicant Age', 'FI Date', 'FI Time',
      'Status', 'Verification Status', 'Assigned Agent', 'Instructions', 'Created Date'
    ];

    const csvContent = [
      headers.join(','),
      ...leads.map(lead => {
        const hasCoApplicant = lead.additionalDetails?.coApplicant ? true : false;
        return [
          lead.id,
          lead.name,
          lead.additionalDetails?.phoneNumber || '',
          lead.additionalDetails?.email || '',
          lead.age || '',
          lead.bank || '',
          lead.additionalDetails?.bankProduct || '',
          lead.additionalDetails?.initiatedBranch || '',
          lead.additionalDetails?.buildBranch || '',
          `"${getResidenceAddress(lead)}"`,
          `"${getOfficeAddress(lead)}"`,
          lead.additionalDetails?.monthlyIncome || '',
          lead.additionalDetails?.annualIncome || '',
          lead.additionalDetails?.company || '',
          lead.additionalDetails?.designation || '',
          lead.additionalDetails?.workExperience || '',
          lead.additionalDetails?.propertyType || '',
          lead.additionalDetails?.ownershipStatus || '',
          hasCoApplicant ? 'Yes' : 'No',
          lead.additionalDetails?.coApplicant?.name || '',
          lead.additionalDetails?.coApplicant?.phone || '',
          lead.additionalDetails?.coApplicant?.email || '',
          lead.additionalDetails?.coApplicant?.age || '',
          getFIDate(lead),
          getFITime(lead),
          lead.status,
          getVerificationStatus(lead),
          getAgentName(lead.assignedTo || ''),
          lead.instructions || '',
          lead.createdAt ? new Date(lead.createdAt).toISOString() : ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Export completed",
      description: `Lead data exported in ${format.toUpperCase()} format.`,
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
          if (values.length >= 5 && values[1].trim()) {
            const newLead: Lead = {
              id: values[0] || `imported-lead-${Date.now()}-${i}`,
              name: values[1].trim(),
              age: parseInt(values[4]) || 0,
              job: values[14] || 'Not specified',
              address: {
                street: values[9] ? values[9].replace(/"/g, '') : '',
                city: 'Imported',
                district: 'Imported',
                state: 'Imported',
                pincode: '000000'
              },
              additionalDetails: {
                phoneNumber: values[2] || '',
                email: values[3] || '',
                bankProduct: values[6] || '',
                initiatedBranch: values[7] || '',
                buildBranch: values[8] || '',
                monthlyIncome: values[11] || '',
                annualIncome: values[12] || '',
                company: values[13] || '',
                designation: values[14] || '',
                workExperience: values[15] || '',
                propertyType: values[16] || '',
                ownershipStatus: values[17] || '',
                coApplicant: values[18] === 'Yes' ? {
                  name: values[19] || '',
                  phone: values[20] || '',
                  email: values[21] || '',
                  age: values[22] || '',
                  relation: 'Spouse'
                } : null,
                addresses: []
              },
              status: (values[25] as Lead['status']) || 'Pending',
              bank: values[5] || 'bank-1',
              visitType: 'Residence' as const,
              assignedTo: '',
              createdAt: values[29] ? new Date(values[29]) : new Date(),
              documents: [],
              instructions: values[28] || ''
            };
            importedLeads.push(newLead);
          }
        }
        
        if (importedLeads.length > 0 && onImport) {
          const importData = JSON.stringify(importedLeads);
          const blob = new Blob([importData], { type: 'application/json' });
          const mockFile = new File([blob], 'imported_leads.json', { type: 'application/json' });
          
          onImport(mockFile);
          
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

  const handleViewLead = (leadId: string) => {
    if (isAdmin) {
      navigate(`/admin/leads/${leadId}`);
    } else {
      navigate(`/agent/leads/${leadId}`);
    }
  };

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No leads found.</p>
          {isAdmin && (
            <div className="mt-4">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                id="import-leads-empty"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-leads-empty')?.click()}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Import Lead Data (CSV/Excel)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-medium">
              {selectedLeads.length} of {leads.length} selected
            </span>
            {selectedLeads.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedLeads.length})
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                id="import-leads"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-leads')?.click()}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border shadow-lg">
                <DropdownMenuItem 
                  onClick={() => handleExport('csv')}
                  className="hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExport('xls')}
                  className="hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedLeads.length === leads.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="w-[100px]">Lead ID</TableHead>
              <TableHead className="w-[150px]">Customer Name</TableHead>
              <TableHead className="w-[120px]">Phone</TableHead>
              <TableHead className="w-[150px]">Email</TableHead>
              <TableHead className="w-[80px]">Age</TableHead>
              <TableHead className="w-[120px]">Bank Name</TableHead>
              <TableHead className="w-[120px]">Bank Product</TableHead>
              <TableHead className="w-[120px]">Initiated Branch</TableHead>
              <TableHead className="w-[120px]">Build Branch</TableHead>
              <TableHead className="w-[200px]">Residence Address</TableHead>
              <TableHead className="w-[200px]">Office Address</TableHead>
              <TableHead className="w-[120px]">Monthly Income</TableHead>
              <TableHead className="w-[100px]">Company</TableHead>
              <TableHead className="w-[120px]">Designation</TableHead>
              <TableHead className="w-[100px]">FI Date</TableHead>
              <TableHead className="w-[80px]">FI Time</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px]">Assigned Agent</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-muted/50">
                {isAdmin && (
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {lead.id}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    {lead.name}
                    {lead.additionalDetails?.coApplicant && (
                      <Users className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {lead.additionalDetails?.phoneNumber || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {lead.additionalDetails?.email || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>{lead.age || 'N/A'}</TableCell>
                <TableCell>
                  {getBankName(lead.bank || '')}
                </TableCell>
                <TableCell>
                  {getProductName(lead.additionalDetails?.bankProduct || '')}
                </TableCell>
                <TableCell>
                  {getBranchName(lead.additionalDetails?.initiatedBranch || '')}
                </TableCell>
                <TableCell>
                  {getBranchName(lead.additionalDetails?.buildBranch || '')}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={getResidenceAddress(lead)}>
                  {getResidenceAddress(lead)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={getOfficeAddress(lead)}>
                  {getOfficeAddress(lead)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    {lead.additionalDetails?.monthlyIncome ? `₹${Number(lead.additionalDetails.monthlyIncome).toLocaleString()}` : 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    {lead.additionalDetails?.company || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  {lead.additionalDetails?.designation || 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {getFIDate(lead)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {getFITime(lead)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {getAgentName(lead.assignedTo || '')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLead(lead.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border shadow-lg">
                          <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(lead)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Lead
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAssignLead(lead.id)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Agent
                          </DropdownMenuItem>
                          {onDelete && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(lead.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
              <label className="text-sm font-medium">Available Agents ({allAvailableAgents.length})</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {allAvailableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.district || 'No district'} ({agent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {allAvailableAgents.length === 0 && (
                <p className="text-sm text-red-600">No agents available. Please create agents first.</p>
              )}
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

export default LeadList;
