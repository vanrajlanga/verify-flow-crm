
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '@/utils/mockData';
import { Eye, Edit, Download, Upload, FileDown, Search } from 'lucide-react';
import { exportLeadsToCSV, generateSampleCSV, downloadFile } from '@/lib/csv-operations';
import { toast } from '@/components/ui/use-toast';

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (leadId: string) => void;
  onEditLead?: (leadId: string) => void;
  onImportCSV?: (file: File) => void;
  showActions?: boolean;
  title?: string;
  description?: string;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onViewLead,
  onEditLead,
  onImportCSV,
  showActions = true,
  title = "100% Database-Driven Leads Sheet",
  description = "Complete database view with all lead fields and CSV operations"
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

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.additionalDetails?.phoneNumber && lead.additionalDetails.phoneNumber.includes(searchTerm)) ||
    (lead.additionalDetails?.email && lead.additionalDetails.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description} - {filteredLeads.length} of {leads.length} leads</CardDescription>
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
                <TableHead>Lead ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Visit Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created Date</TableHead>
                {showActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 17 : 16} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm ? 'No leads found matching your search criteria.' : 'No leads available in database.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{lead.id}</TableCell>
                    <TableCell className="font-semibold">{lead.name}</TableCell>
                    <TableCell>{lead.age}</TableCell>
                    <TableCell>{lead.job}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.bank}</TableCell>
                    <TableCell>{lead.visitType}</TableCell>
                    <TableCell>{lead.address.city}</TableCell>
                    <TableCell>{lead.address.state}</TableCell>
                    <TableCell>{lead.additionalDetails?.phoneNumber || '-'}</TableCell>
                    <TableCell>{lead.additionalDetails?.email || '-'}</TableCell>
                    <TableCell>{lead.additionalDetails?.company || '-'}</TableCell>
                    <TableCell>{lead.additionalDetails?.loanType || '-'}</TableCell>
                    <TableCell>{lead.additionalDetails?.loanAmount || '-'}</TableCell>
                    <TableCell>{lead.assignedTo || 'Unassigned'}</TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadsTable;
