
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Download, FileDown, Trash2 } from 'lucide-react';
import { Lead, User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadsTable from '@/components/admin/LeadsTable';
import { getAllLeadsFromDatabase, getLeadsByBankFromDatabase, deleteLeadFromDatabase } from '@/lib/lead-operations';
import { exportLeadsToCSV, generateSampleCSV, downloadFile, parseCSVToLeads } from '@/lib/csv-operations';
import { transformFormDataToLead } from '@/lib/form-data-transformer';
import { saveLeadToDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

const AdminLeadsSheet = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    // Allow both admin and manager roles to access this page
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadLeads(parsedUser);
  }, [navigate]);

  const loadLeads = async (user: User) => {
    try {
      setLoading(true);
      console.log('Loading leads for user:', user);
      
      let leadsData: Lead[];
      
      // If user is a manager, only show leads for their managed bank
      if (user.role === 'manager' && user.managedBankId) {
        console.log('Manager loading leads for bank:', user.managedBankId);
        leadsData = await getLeadsByBankFromDatabase(user.managedBankId);
      } else {
        // Admin can see all leads
        console.log('Admin loading all leads');
        leadsData = await getAllLeadsFromDatabase();
      }
      
      setLeads(leadsData);
      console.log(`Loaded ${leadsData.length} leads`);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: "Error loading leads",
        description: "Failed to load leads from database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/admin/leads/${leadId}`);
  };

  const handleLeadUpdate = () => {
    if (currentUser) {
      loadLeads(currentUser);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const leadsToExport = selectedLeads.length > 0 
        ? leads.filter(lead => selectedLeads.includes(lead.id))
        : leads;
      
      const csvContent = exportLeadsToCSV(leadsToExport);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `database-leads-sheet-${timestamp}.csv`;
      
      downloadFile(csvContent, filename);
      
      toast({
        title: "Export Successful",
        description: `${leadsToExport.length} leads exported to ${filename}`,
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

  const handleImportCSV = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const parsedLeads = parseCSVToLeads(text);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const parsedLead of parsedLeads) {
        try {
          const leadData = transformFormDataToLead(parsedLead);
          await saveLeadToDatabase(leadData);
          successCount++;
        } catch (error) {
          console.error('Error saving individual lead:', error);
          errorCount++;
        }
      }
      
      if (currentUser) {
        await loadLeads(currentUser);
      }
      
      toast({
        title: "Import Completed",
        description: `Successfully imported ${successCount} leads. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import CSV file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select leads to delete.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const leadId of selectedLeads) {
        try {
          await deleteLeadFromDatabase(leadId);
          successCount++;
        } catch (error) {
          console.error(`Error deleting lead ${leadId}:`, error);
          errorCount++;
        }
      }

      // Refresh the leads list
      if (currentUser) {
        await loadLeads(currentUser);
      }

      // Clear selection
      setSelectedLeads([]);

      toast({
        title: "Bulk Delete Completed",
        description: `Successfully deleted ${successCount} leads. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete selected leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      handleImportCSV(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
    // Reset the input
    event.target.value = '';
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar user={currentUser} isOpen={sidebarOpen} />
      
      <div className="flex flex-col flex-1">
        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  100% Database-Driven Leads Sheet
                </h1>
                <p className="text-muted-foreground">
                  Complete database view with bulk operations, CSV import/export, and inline editing capabilities
                </p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {/* Only show Add Lead button for admins */}
                {currentUser.role === 'admin' && (
                  <Button onClick={() => navigate('/admin/add-lead')} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Lead
                  </Button>
                )}
                
                {/* CSV Import */}
                <div className="relative">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isImporting}
                  />
                  <Button 
                    variant="outline"
                    disabled={isImporting}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isImporting ? 'Importing...' : 'Import CSV'}
                  </Button>
                </div>

                {/* CSV Export */}
                <Button 
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : `Export CSV${selectedLeads.length > 0 ? ` (${selectedLeads.length})` : ` (${leads.length})`}`}
                </Button>

                {/* Download Sample */}
                <Button 
                  onClick={handleDownloadSample}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Download Sample CSV
                </Button>

                {/* Bulk Delete */}
                {selectedLeads.length > 0 && currentUser.role === 'admin' && (
                  <Button 
                    onClick={handleBulkDelete}
                    variant="destructive"
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? 'Deleting...' : `Delete Selected (${selectedLeads.length})`}
                  </Button>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Complete Database Leads Sheet</CardTitle>
                <CardDescription>
                  {loading 
                    ? 'Loading comprehensive leads data...' 
                    : `${leads.length} total leads | Bulk operations available | Inline editing enabled${selectedLeads.length > 0 ? ` | ${selectedLeads.length} selected` : ''}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Loading comprehensive leads sheet...</h3>
                      <p className="text-muted-foreground">Please wait while we fetch all lead data from database.</p>
                    </div>
                  </div>
                ) : (
                  <LeadsTable 
                    leads={leads} 
                    onViewLead={handleViewLead}
                    onLeadUpdate={handleLeadUpdate}
                    showActions={currentUser.role === 'admin'}
                    title="100% Database-Driven Leads Sheet"
                    description="Complete database view with all lead fields and CSV operations"
                    enableInlineEdit={true}
                    enableBulkSelect={true}
                    selectedLeads={selectedLeads}
                    onSelectLeads={setSelectedLeads}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeadsSheet;
