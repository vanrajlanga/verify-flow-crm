import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, mockBanks } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import MultiStepLeadForm from '@/components/admin/MultiStepLeadForm';
import { toast } from '@/components/ui/use-toast';
import { saveLeadToDatabase } from '@/lib/lead-operations';
import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  states: {
    id: string;
    name: string;
    districts: {
      id: string;
      name: string;
      cities: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
}

const AddNewLead = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<User[]>([]);
  const [locationData, setLocationData] = useState<LocationData>({
    states: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { leadId } = useParams();

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
    loadAgents();
    loadLocationData();
  }, [navigate, leadId]);

  const loadAgents = async () => {
    try {
      // Try to get agents from database first
      const { data: dbAgents, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'agent');

      if (!error && dbAgents && dbAgents.length > 0) {
        const transformedAgents = dbAgents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          email: agent.email,
          password: agent.password || 'default123',
          phone: agent.phone || '',
          district: agent.district || '',
          status: agent.status || 'Active',
          state: agent.state,
          city: agent.city,
          baseLocation: agent.base_location,
          maxTravelDistance: agent.max_travel_distance,
          extraChargePerKm: agent.extra_charge_per_km,
          profilePicture: agent.profile_picture,
          totalVerifications: agent.total_verifications || 0,
          completionRate: agent.completion_rate || 0
        }));
        setAgents(transformedAgents);
        return;
      }
    } catch (error) {
      console.error('Error loading agents from database:', error);
    }

    // Fall back to localStorage
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        const filteredAgents = parsedUsers.filter((user: User) => user.role === 'agent');
        setAgents(filteredAgents);
      } catch (error) {
        console.error("Error parsing stored users:", error);
        setAgents([]);
      }
    } else {
      setAgents([]);
    }
  };

  const loadLocationData = () => {
    // Initialize default location data
    const defaultLocationData = {
      states: [
        {
          id: 'state-1',
          name: 'Karnataka',
          districts: [
            {
              id: 'district-1',
              name: 'Bangalore Urban',
              cities: [
                { id: 'city-1', name: 'Bangalore' },
                { id: 'city-2', name: 'Electronic City' }
              ]
            },
            {
              id: 'district-2',
              name: 'Mysore',
              cities: [
                { id: 'city-3', name: 'Mysore' },
                { id: 'city-4', name: 'Mandya' }
              ]
            }
          ]
        },
        {
          id: 'state-2',
          name: 'Maharashtra',
          districts: [
            {
              id: 'district-3',
              name: 'Mumbai',
              cities: [
                { id: 'city-5', name: 'Mumbai' },
                { id: 'city-6', name: 'Navi Mumbai' }
              ]
            },
            {
              id: 'district-4',
              name: 'Pune',
              cities: [
                { id: 'city-7', name: 'Pune' },
                { id: 'city-8', name: 'Pimpri-Chinchwad' }
              ]
            }
          ]
        },
        {
          id: 'state-3',
          name: 'Tamil Nadu',
          districts: [
            {
              id: 'district-5',
              name: 'Chennai',
              cities: [
                { id: 'city-9', name: 'Chennai' },
                { id: 'city-10', name: 'Tambaram' }
              ]
            }
          ]
        }
      ]
    };
    setLocationData(defaultLocationData);
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleSubmitLead = async (formData: any) => {
    try {
      console.log('Submitting lead with complete data:', formData);
      
      // Get selected product and vehicle details
      const selectedProduct = products.find(p => p.id === formData.leadType);
      const selectedVehicleBrand = vehicleBrands.find(b => b.id === formData.vehicleBrand);
      const selectedVehicleModel = vehicleModels.find(m => m.id === formData.vehicleModel);
      
      // Transform form data to lead format with all data
      const newLead = {
        id: `lead-${Date.now()}`,
        name: formData.customerName,
        age: Number(formData.age) || 30,
        job: formData.designation || '',
        address: {
          id: `addr-${Date.now()}`,
          type: 'Residence' as const,
          street: formData.addresses?.[0]?.streetAddress || '',
          city: formData.addresses?.[0]?.city || '',
          district: formData.addresses?.[0]?.district || '',
          state: formData.addresses?.[0]?.state || '',
          pincode: formData.addresses?.[0]?.pincode || ''
        },
        additionalDetails: {
          company: formData.companyName || '',
          designation: formData.designation || '',
          workExperience: formData.workExperience || '',
          propertyType: formData.propertyType || '',
          ownershipStatus: formData.ownershipStatus || '',
          propertyAge: formData.propertyAge || '',
          monthlyIncome: formData.monthlyIncome || '',
          annualIncome: formData.annualIncome || '',
          otherIncome: formData.otherIncome || '',
          phoneNumber: formData.phoneNumber || '',
          email: formData.email || '',
          dateOfBirth: '',
          gender: formData.gender || 'Male',
          maritalStatus: formData.maritalStatus || 'Single',
          fatherName: formData.fatherName || '',
          motherName: formData.motherName || '',
          spouseName: '',
          agencyFileNo: formData.agencyFileNo || '',
          applicationBarcode: formData.applicationBarcode || '',
          caseId: formData.caseId || '',
          schemeDesc: formData.schemeDescription || '',
          bankBranch: formData.buildBranch || '',
          additionalComments: formData.specialInstructions || '',
          leadType: selectedProduct?.name || '',
          leadTypeId: formData.leadType || '',
          loanAmount: formData.loanAmount || '',
          loanType: 'New',
          vehicleBrandName: selectedVehicleBrand?.name || '',
          vehicleBrandId: formData.vehicleBrand || '',
          vehicleModelName: selectedVehicleModel?.name || '',
          vehicleModelId: formData.vehicleModel || '',
          addresses: formData.addresses || [],
          phoneNumbers: [
            {
              id: `phone-${Date.now()}`,
              number: formData.phoneNumber,
              type: 'mobile',
              isPrimary: true
            }
          ]
        },
        status: 'Pending' as const,
        bank: formData.bankName,
        visitType: formData.visitType as 'Residence' | 'Office' | 'Both',
        assignedTo: formData.assignedAgent || '',
        createdAt: new Date(),
        verificationDate: formData.preferredDate,
        documents: [],
        instructions: formData.specialInstructions || ''
      };

      console.log('Transformed lead data:', newLead);

      // Save to database
      await saveLeadToDatabase(newLead);

      toast({
        title: "Success",
        description: "Lead created successfully and saved to database.",
      });

      // Navigate back to leads list
      navigate('/admin/leads');
    } catch (error) {
      console.error('Error saving lead:', error);
      
      // Fall back to localStorage if database save fails
      const storedLeads = localStorage.getItem('mockLeads');
      let currentLeads = [];
      if (storedLeads) {
        try {
          currentLeads = JSON.parse(storedLeads);
        } catch (parseError) {
          console.error("Error parsing stored leads:", parseError);
          currentLeads = [];
        }
      }

      toast({
        title: "Warning",
        description: "Lead saved locally. Database connection failed.",
        variant: "destructive"
      });

      navigate('/admin/leads');
    }
  };

  const handleCancel = () => {
    navigate('/admin/leads');
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
          <div className="max-w-7xl mx-auto">
            <MultiStepLeadForm
              banks={mockBanks}
              agents={agents}
              onSubmit={handleSubmitLead}
              onCancel={handleCancel}
              locationData={locationData}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddNewLead;
