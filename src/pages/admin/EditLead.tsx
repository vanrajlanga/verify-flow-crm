
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Lead, User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import EditLeadForm from '@/components/admin/EditLeadForm';
import { getLeadByIdFromDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';

const EditLead = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [navigate]);

  useEffect(() => {
    if (leadId && currentUser) {
      loadLead();
    }
  }, [leadId, currentUser]);

  const loadLead = async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      console.log('Loading lead for editing:', leadId);
      const leadData = await getLeadByIdFromDatabase(leadId);
      
      if (!leadData) {
        toast({
          title: "Lead not found",
          description: "The requested lead could not be found.",
          variant: "destructive"
        });
        navigate('/admin/leads');
        return;
      }
      
      setLead(leadData);
      console.log('Lead loaded for editing:', leadData);
    } catch (error) {
      console.error('Error loading lead:', error);
      toast({
        title: "Error loading lead",
        description: "Failed to load lead data. Please try again.",
        variant: "destructive"
      });
      navigate('/admin/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleBack = () => {
    navigate('/admin/leads');
  };

  const handleSave = () => {
    toast({
      title: "Lead updated",
      description: "Lead has been successfully updated.",
    });
    navigate('/admin/leads');
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
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Leads
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Edit Lead
                </h1>
                <p className="text-muted-foreground">
                  {loading ? 'Loading lead data...' : `Edit lead details and assign agents - ${lead?.id || 'Unknown Lead'}`}
                </p>
              </div>
            </div>

            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Loading lead data...</h3>
                    <p className="text-muted-foreground">Please wait while we fetch the lead information.</p>
                  </div>
                </CardContent>
              </Card>
            ) : lead ? (
              <EditLeadForm 
                lead={lead} 
                onSuccess={handleSave}
                onCancel={handleBack}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Lead not found</h3>
                    <p className="text-muted-foreground">The requested lead could not be found.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditLead;
