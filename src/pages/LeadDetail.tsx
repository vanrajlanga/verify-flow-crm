
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lead, User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Phone, Mail, Building, CreditCard, Calendar, User as UserIcon, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getLeadsFromDatabase } from '@/lib/lead-operations';

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
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
  }, [id, navigate]);

  const loadLead = async () => {
    if (!id) {
      toast({
        title: "Error",
        description: "Lead ID not provided.",
        variant: "destructive",
      });
      navigate('/admin/leads');
      return;
    }

    setLoading(true);
    try {
      // Try to get leads from database first
      const dbLeads = await getLeadsFromDatabase();
      const foundLead = dbLeads.find(l => l.id === id);
      
      if (foundLead) {
        setLead(foundLead);
        setLoading(false);
        return;
      }

      // Fall back to localStorage
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        const foundLead = leads.find((l: Lead) => l.id === id);
        if (foundLead) {
          setLead(foundLead);
        } else {
          toast({
            title: "Lead not found",
            description: "The requested lead could not be found.",
            variant: "destructive",
          });
          navigate('/admin/leads');
        }
      } else {
        toast({
          title: "No leads found",
          description: "No leads data available.",
          variant: "destructive",
        });
        navigate('/admin/leads');
      }
    } catch (error) {
      console.error('Error loading lead:', error);
      toast({
        title: "Error",
        description: "Failed to load lead details.",
        variant: "destructive",
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

  const handleEdit = () => {
    if (currentUser?.role === 'admin') {
      navigate(`/admin/add-lead/${lead?.id}`);
    } else {
      navigate(`/agent/leads/${lead?.id}/edit`);
    }
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
    return `${address.street || ''}, ${address.city || ''}, ${address.district || ''}, ${address.state || ''} - ${address.pincode || ''}`.replace(/^,\s*|,\s*$/g, '');
  };

  const getBankName = (bankId: string) => {
    try {
      const storedBanks = localStorage.getItem('mockBanks');
      if (storedBanks) {
        const banks = JSON.parse(storedBanks);
        const bank = banks.find((b: any) => b.id === bankId);
        return bank ? bank.name : bankId;
      }
    } catch (error) {
      console.error('Error getting bank name:', error);
    }
    return bankId;
  };

  const getAgentName = (agentId: string) => {
    try {
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const agent = users.find((u: User) => u.id === agentId && u.role === 'agent');
        return agent ? agent.name : 'Unassigned';
      }
    } catch (error) {
      console.error('Error getting agent name:', error);
    }
    return 'Unassigned';
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
          <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
            <p>Loading lead details...</p>
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
          <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
            <p>Lead not found.</p>
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
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(currentUser.role === 'admin' ? '/admin/leads' : '/agent/leads')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
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
                {currentUser.role === 'admin' && (
                  <Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Lead
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{lead.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{lead.age || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job/Designation</p>
                    <p className="font-medium">{lead.additionalDetails?.designation || lead.job || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Agency File No</p>
                    <p className="font-medium">{lead.additionalDetails?.agencyFileNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Application Barcode</p>
                    <p className="font-medium">{lead.additionalDetails?.applicationBarcode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Case ID</p>
                    <p className="font-medium">{lead.additionalDetails?.caseId || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{lead.additionalDetails?.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{lead.additionalDetails?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{lead.additionalDetails?.dateOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{lead.additionalDetails?.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marital Status</p>
                    <p className="font-medium">{lead.additionalDetails?.maritalStatus || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Lead Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Type</p>
                    <p className="font-medium">{lead.additionalDetails?.leadType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="font-medium">{lead.additionalDetails?.loanAmount ? `₹${lead.additionalDetails.loanAmount}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-medium">{getBankName(lead.bank || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Visit Type</p>
                    <p className="font-medium">{lead.visitType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Agent</p>
                    <p className="font-medium">{getAgentName(lead.assignedTo || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created Date</p>
                    <p className="font-medium">{formatDate(lead.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Residence Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formatAddress(lead.address)}</p>
                </CardContent>
              </Card>

              {lead.additionalDetails?.addresses && lead.additionalDetails.addresses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Additional Addresses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lead.additionalDetails.addresses.map((addr, index) => (
                      <div key={index}>
                        <p className="text-sm font-medium">{addr.type}</p>
                        <p className="text-sm text-muted-foreground">{formatAddress(addr)}</p>
                        {index < lead.additionalDetails!.addresses!.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Financial Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="font-medium">{lead.additionalDetails?.monthlyIncome ? `₹${lead.additionalDetails.monthlyIncome}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Income</p>
                    <p className="font-medium">{lead.additionalDetails?.annualIncome ? `₹${lead.additionalDetails.annualIncome}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Other Income</p>
                    <p className="font-medium">{lead.additionalDetails?.otherIncome ? `₹${lead.additionalDetails.otherIncome}` : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(lead.instructions || lead.additionalDetails?.additionalComments) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead.instructions && (
                    <div>
                      <p className="text-sm text-muted-foreground">Instructions</p>
                      <p className="text-sm">{lead.instructions}</p>
                    </div>
                  )}
                  {lead.additionalDetails?.additionalComments && (
                    <div>
                      <p className="text-sm text-muted-foreground">Additional Comments</p>
                      <p className="text-sm">{lead.additionalDetails.additionalComments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Verification Status */}
            {lead.verification && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={getStatusBadgeVariant(lead.verification.status)}>
                        {lead.verification.status}
                      </Badge>
                    </div>
                    {lead.verification.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{lead.verification.notes}</p>
                      </div>
                    )}
                  </div>
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
