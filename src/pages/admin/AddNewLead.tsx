import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, mockBanks } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import MultiStepLeadForm from '@/components/admin/MultiStepLeadForm';
import { toast } from '@/components/ui/use-toast';
import { saveLeadToDatabase, getLeadsFromDatabase } from '@/lib/lead-operations';
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
  const [products, setProducts] = useState<any[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<any[]>([]);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
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
    loadLocationDataFromSupabase();
    loadProducts();
    loadVehicleData();
    
    // If leadId is provided, load the lead for editing
    if (leadId) {
      loadLeadForEditing(leadId);
    }
  }, [navigate, leadId]);

  const loadLeadForEditing = async (id: string) => {
    try {
      // Try to get lead from database first
      const dbLeads = await getLeadsFromDatabase();
      const foundLead = dbLeads.find(l => l.id === id);
      
      if (foundLead) {
        setEditingLead(foundLead);
        return;
      }

      // Fall back to localStorage
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        const foundLead = leads.find((l: any) => l.id === id);
        if (foundLead) {
          setEditingLead(foundLead);
        } else {
          toast({
            title: "Lead not found",
            description: "The lead you're trying to edit could not be found.",
            variant: "destructive",
          });
          navigate('/admin/leads');
        }
      }
    } catch (error) {
      console.error('Error loading lead for editing:', error);
      toast({
        title: "Error",
        description: "Failed to load lead for editing.",
        variant: "destructive",
      });
      navigate('/admin/leads');
    }
  };

  const loadProducts = () => {
    // Load from localStorage but ensure bank IDs match mockBanks
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      // Map localStorage products to use correct bank IDs from mockBanks
      const mappedProducts = parsedProducts.map((product: any) => ({
        ...product,
        banks: product.banks?.map((bankId: string) => {
          // If bankId is like "bank-1", map it to actual bank ID from mockBanks
          if (bankId.startsWith('bank-')) {
            const bankIndex = parseInt(bankId.split('-')[1]) - 1;
            return mockBanks[bankIndex]?.id || bankId;
          }
          return bankId;
        }) || []
      }));
      console.log('Mapped products:', mappedProducts);
      setProducts(mappedProducts);
    } else {
      // Set default products with correct bank IDs
      const defaultProducts = [
        { id: 'prod-1', name: 'Auto Loans', description: 'Vehicle financing', banks: [mockBanks[0]?.id, mockBanks[1]?.id] },
        { id: 'prod-2', name: 'Commercial Vehicles', description: 'Commercial vehicle loans', banks: [mockBanks[0]?.id, mockBanks[2]?.id] },
        { id: 'prod-3', name: 'CVCE', description: 'Commercial Vehicle Customer Enquiry', banks: [mockBanks[1]?.id, mockBanks[2]?.id] },
        { id: 'prod-4', name: 'Home Loans', description: 'Housing finance', banks: [mockBanks[0]?.id, mockBanks[1]?.id, mockBanks[2]?.id] },
        { id: 'prod-5', name: 'Personal Loans', description: 'Personal financing', banks: [mockBanks[0]?.id, mockBanks[1]?.id] }
      ].filter(product => product.banks.some(bankId => bankId)); // Filter out products with invalid bank IDs
      
      setProducts(defaultProducts);
      localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
  };

  const loadVehicleData = () => {
    const storedBrands = localStorage.getItem('vehicleBrands');
    const storedModels = localStorage.getItem('vehicleModels');
    
    if (storedBrands) {
      setVehicleBrands(JSON.parse(storedBrands));
    } else {
      // Set default vehicle brands
      const defaultBrands = [
        { id: 'brand-1', name: 'Maruti Suzuki' },
        { id: 'brand-2', name: 'Hyundai' },
        { id: 'brand-3', name: 'Tata' },
        { id: 'brand-4', name: 'Mahindra' }
      ];
      setVehicleBrands(defaultBrands);
      localStorage.setItem('vehicleBrands', JSON.stringify(defaultBrands));
    }
    
    if (storedModels) {
      setVehicleModels(JSON.parse(storedModels));
    } else {
      // Set default vehicle models
      const defaultModels = [
        { id: 'model-1', name: 'Swift', brandId: 'brand-1' },
        { id: 'model-2', name: 'Alto', brandId: 'brand-1' },
        { id: 'model-3', name: 'Baleno', brandId: 'brand-1' },
        { id: 'model-4', name: 'i20', brandId: 'brand-2' },
        { id: 'model-5', name: 'Creta', brandId: 'brand-2' },
        { id: 'model-6', name: 'Venue', brandId: 'brand-2' },
        { id: 'model-7', name: 'Nexon', brandId: 'brand-3' },
        { id: 'model-8', name: 'Tiago', brandId: 'brand-3' },
        { id: 'model-9', name: 'XUV700', brandId: 'brand-4' },
        { id: 'model-10', name: 'Scorpio', brandId: 'brand-4' }
      ];
      setVehicleModels(defaultModels);
      localStorage.setItem('vehicleModels', JSON.stringify(defaultModels));
    }
  };

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

  const loadLocationDataFromSupabase = async () => {
    try {
      // Try to load from localStorage first (which might be synced with Supabase)
      const storedLocationData = localStorage.getItem('locationData');
      if (storedLocationData) {
        console.log('Loading location data from localStorage');
        const parsedLocationData = JSON.parse(storedLocationData);
        setLocationData(parsedLocationData);
        return;
      }
    } catch (error) {
      console.error('Error loading location data from localStorage:', error);
    }

    // Fall back to default location data
    console.log('Using default location data');
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
    // Save default data to localStorage for future use
    localStorage.setItem('locationData', JSON.stringify(defaultLocationData));
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
      const leadData = {
        id: editingLead ? editingLead.id : `lead-${Date.now()}`,
        name: formData.customerName,
        age: Number(formData.age) || 30,
        job: formData.designation || '',
        address: {
          id: editingLead?.address?.id || `addr-${Date.now()}`,
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
              type: 'mobile' as const,
              isPrimary: true
            }
          ]
        },
        status: editingLead?.status || 'Pending' as const,
        bank: formData.bankName,
        visitType: formData.visitType as 'Residence' | 'Office' | 'Both',
        assignedTo: formData.assignedAgent || '',
        createdAt: editingLead?.createdAt || new Date(),
        verificationDate: formData.preferredDate,
        documents: editingLead?.documents || [],
        instructions: formData.specialInstructions || ''
      };

      console.log('Transformed lead data:', leadData);

      // Save to database
      await saveLeadToDatabase(leadData);

      // Update localStorage for immediate sync
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

      if (editingLead) {
        // Update existing lead
        const updatedLeads = currentLeads.map((lead: any) => 
          lead.id === editingLead.id ? leadData : lead
        );
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
        toast({
          title: "Success",
          description: "Lead updated successfully.",
        });
      } else {
        // Add new lead
        const updatedLeads = [...currentLeads, leadData];
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
        toast({
          title: "Success",
          description: "Lead created successfully.",
        });
      }

      // Navigate back to leads list
      navigate('/admin/leads');
    } catch (error) {
      console.error('Error saving lead:', error);
      
      toast({
        title: "Warning",
        description: editingLead ? "Lead updated locally. Database connection failed." : "Lead saved locally. Database connection failed.",
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
              editingLead={editingLead}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddNewLead;
