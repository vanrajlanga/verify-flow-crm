
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lead, User, getUserById, getBankById } from '@/utils/mockData';
import { 
  Eye, 
  Search, 
  Edit, 
  Trash, 
  UserCheck, 
  MoreVertical 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface LeadListProps {
  leads: Lead[];
  currentUser: User;
  isAdmin?: boolean;
  onUpdate?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  availableAgents?: User[];
}

const LeadList = ({ 
  leads, 
  currentUser, 
  isAdmin = false,
  onUpdate,
  onDelete,
  availableAgents = []
}: LeadListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newAgentId, setNewAgentId] = useState('');
  
  const navigate = useNavigate();

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.address.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getBankById(lead.bank)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewLead = (leadId: string) => {
    if (isAdmin) {
      navigate(`/admin/leads/${leadId}`);
    } else {
      navigate(`/agent/leads/${leadId}`);
    }
  };
  
  const handleEditLead = (lead: Lead) => {
    if (isAdmin) {
      navigate(`/admin/leads/${lead.id}`);
    }
  };
  
  const handleDeleteLead = (leadId: string) => {
    if (onDelete && isAdmin) {
      onDelete(leadId);
    }
  };
  
  const handleOpenReassignDialog = (lead: Lead) => {
    setSelectedLead(lead);
    const agent = getUserById(lead.assignedTo);
    if (agent) {
      setNewAgentId(agent.id);
    }
    setIsReassignDialogOpen(true);
  };
  
  const handleReassignLead = () => {
    if (!selectedLead || !newAgentId || !onUpdate) {
      return;
    }
    
    const updatedLead = {
      ...selectedLead,
      assignedTo: newAgentId,
      verification: {
        ...selectedLead.verification,
        agentId: newAgentId
      }
    };
    
    onUpdate(updatedLead);
    setIsReassignDialogOpen(false);
    
    toast({
      title: "Lead Reassigned",
      description: "The lead has been successfully reassigned to a new agent.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, district, or bank..."
            type="search"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={statusFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === 'pending' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={statusFilter === 'in progress' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('in progress')}
          >
            In Progress
          </Button>
          <Button 
            variant={statusFilter === 'completed' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Visit Type</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Assigned To</TableHead>}
              <TableHead>Bank</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const assignedAgent = isAdmin ? getUserById(lead.assignedTo) : null;
                const bank = getBankById(lead.bank);

                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.address.district}, {lead.address.state}</TableCell>
                    <TableCell>{lead.visitType}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{assignedAgent?.name || 'Unassigned'}</span>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenReassignDialog(lead)}
                              title="Reassign"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>{bank?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenReassignDialog(lead)}
                              className="text-blue-600"
                            >
                              <UserCheck className="h-4 w-4 mr-2" /> Reassign
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewLead(lead.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Reassign Dialog */}
      <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Lead</DialogTitle>
            <DialogDescription>
              Select a new agent to handle this verification lead.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {selectedLead && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Lead Details</p>
                <p className="text-sm">Name: {selectedLead.name}</p>
                <p className="text-sm">Location: {selectedLead.address.district}, {selectedLead.address.state}</p>
                <p className="text-sm">Current Agent: {getUserById(selectedLead.assignedTo)?.name || 'Unassigned'}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="agent" className="text-sm font-medium">
                New Agent
              </label>
              <Select value={newAgentId} onValueChange={setNewAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.district || 'No district assigned'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReassignLead}>
              Reassign Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadList;
