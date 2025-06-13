import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Download, ArrowLeft, MapPin, User, Building, Phone, Calendar, Clock, Home, Briefcase, DollarSign, Eye } from 'lucide-react';
import { mockLeads } from '@/utils/mockData';
import { getLeadById, getUserById, getBankById } from '@/lib/supabase-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LeadReview from '@/components/dashboard/LeadReview';
import VerificationProcess from '@/components/dashboard/VerificationProcess';
import DocumentViewer from '@/components/shared/DocumentViewer';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const LeadDetail = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    
    const fetchLeadData = async () => {
      try {
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
        
        let foundLead = await getLeadById(leadId || '');
        
        if (!foundLead && allLeads && allLeads.length > 0) {
          foundLead = allLeads.find((l: any) => l.id === leadId);
          
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
    
    Array.from(files).forEach((file, index) => {
      const photoId = `photo-${new Date().getTime()}-${index}`;
      const photoUrl = URL.createObjectURL(file);
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
    
    Array.from(files).forEach((file, index) => {
      const docId = `doc-${new Date().getTime()}-${index}`;
      const docUrl = URL.createObjectURL(file);
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
    toast({
      title: "Forwarded to Bank",
      description: `The verification has been forwarded to ${bank?.name || 'the bank'}.`,
    });
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
  const additionalAddresses = lead.additionalDetails?.addresses || [];
  const homeAddress = additionalAddresses.find((a: any) => a?.type === 'Residence');
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
          {/* Lead Summary - Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Summary</CardTitle>
                <CardDescription>Quick overview of the lead</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{lead.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{lead.additionalDetails?.phoneNumber || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-medium">{lead.additionalDetails?.bankName || 'Not Assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="font-medium">₹{Number(lead.additionalDetails?.loanAmount || 0).toLocaleString()}</p>
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

                {lead.verificationDate && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Date</p>
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
                <CardDescription>Uploaded documents</CardDescription>
              </CardHeader>
              <CardContent>
                {formattedDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {formattedDocuments.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">{doc.name || doc.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} • {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{doc.name || doc.type}</DialogTitle>
                              <DialogDescription>
                                Document uploaded on {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'Unknown date'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              {doc.url && (
                                <img 
                                  src={doc.url} 
                                  alt={doc.name || doc.type}
                                  className="max-w-full h-auto rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextElement) {
                                      nextElement.style.display = 'block';
                                    }
                                  }}
                                />
                              )}
                              <div className="hidden text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Document preview not available</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="bank-details" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
                <TabsTrigger value="applicant-info">Applicant Info</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="additional">Additional Details</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>
              
              {/* Bank Details Tab */}
              <TabsContent value="bank-details" className="pt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank & Product Information</CardTitle>
                    <CardDescription>Banking and loan details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Name</p>
                          <p className="font-medium">{lead.additionalDetails?.bankName || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Product</p>
                          <p className="font-medium">{lead.additionalDetails?.bankProduct || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Initiated Branch</p>
                          <p className="font-medium">{lead.additionalDetails?.initiatedBranch || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Build Branch</p>
                          <p className="font-medium">{lead.additionalDetails?.buildBranch || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Agency File No.</p>
                          <p className="font-medium">{lead.additionalDetails?.agencyFileNo || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Lead Type</p>
                          <p className="font-medium">{lead.additionalDetails?.leadType || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Loan Amount</p>
                          <p className="font-medium">₹{Number(lead.additionalDetails?.loanAmount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Loan Type</p>
                          <p className="font-medium">{lead.additionalDetails?.loanType || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Application Barcode</p>
                          <p className="font-medium">{lead.additionalDetails?.applicationBarcode || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Case ID</p>
                          <p className="font-medium">{lead.additionalDetails?.caseId || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Details (if applicable) */}
                {lead.additionalDetails?.leadType === 'Auto Loan' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Details</CardTitle>
                      <CardDescription>Vehicle information for auto loan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Vehicle Brand</p>
                          <p className="font-medium">{lead.additionalDetails?.vehicleBrandName || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vehicle Model</p>
                          <p className="font-medium">{lead.additionalDetails?.vehicleModelName || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vehicle Variant</p>
                          <p className="font-medium">{lead.additionalDetails?.vehicleVariant || 'Not specified'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Applicant Info Tab */}
              <TabsContent value="applicant-info" className="pt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Customer personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{lead.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{lead.additionalDetails?.phoneNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{lead.additionalDetails?.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{lead.additionalDetails?.dateOfBirth ? format(new Date(lead.additionalDetails.dateOfBirth), 'MMM d, yyyy') : 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-medium">{lead.age} years</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="font-medium">{lead.additionalDetails?.gender || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Father's Name</p>
                          <p className="font-medium">{lead.additionalDetails?.fatherName || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Mother's Name</p>
                          <p className="font-medium">{lead.additionalDetails?.motherName || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Marital Status</p>
                          <p className="font-medium">{lead.additionalDetails?.maritalStatus || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Spouse Name</p>
                          <p className="font-medium">{lead.additionalDetails?.spouseName || 'Not applicable'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Co-Applicant Details */}
                {lead.additionalDetails?.hasCoApplicant && lead.additionalDetails?.coApplicant && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Co-Applicant Details</CardTitle>
                      <CardDescription>Co-applicant information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{lead.additionalDetails.coApplicant.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{lead.additionalDetails.coApplicant.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Relation</p>
                          <p className="font-medium">{lead.additionalDetails.coApplicant.relation}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{lead.additionalDetails.coApplicant.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-medium">{lead.additionalDetails.coApplicant.age || 'Not provided'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="pt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Residence Address</CardTitle>
                    <CardDescription>Primary residential address</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{lead.address?.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.address?.city}, {lead.address?.district}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lead.address?.state} - {lead.address?.pincode}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {officeAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Office Address</CardTitle>
                      <CardDescription>Work place address</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{officeAddress.street}</p>
                        <p className="text-sm text-muted-foreground">
                          {officeAddress.city}, {officeAddress.district}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {officeAddress.state} - {officeAddress.pincode}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Additional Details Tab */}
              <TabsContent value="additional" className="pt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>Employment and business information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{lead.additionalDetails?.company || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Designation</p>
                          <p className="font-medium">{lead.additionalDetails?.designation || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Work Experience</p>
                          <p className="font-medium">{lead.additionalDetails?.workExperience || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Job Duration</p>
                          <p className="font-medium">{lead.additionalDetails?.currentJobDuration || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Employment Type</p>
                          <p className="font-medium">{lead.additionalDetails?.employmentType || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Income</p>
                          <p className="font-medium">{lead.additionalDetails?.monthlyIncome ? `₹${Number(lead.additionalDetails.monthlyIncome).toLocaleString()}` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Annual Income</p>
                          <p className="font-medium">{lead.additionalDetails?.annualIncome ? `₹${Number(lead.additionalDetails.annualIncome).toLocaleString()}` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Other Income</p>
                          <p className="font-medium">{lead.additionalDetails?.otherIncome ? `₹${Number(lead.additionalDetails.otherIncome).toLocaleString()}` : 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>Property information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Property Type</p>
                        <p className="font-medium">{lead.additionalDetails?.propertyType || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ownership Status</p>
                        <p className="font-medium">{lead.additionalDetails?.ownershipStatus || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Property Age</p>
                        <p className="font-medium">{lead.additionalDetails?.propertyAge ? `${lead.additionalDetails.propertyAge} years` : 'Not specified'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Instructions & Additional Information</CardTitle>
                    <CardDescription>Special instructions and other details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Visit Type</p>
                        <p className="font-medium">{lead.visitType || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Special Instructions</p>
                        <p className="font-medium">{lead.instructions || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Application ID</p>
                        <p className="font-medium">{lead.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Verification Tab */}
              <TabsContent value="verification" className="pt-4">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
