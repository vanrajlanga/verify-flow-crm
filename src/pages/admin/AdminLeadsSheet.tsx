
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, Lead } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadsTable from '@/components/admin/LeadsTable';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getLeadsFromDatabase } from '@/lib/lead-operations';
import { Link } from 'react-router-dom';

const AdminLeadsSheet = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
                  <h1 className="text-2xl font-bold tracking-tight">Database Leads Sheet View</h1>
                  <p className="text-muted-foreground">
                    100% Real-time database sheet - {leads.length} leads | Auto-refresh: 5s
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
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

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-lg font-semibold mb-2">Loading leads sheet from database...</div>
                <div className="text-muted-foreground">Fetching all lead data with complete field mapping.</div>
              </div>
            ) : (
              <LeadsTable 
                leads={leads}
                onViewLead={handleViewLead}
                onEditLead={handleEditLead}
                showActions={true}
                title="100% Database-Driven Leads Sheet"
                description={`Real-time database view with comprehensive field mapping | Last update: ${new Date().toLocaleTimeString()}`}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeadsSheet;
