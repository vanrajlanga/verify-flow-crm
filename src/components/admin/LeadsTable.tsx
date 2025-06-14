
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '@/utils/mockData';
import { Eye, Edit, Download, FileDown, Search } from 'lucide-react';
import { exportLeadsToCSV, generateSampleCSV, downloadFile } from '@/lib/csv-operations';
import { updateLeadInDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';
import EditableCell from './EditableCell';

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (leadId: string) => void;
  onEditLead?: (leadId: string) => void;
  onImportCSV?: (file: File) => void;
  onLeadUpdate?: () => void;
  showActions?: boolean;
  title?: string;
  description?: string;
  enableInlineEdit?: boolean;
  enableBulkSelect?: boolean;
  selectedLeads?: string[];
  onSelectLeads?: (leadIds: string[]) => void;
  visibleColumns?: string[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onViewLead,
  onEditLead,
  onImportCSV,
  onLeadUpdate,
  showActions = true,
  title = "100% Database-Driven Leads Sheet",
  description = "Complete database view with all lead fields and CSV operations",
  enableInlineEdit = false,
  enableBulkSelect = false,
  selectedLeads = [],
  onSelectLeads,
  visibleColumns
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = exportLeadsToCSV(filteredLeads);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `database-leads-sheet-${timestamp}.csv`;
      
      downloadFile(csvContent, filename);
      
      toast({
        title: "Export Successful",
        description: `${filteredLeads.length} leads exported to ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export leads to CSV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSample = () => {
    try {
      const sampleContent = generateSampleCSV();
      downloadFile(sampleContent, 'leads-import-template.csv');
      
      toast({
        title: "Sample Downloaded",
        description: "CSV import template downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating sample CSV:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download sample CSV template.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (!onSelectLeads) return;
    
    if (selectedLeads.length === filteredLeads.length && filteredLeads.length > 0) {
      onSelectLeads([]);
    } else {
      onSelectLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleSelectLead = (leadId: string) => {
    if (!onSelectLeads) return;
    
    if (selectedLeads.includes(leadId)) {
      onSelectLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      onSelectLeads([...selectedLeads, leadId]);
    }
  };

  const handleCellUpdate = async (leadId: string, field: string, value: string | number) => {
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      let updates: Partial<Lead> = {};

      // Handle different field types
      switch (field) {
        case 'name':
          updates.name = value.toString();
          break;
        case 'age':
          updates.age = typeof value === 'number' ? value : parseInt(value.toString()) || 0;
          break;
        case 'job':
          updates.job = value.toString();
          break;
        case 'bank':
          updates.bank = value.toString();
          break;
        case 'status':
          updates.status = value.toString() as Lead['status'];
          break;
        case 'visitType':
          updates.visitType = value.toString() as Lead['visitType'];
          break;
        case 'city':
          updates.address = { ...lead.address, city: value.toString() };
          break;
        case 'state':
          updates.address = { ...lead.address, state: value.toString() };
          break;
        case 'phoneNumber':
          updates.additionalDetails = {
            ...lead.additionalDetails,
            phoneNumber: value.toString()
          };
          break;
        case 'email':
          updates.additionalDetails = {
            ...lead.additionalDetails,
            email: value.toString()
          };
          break;
        case 'company':
          updates.additionalDetails = {
            ...lead.additionalDetails,
            company: value.toString()
          };
          break;
        case 'loanType':
          updates.additionalDetails = {
            ...lead.additionalDetails,
            loanType: value.toString()
          };
          break;
        case 'loanAmount':
          updates.additionalDetails = {
            ...lead.additionalDetails,
            loanAmount: value.toString()
          };
          break;
        case 'bankProduct':
          updates.additionalDetails = {
            ...lead.additionalDetails,
            bankProduct: value.toString()
          };
          break;
        case 'initiatedUnderBranch':
          updates.additionalDetails = {
            ...lead.additionalDetails,
            initiatedUnderBranch: value.toString()
          };
          break;
      }

      await updateLeadInDatabase(leadId, updates);
      
      if (onLeadUpdate) {
        onLeadUpdate();
      }

      toast({
        title: "Field Updated",
        description: `${field} updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Update Failed",
        description: `Failed to update ${field}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.additionalDetails?.phoneNumber && lead.additionalDetails.phoneNumber.includes(searchTerm)) ||
    (lead.additionalDetails?.email && lead.additionalDetails.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const visitTypeOptions = [
    { value: 'Residence', label: 'Residence' },
    { value: 'Office', label: 'Office' },
    { value: 'Both', label: 'Both' }
  ];

  // Define all available columns
  const allColumns = [
    'leadId', 'name', 'age', 'job', 'status', 'bank', 'visitType', 'city', 'state', 
    'phone', 'email', 'company', 'loanType', 'loanAmount', 'bankProduct', 
    'initiatedBranch', 'coApplicant', 'assignedTo', 'createdDate'
  ];

  // Use provided visible columns or show all columns
  const columnsToShow = visibleColumns || allColumns;

  // Helper function to check if column should be visible
  const isColumnVisible = (columnName: string) => {
    return columnsToShow.includes(columnName);
  };

  // Calculate total columns for empty state
  const totalColumns = (enableBulkSelect ? 1 : 0) + columnsToShow.length + (showActions ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description} - {filteredLeads.length} of {leads.length} leads
              {enableInlineEdit && " | Click any cell to edit"}
              {enableBulkSelect && " | Select multiple for bulk operations"}
            </CardDescription>
          </div>
          
          {showActions && !visibleColumns && (
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleExportCSV}
                disabled={isExporting || leads.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : `Export CSV (${filteredLeads.length})`}
              </Button>
              
              <Button 
                onClick={handleDownloadSample}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Sample CSV
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search leads by name, ID, bank, city, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {enableBulkSelect && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {isColumnVisible('leadId') && <TableHead>Lead ID</TableHead>}
                {isColumnVisible('name') && <TableHead>Name</TableHead>}
                {isColumnVisible('age') && <TableHead>Age</TableHead>}
                {isColumnVisible('job') && <TableHead>Job</TableHead>}
                {isColumnVisible('status') && <TableHead>Status</TableHead>}
                {isColumnVisible('bank') && <TableHead>Bank</TableHead>}
                {isColumnVisible('visitType') && <TableHead>Visit Type</TableHead>}
                {isColumnVisible('city') && <TableHead>City</TableHead>}
                {isColumnVisible('state') && <TableHead>State</TableHead>}
                {isColumnVisible('phone') && <TableHead>Phone</TableHead>}
                {isColumnVisible('email') && <TableHead>Email</TableHead>}
                {isColumnVisible('company') && <TableHead>Company</TableHead>}
                {isColumnVisible('loanType') && <TableHead>Loan Type</TableHead>}
                {isColumnVisible('loanAmount') && <TableHead>Loan Amount</TableHead>}
                {isColumnVisible('bankProduct') && <TableHead>Bank Product</TableHead>}
                {isColumnVisible('initiatedBranch') && <TableHead>Initiated Branch</TableHead>}
                {isColumnVisible('coApplicant') && <TableHead>Co-Applicant</TableHead>}
                {isColumnVisible('assignedTo') && <TableHead>Assigned To</TableHead>}
                {isColumnVisible('createdDate') && <TableHead>Created Date</TableHead>}
                {showActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm ? 'No leads found matching your search criteria.' : 'No leads available in database.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50">
                    {enableBulkSelect && (
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => handleSelectLead(lead.id)}
                        />
                      </TableCell>
                    )}
                    {isColumnVisible('leadId') && (
                      <TableCell className="font-medium">{lead.id}</TableCell>
                    )}
                    {isColumnVisible('name') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.name}
                            onSave={(value) => handleCellUpdate(lead.id, 'name', value)}
                            placeholder="Enter name"
                          />
                        ) : (
                          <span className="font-semibold">{lead.name}</span>
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('age') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.age}
                            onSave={(value) => handleCellUpdate(lead.id, 'age', value)}
                            type="number"
                          />
                        ) : (
                          lead.age
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('job') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.job}
                            onSave={(value) => handleCellUpdate(lead.id, 'job', value)}
                            placeholder="Enter job"
                          />
                        ) : (
                          lead.job
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('status') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.status}
                            onSave={(value) => handleCellUpdate(lead.id, 'status', value)}
                            type="select"
                            options={statusOptions}
                          />
                        ) : (
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('bank') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.bank}
                            onSave={(value) => handleCellUpdate(lead.id, 'bank', value)}
                            placeholder="Enter bank"
                          />
                        ) : (
                          lead.bank
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('visitType') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.visitType}
                            onSave={(value) => handleCellUpdate(lead.id, 'visitType', value)}
                            type="select"
                            options={visitTypeOptions}
                          />
                        ) : (
                          lead.visitType
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('city') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.address.city}
                            onSave={(value) => handleCellUpdate(lead.id, 'city', value)}
                            placeholder="Enter city"
                          />
                        ) : (
                          lead.address.city
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('state') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.address.state}
                            onSave={(value) => handleCellUpdate(lead.id, 'state', value)}
                            placeholder="Enter state"
                          />
                        ) : (
                          lead.address.state
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('phone') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.additionalDetails?.phoneNumber || ''}
                            onSave={(value) => handleCellUpdate(lead.id, 'phoneNumber', value)}
                            placeholder="Enter phone"
                          />
                        ) : (
                          lead.additionalDetails?.phoneNumber || '-'
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('email') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.additionalDetails?.email || ''}
                            onSave={(value) => handleCellUpdate(lead.id, 'email', value)}
                            placeholder="Enter email"
                          />
                        ) : (
                          lead.additionalDetails?.email || '-'
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('company') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.additionalDetails?.company || ''}
                            onSave={(value) => handleCellUpdate(lead.id, 'company', value)}
                            placeholder="Enter company"
                          />
                        ) : (
                          lead.additionalDetails?.company || '-'
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('loanType') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.additionalDetails?.loanType || ''}
                            onSave={(value) => handleCellUpdate(lead.id, 'loanType', value)}
                            placeholder="Enter loan type"
                          />
                        ) : (
                          lead.additionalDetails?.loanType || '-'
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('loanAmount') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.additionalDetails?.loanAmount || ''}
                            onSave={(value) => handleCellUpdate(lead.id, 'loanAmount', value)}
                            placeholder="Enter amount"
                          />
                        ) : (
                          lead.additionalDetails?.loanAmount || '-'
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('bankProduct') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.additionalDetails?.bankProduct || ''}
                            onSave={(value) => handleCellUpdate(lead.id, 'bankProduct', value)}
                            placeholder="Enter bank product"
                          />
                        ) : (
                          lead.additionalDetails?.bankProduct || '-'
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('initiatedBranch') && (
                      <TableCell>
                        {enableInlineEdit ? (
                          <EditableCell
                            value={lead.additionalDetails?.initiatedUnderBranch || ''}
                            onSave={(value) => handleCellUpdate(lead.id, 'initiatedUnderBranch', value)}
                            placeholder="Enter branch"
                          />
                        ) : (
                          lead.additionalDetails?.initiatedUnderBranch || '-'
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('coApplicant') && (
                      <TableCell>
                        {lead.additionalDetails?.coApplicant ? (
                          <span className="text-sm">
                            {lead.additionalDetails.coApplicant.name}
                            {lead.additionalDetails.coApplicant.relation && ` (${lead.additionalDetails.coApplicant.relation})`}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('assignedTo') && (
                      <TableCell>{lead.assignedTo || 'Unassigned'}</TableCell>
                    )}
                    {isColumnVisible('createdDate') && (
                      <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                    )}
                    {showActions && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewLead(lead.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {onEditLead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditLead(lead.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredLeads.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredLeads.length} of {leads.length} total leads from database
            {enableInlineEdit && " | Click any cell to edit data inline"}
            {enableBulkSelect && selectedLeads.length > 0 && ` | ${selectedLeads.length} selected`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadsTable;
