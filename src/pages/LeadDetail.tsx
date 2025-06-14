
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Building, Calendar, User, Phone, FileText, Briefcase, CreditCard } from 'lucide-react';
import { Lead, User as UserType } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import DocumentViewer from '@/components/shared/DocumentViewer';
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
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
  }, [navigate]);

  useEffect(() => {
    if (leadId && currentUser) {
      loadLead();
    }
  }, [leadId, currentUser]);

  const loadLead = async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      console.log('Loading lead details:', leadId);
      const leadData = await getLeadByIdFromDatabase(leadId);
      
      if (!leadData) {
        toast({
          title: "Lead not found",
          description: "The requested lead could not be found.",
          variant: "destructive"
        });
        navigate('/admin/leads');
        return;
      }
      
      setLead(leadData);
      console.log('Lead loaded:', leadData);
    } catch (error) {
      console.error('Error loading lead:', error);
      toast({
        title: "Error loading lead",
        description: "Failed to load lead data. Please try again.",
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

  const handleBack = () => {
    navigate('/admin/leads');
  };

  const handleEdit = () => {
    navigate(`/admin/leads/edit/${leadId}`);
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Leads
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {loading ? 'Loading...' : `Lead Details - ${lead?.name || 'Unknown'}`}
                  </h1>
                  <p className="text-muted-foreground">
                    {loading ? 'Loading lead information...' : `ID: ${lead?.id || 'Unknown'}`}
                  </p>
                </div>
              </div>
              
              {!loading && lead && (
                <Button onClick={handleEdit}>
                  Edit Lead
                </Button>
              )}
            </div>

            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Loading lead details...</h3>
                    <p className="text-muted-foreground">Please wait while we fetch the lead information.</p>
                  </div>
                </CardContent>
              </Card>
            ) : lead ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Full Name</h4>
                          <p className="font-medium">{lead.name}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Occupation</h4>
                          <p>{lead.job}</p>
                        </div>
                        {lead.additionalDetails?.phoneNumber && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Phone Number</h4>
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {lead.additionalDetails.phoneNumber}
                            </p>
                          </div>
                        )}
                        {lead.additionalDetails?.company && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Company</h4>
                            <p className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {lead.additionalDetails.company}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{lead.address.type}</Badge>
                          <Badge variant={getStatusBadgeVariant(lead.visitType)}>{lead.visitType} Visit</Badge>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{lead.address.street}</p>
                          <p className="text-muted-foreground">
                            {lead.address.city}, {lead.address.district}
                          </p>
                          <p className="text-muted-foreground">
                            {lead.address.state} - {lead.address.pincode}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank & Loan Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Bank & Loan Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Bank</h4>
                          <p className="font-medium">{lead.bank}</p>
                        </div>
                        {lead.additionalDetails?.loanAmount && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Loan Amount</h4>
                            <p>₹{parseInt(lead.additionalDetails.loanAmount).toLocaleString()}</p>
                          </div>
                        )}
                        {lead.additionalDetails?.loanType && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Loan Type</h4>
                            <p>{lead.additionalDetails.loanType}</p>
                          </div>
                        )}
                        {lead.additionalDetails?.agencyFileNo && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Agency File No</h4>
                            <p>{lead.additionalDetails.agencyFileNo}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instructions */}
                  {lead.instructions && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Instructions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{lead.instructions}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Documents */}
                  {lead.documents && lead.documents.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>Documents uploaded for this lead</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DocumentViewer documents={lead.documents} />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar Information */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={getStatusBadgeVariant(lead.status)} className="text-sm">
                        {lead.status}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Assignment Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Assignment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Assigned To</h4>
                        <p>{lead.assignedTo || 'Not assigned'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                        <p className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {lead.verificationDate && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Verification Date</h4>
                          <p className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            {new Date(lead.verificationDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  {(lead.additionalDetails?.monthlyIncome || lead.additionalDetails?.annualIncome) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Financial Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {lead.additionalDetails.monthlyIncome && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Monthly Income</h4>
                            <p>₹{parseInt(lead.additionalDetails.monthlyIncome).toLocaleString()}</p>
                          </div>
                        )}
                        {lead.additionalDetails.annualIncome && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Annual Income</h4>
                            <p>₹{parseInt(lead.additionalDetails.annualIncome).toLocaleString()}</p>
                          </div>
                        )}
                        {lead.additionalDetails.otherIncome && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Other Income</h4>
                            <p>₹{parseInt(lead.additionalDetails.otherIncome).toLocaleString()}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Lead not found</h3>
                    <p className="text-muted-foreground">The requested lead could not be found.</p>
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
