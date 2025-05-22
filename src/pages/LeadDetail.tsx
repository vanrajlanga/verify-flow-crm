import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Download, ArrowLeft, MapPin, User, Building, Phone, Calendar, Clock } from 'lucide-react';
import { getLeadById, getUserById, getBankById } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LeadReview from '@/components/dashboard/LeadReview';
import VerificationProcess from '@/components/dashboard/VerificationProcess';
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

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'PAN':
    case 'Aadhar':
    case 'Voter ID':
    case 'Job ID':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
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
  const lead = getLeadById(leadId || '');
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
  }, [navigate]);

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

  const agent = getUserById(lead.assignedTo);
  const bank = getBankById(lead.bank);
  
  // Handle verification actions for agents
  const handleStartVerification = () => {
    // Implementation would update the lead's verification status
    toast({
      title: "Verification Started",
      description: "You've started the verification process.",
    });
  };

  const handleMarkArrival = () => {
    // Implementation would mark agent arrival at location
    toast({
      title: "Arrival Marked",
      description: "Your arrival at the verification location has been recorded.",
    });
  };

  const handleUploadPhoto = (files: FileList) => {
    // Implementation would handle photo upload
    toast({
      title: "Photos Uploaded",
      description: `${files.length} photo(s) have been uploaded.`,
    });
  };

  const handleUploadDocument = (files: FileList, type: string) => {
    // Implementation would handle document upload
    toast({
      title: "Documents Uploaded",
      description: `${files.length} ${type} document(s) have been uploaded.`,
    });
  };

  const handleAddNotes = (notes: string) => {
    // Implementation would save agent notes
    toast({
      title: "Notes Saved",
      description: "Your verification notes have been saved.",
    });
  };

  const handleCompleteVerification = () => {
    // Implementation would complete the verification process
    toast({
      title: "Verification Completed",
      description: "The verification process has been marked as complete.",
    });
  };

  // Handle review actions for admins
  const handleApproveVerification = (remarks: string) => {
    // Implementation would approve the verification
    toast({
      title: "Verification Approved",
      description: "The verification has been approved.",
    });
  };

  const handleRejectVerification = (remarks: string) => {
    // Implementation would reject the verification
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

  // Document list rendering
  const documentsList = lead.documents?.map((doc, index) => (
    <li key={typeof doc === 'string' ? `${doc}-${index}` : doc.id} className="mb-4 flex items-center justify-between p-3 bg-white rounded-md shadow-sm border">
      <div className="flex items-center">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getBadgeColor('default')}`}>
          {typeof doc === 'string' ? 
            <FileText className="h-5 w-5" /> : 
            getDocumentIcon(doc.type)
          }
        </div>
        <span className="ml-3 font-medium">
          {typeof doc === 'string' ? doc : doc.name}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          asChild
        >
          <a 
            href={typeof doc === 'string' ? '#' : doc.url} 
            target="_blank" 
            download={typeof doc === 'string' ? '' : doc.name}
          >
            <Download className="h-4 w-4 mr-1" />
            <span>{typeof doc === 'string' ? 'Download' : 'View'}</span>
          </a>
        </Button>
      </div>
    </li>
  ));

  const isAdmin = currentUser?.role === 'admin';

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
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{lead.address.street}</p>
                    <p className="text-sm">{lead.address.city}, {lead.address.state}</p>
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
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Customer submitted documents</CardDescription>
              </CardHeader>
              <CardContent>
                {lead.documents && lead.documents.length > 0 ? (
                  <ul className="space-y-2">
                    {documentsList}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No documents available</p>
                  </div>
                )}
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
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Details</CardTitle>
                    <CardDescription>Comprehensive information about the lead</CardDescription>
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
                          <p className="text-sm text-muted-foreground">Income</p>
                          <p className="font-medium">{lead.additionalDetails?.monthlyIncome ? `₹${Number(lead.additionalDetails.monthlyIncome).toLocaleString()}/month` : 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Application ID</p>
                          <p className="font-medium">{lead.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{lead.additionalDetails?.email || 'Not provided'}</p>
                        </div>
                        {lead.instructions && (
                          <div>
                            <p className="text-sm text-muted-foreground">Remarks</p>
                            <p className="font-medium">{lead.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline or Recent Activity could go here */}
              </TabsContent>
              
              <TabsContent value="verification" className="pt-4">
                {isAdmin && lead.verification ? (
                  <LeadReview 
                    lead={lead}
                    currentUser={currentUser}
                    onApprove={handleApproveVerification}
                    onReject={handleRejectVerification}
                    onForwardToBank={handleForwardToBank}
                  />
                ) : currentUser?.role === 'agent' ? (
                  <VerificationProcess 
                    lead={lead}
                    onStartVerification={handleStartVerification}
                    onMarkArrival={handleMarkArrival}
                    onUploadPhoto={handleUploadPhoto}
                    onUploadDocument={handleUploadDocument}
                    onAddNotes={handleAddNotes}
                    onCompleteVerification={handleCompleteVerification}
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Verification Not Started</h3>
                        <p className="text-muted-foreground">
                          The verification process has not been initiated yet.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
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
