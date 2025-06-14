
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

const TvtLeadDetail = () => {
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
    // Fix: Check for 'tvtteam' role instead of 'tvt'
    if (parsedUser.role !== 'tvtteam') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    
    if (leadId) {
      loadLeadDetail(leadId);
    }
  }, [navigate, leadId]);

  const loadLeadDetail = async (id: string) => {
    try {
      setLoading(true);
      console.log('TVT: Loading lead detail for ID:', id);
      
      const leadData = await getLeadByIdFromDatabase(id);
      
      if (leadData) {
        setLead(leadData);
        console.log('TVT: Lead detail loaded successfully:', leadData.name);
      } else {
        console.log('TVT: No lead found with ID:', id);
        toast({
          title: "Lead not found",
          description: `No lead found with ID: ${id}`,
          variant: "destructive"
        });
        navigate('/tvt/dashboard');
      }
    } catch (error) {
      console.error('TVT: Error loading lead detail:', error);
      toast({
        title: "Error loading lead",
        description: "Failed to load lead details. Please try again.",
        variant: "destructive"
      });
      navigate('/tvt/dashboard');
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
                <Button onClick={() => navigate('/tvt/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
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
                  onClick={() => navigate('/tvt/dashboard')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
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

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
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

export default TvtLeadDetail;
