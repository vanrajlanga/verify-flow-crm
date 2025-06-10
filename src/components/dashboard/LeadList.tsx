
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
import { Eye, MapPin, Calendar, Clock, User as UserIcon, Building, Phone, CreditCard, Edit, Trash2, UserPlus, MoreVertical, Download, Upload, FileDown, FileUp } from 'lucide-react';
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

  const getBankBranchName = (branchId: string) => {
    try {
      const storedBranches = localStorage.getItem('bankBranches');
      if (storedBranches) {
        const branches = JSON.parse(storedBranches);
        const branch = branches.find((b: any) => b.id === branchId);
        return branch ? `${branch.name} (${branch.code})` : branchId;
      }
    } catch (error) {
      console.error('Error getting branch name:', error);
    }
    return branchId;
  };

  const getAddressString = (address: any) => {
    if (!address) return 'N/A';
    return `${address.street || ''}, ${address.city || ''}, ${address.district || ''}, ${address.state || ''} - ${address.pincode || ''}`.replace(/^,\s*|,\s*$/g, '');
  };

  const getResidenceAddress = (lead: Lead) => {
    return getAddressString(lead.address);
  };

  const getOfficeAddress = (lead: Lead) => {
    if (!lead.additionalDetails?.addresses) return 'N/A';
    const officeAddress = lead.additionalDetails.addresses.find((addr: any) => addr.type === 'Office');
    return officeAddress ? getAddressString(officeAddress) : 'N/A';
  };

  const getPermanentAddress = (lead: Lead) => {
    return getResidenceAddress(lead);
  };

  const getProductName = (lead: Lead) => {
    return lead.additionalDetails?.leadType || 'N/A';
  };

  const getLoanAmount = (lead: Lead) => {
    return lead.additionalDetails?.loanAmount ? `₹${lead.additionalDetails.loanAmount}` : 'N/A';
  };

  const getAssetMake = (lead: Lead) => {
    return lead.additionalDetails?.vehicleBrandName || 'N/A';
  };

  const getAssetModel = (lead: Lead) => {
    return lead.additionalDetails?.vehicleModelName || 'N/A';
  };

  const getFIDate = (lead: Lead) => {
    return lead.createdAt ? format(new Date(lead.createdAt), 'dd/MM/yyyy') : 'N/A';
  };

  const getFITime = (lead: Lead) => {
    return lead.createdAt ? format(new Date(lead.createdAt), 'HH:mm') : 'N/A';
  };

  const getDateOfBirth = (lead: Lead) => {
    if (lead.additionalDetails?.dateOfBirth) {
      return format(new Date(lead.additionalDetails.dateOfBirth), 'dd/MM/yyyy');
    }
    return 'N/A';
  };

  const getAgentName = (agentId: string) => {
    const agent = allAvailableAgents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unassigned';
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
          console.log('Lead assignment updated in localStorage');
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

  const generateSampleCSV = () => {
    const headers = [
      'Agency File No', 'Branch', 'Application ID', 'Customer Name', 'Assigned Agent',
      'Address Type', 'Product Type', 'Residence Address', 'Office Address', 
      'Permanent Address', 'FI Date', 'FI Time', 'FI Flag', 'Date of Birth',
      'Designation', 'Loan Amount', 'Asset Make', 'Asset Model'
    ];

    const sampleData = [
      'AGF001', 'Main Branch (MB001)', 'APP001', 'Sample Customer', 'Agent Name',
      'Residence', 'HOME LOAN', '123 Main St, Mumbai, Mumbai, Maharashtra - 400001',
      'ABC Corp, Andheri, Mumbai, Maharashtra - 400058', '123 Main St, Mumbai, Mumbai, Maharashtra - 400001',
      '01/01/2024', '09:00', 'Pending', '15/06/1990', 'Software Engineer',
      '₹2500000', 'Maruti', 'Swift'
    ];

    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_lead_data.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Sample downloaded",
      description: "Sample CSV file with proper field mapping has been downloaded.",
    });
  };

  const handleExport = (format: 'csv' | 'xls') => {
    const headers = [
      'Agency File No', 'Branch', 'Application ID', 'Customer Name', 'Assigned Agent',
      'Address Type', 'Product Type', 'Residence Address', 'Office Address', 
      'Permanent Address', 'FI Date', 'FI Time', 'FI Flag', 'Date of Birth',
      'Designation', 'Loan Amount', 'Asset Make', 'Asset Model'
    ];

    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.additionalDetails?.agencyFileNo || '',
        getBankBranchName(lead.additionalDetails?.bankBranch || ''),
        lead.additionalDetails?.applicationBarcode || '',
        lead.name,
        getAgentName(lead.assignedTo || ''),
        lead.visitType,
        getProductName(lead),
        `"${getResidenceAddress(lead)}"`,
        `"${getOfficeAddress(lead)}"`,
        `"${getPermanentAddress(lead)}"`,
        getFIDate(lead),
        getFITime(lead),
        lead.status,
        getDateOfBirth(lead),
        lead.additionalDetails?.designation || lead.job || '',
        getLoanAmount(lead),
        getAssetMake(lead),
        getAssetModel(lead)
      ].join(','))
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
      description: `Lead data exported in ${format.toUpperCase()} format with correct field mapping.`,
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Import failed",
            description: "File must contain header and at least one data row.",
            variant: "destructive",
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        console.log('CSV Headers:', headers);
        
        const importedLeads: Lead[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length >= 4 && values[3].trim()) {
            const visitType = values[5] as Lead['visitType'] || 'Residence';
            
            const newLead: Lead = {
              id: `imported-lead-${Date.now()}-${i}`,
              name: values[3] || `Customer ${i}`,
              age: 30,
              job: values[14] || 'Not specified',
              address: {
                street: values[7] ? values[7].split(',')[0] : '',
                city: values[7] ? values[7].split(',')[1] || 'Unknown' : 'Unknown',
                district: values[7] ? values[7].split(',')[2] || 'Unknown' : 'Unknown',
                state: values[7] ? values[7].split(',')[3] || 'Unknown' : 'Unknown',
                pincode: values[7] ? values[7].split('-')[1] || '000000' : '000000'
              },
              additionalDetails: {
                agencyFileNo: values[0] || '',
                bankBranch: values[1] || '',
                applicationBarcode: values[2] || '',
                phoneNumber: '',
                email: '',
                dateOfBirth: values[13] || '',
                designation: values[14] || '',
                company: '',
                workExperience: '',
                propertyType: '',
                ownershipStatus: '',
                propertyAge: '',
                monthlyIncome: '',
                annualIncome: '',
                otherIncome: '',
                leadType: values[6] || '',
                loanAmount: values[15] ? values[15].replace('₹', '') : '',
                vehicleBrandName: values[16] || '',
                vehicleModelName: values[17] || '',
                addresses: values[8] ? [{
                  type: 'Office',
                  street: values[8].split(',')[0] || '',
                  city: values[8].split(',')[1] || 'Unknown',
                  district: values[8].split(',')[2] || 'Unknown',
                  state: values[8].split(',')[3] || 'Unknown',
                  pincode: values[8].split('-')[1] || '000000'
                }] : []
              },
              status: (values[12] as Lead['status']) || 'Pending',
              bank: 'bank-1',
              visitType: visitType,
              assignedTo: '',
              createdAt: values[10] ? new Date(values[10].split('/').reverse().join('-')) : new Date(),
              documents: [],
              instructions: ''
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
            description: `${importedLeads.length} leads imported with correct field mapping.`,
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
          <p className="text-muted-foreground mb-4">No leads found.</p>
          {isAdmin && (
            <div className="flex justify-center gap-4">
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
                Import Leads
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateSampleCSV}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
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
            <Button
              variant="outline"
              size="sm"
              onClick={generateSampleCSV}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample
            </Button>
            
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
                Import Leads
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Leads
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
              <TableHead className="w-[100px]">Agency File No.</TableHead>
              <TableHead className="w-[120px]">Branch</TableHead>
              <TableHead className="w-[120px]">Application ID</TableHead>
              <TableHead className="w-[150px]">Customer Name</TableHead>
              <TableHead className="w-[120px]">Assigned Agent</TableHead>
              <TableHead className="w-[100px]">Address Type</TableHead>
              <TableHead className="w-[120px]">Product Type</TableHead>
              <TableHead className="w-[200px]">Residence Address</TableHead>
              <TableHead className="w-[200px]">Office Address</TableHead>
              <TableHead className="w-[200px]">Permanent Address</TableHead>
              <TableHead className="w-[100px]">FI Date</TableHead>
              <TableHead className="w-[80px]">FI Time</TableHead>
              <TableHead className="w-[80px]">FI Flag</TableHead>
              <TableHead className="w-[100px]">Date of Birth</TableHead>
              <TableHead className="w-[120px]">Designation</TableHead>
              <TableHead className="w-[100px]">Loan Amount</TableHead>
              <TableHead className="w-[100px]">Asset Make</TableHead>
              <TableHead className="w-[100px]">Asset Model</TableHead>
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
                      onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{lead.additionalDetails?.agencyFileNo || 'N/A'}</TableCell>
                <TableCell>{getBankBranchName(lead.additionalDetails?.bankBranch || '')}</TableCell>
                <TableCell>{lead.additionalDetails?.applicationBarcode || 'N/A'}</TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{getAgentName(lead.assignedTo || '')}</TableCell>
                <TableCell>{lead.visitType}</TableCell>
                <TableCell>{getProductName(lead)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{getResidenceAddress(lead)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{getOfficeAddress(lead)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{getPermanentAddress(lead)}</TableCell>
                <TableCell>{getFIDate(lead)}</TableCell>
                <TableCell>{getFITime(lead)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                </TableCell>
                <TableCell>{getDateOfBirth(lead)}</TableCell>
                <TableCell>{lead.additionalDetails?.designation || lead.job || 'N/A'}</TableCell>
                <TableCell>{getLoanAmount(lead)}</TableCell>
                <TableCell>{getAssetMake(lead)}</TableCell>
                <TableCell>{getAssetModel(lead)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                      <DropdownMenuItem onClick={() => handleViewLead(lead.id)} className="hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit && onEdit(lead)} className="hover:bg-gray-50">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignLead(lead.id)} className="hover:bg-gray-50">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete && onDelete(lead.id)} 
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Assign Agent Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent</DialogTitle>
            <DialogDescription>
              Select an agent to assign this lead to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {allAvailableAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} - {agent.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssignment}>
              Assign Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadList;
