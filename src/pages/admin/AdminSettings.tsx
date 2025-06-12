
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationManager from '@/components/admin/LocationManager';
import ProductManager from '@/components/admin/ProductManager';
import BankBranchManager from '@/components/admin/BankBranchManager';
import VehicleManager from '@/components/admin/VehicleManager';

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

const AdminSettings = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [locationData, setLocationData] = useState<LocationData>({
    states: []
  });
  const navigate = useNavigate();

  useEffect(() => {
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

    // Load location data from localStorage
    const storedLocationData = localStorage.getItem('locationData');
    if (storedLocationData) {
      try {
        setLocationData(JSON.parse(storedLocationData));
      } catch (error) {
        console.error('Error parsing location data:', error);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
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
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
              <p className="text-muted-foreground">
                Manage system configuration and master data
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Configuration Management</CardTitle>
                <CardDescription>
                  Configure locations, products, bank branches, and vehicle data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="locations" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="branches">Bank Branches</TabsTrigger>
                    <TabsTrigger value="vehicles">Vehicle Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="locations">
                    <LocationManager locationData={locationData} setLocationData={setLocationData} />
                  </TabsContent>
                  
                  <TabsContent value="products">
                    <ProductManager />
                  </TabsContent>
                  
                  <TabsContent value="branches">
                    <BankBranchManager />
                  </TabsContent>
                  
                  <TabsContent value="vehicles">
                    <VehicleManager />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
