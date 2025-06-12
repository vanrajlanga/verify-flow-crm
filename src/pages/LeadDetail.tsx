
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
import FieldVerificationButton from '@/components/tvt/FieldVerificationButton';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const [fieldVerifications, setFieldVerifications] = useState<{[key: string]: any}>({});
  
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

          // Load field verifications if user is TVT
          if (parsedUser.role === 'tvt' && leadId) {
            await loadFieldVerifications(leadId);
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

  const loadFieldVerifications = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('field_verifications')
        .select('*')
        .eq('lead_id', leadId);

      if (error) {
        console.error('Error loading field verifications:', error);
        // Fallback to localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith(`verification_${leadId}_`));
        const verifications: {[key: string]: any} = {};
        keys.forEach(key => {
          const fieldName = key.replace(`verification_${leadId}_`, '');
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          verifications[fieldName] = data;
        });
        setFieldVerifications(verifications);
        return;
      }

      if (data) {
        const verifications: {[key: string]: any} = {};
        data.forEach(item => {
          verifications[item.field_name] = {
            isVerified: item.is_verified,
            verifiedBy: item.verified_by,
            verifiedAt: item.verified_at,
            notes: item.verification_notes
          };
        });
        setFieldVerifications(verifications);
      }
    } catch (error) {
      console.error('Error loading field verifications:', error);
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
  const formattedDocuments = lead?.documents?.map((doc: any) => {
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
  const isTVT = currentUser?.role === 'tvt';

  // Format addresses from additionalDetails if available
  const additionalAddresses = lead?.additionalDetails?.addresses || [];
  const homeAddress = additionalAddresses.find((a: any) => a?.type === 'Residence');
  const officeAddress = additionalAddresses.find((a: any) => a?.type === 'Office');

  const renderFieldWithVerification = (label: string, value: string, fieldKey: string) => {
    const verification = fieldVerifications[fieldKey];
    
    if (!isTVT) {
      return (
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium">{value || 'Not provided'}</p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium">{value || 'Not provided'}</p>
        </div>
        <FieldVerificationButton
          leadId={lead.id}
          fieldName={fieldKey}
          fieldValue={value}
          currentUserId={currentUser.id}
          isVerified={verification?.isVerified || false}
          verificationNotes={verification?.notes || ''}
          onVerificationUpdate={() => loadFieldVerifications(lead.id)}
        />
      </div>
    );
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

  return (
    <div className="p-6 bg-muted/30 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {isTVT ? 'Televerification - ' : ''}Lead Details
            </h1>
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
                  {renderFieldWithVerification('Name', lead.name, 'customerName')}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  {renderFieldWithVerification('Contact Number', lead.additionalDetails?.phoneNumber || "Not provided", 'phoneNumber')}
                </div>

                {lead.additionalDetails?.email && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    {renderFieldWithVerification('Email', lead.additionalDetails.email, 'email')}
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Address</p>
                    <p className="font-medium">{lead.address?.street}</p>
                    <p className="text-sm">{lead.address?.city}, {lead.address?.state}</p>
                    {isTVT && (
                      <div className="mt-2">
                        <FieldVerificationButton
                          leadId={lead.id}
                          fieldName="primaryAddress"
                          fieldValue={`${lead.address?.street}, ${lead.address?.city}, ${lead.address?.state}`}
                          currentUserId={currentUser.id}
                          isVerified={fieldVerifications['primaryAddress']?.isVerified || false}
                          verificationNotes={fieldVerifications['primaryAddress']?.notes || ''}
                          onVerificationUpdate={() => loadFieldVerifications(lead.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  {renderFieldWithVerification('Bank', bank?.name || 'Not Assigned', 'bankName')}
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
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Lead Details</TabsTrigger>
                {!isTVT && <TabsTrigger value="verification">Verification</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="details" className="pt-4 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Lead type and basic details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {lead.additionalDetails?.leadType && 
                          renderFieldWithVerification('Lead Type', lead.additionalDetails.leadType, 'leadType')
                        }
                        {lead.additionalDetails?.agencyFileNo && 
                          renderFieldWithVerification('Agency File No.', lead.additionalDetails.agencyFileNo, 'agencyFileNo')
                        }
                        {lead.additionalDetails?.loanAmount && 
                          renderFieldWithVerification('Loan Amount', `₹${Number(lead.additionalDetails.loanAmount).toLocaleString()}`, 'loanAmount')
                        }
                      </div>
                      <div className="space-y-4">
                        {lead.additionalDetails?.gender && 
                          renderFieldWithVerification('Gender', lead.additionalDetails.gender, 'gender')
                        }
                        {lead.age && 
                          renderFieldWithVerification('Age', `${lead.age} years`, 'age')
                        }
                        {lead.additionalDetails?.maritalStatus && 
                          renderFieldWithVerification('Marital Status', lead.additionalDetails.maritalStatus, 'maritalStatus')
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Family Details */}
                {(lead.additionalDetails?.fatherName || lead.additionalDetails?.motherName || lead.additionalDetails?.spouseName) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Family Details</CardTitle>
                      <CardDescription>Family member information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {lead.additionalDetails?.fatherName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Father's Name</p>
                            <p className="font-medium">{lead.additionalDetails.fatherName}</p>
                          </div>
                        )}
                        {lead.additionalDetails?.motherName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Mother's Name</p>
                            <p className="font-medium">{lead.additionalDetails.motherName}</p>
                          </div>
                        )}
                        {lead.additionalDetails?.spouseName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Spouse Name</p>
                            <p className="font-medium">{lead.additionalDetails.spouseName}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Co-Applicant Details */}
                {lead.additionalDetails?.coApplicant && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Co-Applicant Details</CardTitle>
                      <CardDescription>Co-applicant information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Vehicle Details (for Auto Loans) */}
                {lead.additionalDetails?.leadType === 'Auto Loan' && (lead.additionalDetails?.vehicleBrandName || lead.additionalDetails?.vehicleModelName) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Details</CardTitle>
                      <CardDescription>Vehicle information for auto loan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {lead.additionalDetails.vehicleBrandName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Vehicle Brand</p>
                            <p className="font-medium">{lead.additionalDetails.vehicleBrandName}</p>
                          </div>
                        )}
                        {lead.additionalDetails.vehicleModelName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Vehicle Model</p>
                            <p className="font-medium">{lead.additionalDetails.vehicleModelName}</p>
                          </div>
                        )}
                        {lead.additionalDetails.vehicleVariant && (
                          <div>
                            <p className="text-sm text-muted-foreground">Vehicle Variant</p>
                            <p className="font-medium">{lead.additionalDetails.vehicleVariant}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Professional Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>Employment and business information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {renderFieldWithVerification('Job Title', lead.job || 'Not specified', 'jobTitle')}
                        {renderFieldWithVerification('Company', lead.additionalDetails?.company || 'Not specified', 'companyName')}
                        {renderFieldWithVerification('Designation', lead.additionalDetails?.designation || 'Not specified', 'designation')}
                        {lead.additionalDetails?.employmentType && 
                          renderFieldWithVerification('Employment Type', lead.additionalDetails.employmentType, 'employmentType')
                        }
                      </div>
                      <div className="space-y-4">
                        {renderFieldWithVerification('Work Experience', lead.additionalDetails?.workExperience || 'Not specified', 'workExperience')}
                        {lead.additionalDetails?.currentJobDuration && 
                          renderFieldWithVerification('Current Job Duration', lead.additionalDetails.currentJobDuration, 'currentJobDuration')
                        }
                        {officeAddress && (
                          <div>
                            <p className="text-sm text-muted-foreground">Office Address</p>
                            <p className="font-medium">{officeAddress.street}</p>
                            <p className="text-sm">{officeAddress.city}, {officeAddress.state} - {officeAddress.pincode}</p>
                            {isTVT && (
                              <div className="mt-2">
                                <FieldVerificationButton
                                  leadId={lead.id}
                                  fieldName="officeAddress"
                                  fieldValue={`${officeAddress.street}, ${officeAddress.city}, ${officeAddress.state} - ${officeAddress.pincode}`}
                                  currentUserId={currentUser.id}
                                  isVerified={fieldVerifications['officeAddress']?.isVerified || false}
                                  verificationNotes={fieldVerifications['officeAddress']?.notes || ''}
                                  onVerificationUpdate={() => loadFieldVerifications(lead.id)}
                                />
                              </div>
                            )}
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
                        {renderFieldWithVerification(
                          'Monthly Income', 
                          lead.additionalDetails?.monthlyIncome ? `₹${Number(lead.additionalDetails.monthlyIncome).toLocaleString()}/month` : 'Not specified',
                          'monthlyIncome'
                        )}
                        {renderFieldWithVerification(
                          'Annual Income',
                          lead.additionalDetails?.annualIncome ? `₹${Number(lead.additionalDetails.annualIncome).toLocaleString()}/year` : 'Not specified',
                          'annualIncome'
                        )}
                      </div>
                      <div className="space-y-4">
                        {lead.additionalDetails?.otherIncome && 
                          renderFieldWithVerification(
                            'Other Income',
                            `₹${Number(lead.additionalDetails.otherIncome).toLocaleString()}`,
                            'otherIncome'
                          )
                        }
                        {lead.additionalDetails?.propertyType && 
                          renderFieldWithVerification('Property Type', lead.additionalDetails.propertyType, 'propertyType')
                        }
                        {lead.additionalDetails?.ownershipStatus && 
                          renderFieldWithVerification('Ownership Status', lead.additionalDetails.ownershipStatus, 'ownershipStatus')
                        }
                        {lead.additionalDetails?.propertyAge && 
                          renderFieldWithVerification('Property Age', `${lead.additionalDetails.propertyAge} years`, 'propertyAge')
                        }
                        {homeAddress && (
                          <div>
                            <p className="text-sm text-muted-foreground">Home Address</p>
                            <p className="font-medium">{homeAddress.street}</p>
                            <p className="text-sm">{homeAddress.city}, {homeAddress.state} - {homeAddress.pincode}</p>
                            {isTVT && (
                              <div className="mt-2">
                                <FieldVerificationButton
                                  leadId={lead.id}
                                  fieldName="homeAddress"
                                  fieldValue={`${homeAddress.street}, ${homeAddress.city}, ${homeAddress.state} - ${homeAddress.pincode}`}
                                  currentUserId={currentUser.id}
                                  isVerified={fieldVerifications['homeAddress']?.isVerified || false}
                                  verificationNotes={fieldVerifications['homeAddress']?.notes || ''}
                                  onVerificationUpdate={() => loadFieldVerifications(lead.id)}
                                />
                              </div>
                            )}
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
                      </div>
                      <div className="space-y-4">
                        {lead.instructions && (
                          <div>
                            <p className="text-sm text-muted-foreground">Special Instructions</p>
                            <p className="font-medium">{lead.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {!isTVT && (
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
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
