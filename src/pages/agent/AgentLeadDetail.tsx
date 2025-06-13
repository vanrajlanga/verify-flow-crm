
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Building, Phone, Mail, Calendar, User, FileText, Briefcase, Car, DollarSign, Users, ClipboardList, Download } from 'lucide-react';
import { Lead, User as UserType, Document } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import VerificationProcess from '@/components/dashboard/VerificationProcess';
import { getLeadByIdFromDatabase, updateLeadInDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';

const AgentLeadDetail = () => {
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
    if (parsedUser.role !== 'agent') {
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
      console.log('Agent: Loading lead detail for ID:', id);
      
      const leadData = await getLeadByIdFromDatabase(id);
      
      if (leadData) {
        setLead(leadData);
        console.log('Agent: Lead detail loaded successfully:', leadData.name);
      } else {
        console.log('Agent: No lead found with ID:', id);
        toast({
          title: "Lead not found",
          description: `No lead found with ID: ${id}`,
          variant: "destructive"
        });
        navigate('/agent/leads');
      }
    } catch (error) {
      console.error('Agent: Error loading lead detail:', error);
      toast({
        title: "Error loading lead",
        description: "Failed to load lead details. Please try again.",
        variant: "destructive"
      });
      navigate('/agent/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleStartVerification = async () => {
    if (!lead || !currentUser) return;
    
    try {
      const updatedLead = {
        ...lead,
        status: 'In Progress' as const,
        verification: {
          ...lead.verification,
          status: 'In Progress' as const,
          startTime: new Date(),
          agentId: currentUser.id
        }
      };
      
      await updateLeadInDatabase(lead.id, updatedLead);
      setLead(updatedLead);
      
      toast({
        title: "Verification Started",
        description: "Lead verification process has been initiated.",
      });
    } catch (error) {
      console.error('Error starting verification:', error);
      toast({
        title: "Error",
        description: "Failed to start verification process.",
        variant: "destructive"
      });
    }
  };

  const handleMarkArrival = async () => {
    if (!lead) return;
    
    try {
      const updatedLead = {
        ...lead,
        verification: {
          ...lead.verification!,
          arrivalTime: new Date()
        }
      };
      
      await updateLeadInDatabase(lead.id, updatedLead);
      setLead(updatedLead);
      
      toast({
        title: "Arrival Marked",
        description: "Your arrival at the location has been recorded.",
      });
    } catch (error) {
      console.error('Error marking arrival:', error);
      toast({
        title: "Error",
        description: "Failed to mark arrival.",
        variant: "destructive"
      });
    }
  };

  const handleUploadPhoto = async (files: FileList) => {
    if (!lead || !files.length) return;
    
    try {
      const newPhotos = Array.from(files).map((file, index) => ({
        id: `photo-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date()
      }));
      
      const updatedLead = {
        ...lead,
        verification: {
          ...lead.verification!,
          photos: [...(lead.verification?.photos || []), ...newPhotos]
        }
      };
      
      await updateLeadInDatabase(lead.id, updatedLead);
      setLead(updatedLead);
      
      toast({
        title: "Photos Uploaded",
        description: `${files.length} photo(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Error",
        description: "Failed to upload photos.",
        variant: "destructive"
      });
    }
  };

  const handleUploadDocument = async (files: FileList, type: Document['type']) => {
    if (!lead || !files.length) return;
    
    try {
      const newDocuments = Array.from(files).map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date()
      }));
      
      const updatedLead = {
        ...lead,
        verification: {
          ...lead.verification!,
          documents: [...(lead.verification?.documents || []), ...newDocuments]
        }
      };
      
      await updateLeadInDatabase(lead.id, updatedLead);
      setLead(updatedLead);
      
      toast({
        title: "Documents Uploaded",
        description: `${files.length} document(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents.",
        variant: "destructive"
      });
    }
  };

  const handleAddNotes = async (notes: string) => {
    if (!lead) return;
    
    try {
      const updatedLead = {
        ...lead,
        verification: {
          ...lead.verification!,
          notes
        }
      };
      
      await updateLeadInDatabase(lead.id, updatedLead);
      setLead(updatedLead);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes.",
        variant: "destructive"
      });
    }
  };

  const handleCompleteVerification = async () => {
    if (!lead) return;
    
    try {
      const updatedLead = {
        ...lead,
        status: 'Completed' as const,
        verification: {
          ...lead.verification!,
          status: 'Completed' as const,
          completionTime: new Date()
        }
      };
      
      await updateLeadInDatabase(lead.id, updatedLead);
      setLead(updatedLead);
      
      toast({
        title: "Verification Completed",
        description: "Lead verification has been completed successfully.",
      });
    } catch (error) {
      console.error('Error completing verification:', error);
      toast({
        title: "Error",
        description: "Failed to complete verification.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReport = () => {
    // Generate and download PDF report
    const reportData = {
      lead,
      verification: lead?.verification,
      agent: currentUser
    };
    
    // This would generate a PDF report
    console.log('Downloading report for lead:', reportData);
    toast({
      title: "Report Downloaded",
      description: "Verification report has been downloaded.",
    });
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
                <h2 className="text-xl font-semibold mb-2">Loading Lead Details...</h2>
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
                <Button onClick={() => navigate('/agent/leads')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Leads
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
                  onClick={() => navigate('/agent/leads')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Leads
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{lead.name}</h1>
                  <p className="text-muted-foreground">Lead ID: {lead.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
                {lead.verification?.status === 'Completed' && (
                  <Button onClick={handleDownloadReport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
            </div>

            {/* Verification Process */}
            <VerificationProcess
              lead={lead}
              onStartVerification={handleStartVerification}
              onMarkArrival={handleMarkArrival}
              onUploadPhoto={handleUploadPhoto}
              onUploadDocument={handleUploadDocument}
              onAddNotes={handleAddNotes}
              onCompleteVerification={handleCompleteVerification}
            />

            {/* Rest of lead details cards from LeadDetail.tsx */}
            {/* Bank Selection & Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Bank Selection & Product Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                    <p className="text-base">{lead.additionalDetails?.bankName || lead.bank || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bank Product</label>
                    <p className="text-base">{lead.additionalDetails?.bankProduct || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Initiated Under Branch</label>
                    <p className="text-base">{lead.additionalDetails?.initiatedBranch || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Build Under Branch</label>
                    <p className="text-base">{lead.additionalDetails?.buildBranch || lead.additionalDetails?.bankBranch || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applicant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-base">{lead.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.additionalDetails?.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Age</label>
                    <p className="text-base">{lead.age} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.additionalDetails?.email || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                    <p className="text-sm">{lead.address.street}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <p className="text-sm">{lead.address.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">State</label>
                    <p className="text-sm">{lead.address.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">District</label>
                    <p className="text-sm">{lead.address.district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pincode</label>
                    <p className="text-sm">{lead.address.pincode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="text-base">{lead.additionalDetails?.company || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Designation</label>
                    <p className="text-base">{lead.additionalDetails?.designation || lead.job || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
                    <p className="text-base">₹{lead.additionalDetails?.monthlyIncome || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Annual Income</label>
                    <p className="text-base">₹{lead.additionalDetails?.annualIncome || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentLeadDetail;
