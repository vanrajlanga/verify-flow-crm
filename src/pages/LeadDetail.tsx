
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Lead } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Building, Car, CreditCard } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getLeadsFromDatabase } from '@/lib/lead-operations';

const LeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    loadLead();
  }, [navigate, leadId]);

  const loadLead = async () => {
    if (!leadId) {
      toast({
        title: "Error",
        description: "No lead ID provided.",
        variant: "destructive",
      });
      navigate('/admin/leads');
      return;
    }

    try {
      // Try to get lead from database first
      const dbLeads = await getLeadsFromDatabase();
      const foundLead = dbLeads.find(l => l.id === leadId);
      
      if (foundLead) {
        setLead(foundLead);
        setLoading(false);
        return;
      }

      // Fall back to localStorage
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        const foundLead = leads.find((l: any) => l.id === leadId);
        if (foundLead) {
          setLead(foundLead);
        } else {
          toast({
            title: "Lead not found",
            description: "The lead you're looking for could not be found.",
            variant: "destructive",
          });
          navigate('/admin/leads');
        }
      }
    } catch (error) {
      console.error('Error loading lead:', error);
      toast({
        title: "Error",
        description: "Failed to load lead details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleEdit = () => {
    navigate(`/admin/add-lead/${leadId}`);
  };

  const getBankName = (bankId: string) => {
    const bankNames = {
      'bank-1': 'State Bank of India',
      'bank-2': 'HDFC Bank',
      'bank-3': 'ICICI Bank'
    };
    return bankNames[bankId as keyof typeof bankNames] || bankId;
  };

  const getAgentName = (agentId: string) => {
    try {
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const agent = users.find((user: User) => user.id === agentId);
        return agent ? agent.name : 'Unassigned';
      }
    } catch (error) {
      console.error('Error getting agent name:', error);
    }
    return 'Unassigned';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
      case 'Assigned':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    const parts = [
      address.street,
      address.city,
      address.district,
      address.state,
      address.pincode
    ].filter(Boolean);
    return parts.join(', ') || 'N/A';
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
            <div className="flex items-center justify-center h-48">
              <p>Loading lead details...</p>
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
            <div className="flex items-center justify-center h-48">
              <p>Lead not found</p>
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
            {/* Header Section */}
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
                  <h1 className="text-2xl font-semibold">{lead.name}</h1>
                  <p className="text-muted-foreground">Lead ID: {lead.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(lead.status)}>
                  {lead.status}
                </Badge>
                <Button onClick={handleEdit} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Lead
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Lead Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Agency File No</label>
                      <p className="text-sm">{lead.additionalDetails?.agencyFileNo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Application Barcode</label>
                      <p className="text-sm">{lead.additionalDetails?.applicationBarcode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Case ID</label>
                      <p className="text-sm">{lead.additionalDetails?.caseId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Lead Type</label>
                      <p className="text-sm">{lead.additionalDetails?.leadType || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bank</label>
                      <p className="text-sm">{getBankName(lead.bank || '')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Branch</label>
                      <p className="text-sm">{lead.additionalDetails?.bankBranch || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Loan Amount</label>
                      <p className="text-sm">{lead.additionalDetails?.loanAmount ? `₹${lead.additionalDetails.loanAmount}` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Visit Type</label>
                      <p className="text-sm">{lead.visitType || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {lead.additionalDetails?.schemeDesc && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Scheme Description</label>
                      <p className="text-sm">{lead.additionalDetails.schemeDesc}</p>
                    </div>
                  )}
                  
                  {lead.instructions && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Instructions</label>
                      <p className="text-sm">{lead.instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assignment & Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned Agent</label>
                    <p className="text-sm">{getAgentName(lead.assignedTo || '')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                    <p className="text-sm">{formatDate(lead.createdAt)}</p>
                  </div>
                  {lead.verificationDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verification Date</label>
                      <p className="text-sm">{formatDate(lead.verificationDate)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Age</label>
                      <p className="text-sm">{lead.age || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gender</label>
                      <p className="text-sm">{lead.additionalDetails?.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <p className="text-sm">{lead.additionalDetails?.dateOfBirth || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                      <p className="text-sm">{lead.additionalDetails?.maritalStatus || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                    <p className="text-sm">{lead.additionalDetails?.fatherName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mother's Name</label>
                    <p className="text-sm">{lead.additionalDetails?.motherName || 'N/A'}</p>
                  </div>
                  {lead.additionalDetails?.spouseName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Spouse's Name</label>
                      <p className="text-sm">{lead.additionalDetails.spouseName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-sm">{lead.additionalDetails?.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{lead.additionalDetails?.email || 'N/A'}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Residence Address</label>
                    <p className="text-sm">{formatAddress(lead.address)}</p>
                  </div>
                  
                  {lead.additionalDetails?.addresses?.find(addr => addr.type === 'Office') && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Office Address</label>
                      <p className="text-sm">{formatAddress(lead.additionalDetails.addresses.find(addr => addr.type === 'Office'))}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p className="text-sm">{lead.additionalDetails?.company || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Designation</label>
                    <p className="text-sm">{lead.additionalDetails?.designation || lead.job || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Work Experience</label>
                    <p className="text-sm">{lead.additionalDetails?.workExperience || 'N/A'}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
                      <p className="text-sm">{lead.additionalDetails?.monthlyIncome ? `₹${lead.additionalDetails.monthlyIncome}` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Annual Income</label>
                      <p className="text-sm">{lead.additionalDetails?.annualIncome ? `₹${lead.additionalDetails.annualIncome}` : 'N/A'}</p>
                    </div>
                    {lead.additionalDetails?.otherIncome && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Other Income</label>
                        <p className="text-sm">₹{lead.additionalDetails.otherIncome}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information (if applicable) */}
              {(lead.additionalDetails?.vehicleBrandName || lead.additionalDetails?.vehicleModelName) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle Brand</label>
                      <p className="text-sm">{lead.additionalDetails?.vehicleBrandName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle Model</label>
                      <p className="text-sm">{lead.additionalDetails?.vehicleModelName || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Property Information (if applicable) */}
              {(lead.additionalDetails?.propertyType || lead.additionalDetails?.ownershipStatus) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Property Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                      <p className="text-sm">{lead.additionalDetails?.propertyType || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ownership Status</label>
                      <p className="text-sm">{lead.additionalDetails?.ownershipStatus || 'N/A'}</p>
                    </div>
                    {lead.additionalDetails?.propertyAge && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Property Age</label>
                        <p className="text-sm">{lead.additionalDetails.propertyAge}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Additional Comments */}
            {lead.additionalDetails?.additionalComments && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{lead.additionalDetails.additionalComments}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadDetail;
