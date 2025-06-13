
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Eye, 
  UserPlus, 
  Calendar,
  MapPin,
  Building,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { User, Lead, Bank } from '@/utils/mockData';
import { getLeadsFromDatabase } from '@/lib/lead-operations';

interface LeadListProps {
  leads: Lead[];
  banks?: Bank[];
  agents?: User[];
  currentUser: User;
  onLeadUpdate?: (updatedLead: Lead) => void;
  onViewLead?: (leadId: string) => void;
  onRefresh?: () => void;
}

const LeadList: React.FC<LeadListProps> = ({ 
  leads, 
  banks = [], 
  agents = [], 
  currentUser, 
  onLeadUpdate,
  onViewLead,
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh leads every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefresh) {
        console.log('Auto-refreshing leads...');
        onRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      toast({
        title: "Refreshed",
        description: "Lead data has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Error refreshing leads:', error);
      toast({
        title: "Refresh failed",
        description: "Failed to refresh lead data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter leads based on user role
  const visibleLeads = useMemo(() => {
    let filtered = leads;
    
    // Role-based filtering
    if (currentUser.role === 'agent') {
      filtered = leads.filter(lead => lead.assignedTo === currentUser.name);
    } else if (currentUser.role === 'tvtteam') {
      filtered = leads.filter(lead => lead.assignedTo === currentUser.name);
    }
    // Admin sees all leads
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.address.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    // Apply bank filter
    if (bankFilter !== 'all') {
      filtered = filtered.filter(lead => lead.bank === bankFilter);
    }
    
    return filtered;
  }, [leads, currentUser, searchTerm, statusFilter, bankFilter]);

  // Pagination
  const totalPages = Math.ceil(visibleLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = visibleLeads.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignTvt = (leadId: string, tvtId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead && onLeadUpdate) {
      const updatedLead = { ...lead, assignedTo: tvtId };
      onLeadUpdate(updatedLead);
      toast({
        title: "TVT Assigned",
        description: "TVT member has been assigned to the lead successfully.",
      });
    }
  };

  const handleViewLead = (leadId: string) => {
    if (onViewLead) {
      onViewLead(leadId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Leads Management</h2>
          <p className="text-muted-foreground">
            {visibleLeads.length} total leads
          </p>
        </div>
        <Button 
          onClick={handleManualRefresh} 
          variant="outline" 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
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

      {/* Leads Grid */}
      <div className="grid gap-4">
        {paginatedLeads.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No leads found matching your criteria.</p>
                <Button 
                  onClick={handleManualRefresh} 
                  variant="outline" 
                  className="mt-4"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh to check for new leads
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          paginatedLeads.map((lead) => (
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

                    {currentUser.role === 'admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign TVT
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {agents.filter(agent => agent.role === 'tvtteam' || agent.role === 'agent').map((agent) => (
                            <DropdownMenuItem
                              key={agent.id}
                              onClick={() => handleAssignTvt(lead.id, agent.name)}
                            >
                              {agent.name} ({agent.role})
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                          View Details
                        </DropdownMenuItem>
                        {currentUser.role === 'admin' && (
                          <DropdownMenuItem>
                            Edit Lead
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeadList;
