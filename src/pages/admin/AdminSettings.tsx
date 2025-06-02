
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadTypeManager from '@/components/admin/LeadTypeManager';
import BankBranchManager from '@/components/admin/BankBranchManager';
import VehicleManager from '@/components/admin/VehicleManager';

const AdminSettings = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage system configurations and master data
              </p>
            </div>

            <Tabs defaultValue="lead-types" className="space-y-4">
              <TabsList>
                <TabsTrigger value="lead-types">Lead Types</TabsTrigger>
                <TabsTrigger value="bank-branches">Bank Branches</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicle Brands & Models</TabsTrigger>
              </TabsList>

              <TabsContent value="lead-types">
                <LeadTypeManager />
              </TabsContent>

              <TabsContent value="bank-branches">
                <BankBranchManager />
              </TabsContent>

              <TabsContent value="vehicles">
                <VehicleManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
