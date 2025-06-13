
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import AddLeadFormMultiStep from '@/components/admin/AddLeadFormMultiStep';
import { toast } from '@/components/ui/use-toast';
import { saveLeadToDatabase } from '@/lib/lead-operations';
import { migrateLocalLeadsToDatabase } from '@/lib/migrate-local-leads';
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
  const [locationData, setLocationData] = useState<LocationData>({
    states: []
  });
  const [isMigrating, setIsMigrating] = useState(false);
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
    
    // Migrate any existing localStorage leads to database
    migrateExistingLeads();
  }, [navigate]);

  const migrateExistingLeads = async () => {
    setIsMigrating(true);
    try {
      console.log('Checking for existing localStorage leads to migrate...');
      const result = await migrateLocalLeadsToDatabase();
      
      if (result.success && result.migratedCount > 0) {
        toast({
          title: "Migration Completed",
          description: `Successfully migrated ${result.migratedCount} leads from local storage to database.`,
        });
        console.log(`Migration completed: ${result.migratedCount} leads migrated`);
      } else if (result.success && result.migratedCount === 0) {
        console.log('No leads found to migrate');
      } else {
        console.error('Migration failed:', result.error);
        toast({
          title: "Migration Warning",
          description: "Some leads could not be migrated to database. Please check console for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error during migration:', error);
      toast({
        title: "Migration Error",
        description: "Failed to migrate existing leads to database.",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
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
      console.log('AddNewLead: Saving lead to database only (no localStorage fallback):', newLead);
      
      // FORCE database save - NO localStorage fallback
      await saveLeadToDatabase(newLead);

      console.log('AddNewLead: Lead successfully saved to database');
      
      toast({
        title: "Lead added successfully",
        description: `New lead ${newLead.name} has been saved to database and is ready for management.`,
      });

      // Navigate back to leads list
      navigate('/admin/leads');
    } catch (error) {
      console.error('AddNewLead: CRITICAL ERROR - Failed to save lead to database:', error);
      
      // DO NOT fall back to localStorage - show error instead
      toast({
        title: "Database Save Failed",
        description: `Failed to save lead ${newLead.name} to database. Please check your connection and try again.`,
        variant: "destructive"
      });

      // Do not navigate away - let user try again
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isMigrating) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Migrating Leads to Database...</div>
          <div className="text-muted-foreground">Please wait while we transfer your leads to the database.</div>
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
          <div className="max-w-7xl mx-auto">
            <AddLeadFormMultiStep 
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
