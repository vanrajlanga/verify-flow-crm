import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Download, ArrowLeft, MapPin, User, Building, Phone, Calendar, Clock, Home, Briefcase, DollarSign, Eye, Mail, Users } from 'lucide-react';
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
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [bankData, setBankData] = useState<any>({});
  
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

          // Load bank details for the lead
          loadBankDetails(foundLead);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lead data:', error);
        setLoading(false);
      }
    };
    
    fetchLeadData();
  }, [navigate, leadId]);

  const loadBankDetails = (lead: any) => {
    try {
      const storedBanks = localStorage.getItem('banks');
      const storedProducts = localStorage.getItem('bankProducts');
      const storedBranches = localStorage.getItem('bankBranches');
      
      if (storedBanks && storedProducts && storedBranches) {
        const banks = JSON.parse(storedBanks);
        const products = JSON.parse(storedProducts);
        const branches = JSON.parse(storedBranches);
        
        const bankInfo = banks.find((b: any) => b.id === lead.additionalDetails?.bankName);
        const productInfo = products.find((p: any) => p.id === lead.additionalDetails?.bankProduct);
        const initiatedBranchInfo = branches.find((b: any) => b.id === lead.additionalDetails?.initiatedBranch);
        const buildBranchInfo = branches.find((b: any) => b.id === lead.additionalDetails?.buildBranch);
        
        setBankData({
          bank: bankInfo,
          product: productInfo,
          initiatedBranch: initiatedBranchInfo,
          buildBranch: buildBranchInfo
        });
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
    }
  };

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

        <Tabs defaultValue="basic-info" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="basic-info">Lead Type & Basic Information</TabsTrigger>
            <TabsTrigger value="applicant-info">Applicant Information</TabsTrigger>
            <TabsTrigger value="address-info">Address Information</TabsTrigger>
            <TabsTrigger value="additional-details">Additional Details</TabsTrigger>
            <TabsTrigger value="documents">Documents & Instructions</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Lead Type & Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{bankData.bank?.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Product</p>
                      <p className="font-medium">{bankData.product?.name || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Initiated Branch</p>
                      <p className="font-medium">{bankData.initiatedBranch?.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Build Branch</p>
                      <p className="font-medium">{bankData.buildBranch?.name || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applicant-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
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
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium">{lead.age || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{lead.additionalDetails?.email || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {lead.additionalDetails?.hasCoApplicant && lead.additionalDetails?.coApplicant && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Co-Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{lead.additionalDetails.coApplicant.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="font-medium">{lead.additionalDetails.coApplicant.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium">{lead.additionalDetails.coApplicant.age}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{lead.additionalDetails.coApplicant.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="address-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lead.additionalDetails?.addresses?.map((address: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{address.type} Address</h3>
                      {address.requiresVerification && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Requires Verification
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Street Address</p>
                        <p className="font-medium">{address.street || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">City</p>
                        <p className="font-medium">{address.city || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">District</p>
                        <p className="font-medium">{address.district || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">State</p>
                        <p className="font-medium">{address.state || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pincode</p>
                        <p className="font-medium">{address.pincode || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">No address information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional-details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Income</p>
                      <p className="font-medium">{lead.additionalDetails?.monthlyIncome ? `₹${Number(lead.additionalDetails.monthlyIncome).toLocaleString()}` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Income</p>
                      <p className="font-medium">{lead.additionalDetails?.annualIncome ? `₹${Number(lead.additionalDetails.annualIncome).toLocaleString()}` : 'Not specified'}</p>
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
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-medium">{lead.additionalDetails?.propertyType || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ownership Status</p>
                      <p className="font-medium">{lead.additionalDetails?.ownershipStatus || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created On</p>
                      <p className="font-medium">
                        {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy') : 'Not Available'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents & Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Uploaded Documents</h3>
                    {lead.documents && lead.documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lead.documents.map((doc: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-sm truncate">{doc.name || `Document ${index + 1}`}</span>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>{doc.name || `Document ${index + 1}`}</DialogTitle>
                                    <DialogDescription>
                                      Uploaded on {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'Unknown date'}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4">
                                    {doc.url && (
                                      <img 
                                        src={doc.url} 
                                        alt={doc.name || `Document ${index + 1}`}
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
                            <div className="text-xs text-muted-foreground">
                              {doc.type || 'Document'} • {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'Unknown date'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No documents uploaded</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4">Special Instructions</h3>
                    {lead.instructions ? (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm">{lead.instructions}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No special instructions provided</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
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
  );
};

export default LeadDetail;
