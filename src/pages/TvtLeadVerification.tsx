
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, Building, MapPin, User, Clock } from 'lucide-react';
import { Lead, User as UserType } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadVerificationForm from '@/components/tvt/LeadVerificationForm';
import { getLeadByIdFromDatabase, updateLeadInDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';

const TvtLeadVerification = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
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
    if (parsedUser.role !== 'tvtteam') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    
    if (leadId) {
      loadLeadDetail(leadId);
    }
  }, [navigate, leadId]);

  const loadLeadDetail = async (id: string) => {
    try {
      setLoading(true);
      console.log('TVT: Loading lead detail for verification, ID:', id);
      
      const leadData = await getLeadByIdFromDatabase(id);
      
      if (leadData) {
        // Check if this lead is assigned to the current TVT user
        if (leadData.assignedTo !== currentUser?.name && leadData.assignedTo !== currentUser?.id) {
          toast({
            title: "Access Denied",
            description: "This lead is not assigned to you.",
            variant: "destructive"
          });
          navigate('/tvt/dashboard');
          return;
        }
        
        setLead(leadData);
        console.log('TVT: Lead detail loaded for verification:', leadData.name);
      } else {
        console.log('TVT: No lead found with ID:', id);
        toast({
          title: "Lead not found",
          description: `No lead found with ID: ${id}`,
          variant: "destructive"
        });
        navigate('/tvt/dashboard');
      }
    } catch (error) {
      console.error('TVT: Error loading lead detail:', error);
      toast({
        title: "Error loading lead",
        description: "Failed to load lead details. Please try again.",
        variant: "destructive"
      });
      navigate('/tvt/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleSaveVerification = async (verificationData: any[]) => {
    if (!lead) return;
    
    try {
      // Update lead with verification data
      const updatedLead = {
        ...lead,
        verification: {
          ...lead.verification,
          verificationData,
          verifiedBy: currentUser?.id,
          verifiedAt: new Date(),
          status: 'Completed'
        },
        status: 'Completed' as const
      };
      
      await updateLeadInDatabase(lead.id, updatedLead);
      setLead(updatedLead);
      
      toast({
        title: "Verification Completed",
        description: "Lead verification has been saved successfully.",
      });
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/tvt/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving verification:', error);
      toast({
        title: "Error",
        description: "Failed to save verification data.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (loading) {
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Loading Lead for Verification...</h2>
                <p className="text-muted-foreground">Please wait while we fetch the lead information.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!lead) {
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Lead Not Found</h2>
                <p className="text-muted-foreground mb-4">The requested lead could not be found.</p>
                <Button onClick={() => navigate('/tvt/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/tvt/dashboard')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Verify Lead - {lead.name}</h1>
                  <p className="text-muted-foreground">Lead ID: {lead.id}</p>
                </div>
              </div>
              <Badge className={getStatusColor(lead.status)}>
                {lead.status}
              </Badge>
            </div>

            {/* Lead Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Lead Summary
                </CardTitle>
                <CardDescription>
                  Quick overview of the lead before verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{lead.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{lead.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{lead.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bank</p>
                      <p className="font-medium">{lead.bank || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{lead.address?.city || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Form */}
            <LeadVerificationForm 
              lead={lead} 
              onSave={handleSaveVerification}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TvtLeadVerification;
