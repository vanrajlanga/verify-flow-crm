
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, User } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MapPin, Calendar, Clock, User as UserIcon, Building, Phone, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface LeadListProps {
  leads: Lead[];
  currentUser: User;
  isAdmin?: boolean;
  onUpdate?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  availableAgents?: User[];
}

const LeadList = ({ leads, currentUser, isAdmin = false }: LeadListProps) => {
  const navigate = useNavigate();

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
    // For now, using residence address as permanent address
    // This can be enhanced to have a separate permanent address field
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

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No leads found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Agency File No.</TableHead>
              <TableHead className="w-[120px]">Branch</TableHead>
              <TableHead className="w-[120px]">Application ID</TableHead>
              <TableHead className="w-[150px]">Customer Name</TableHead>
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
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-muted/50">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/lead/${lead.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadList;
