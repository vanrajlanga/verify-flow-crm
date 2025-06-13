
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, Lead } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadsTable from '@/components/admin/LeadsTable';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, RefreshCw, Download, Upload, FileDown, Trash2 } from 'lucide-react';
import { getLeadsFromDatabase, deleteLeadFromDatabase } from '@/lib/lead-operations';
import { exportLeadsToCSV, parseCSVToLeads, generateSampleCSV, downloadFile } from '@/lib/csv-operations';
import { Link } from 'react-router-dom';

const AdminLeadsSheet = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadLeads();
  }, [navigate]);

  // Auto-refresh every 5 seconds for sheet view
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('AdminLeadsSheet: Auto-refresh from database...');
        loadLeads(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadLeads = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      console.log('AdminLeadsSheet: Loading leads from database...');
      const dbLeads = await getLeadsFromDatabase(true);
      
      console.log(`AdminLeadsSheet: Loaded ${dbLeads.length} leads from database`);
      setLeads(dbLeads);
      
    } catch (error) {
      console.error('AdminLeadsSheet: Error loading leads:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load leads from database.",
        variant: "destructive"
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadLeads(false);
      toast({
        title: "Database Refreshed",
        description: `Successfully refreshed ${leads.length} leads from database.`,
      });
    } catch (error) {
      console.error('Error during manual refresh:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh leads from database.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = exportLeadsToCSV(leads);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `leads-sheet-export-${timestamp}.csv`;
      
      downloadFile(csvContent, filename);
      
      toast({
        title: "Export Successful",
        description: `${leads.length} leads exported to ${filename}`,
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

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select leads to delete.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedLeads.length} selected leads? This action cannot be undone.`)) {
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

      await loadLeads();
      setSelectedLeads([]);

      toast({
        title: "Bulk Delete Completed",
        description: `Successfully deleted ${successCount} leads. ${errorCount > 0 ? `${errorCount} leads failed to delete.` : ''}`,
      });
    } catch (error) {
      console.error('Error during bulk delete:', error);
      toast({
        title: "Bulk Delete Failed",
        description: "Failed to delete selected leads.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/admin/leads/${leadId}`);
  };

  const handleEditLead = (leadId: string) => {
    // Navigate to edit lead page (if exists) or view page with edit mode
    navigate(`/admin/leads/${leadId}?edit=true`);
  };

  const handleLeadUpdate = () => {
    // Refresh leads after inline edit
    loadLeads(false);
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
          <div className="max-w-full mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild>
                  <Link to="/admin/leads">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Leads
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">100% Database-Driven Leads Sheet</h1>
                  <p className="text-muted-foreground">
                    Real-time spreadsheet view - {leads.length} leads | Auto-refresh: 5s | Click any cell to edit | Bulk Operations
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleExportCSV}
                  disabled={isExporting || leads.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : `Export All (${leads.length})`}
                </Button>
                
                <Button 
                  onClick={handleDownloadSample}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Sample CSV
                </Button>
                
                <Button 
                  onClick={handleManualRefresh} 
                  variant="outline" 
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Force Refresh
                </Button>
                
                <Button asChild>
                  <Link to="/admin/add-lead">
                    Add New Lead
                  </Link>
                </Button>
              </div>
            </div>

            {/* Bulk Operations Bar */}
            {selectedLeads.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-orange-800">
                    {selectedLeads.length} leads selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : `Delete Selected (${selectedLeads.length})`}
                    </Button>
                    <Button
                      onClick={() => setSelectedLeads([])}
                      variant="outline"
                      size="sm"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-lg font-semibold mb-2">Loading leads sheet from database...</div>
                <div className="text-muted-foreground">Fetching all lead data with complete field mapping and inline editing.</div>
              </div>
            ) : (
              <LeadsTable 
                leads={leads}
                onViewLead={handleViewLead}
                onEditLead={handleEditLead}
                onLeadUpdate={handleLeadUpdate}
                showActions={true}
                enableInlineEdit={true}
                enableBulkSelect={true}
                selectedLeads={selectedLeads}
                onSelectLeads={setSelectedLeads}
                title="100% Database-Driven Leads Sheet with Bulk Operations"
                description={`Real-time database view with spreadsheet-like editing and bulk operations | Last update: ${new Date().toLocaleTimeString()}`}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeadsSheet;
