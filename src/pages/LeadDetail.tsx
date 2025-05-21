
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead, getLeadById, getUserById, getBankById } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadReview from '@/components/dashboard/LeadReview';
import VerificationProcess from '@/components/dashboard/VerificationProcess';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Calendar, MapPin, UserCheck } from 'lucide-react';

const LeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const isAdmin = location.pathname.includes('/admin/');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    
    // Fetch lead by id
    if (leadId) {
      const leadData = getLeadById(leadId);
      if (!leadData) {
        toast({
          title: "Lead not found",
          description: "The lead you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate(isAdmin ? '/admin/leads' : '/agent/leads');
        return;
      }
      setLead(leadData);
    }
  }, [leadId, navigate, isAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleStartVerification = () => {
    if (lead && lead.verification) {
      const updatedLead = { ...lead };
      updatedLead.verification = {
        ...updatedLead.verification,
        startTime: new Date(),
        status: 'In Progress'
      };
      setLead(updatedLead);
      
      // Update the lead in localStorage to persist the change
      const storedUser = localStorage.getItem('kycUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
        const updatedLeads = mockLeads.map((l: Lead) => 
          l.id === updatedLead.id ? updatedLead : l
        );
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      }
      
      toast({
        title: "Verification Started",
        description: `You've started verification for ${lead.name}.`,
      });
    }
  };

  const handleMarkArrival = () => {
    if (lead && lead.verification) {
      const updatedLead = { ...lead };
      updatedLead.verification = {
        ...updatedLead.verification,
        arrivalTime: new Date(),
      };
      setLead(updatedLead);
      
      // Update in localStorage
      const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = mockLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      
      toast({
        title: "Arrival Marked",
        description: `You've marked your arrival at the verification location.`,
      });
    }
  };

  const handleUploadPhoto = (files: FileList) => {
    if (lead && lead.verification) {
      const updatedLead = { ...lead };
      const newPhotos = Array.from(files).map((file, index) => ({
        id: `newphoto${Date.now()}${index}`,
        name: file.name,
        type: 'Photo' as const,
        uploadedBy: 'agent' as const,
        url: '/placeholder.svg', // In a real app, we would upload to storage
        uploadDate: new Date()
      }));
      
      updatedLead.verification = {
        ...updatedLead.verification,
        photos: [...updatedLead.verification.photos, ...newPhotos]
      };
      
      setLead(updatedLead);
      
      // Update in localStorage
      const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = mockLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      
      toast({
        title: "Photos Uploaded",
        description: `${files.length} photo(s) uploaded successfully.`,
      });
    }
  };

  const handleUploadDocument = (files: FileList, type: any) => {
    if (lead && lead.verification) {
      const updatedLead = { ...lead };
      const newDocs = Array.from(files).map((file, index) => ({
        id: `newdoc${Date.now()}${index}`,
        name: file.name,
        type,
        uploadedBy: 'agent' as const,
        url: '/placeholder.svg', // In a real app, we would upload to storage
        uploadDate: new Date()
      }));
      
      updatedLead.verification = {
        ...updatedLead.verification,
        documents: [...updatedLead.verification.documents, ...newDocs]
      };
      
      setLead(updatedLead);
      
      // Update in localStorage
      const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = mockLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      
      toast({
        title: "Documents Uploaded",
        description: `${files.length} document(s) uploaded successfully.`,
      });
    }
  };

  const handleAddNotes = (notes: string) => {
    if (lead && lead.verification) {
      const updatedLead = { ...lead };
      updatedLead.verification = {
        ...updatedLead.verification,
        notes
      };
      setLead(updatedLead);
      
      // Update in localStorage
      const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = mockLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
    }
  };

  const handleCompleteVerification = () => {
    if (lead && lead.verification) {
      const updatedLead = { ...lead };
      updatedLead.verification = {
        ...updatedLead.verification,
        completionTime: new Date(),
        status: 'Completed'
      };
      updatedLead.status = 'Completed';
      
      setLead(updatedLead);
      
      // Update in localStorage
      const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = mockLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      
      toast({
        title: "Verification Completed",
        description: `You've successfully completed the verification for ${lead.name}.`,
      });
    }
  };

  const handleApproveVerification = (remarks: string) => {
    if (lead && lead.verification && currentUser) {
      const updatedLead = { ...lead };
      updatedLead.verification = {
        ...updatedLead.verification,
        adminRemarks: remarks,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        status: 'Approved'
      };
      
      setLead(updatedLead);
      
      // Update in localStorage
      const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = mockLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      
      toast({
        title: "Verification Approved",
        description: `You've approved the verification for ${lead.name}.`,
      });
    }
  };

  const handleRejectVerification = (remarks: string) => {
    if (lead && lead.verification && currentUser) {
      const updatedLead = { ...lead };
      updatedLead.verification = {
        ...updatedLead.verification,
        adminRemarks: remarks,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        status: 'Rejected'
      };
      updatedLead.status = 'Rejected';
      
      setLead(updatedLead);
      
      // Update in localStorage
      const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = mockLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      
      toast({
        title: "Verification Rejected",
        description: `You've rejected the verification for ${lead.name}.`,
      });
    }
  };

  const handleForwardToBank = () => {
    if (lead) {
      const updatedLead = { ...lead };
      updatedLead.status = 'Forwarded to Bank';
      
      setLead(updatedLead);
      
      // Update in localStorage
      const mockLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = mockLeads.map((l: Lead) => 
        l.id === updatedLead.id ? updatedLead : l
      );
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      
      toast({
        title: "Forwarded to Bank",
        description: "The verification has been forwarded to the bank successfully.",
      });
    }
  };

  if (!currentUser || !lead) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const bank = getBankById(lead.bank);
  const agent = getUserById(lead.assignedTo);

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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => navigate(isAdmin ? '/admin/leads' : '/agent/leads')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
                  <p className="text-muted-foreground">
                    {bank?.name} - {lead.visitType} Visit
                  </p>
                </div>
              </div>
              {isAdmin ? null : (
                <Button 
                  variant={lead.verification?.status === 'Completed' ? 'outline' : 'default'}
                  disabled={lead.verification?.status === 'Completed'}
                  onClick={handleStartVerification}
                >
                  {lead.verification?.status === 'Completed' ? 'Completed' : 'Start Verification'}
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Details</CardTitle>
                    <CardDescription>Personal and address information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Personal Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Name</span>
                            <span className="text-sm font-medium">{lead.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Age</span>
                            <span className="text-sm font-medium">{lead.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Occupation</span>
                            <span className="text-sm font-medium">{lead.job}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Visit Type</span>
                            <span className="text-sm font-medium">{lead.visitType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Address Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Street</span>
                            <span className="text-sm font-medium">{lead.address.street}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">City</span>
                            <span className="text-sm font-medium">{lead.address.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">District</span>
                            <span className="text-sm font-medium">{lead.address.district}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">State</span>
                            <span className="text-sm font-medium">{lead.address.state}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Pincode</span>
                            <span className="text-sm font-medium">{lead.address.pincode}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Bank Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Bank Name</span>
                            <span className="text-sm font-medium">{bank?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Assigned Agent</span>
                            <span className="text-sm font-medium">{agent?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <span className="text-sm font-medium">{lead.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {lead.instructions && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">Special Instructions</h3>
                        <div className="bg-muted/50 p-3 rounded-md text-sm">
                          {lead.instructions}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Documents from Bank</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                        {lead.documents.map((doc) => (
                          <div key={doc.id} className="border rounded-md p-3 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium">{doc.name}</span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {doc.type}
                              </span>
                            </div>
                            <div className="flex-grow">
                              <img 
                                src={doc.url} 
                                alt={doc.name}
                                className="w-full h-32 object-cover rounded-md mb-2" 
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(doc.uploadDate, 'MMM d, yyyy')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                {isAdmin ? (
                  <LeadReview 
                    lead={lead}
                    currentUser={currentUser}
                    onApprove={handleApproveVerification}
                    onReject={handleRejectVerification}
                    onForwardToBank={handleForwardToBank}
                  />
                ) : (
                  <VerificationProcess
                    lead={lead}
                    onStartVerification={handleStartVerification}
                    onMarkArrival={handleMarkArrival}
                    onUploadPhoto={handleUploadPhoto}
                    onUploadDocument={handleUploadDocument}
                    onAddNotes={handleAddNotes}
                    onCompleteVerification={handleCompleteVerification}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadDetail;
