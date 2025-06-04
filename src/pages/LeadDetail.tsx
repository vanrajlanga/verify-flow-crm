import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Download, ArrowLeft, MapPin, User, Building, Phone, Calendar, Clock, Home, Briefcase, DollarSign } from 'lucide-react';
import { getLeadById, getUserById, getBankById, mockLeads } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LeadReview from '@/components/dashboard/LeadReview';
import VerificationProcess from '@/components/dashboard/VerificationProcess';
import DocumentViewer from '@/components/shared/DocumentViewer';
import { toast } from '@/components/ui/use-toast';

// Helper functions
const getBadgeColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
    case 'In Progress':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>;
    case 'Completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
    case 'Rejected':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// LeadDetail component
const LeadDetail = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    
    const fetchLeadData = async () => {
      try {
        // Get leads from localStorage or use mockLeads if not available
        const storedLeads = localStorage.getItem('mockLeads');
        let allLeads = [];
        
        if (storedLeads) {
          try {
            allLeads = JSON.parse(storedLeads);
          } catch (error) {
            console.error("Error parsing stored leads:", error);
            allLeads = mockLeads;
          }
        } else {
          allLeads = mockLeads;
        }
        
        // Try finding the lead directly using ID - await the Promise
        let foundLead = await getLeadById(leadId || '');
        
        // If not found with getLeadById, search manually in all leads
        if (!foundLead && allLeads && allLeads.length > 0) {
          foundLead = allLeads.find((l: any) => l.id === leadId);
          
          // If still not found, try partial match if the ID might be stored differently
          if (!foundLead) {
            foundLead = allLeads.find((l: any) => 
              leadId?.includes(l.id) || 
              l.id.includes(leadId || '')
            );
          }
        }
        
        console.log("Looking for lead with ID:", leadId);
        console.log("Found lead:", foundLead);
        
        if (foundLead) {
          setLead(foundLead);
          
          // Fetch agent and bank data asynchronously
          if (foundLead.assignedTo) {
            const agentData = await getUserById(foundLead.assignedTo);
            setAgent(agentData);
          }
          
          if (foundLead.bank) {
            const bankData = await getBankById(foundLead.bank);
            setBank(bankData);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lead data:', error);
        setLoading(false);
      }
    };
    
    fetchLeadData();
  }, [navigate, leadId]);

  // Function to update lead data in localStorage
  const updateLeadInStorage = (updatedLead: any) => {
    const storedLeads = localStorage.getItem('mockLeads');
    if (storedLeads) {
      try {
        const allLeads = JSON.parse(storedLeads);
        const updatedLeads = allLeads.map((l: any) => 
          l.id === updatedLead.id ? updatedLead : l
        );
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      } catch (error) {
        console.error("Error updating lead in storage:", error);
      }
    }
    setLead({...updatedLead});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Lead Not Found</h1>
        <p className="text-muted-foreground mb-6">The lead you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // Handle verification actions for agents
  const handleStartVerification = () => {
    if (!lead.verification) {
      lead.verification = {
        id: `verification-${lead.id}`,
        leadId: lead.id,
        agentId: currentUser.id,
        status: 'In Progress',
        photos: [],
        documents: [],
        notes: ''
      };
    }
    
    lead.verification.startTime = new Date();
    lead.verification.status = 'In Progress';
    lead.status = 'In Progress';
    
    updateLeadInStorage(lead);
    
    toast({
      title: "Verification Started",
      description: "You've started the verification process.",
    });
  };

  const handleMarkArrival = () => {
    if (lead.verification) {
      lead.verification.arrivalTime = new Date();
      updateLeadInStorage(lead);
    }
    
    toast({
      title: "Arrival Marked",
      description: "Your arrival at the verification location has been recorded.",
    });
  };

  const handleUploadPhoto = (files: FileList) => {
    if (!lead.verification.photos) {
      lead.verification.photos = [];
    }
    
    // Convert FileList to array and create photo objects
    Array.from(files).forEach((file, index) => {
      const photoId = `photo-${new Date().getTime()}-${index}`;
      const photoUrl = URL.createObjectURL(file); // Create preview URL
      lead.verification.photos.push({
        id: photoId,
        name: file.name,
        type: 'Photo',
        uploadedBy: 'agent',
        url: photoUrl,
        uploadDate: new Date(),
        size: file.size
      });
    });
    
    updateLeadInStorage(lead);
    
    toast({
      title: "Photos Uploaded",
      description: `${files.length} photo(s) have been uploaded.`,
    });
  };

  const handleUploadDocument = (files: FileList, type: string) => {
    if (!lead.verification.documents) {
      lead.verification.documents = [];
    }
    
    // Convert FileList to array and create document objects
    Array.from(files).forEach((file, index) => {
      const docId = `doc-${new Date().getTime()}-${index}`;
      const docUrl = URL.createObjectURL(file); // Create preview URL
      lead.verification.documents.push({
        id: docId,
        name: file.name,
        type: type as any,
        uploadedBy: 'agent',
        url: docUrl,
        uploadDate: new Date(),
        size: file.size
      });
    });
    
    updateLeadInStorage(lead);
    
    toast({
      title: "Documents Uploaded",
      description: `${files.length} ${type} document(s) have been uploaded.`,
    });
  };

  const handleAddNotes = (notes: string) => {
    if (lead.verification) {
      lead.verification.notes = notes;
      updateLeadInStorage(lead);
    }
    
    toast({
      title: "Notes Saved",
      description: "Your verification notes have been saved.",
    });
  };

  const handleCompleteVerification = () => {
    if (lead.verification) {
      lead.verification.completionTime = new Date();
      lead.verification.status = 'Completed';
      lead.status = 'Completed';
      updateLeadInStorage(lead);
    }
    
    toast({
      title: "Verification Completed",
      description: "The verification process has been marked as complete.",
    });
  };

  // Handle review actions for admins
  const handleApproveVerification = (remarks: string) => {
    if (lead.verification) {
      lead.verification.adminRemarks = remarks;
      lead.verification.reviewedBy = currentUser.id;
      lead.verification.reviewedAt = new Date();
      lead.status = 'Completed';
      updateLeadInStorage(lead);
    }
    
    toast({
      title: "Verification Approved",
      description: "The verification has been approved.",
    });
  };

  const handleRejectVerification = (remarks: string) => {
    if (lead.verification) {
      lead.verification.adminRemarks = remarks;
      lead.verification.reviewedBy = currentUser.id;
      lead.verification.reviewedAt = new Date();
      lead.verification.status = 'Rejected';
      lead.status = 'Rejected';
      updateLeadInStorage(lead);
    }
    
    toast({
      title: "Verification Rejected",
      description: "The verification has been rejected.",
    });
  };

  const handleForwardToBank = () => {
    // Implementation would forward the verification to the bank
    toast({
      title: "Forwarded to Bank",
      description: `The verification has been forwarded to ${bank?.name || 'the bank'}.`,
    });
  };

  // Convert documents to proper format for DocumentViewer
  const formattedDocuments = lead.documents?.map((doc: any) => {
    if (typeof doc === 'string') {
      return {
        id: `doc-${Math.random()}`,
        name: doc,
        type: 'Document',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date()
      };
    }
    return doc;
  }) || [];

  const isAdmin = currentUser?.role === 'admin';

  // Format addresses from additionalDetails if available
  const additionalAddresses = lead.additionalDetails?.addresses || [];
  const homeAddress = additionalAddresses.find((a: any) => a?.type === 'Home');
  const officeAddress = additionalAddresses.find((a: any) => a?.type === 'Office');

  return (
    <div className="p-6 bg-muted/30 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Lead Details</h1>
            {lead.status && (
              <div className="ml-4">
                {getStatusBadge(lead.status)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Information - Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Basic details about the customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{lead.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Number</p>
                    <p className="font-medium">{lead.additionalDetails?.phoneNumber || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Address</p>
                    <p className="font-medium">{lead.address?.street}</p>
                    <p className="text-sm">{lead.address?.city}, {lead.address?.state}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-medium">{bank?.name || 'Not Assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created On</p>
                    <p className="font-medium">
                      {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy') : 'Not Available'}
                    </p>
                  </div>
                </div>
                
                {lead.visitType && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visit Type</p>
                      <p className="font-medium">{lead.visitType}</p>
                    </div>
                  </div>
                )}

                {lead.assignedTo && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned Agent</p>
                      <p className="font-medium">{agent?.name || 'Unknown'}</p>
                    </div>
                  </div>
                )}
                
                {lead.verificationDate && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Scheduled Verification</p>
                      <p className="font-medium">
                        {format(new Date(lead.verificationDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Customer submitted documents</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentViewer documents={formattedDocuments} title="" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Lead Details</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="pt-4 space-y-6">
                {/* Professional Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>Employment and business information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Job Title</p>
                          <p className="font-medium">{lead.job || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{lead.additionalDetails?.company || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Designation</p>
                          <p className="font-medium">{lead.additionalDetails?.designation || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Work Experience</p>
                          <p className="font-medium">{lead.additionalDetails?.workExperience || 'Not specified'}</p>
                        </div>
                        {officeAddress && (
                          <div>
                            <p className="text-sm text-muted-foreground">Office Address</p>
                            <p className="font-medium">{officeAddress.street}</p>
                            <p className="text-sm">{officeAddress.city}, {officeAddress.state} - {officeAddress.pincode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial & Property Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial & Property Details</CardTitle>
                    <CardDescription>Income and property information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Loan Amount</p>
                          <p className="font-medium">{lead.additionalDetails?.loanAmount ? `₹${Number(lead.additionalDetails.loanAmount).toLocaleString()}` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Loan Type</p>
                          <p className="font-medium">{lead.additionalDetails?.loanType || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Income</p>
                          <p className="font-medium">{lead.additionalDetails?.monthlyIncome ? `₹${Number(lead.additionalDetails.monthlyIncome).toLocaleString()}/month` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Annual Income</p>
                          <p className="font-medium">{lead.additionalDetails?.annualIncome ? `₹${Number(lead.additionalDetails.annualIncome).toLocaleString()}/year` : 'Not specified'}</p>
                        </div>
                        {lead.additionalDetails?.otherIncome && (
                          <div>
                            <p className="text-sm text-muted-foreground">Other Income</p>
                            <p className="font-medium">{`₹${Number(lead.additionalDetails.otherIncome).toLocaleString()}`}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {lead.additionalDetails?.propertyType && (
                          <div>
                            <p className="text-sm text-muted-foreground">Property Type</p>
                            <p className="font-medium">{lead.additionalDetails.propertyType}</p>
                          </div>
                        )}
                        {lead.additionalDetails?.ownershipStatus && (
                          <div>
                            <p className="text-sm text-muted-foreground">Ownership Status</p>
                            <p className="font-medium">{lead.additionalDetails.ownershipStatus}</p>
                          </div>
                        )}
                        {lead.additionalDetails?.propertyAge && (
                          <div>
                            <p className="text-sm text-muted-foreground">Property Age</p>
                            <p className="font-medium">{lead.additionalDetails.propertyAge} years</p>
                          </div>
                        )}
                        {homeAddress && (
                          <div>
                            <p className="text-sm text-muted-foreground">Home Address</p>
                            <p className="font-medium">{homeAddress.street}</p>
                            <p className="text-sm">{homeAddress.city}, {homeAddress.state} - {homeAddress.pincode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Other important details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Application ID</p>
                          <p className="font-medium">{lead.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{lead.additionalDetails?.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {lead.instructions && (
                          <div>
                            <p className="text-sm text-muted-foreground">Special Instructions</p>
                            <p className="font-medium">{lead.instructions}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-medium">{lead.age || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="verification" className="pt-4">
                {isAdmin ? (
                  <LeadReview
                    lead={lead}
                    onApprove={handleApproveVerification}
                    onReject={handleRejectVerification}
                    onForwardToBank={handleForwardToBank}
                  />
                ) : (
                  <VerificationProcess
                    lead={lead}
                    onStart={handleStartVerification}
                    onMarkArrival={handleMarkArrival}
                    onUploadPhoto={handleUploadPhoto}
                    onUploadDocument={handleUploadDocument}
                    onAddNotes={handleAddNotes}
                    onComplete={handleCompleteVerification}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
