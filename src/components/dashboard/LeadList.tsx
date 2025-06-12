
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { Lead, User } from '@/utils/mockData';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  UserPlus,
  Eye,
  MapPin,
  Phone,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Car
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  // Filter and search leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.additionalDetails?.agencyFileNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.additionalDetails?.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + leadsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(paginatedLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select leads to delete",
        variant: "destructive"
      });
      return;
    }

    if (onBulkDelete) {
      onBulkDelete(selectedLeads);
      setSelectedLeads([]);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Pending': 'outline',
      'In Progress': 'secondary',
      'Completed': 'default',
      'Rejected': 'destructive'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '-';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            {selectedLeads.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedLeads.length})
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport && onExport('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Lead Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Agency File No.</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Vehicle Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    {isAdmin && (
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {lead.additionalDetails?.agencyFileNo || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {lead.additionalDetails?.email || '-'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {lead.bank === 'bank-1' ? 'HDFC Bank' : 
                         lead.bank === 'bank-2' ? 'ICICI Bank' : 
                         lead.bank === 'bank-3' ? 'SBI Bank' : lead.bank}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {lead.additionalDetails?.leadType || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {lead.additionalDetails?.phoneNumber || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{lead.age || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {lead.additionalDetails?.designation || lead.job || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Building className="h-3 w-3" />
                        {lead.additionalDetails?.company || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(lead.additionalDetails?.loanAmount || '')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(lead.additionalDetails?.monthlyIncome || '')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm max-w-40">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <div className="truncate">
                          {lead.address?.city && lead.address?.state 
                            ? `${lead.address.city}, ${lead.address.state}` 
                            : '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Car className="h-3 w-3" />
                        <div className="max-w-32 truncate">
                          {lead.additionalDetails?.vehicleBrandName && lead.additionalDetails?.vehicleModelName
                            ? `${lead.additionalDetails.vehicleBrandName} ${lead.additionalDetails.vehicleModelName}`
                            : '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(lead.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {lead.assignedTo 
                          ? availableAgents.find(agent => agent.id === lead.assignedTo)?.name || 'Unknown Agent'
                          : 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {isAdmin && onAssignLead && !lead.assignedTo && (
                          <Select onValueChange={(agentId) => onAssignLead(lead.id, agentId)}>
                            <SelectTrigger className="w-8 h-8 p-0">
                              <UserPlus className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {isAdmin && onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(lead.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + leadsPerPage, sortedLeads.length)} of {sortedLeads.length} leads
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;
