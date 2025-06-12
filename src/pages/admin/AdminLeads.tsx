
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { getLeadsFromDatabase } from '@/lib/lead-operations';

// Simple search criteria interface
interface SearchCriteria {
  status?: string;
  bank?: string;
  assignedTo?: string;
}

const AdminLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadLeads();
  }, [navigate]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      // Try to get leads from database first
      const dbLeads = await getLeadsFromDatabase();
      
      if (dbLeads && dbLeads.length > 0) {
        setLeads(dbLeads);
        return;
      }
    } catch (error) {
      console.error('Error loading leads from database:', error);
      toast({
        title: "Error",
        description: "Failed to load leads from database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }

    // Fall back to localStorage
    const storedLeads = localStorage.getItem('mockLeads');
    if (storedLeads) {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        const transformedLeads = parsedLeads.map((lead: any) => ({
          ...lead,
          address: {
            id: lead.address?.id || `addr-${Date.now()}`,
            type: lead.address?.type || 'Residence',
            street: lead.address?.street || '',
            city: lead.address?.city || '',
            district: lead.address?.district || '',
            state: lead.address?.state || '',
            pincode: lead.address?.pincode || ''
          },
          additionalDetails: {
            company: lead.additionalDetails?.company || '',
            designation: lead.additionalDetails?.designation || '',
            workExperience: lead.additionalDetails?.workExperience || '',
            propertyType: lead.additionalDetails?.propertyType || '',
            ownershipStatus: lead.additionalDetails?.ownershipStatus || '',
            propertyAge: lead.additionalDetails?.propertyAge || '',
            monthlyIncome: lead.additionalDetails?.monthlyIncome || '',
            annualIncome: lead.additionalDetails?.annualIncome || '',
            otherIncome: lead.additionalDetails?.otherIncome || '',
            phoneNumber: lead.additionalDetails?.phoneNumber || '',
            email: lead.additionalDetails?.email || '',
            dateOfBirth: lead.additionalDetails?.dateOfBirth || '',
            gender: lead.additionalDetails?.gender || 'Male',
            maritalStatus: lead.additionalDetails?.maritalStatus || 'Single',
            fatherName: lead.additionalDetails?.fatherName || '',
            motherName: lead.additionalDetails?.motherName || '',
            spouseName: lead.additionalDetails?.spouseName || '',
            agencyFileNo: lead.additionalDetails?.agencyFileNo || '',
            applicationBarcode: lead.additionalDetails?.applicationBarcode || '',
            caseId: lead.additionalDetails?.caseId || '',
            schemeDesc: lead.additionalDetails?.schemeDesc || '',
            bankBranch: lead.additionalDetails?.bankBranch || '',
            additionalComments: lead.additionalDetails?.additionalComments || '',
            leadType: lead.additionalDetails?.leadType || '',
            leadTypeId: lead.additionalDetails?.leadTypeId || '',
            loanAmount: lead.additionalDetails?.loanAmount || '',
            loanType: lead.additionalDetails?.loanType || '',
            vehicleBrandName: lead.additionalDetails?.vehicleBrandName || '',
            vehicleBrandId: lead.additionalDetails?.vehicleBrandId || '',
            vehicleModelName: lead.additionalDetails?.vehicleModelName || '',
            vehicleModelId: lead.additionalDetails?.vehicleModelId || '',
            addresses: lead.additionalDetails?.addresses || [],
            phoneNumbers: lead.additionalDetails?.phoneNumbers || []
          }
        }));
        setLeads(transformedLeads);
      } catch (error) {
        console.error("Error parsing stored leads:", error);
        setLeads([]);
      }
    } else {
      setLeads([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleAddLead = () => {
    navigate('/admin/add-lead');
  };

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

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
          <div className="container mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Lead Management</h1>
              <Button onClick={handleAddLead} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Lead
              </Button>
            </div>

            {/* Search and Filter Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
                <CardDescription>Find leads using various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select onValueChange={(value) => setSearchCriteria({...searchCriteria, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="bank-filter">Bank</Label>
                    <Select onValueChange={(value) => setSearchCriteria({...searchCriteria, bank: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All banks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Banks</SelectItem>
                        <SelectItem value="SBI">State Bank of India</SelectItem>
                        <SelectItem value="HDFC">HDFC Bank</SelectItem>
                        <SelectItem value="ICICI">ICICI Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="search-name">Customer Name</Label>
                    <Input 
                      id="search-name" 
                      placeholder="Search by name..." 
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leads List */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <p>Loading leads...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {leads.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">No leads found</p>
                      <Button onClick={handleAddLead}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Lead
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  leads.map((lead) => (
                    <Card key={lead.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{lead.name}</h3>
                              <Badge variant={getStatusBadgeVariant(lead.status)}>
                                {lead.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div>
                                <p><strong>Bank:</strong> {lead.bank || 'Not specified'}</p>
                                <p><strong>Visit Type:</strong> {lead.visitType}</p>
                              </div>
                              <div>
                                <p><strong>Phone:</strong> {lead.additionalDetails?.phoneNumber || 'Not provided'}</p>
                                <p><strong>Email:</strong> {lead.additionalDetails?.email || 'Not provided'}</p>
                              </div>
                              <div>
                                <p><strong>City:</strong> {lead.address?.city || 'Not specified'}</p>
                                <p><strong>Created:</strong> {new Date(lead.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/lead/${lead.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/add-lead/${lead.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Handle delete
                                toast({
                                  title: "Lead deleted",
                                  description: `Lead ${lead.name} has been deleted.`,
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeads;
