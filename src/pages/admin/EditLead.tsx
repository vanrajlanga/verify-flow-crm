
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead, User } from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const EditLead = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadLead(id);
    }
  }, [id]);

  const loadLead = (leadId: string) => {
    try {
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        const foundLead = leads.find((l: Lead) => l.id === leadId);
        if (foundLead) {
          setLead(foundLead);
        } else {
          toast({
            title: "Error",
            description: "Lead not found",
            variant: "destructive"
          });
          navigate('/admin/leads');
        }
      }
    } catch (error) {
      console.error('Error loading lead:', error);
      toast({
        title: "Error",
        description: "Failed to load lead details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mockUsers: User[] = [
    {
      id: 'admin-1',
      name: 'Admin User',
      role: 'admin',
      email: 'admin@example.com',
      phone: '9999999999',
      district: 'Mumbai',
      status: 'Active',
      state: 'Maharashtra',
      city: 'Mumbai',
      baseLocation: 'Mumbai',
      maxTravelDistance: 50,
      extraChargePerKm: 10,
      profilePicture: null,
      totalVerifications: 0,
      completionRate: 100,
      password: 'password',
      documents: [],
      managedBankId: ''
    },
    {
      id: 'agent-1',
      name: 'Rajesh Kumar',
      role: 'agent',
      email: 'rajesh@example.com',
      phone: '9876543210',
      district: 'Mumbai',
      status: 'Active',
      state: 'Maharashtra',
      city: 'Mumbai',
      baseLocation: 'Mumbai',
      maxTravelDistance: 30,
      extraChargePerKm: 8,
      profilePicture: null,
      totalVerifications: 25,
      completionRate: 95,
      password: 'password',
      documents: [],
      managedBankId: ''
    },
    {
      id: 'tvt-1',
      name: 'Atul Sharma',
      role: 'tvtteam',
      email: 'atul@gmail.com',
      phone: '9876543212',
      district: 'Delhi',
      status: 'Active',
      state: 'Delhi',
      city: 'New Delhi',
      baseLocation: 'Delhi',
      maxTravelDistance: 25,
      extraChargePerKm: 12,
      profilePicture: null,
      totalVerifications: 15,
      completionRate: 98,
      password: '123456',
      documents: [],
      managedBankId: ''
    }
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lead) {
    return <div>Lead not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Edit Lead</h1>
          <p className="text-muted-foreground">Update lead information</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/leads')}>
          Back to Leads
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Details - {lead.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base">{lead.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bank</label>
                <p className="text-base">{lead.bank}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-base">{lead.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Visit Type</label>
                <p className="text-base">{lead.visitType}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-base">
                  {lead.address.street}, {lead.address.city}, {lead.address.district}, {lead.address.state} - {lead.address.pincode}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                <p className="text-base">{lead.assignedTo || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="text-base">{new Date(lead.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {lead.additionalDetails && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p className="text-base">{lead.additionalDetails.company || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Designation</label>
                    <p className="text-base">{lead.additionalDetails.designation || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
                    <p className="text-base">{lead.additionalDetails.monthlyIncome || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                    <p className="text-base">{lead.additionalDetails.propertyType || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Loan Amount</label>
                    <p className="text-base">{lead.additionalDetails.loanAmount || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-base">{lead.additionalDetails.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {lead.instructions && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <p className="text-base text-muted-foreground">{lead.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditLead;
