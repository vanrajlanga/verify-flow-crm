
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FileText, 
  ArrowLeft, 
  MapPin, 
  User, 
  Building, 
  Phone, 
  Calendar, 
  Home, 
  Briefcase, 
  DollarSign, 
  Eye,
  Edit,
  Car,
  Users,
  CreditCard,
  FileImage,
  Download
} from 'lucide-react';
import { getLeadById } from '@/lib/supabase-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditLeadForm from '@/components/admin/EditLeadForm';

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
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  
  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        // Get leads from localStorage first
        const storedLeads = localStorage.getItem('mockLeads');
        let allLeads = [];
        
        if (storedLeads) {
          try {
            allLeads = JSON.parse(storedLeads);
          } catch (error) {
            console.error("Error parsing stored leads:", error);
          }
        }
        
        // Try finding the lead
        let foundLead = await getLeadById(leadId || '');
        
        if (!foundLead && allLeads && allLeads.length > 0) {
          foundLead = allLeads.find((l: any) => l.id === leadId);
        }
        
        if (foundLead) {
          setLead(foundLead);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lead data:', error);
        setLoading(false);
      }
    };
    
    fetchLeadData();
  }, [leadId]);

  const handleUpdateLead = (updatedLead: any) => {
    setLead(updatedLead);
    // Update localStorage
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
    setShowEditForm(false);
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Lead Details - {lead.name}</h1>
            {lead.status && getStatusBadge(lead.status)}
          </div>
          <Button onClick={() => setShowEditForm(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Lead
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="step1" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="step1">Bank Details</TabsTrigger>
            <TabsTrigger value="step2">Applicant Info</TabsTrigger>
            <TabsTrigger value="step3">Co-Applicant</TabsTrigger>
            <TabsTrigger value="step4">Addresses</TabsTrigger>
            <TabsTrigger value="step5">Professional</TabsTrigger>
            <TabsTrigger value="step6">Financial</TabsTrigger>
            <TabsTrigger value="step7">Vehicle Details</TabsTrigger>
            <TabsTrigger value="step8">Documents</TabsTrigger>
            <TabsTrigger value="step9">Instructions</TabsTrigger>
          </TabsList>

          {/* Step 1: Bank & Product Details */}
          <TabsContent value="step1" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Bank & Product Details
                </CardTitle>
                <CardDescription>Banking and product information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Applicant Information */}
          <TabsContent value="step2" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Applicant Information
                </CardTitle>
                <CardDescription>Primary applicant details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{lead.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Father's Name</p>
                    <p className="font-medium">{lead.additionalDetails?.fatherName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mother's Name</p>
                    <p className="font-medium">{lead.additionalDetails?.motherName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{lead.additionalDetails?.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {lead.additionalDetails?.dateOfBirth ? format(new Date(lead.additionalDetails.dateOfBirth), 'MMM d, yyyy') : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{lead.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marital Status</p>
                    <p className="font-medium">{lead.additionalDetails?.maritalStatus || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{lead.additionalDetails?.phoneNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{lead.additionalDetails?.email || 'Not specified'}</p>
                  </div>
                </div>
                {lead.additionalDetails?.spouseName && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Spouse Name</p>
                    <p className="font-medium">{lead.additionalDetails.spouseName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Co-Applicant Information */}
          <TabsContent value="step3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Co-Applicant Information
                </CardTitle>
                <CardDescription>Co-applicant details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.additionalDetails?.coApplicant ? (
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
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{lead.additionalDetails.coApplicant.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">{lead.additionalDetails.coApplicant.age || 'Not specified'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No co-applicant information provided</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Address Information */}
          <TabsContent value="step4" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
                <CardDescription>Primary and additional addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Address */}
                <div>
                  <h4 className="font-semibold mb-3">Primary Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Street</p>
                      <p className="font-medium">{lead.address?.street || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{lead.address?.city || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">District</p>
                      <p className="font-medium">{lead.address?.district || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-medium">{lead.address?.state || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pincode</p>
                      <p className="font-medium">{lead.address?.pincode || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Addresses */}
                {lead.additionalDetails?.addresses && lead.additionalDetails.addresses.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-3">Additional Addresses</h4>
                    {lead.additionalDetails.addresses.map((addr: any, index: number) => (
                      <div key={index} className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium mb-2">{addr.type} Address</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Street</p>
                            <p className="font-medium">{addr.street}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">City</p>
                            <p className="font-medium">{addr.city}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">District</p>
                            <p className="font-medium">{addr.district}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">State</p>
                            <p className="font-medium">{addr.state}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pincode</p>
                            <p className="font-medium">{addr.pincode}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Professional Details */}
          <TabsContent value="step5" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Details
                </CardTitle>
                <CardDescription>Employment and business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{lead.additionalDetails?.company || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Designation</p>
                    <p className="font-medium">{lead.additionalDetails?.designation || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employment Type</p>
                    <p className="font-medium">{lead.additionalDetails?.employmentType || 'Not specified'}</p>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 6: Financial Details */}
          <TabsContent value="step6" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </CardTitle>
                <CardDescription>Income and property information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="font-medium">
                      {lead.additionalDetails?.monthlyIncome ? `₹${Number(lead.additionalDetails.monthlyIncome).toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Income</p>
                    <p className="font-medium">
                      {lead.additionalDetails?.annualIncome ? `₹${Number(lead.additionalDetails.annualIncome).toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Other Income</p>
                    <p className="font-medium">
                      {lead.additionalDetails?.otherIncome ? `₹${Number(lead.additionalDetails.otherIncome).toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="font-medium">
                      {lead.additionalDetails?.loanAmount ? `₹${Number(lead.additionalDetails.loanAmount).toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium">{lead.additionalDetails?.propertyType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ownership Status</p>
                    <p className="font-medium">{lead.additionalDetails?.ownershipStatus || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 7: Vehicle Details */}
          <TabsContent value="step7" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Details
                </CardTitle>
                <CardDescription>Vehicle information for auto loans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.additionalDetails?.leadType === 'Auto Loan' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle Type</p>
                      <p className="font-medium">{lead.additionalDetails?.vehicleType || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle Price</p>
                      <p className="font-medium">
                        {lead.additionalDetails?.vehiclePrice ? `₹${Number(lead.additionalDetails.vehiclePrice).toLocaleString()}` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Down Payment</p>
                      <p className="font-medium">
                        {lead.additionalDetails?.downPayment ? `₹${Number(lead.additionalDetails.downPayment).toLocaleString()}` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Vehicle details not applicable for this loan type</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 8: Documents */}
          <TabsContent value="step8" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Documents
                </CardTitle>
                <CardDescription>All documents uploaded for this application</CardDescription>
              </CardHeader>
              <CardContent>
                {lead.documents && lead.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lead.documents.map((doc: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileImage className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-sm">{doc.name || `Document ${index + 1}`}</span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{doc.name || `Document ${index + 1}`}</DialogTitle>
                                <DialogDescription>
                                  Document type: {doc.type || 'Unknown'} • 
                                  Uploaded: {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'Unknown date'}
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
                        <p className="text-xs text-muted-foreground mb-2">
                          Type: {doc.type || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'Unknown date'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 9: Instructions & Assignment */}
          <TabsContent value="step9" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Instructions & Assignment
                </CardTitle>
                <CardDescription>Special instructions and assignment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Agent</p>
                    <p className="font-medium">{lead.assignedTo || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Visit Type</p>
                    <p className="font-medium">{lead.visitType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(lead.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created Date</p>
                    <p className="font-medium">
                      {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy') : 'Not available'}
                    </p>
                  </div>
                </div>
                
                {lead.instructions && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Special Instructions</p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="font-medium">{lead.instructions}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Form Dialog */}
        {showEditForm && (
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Lead - {lead.name}</DialogTitle>
                <DialogDescription>
                  Update lead information and details
                </DialogDescription>
              </DialogHeader>
              <EditLeadForm
                lead={lead}
                agents={[]}
                banks={[]}
                onUpdate={handleUpdateLead}
                onClose={() => setShowEditForm(false)}
                locationData={{}}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default LeadDetail;
