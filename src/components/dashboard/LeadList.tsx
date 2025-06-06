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

  const getLeadTypeName = (lead: Lead) => {
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

  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select leads to delete",
        variant: "destructive",
      });
      return;
    }

    if (onBulkDelete) {
      onBulkDelete(selectedLeads);
      setSelectedLeads([]);
      toast({
        title: "Leads deleted",
        description: `${selectedLeads.length} leads have been deleted.`,
      });
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
      
      // Also update the lead data directly to ensure consistency
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

  const handleExport = (format: 'csv' | 'xls') => {
    if (onExport) {
      onExport(format);
      toast({
        title: "Export started",
        description: `Exporting leads in ${format.toUpperCase()} format...`,
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
      toast({
        title: "Import started",
        description: "Processing imported leads...",
      });
      event.target.value = '';
    }
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
          {/* Show import option even when no leads exist */}
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
                Import Leads CSV/Excel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Action Bar with Better Import/Export UI - ALWAYS VISIBLE FOR ADMINS */}
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
            {/* Import Button */}
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
                Import CSV/Excel
              </Button>
            </div>
            
            {/* Export Dropdown */}
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
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExport('xls')}
                  className="hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as Excel
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
                      onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {lead.additionalDetails?.agencyFileNo || 'N/A'}
                </TableCell>
                <TableCell>
                  {lead.additionalDetails?.bankBranch ? getBankBranchName(lead.additionalDetails.bankBranch) : 'N/A'}
                </TableCell>
                <TableCell>
                  {lead.additionalDetails?.applicationBarcode || lead.id}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    {lead.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {getAgentName(lead.assignedTo || '')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{lead.visitType}</Badge>
                </TableCell>
                <TableCell>
                  {getLeadTypeName(lead)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={getResidenceAddress(lead)}>
                  {getResidenceAddress(lead)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={getOfficeAddress(lead)}>
                  {getOfficeAddress(lead)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={getPermanentAddress(lead)}>
                  {getPermanentAddress(lead)}
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
                  <Badge className={getStatusColor(getVerificationStatus(lead))}>
                    {getVerificationStatus(lead)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getDateOfBirth(lead)}
                </TableCell>
                <TableCell>
                  {lead.additionalDetails?.designation || lead.job}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    {getLoanAmount(lead)}
                  </div>
                </TableCell>
                <TableCell>
                  {getAssetMake(lead)}
                </TableCell>
                <TableCell>
                  {getAssetModel(lead)}
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
                            View
                          </DropdownMenuItem>
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(lead)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
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
