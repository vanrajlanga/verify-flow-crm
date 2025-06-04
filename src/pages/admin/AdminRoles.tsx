
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoleManager from '@/components/admin/RoleManager';
import TeamMemberManager from '@/components/admin/TeamMemberManager';

const AdminRoles = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
              <h1 className="text-2xl font-bold tracking-tight">Role & Permission Management</h1>
              <p className="text-muted-foreground">
                Manage user roles, permissions, and team members
              </p>
            </div>

            <Tabs defaultValue="roles" className="space-y-4">
              <TabsList>
                <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                <TabsTrigger value="team">Team Members</TabsTrigger>
              </TabsList>

              <TabsContent value="roles">
                <RoleManager />
              </TabsContent>

              <TabsContent value="team">
                <TeamMemberManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRoles;
