import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, mockBanks } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import AddLeadFormMultiStep from '@/components/admin/AddLeadFormMultiStep';
import { toast } from '@/components/ui/use-toast';
import { saveLeadToDatabase } from '@/lib/lead-operations';
import { getUserById } from '@/lib/supabase-queries';
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
    loadAgents();
    loadLocationData();
  }, [navigate]);

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
          completionRate: agent.completion_rate || 0,
          password: agent.password
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

  const handleAddLead = async (newLead: any) => {
    try {
      console.log('Adding new lead:', newLead);
      
      // Save to database
      await saveLeadToDatabase(newLead);

      toast({
        title: "Lead added",
        description: `New lead ${newLead.name} has been created successfully and saved to database.`,
      });

      // Navigate back to leads list
      navigate('/admin/leads');
    } catch (error) {
      console.error('Error saving lead to database:', error);
      
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

      const updatedLeads = [...currentLeads, newLead];
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Lead added",
        description: `New lead ${newLead.name} has been created successfully (saved locally).`,
        variant: "destructive"
      });

      navigate('/admin/leads');
    }
  };

  const handleClose = () => {
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
            <AddLeadFormMultiStep 
              agents={agents}
              banks={mockBanks}
              onAddLead={handleAddLead}
              onClose={handleClose}
              locationData={locationData}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddNewLead;
