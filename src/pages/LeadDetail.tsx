
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Building, Phone, Mail, Calendar, User, FileText } from 'lucide-react';
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
          <div className="max-w-6xl mx-auto space-y-6">
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

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-base">{lead.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Age</label>
                    <p className="text-base">{lead.age} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                    <p className="text-base">{lead.job || 'Not specified'}</p>
                  </div>
                  {lead.additionalDetails?.designation && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Designation</label>
                      <p className="text-base">{lead.additionalDetails.designation}</p>
                    </div>
                  )}
                  {lead.additionalDetails?.company && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company</label>
                      <p className="text-base">{lead.additionalDetails.company}</p>
                    </div>
                  )}
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
                  {lead.additionalDetails?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.additionalDetails.phoneNumber}</span>
                    </div>
                  )}
                  {lead.additionalDetails?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.additionalDetails.email}</span>
                    </div>
                  )}
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm">{lead.address.street}</p>
                        <p className="text-sm">{lead.address.city}, {lead.address.district}</p>
                        <p className="text-sm">{lead.address.state} - {lead.address.pincode}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead.additionalDetails?.monthlyIncome && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
                      <p className="text-base">₹{lead.additionalDetails.monthlyIncome}</p>
                    </div>
                  )}
                  {lead.additionalDetails?.annualIncome && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Annual Income</label>
                      <p className="text-base">₹{lead.additionalDetails.annualIncome}</p>
                    </div>
                  )}
                  {lead.additionalDetails?.loanAmount && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Loan Amount</label>
                      <p className="text-base">₹{lead.additionalDetails.loanAmount}</p>
                    </div>
                  )}
                  {lead.bank && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bank</label>
                      <p className="text-base">{lead.bank}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Details
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
