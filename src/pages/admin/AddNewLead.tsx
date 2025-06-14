import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import AddLeadFormSingleStep from '@/components/admin/AddLeadFormSingleStep';
import { toast } from '@/components/ui/use-toast';
import { saveLeadToDatabase, createTestLeads } from '@/lib/lead-operations';
import { transformFormDataToLead } from '@/lib/form-data-transformer';
import { Button } from '@/components/ui/button';

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
  const [locationData, setLocationData] = useState<LocationData>({
    states: [],
  });
  const [isCreatingTestLeads, setIsCreatingTestLeads] = useState(false);
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
    loadLocationData();
  }, [navigate]);

  const loadLocationData = () => {
    const storedLocationData = localStorage.getItem('locationData');
    if (storedLocationData) {
      try {
        const parsedLocationData = JSON.parse(storedLocationData);
        setLocationData(parsedLocationData);
      } catch (error) {
        console.error("Error parsing stored location data:", error);
        initializeDefaultLocationData();
      }
    } else {
      initializeDefaultLocationData();
    }
  };

  const initializeDefaultLocationData = () => {
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
                { id: 'city-2', name: 'Electronic City' },
              ],
            },
          ],
        },
        {
          id: 'state-2',
          name: 'Maharashtra',
          districts: [
            {
              id: 'district-2',
              name: 'Mumbai',
              cities: [
                { id: 'city-3', name: 'Mumbai' },
                { id: 'city-4', name: 'Navi Mumbai' },
              ],
            },
          ],
        },
      ],
    };
    setLocationData(defaultLocationData);
    localStorage.setItem('locationData', JSON.stringify(defaultLocationData));
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  /** 
   * ENHANCED ERROR HANDLING FOR ADD LEAD - with debug info!
   */
  const handleAddLead = async (formData: any) => {
    try {
      // Log the raw form data for reference
      console.log('[AddNewLead] - Received form data:', formData);

      // Strict validation per DB schema
      if (!formData.name || typeof formData.name !== "string" || formData.name.trim().length < 2) {
        throw new Error("Lead name is required and must be at least 2 characters.");
      }
      if (!formData.bankName || typeof formData.bankName !== "string") {
        throw new Error("Bank name/id is required.");
      }
      if (!formData.bankProduct || typeof formData.bankProduct !== "string") {
        throw new Error("Bank product is required.");
      }
      if (!formData.initiatedUnderBranch || typeof formData.initiatedUnderBranch !== "string") {
        throw new Error("Branch is required.");
      }
      if (!formData.addresses || !Array.isArray(formData.addresses) || !formData.addresses[0]?.addressLine1) {
        throw new Error("At least one applicant address is required.");
      }
      if (!formData.addresses[0]?.state || !formData.addresses[0]?.district || !formData.addresses[0]?.pincode) {
        throw new Error("Primary address must have state, district, and pincode.");
      }
      if ('vehicleType' in formData && !formData.vehicleType) {
        throw new Error("Vehicle Type is required.");
      }

      // Fix bank field - use ID everywhere
      let bankId = formData.bankName;
      if (typeof formData.bank === "object" && formData.bank.id) {
        bankId = formData.bank.id;
      }

      // VisitType enforcement
      let visitType = typeof formData.visitType === "string" ? formData.visitType : "";
      if (!["Physical", "Virtual"].includes(visitType)) {
        visitType = (typeof formData.visitType === "string" && /virtual|online/i.test(formData.visitType)) ? "Virtual" : "Physical";
      }

      const cleanedFormData = {
        ...formData,
        bankName: bankId,
        visitType,
      };

      const leadData = transformFormDataToLead(cleanedFormData);

      // FINAL DEBUG: Log what is about to be sent to DB
      console.log('[AddNewLead] FINAL DB PAYLOAD to saveLeadToDatabase:', JSON.stringify(leadData, null, 2));

      await saveLeadToDatabase(leadData);

      toast({
        title: "Lead added successfully",
        description: `New lead ${leadData.name} has been saved to the database.`,
      });

      navigate('/admin/leads');
    } catch (error: any) {
      // Log raw error
      console.error('[AddNewLead] ERROR:', error);

      // Show human-readable error in toast and log full details
      let toastDescription = "Unknown error occurred";
      if (error?.message) {
        toastDescription = error.message;
      } else if (typeof error === "string") {
        toastDescription = error;
      } else if (error?.toString) {
        toastDescription = error.toString();
      } else if (error?.error_description) {
        toastDescription = error.error_description;
      }
      toast({
        title: "Database Save Failed",
        description: toastDescription,
        variant: "destructive"
      });
      // Also force log the error object as JSON, if any
      try {
        console.error('Full error object:', JSON.stringify(error, null, 2));
      } catch (_) {}
    }
  };

  const handleCreateTestLeads = async () => {
    try {
      setIsCreatingTestLeads(true);
      await createTestLeads();

      toast({
        title: "Test leads created successfully",
        description: "5 test leads with complete data have been added to the database.",
      });

      navigate('/admin/leads');
    } catch (error: any) {
      console.error('Error creating test leads:', error);
      toast({
        title: "Error creating test leads",
        description: `Failed to create test leads. Error: ${error?.message || String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsCreatingTestLeads(false);
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
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Add New Lead</h1>
              <Button
                onClick={handleCreateTestLeads}
                disabled={isCreatingTestLeads}
                variant="outline"
              >
                {isCreatingTestLeads ? 'Creating Test Leads...' : 'Create 5 Test Leads'}
              </Button>
            </div>
            <AddLeadFormSingleStep
              onSubmit={handleAddLead}
              locationData={locationData}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddNewLead;
