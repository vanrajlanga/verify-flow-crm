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
import ColumnVisibilityControl from './ColumnVisibilityControl';

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
  visibleColumns: providedVisibleColumns
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Define ALL available columns from database A to Z
  const allAvailableColumns = [
    { key: 'leadId', label: 'Lead ID' },
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'job', label: 'Job/Occupation' },
    { key: 'status', label: 'Status' },
    { key: 'bank', label: 'Bank' },
    { key: 'visitType', label: 'Visit Type' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'instructions', label: 'Instructions' },
    { key: 'hasCoApplicant', label: 'Has Co-Applicant' },
    { key: 'coApplicantName', label: 'Co-Applicant Name' },
    
    // Complete Address Fields
    { key: 'streetAddress', label: 'Street Address' },
    { key: 'city', label: 'City' },
    { key: 'district', label: 'District' },
    { key: 'state', label: 'State' },
    { key: 'pincode', label: 'Pincode' },
    
    // Contact Information
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone Number (Additional)' },
    { key: 'emailAdditional', label: 'Email (Additional)' },
    
    // Professional Details
    { key: 'company', label: 'Company' },
    { key: 'designation', label: 'Designation' },
    { key: 'workExperience', label: 'Work Experience' },
    { key: 'monthlyIncome', label: 'Monthly Income' },
    { key: 'annualIncome', label: 'Annual Income' },
    { key: 'otherIncome', label: 'Other Income' },
    
    // Family Details
    { key: 'fatherName', label: 'Father Name' },
    { key: 'motherName', label: 'Mother Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    
    // Loan Details
    { key: 'loanAmount', label: 'Loan Amount' },
    { key: 'loanType', label: 'Loan Type' },
    { key: 'propertyType', label: 'Property Type' },
    { key: 'propertyAge', label: 'Property Age' },
    { key: 'ownershipStatus', label: 'Ownership Status' },
    
    // Vehicle Details
    { key: 'vehicleBrand', label: 'Vehicle Brand' },
    { key: 'vehicleModel', label: 'Vehicle Model' },
    { key: 'vehicleBrandId', label: 'Vehicle Brand ID' },
    { key: 'vehicleModelId', label: 'Vehicle Model ID' },
    
    // Bank and Product Details
    { key: 'bankProduct', label: 'Bank Product' },
    { key: 'bankBranch', label: 'Bank Branch' },
    
    // Additional Database Fields
    { key: 'leadType', label: 'Lead Type' },
    { key: 'leadTypeId', label: 'Lead Type ID' },
    { key: 'caseId', label: 'Case ID' },
    { key: 'agencyFileNo', label: 'Agency File No' },
    { key: 'applicationBarcode', label: 'Application Barcode' },
    { key: 'schemeDesc', label: 'Scheme Description' },
    { key: 'additionalComments', label: 'Additional Comments' },
    
    // Timestamps
    { key: 'createdDate', label: 'Created Date' },
    { key: 'updatedDate', label: 'Updated Date' },
    { key: 'verificationDate', label: 'Verification Date' }
  ];

  // Initialize visible columns - if provided use them, otherwise show key columns
  const defaultVisibleColumns = providedVisibleColumns || [
    'leadId', 'name', 'age', 'job', 'status', 'bank', 'visitType', 
    'city', 'state', 'phone', 'company', 'loanAmount', 'bankProduct', 
    'assignedTo', 'createdDate'
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleColumns);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleShowAllColumns = () => {
    setVisibleColumns(allAvailableColumns.map(col => col.key));
  };

  const handleHideAllColumns = () => {
    setVisibleColumns(['leadId', 'name']); // Keep essential columns
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

      // Handle different field types with complete mapping
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
        case 'streetAddress':
          updates.address = { ...lead.address, street: value.toString() };
          break;
        case 'city':
          updates.address = { ...lead.address, city: value.toString() };
          break;
        case 'district':
          updates.address = { ...lead.address, district: value.toString() };
          break;
        case 'state':
          updates.address = { ...lead.address, state: value.toString() };
          break;
        case 'pincode':
          updates.address = { ...lead.address, pincode: value.toString() };
          break;
        // Add all additional field mappings
        default:
          // Handle additional details fields
          updates.additionalDetails = {
            ...lead.additionalDetails,
            [field]: value.toString()
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

  // Helper function to check if column should be visible
  const isColumnVisible = (columnName: string) => {
    return visibleColumns.includes(columnName);
  };

  // Helper function to get cell value
  const getCellValue = (lead: Lead, columnKey: string) => {
    switch (columnKey) {
      case 'leadId': return lead.id;
      case 'name': return lead.name;
      case 'age': return lead.age;
      case 'job': return lead.job;
      case 'status': return lead.status;
      case 'bank': return lead.bank;
      case 'visitType': return lead.visitType;
      case 'assignedTo': return lead.assignedTo;
      case 'instructions': return lead.instructions;
      case 'hasCoApplicant': return lead.hasCoApplicant ? 'Yes' : 'No';
      case 'coApplicantName': return lead.coApplicantName;
      case 'streetAddress': return lead.address?.street;
      case 'city': return lead.address?.city;
      case 'district': return lead.address?.district;
      case 'state': return lead.address?.state;
      case 'pincode': return lead.address?.pincode;
      case 'phone': return lead.phone;
      case 'email': return lead.email;
      case 'phoneNumber': return lead.additionalDetails?.phoneNumber;
      case 'emailAdditional': return lead.additionalDetails?.email;
      case 'company': return lead.additionalDetails?.company;
      case 'designation': return lead.additionalDetails?.designation;
      case 'workExperience': return lead.additionalDetails?.workExperience;
      case 'monthlyIncome': return lead.additionalDetails?.monthlyIncome;
      case 'annualIncome': return lead.additionalDetails?.annualIncome;
      case 'otherIncome': return lead.additionalDetails?.otherIncome;
      case 'fatherName': return lead.additionalDetails?.fatherName;
      case 'motherName': return lead.additionalDetails?.motherName;
      case 'gender': return lead.additionalDetails?.gender;
      case 'dateOfBirth': return lead.additionalDetails?.dateOfBirth ? new Date(lead.additionalDetails.dateOfBirth).toLocaleDateString() : '';
      case 'loanAmount': return lead.additionalDetails?.loanAmount;
      case 'loanType': return lead.additionalDetails?.loanType;
      case 'propertyType': return lead.additionalDetails?.propertyType;
      case 'propertyAge': return lead.additionalDetails?.propertyAge;
      case 'ownershipStatus': return lead.additionalDetails?.ownershipStatus;
      case 'vehicleBrand': return lead.additionalDetails?.vehicleBrandName;
      case 'vehicleModel': return lead.additionalDetails?.vehicleModelName;
      case 'vehicleBrandId': return lead.additionalDetails?.vehicleBrandId;
      case 'vehicleModelId': return lead.additionalDetails?.vehicleModelId;
      case 'bankProduct': return lead.additionalDetails?.bankProduct;
      case 'bankBranch': return lead.additionalDetails?.bankBranch;
      case 'leadType': return lead.additionalDetails?.leadType;
      case 'leadTypeId': return lead.additionalDetails?.leadTypeId;
      case 'caseId': return lead.additionalDetails?.caseId;
      case 'agencyFileNo': return lead.additionalDetails?.agencyFileNo;
      case 'applicationBarcode': return lead.additionalDetails?.applicationBarcode;
      case 'schemeDesc': return lead.additionalDetails?.schemeDesc;
      case 'additionalComments': return lead.additionalDetails?.additionalComments;
      case 'createdDate': return new Date(lead.createdAt).toLocaleDateString();
      case 'updatedDate': return new Date(lead.updatedAt).toLocaleDateString();
      case 'verificationDate': return lead.verificationDate ? new Date(lead.verificationDate).toLocaleDateString() : '';
      default: return '';
    }
  };

  // Calculate total columns for empty state
  const totalColumns = (enableBulkSelect ? 1 : 0) + visibleColumns.length + (showActions ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description} - {filteredLeads.length} of {leads.length} leads | Showing {visibleColumns.length} of {allAvailableColumns.length} columns
              {enableInlineEdit && " | Click any cell to edit"}
              {enableBulkSelect && " | Select multiple for bulk operations"}
            </CardDescription>
          </div>
          
          {showActions && (
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
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
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
          
          <ColumnVisibilityControl
            availableColumns={allAvailableColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
            onShowAll={handleShowAllColumns}
            onHideAll={handleHideAllColumns}
          />
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
                {visibleColumns.map(columnKey => {
                  const column = allAvailableColumns.find(col => col.key === columnKey);
                  return column ? <TableHead key={columnKey}>{column.label}</TableHead> : null;
                })}
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
                    {visibleColumns.map(columnKey => {
                      const cellValue = getCellValue(lead, columnKey);
                      
                      return (
                        <TableCell key={columnKey}>
                          {enableInlineEdit ? (
                            columnKey === 'status' ? (
                              <EditableCell
                                value={cellValue}
                                onSave={(value) => handleCellUpdate(lead.id, columnKey, value)}
                                type="select"
                                options={statusOptions}
                              />
                            ) : columnKey === 'visitType' ? (
                              <EditableCell
                                value={cellValue}
                                onSave={(value) => handleCellUpdate(lead.id, columnKey, value)}
                                type="select"
                                options={visitTypeOptions}
                              />
                            ) : columnKey === 'age' ? (
                              <EditableCell
                                value={cellValue}
                                onSave={(value) => handleCellUpdate(lead.id, columnKey, value)}
                                type="number"
                              />
                            ) : (
                              <EditableCell
                                value={cellValue}
                                onSave={(value) => handleCellUpdate(lead.id, columnKey, value)}
                                placeholder={`Enter ${columnKey}`}
                              />
                            )
                          ) : (
                            columnKey === 'status' ? (
                              <Badge className={getStatusColor(cellValue?.toString() || '')}>
                                {cellValue || '-'}
                              </Badge>
                            ) : columnKey === 'name' ? (
                              <span className="font-semibold">{cellValue || '-'}</span>
                            ) : (
                              cellValue || '-'
                            )
                          )}
                        </TableCell>
                      );
                    })}
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
            {" | Displaying " + visibleColumns.length + " of " + allAvailableColumns.length + " available columns"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadsTable;
