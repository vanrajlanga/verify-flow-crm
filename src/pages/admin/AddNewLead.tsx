
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
    states: []
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
    // Get location data from localStorage or initialize empty structure
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

  // Function to initialize default location data
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
                { id: 'city-2', name: 'Electronic City' }
              ]
            }
          ]
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
                { id: 'city-4', name: 'Navi Mumbai' }
              ]
            }
          ]
        }
      ]
    };
    setLocationData(defaultLocationData);
    localStorage.setItem('locationData', JSON.stringify(defaultLocationData));
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleAddLead = async (formData: any) => {
    try {
      console.log('AddNewLead: Received form data:', formData);
      // Validate
      // Transform form data to Lead format
      const leadData = transformFormDataToLead(formData);

      console.log('AddNewLead: Transformed lead data FINAL:', JSON.stringify(leadData, null, 2));

      // Save lead to database
      await saveLeadToDatabase(leadData);

      console.log('AddNewLead: Lead successfully saved to database');

      toast({
        title: "Lead added successfully",
        description: `New lead ${leadData.name} has been saved to database and is ready for management.`,
      });

      // Navigate back to leads list
      navigate('/admin/leads');
    } catch (error) {
      console.error('AddNewLead: ERROR - Failed to save lead to database:', error);

      toast({
        title: "Database Save Failed",
        description: `Failed to save lead to database. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection and try again.`,
        variant: "destructive"
      });

      // Do not navigate away - let user try again
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
      
      // Navigate to leads list to see the test leads
      navigate('/admin/leads');
    } catch (error) {
      console.error('Error creating test leads:', error);
      
      toast({
        title: "Error creating test leads",
        description: `Failed to create test leads. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
