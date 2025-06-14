
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Building, Phone, Mail, Calendar, User, FileText, Briefcase, Car, DollarSign, Users, ClipboardList } from 'lucide-react';
import { Lead, User as UserType } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { getLeadByIdFromDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';

const LeadDetail = () => {
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
    setCurrentUser(parsedUser);
    
    if (leadId) {
      loadLeadDetail(leadId);
    }
  }, [navigate, leadId]);

  const loadLeadDetail = async (id: string) => {
    try {
      setLoading(true);
      console.log('Loading lead detail for ID:', id);
      
      const leadData = await getLeadByIdFromDatabase(id);
      
      if (leadData) {
        setLead(leadData);
        console.log('Lead detail loaded successfully:', leadData.name);
      } else {
        console.log('No lead found with ID:', id);
        toast({
          title: "Lead not found",
          description: `No lead found with ID: ${id}`,
          variant: "destructive"
        });
        navigate('/admin/leads');
      }
    } catch (error) {
      console.error('Error loading lead detail:', error);
      toast({
        title: "Error loading lead",
        description: "Failed to load lead details. Please try again.",
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
                <Button onClick={() => navigate('/admin/leads')}>
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
                  onClick={() => navigate('/admin/leads')}
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
              <Badge className={getStatusColor(lead.status)}>
                {lead.status}
              </Badge>
            </div>

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
                    <p className="text-base">{lead.bank || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bank Product</label>
                    <p className="text-base">{lead.additionalDetails?.bankProduct || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Initiated Under Branch</label>
                    <p className="text-base">{lead.additionalDetails?.initiatedUnderBranch || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bank Branch</label>
                    <p className="text-base">{lead.additionalDetails?.bankBranch || 'Not specified'}</p>
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
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                    <p className="text-base">{lead.additionalDetails?.fatherName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mother's Name</label>
                    <p className="text-base">{lead.additionalDetails?.motherName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.additionalDetails?.dateOfBirth ? new Date(lead.additionalDetails.dateOfBirth).toLocaleDateString() : 'Not specified'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-base">{lead.additionalDetails?.gender || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Co-Applicant Information */}
            {lead.additionalDetails?.coApplicant && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Co-Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-base">{lead.additionalDetails.coApplicant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{lead.additionalDetails.coApplicant.phone}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Age</label>
                      <p className="text-base">{lead.additionalDetails.coApplicant.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{lead.additionalDetails.coApplicant.email || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                      <p className="text-base">{lead.additionalDetails.coApplicant.relation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Address */}
                <div>
                  <h4 className="font-medium mb-3">Primary Address ({lead.address.type})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                      <p className="text-sm">{lead.address.street}</p>
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
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <p className="text-sm">{lead.address.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Pincode</label>
                      <p className="text-sm">{lead.address.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Addresses */}
                {lead.additionalDetails?.addresses && lead.additionalDetails.addresses.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">Additional Addresses</h4>
                      <div className="space-y-4">
                        {lead.additionalDetails.addresses.map((addr, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h5 className="font-medium mb-2">{addr.type} Address</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                                <p className="text-sm">{addr.street}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">State</label>
                                <p className="text-sm">{addr.state}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">District</label>
                                <p className="text-sm">{addr.district}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">City</label>
                                <p className="text-sm">{addr.city}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Pincode</label>
                                <p className="text-sm">{addr.pincode}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
                    <label className="text-sm font-medium text-muted-foreground">Work Experience</label>
                    <p className="text-base">{lead.additionalDetails?.workExperience || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
                    <p className="text-base">₹{lead.additionalDetails?.monthlyIncome || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                    <p className="text-base">{lead.additionalDetails?.propertyType || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ownership Status</label>
                    <p className="text-base">{lead.additionalDetails?.ownershipStatus || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property Age</label>
                    <p className="text-base">{lead.additionalDetails?.propertyAge || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            {(lead.additionalDetails?.vehicleBrandName || lead.additionalDetails?.vehicleModelName || lead.additionalDetails?.loanType) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle Type</label>
                      <p className="text-base">{lead.additionalDetails?.loanType || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle Brand</label>
                      <p className="text-base">{lead.additionalDetails?.vehicleBrandName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle Model</label>
                      <p className="text-base">{lead.additionalDetails?.vehicleModelName || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Annual Income</label>
                    <p className="text-base">₹{lead.additionalDetails?.annualIncome || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Other Income</label>
                    <p className="text-base">₹{lead.additionalDetails?.otherIncome || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Loan Amount</label>
                    <p className="text-base">₹{lead.additionalDetails?.loanAmount || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Document management functionality will be available in a future update</p>
                  <p className="text-sm text-gray-400 mt-2">Required: Aadhaar Card, PAN Card, Salary Slip, Bank Statement, Property Documents, Income Tax Returns</p>
                </div>
              </CardContent>
            </Card>

            {/* Assignment & Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Assignment & Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Visit Type</label>
                    <p className="text-base">{lead.visitType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <p className="text-base">{lead.assignedTo || 'Unassigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-base">{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {lead.verificationDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verification Date</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">{new Date(lead.verificationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {lead.instructions && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Special Instructions</label>
                      <p className="text-base mt-2 p-3 bg-muted rounded-md">{lead.instructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadDetail;
