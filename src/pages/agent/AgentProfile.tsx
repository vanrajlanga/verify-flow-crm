
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AgentDocuments from '@/components/agent/AgentDocuments';
import LeaveManagement from '@/components/agent/LeaveManagement';

const AgentProfile = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'agent') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const updateProfile = (updatedUser: User) => {
    // Update in state
    setCurrentUser(updatedUser);
    
    // Update in localStorage
    localStorage.setItem('kycUser', JSON.stringify(updatedUser));
    
    // Update in mockUsers
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const allUsers = JSON.parse(storedUsers);
        const updatedUsers = allUsers.map((user: User) => 
          user.id === updatedUser.id ? updatedUser : user
        );
        localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      } catch (error) {
        console.error("Error updating users in localStorage:", error);
      }
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
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">
                  Manage your profile information and documents
                </p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="profile">Profile & Documents</TabsTrigger>
                <TabsTrigger value="leave">Leave Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center pb-4">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border mb-4">
                          {currentUser.profilePicture ? (
                            <img 
                              src={currentUser.profilePicture} 
                              alt="Profile" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <span className="text-4xl font-bold text-gray-400">
                                {currentUser.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-medium text-lg">{currentUser.name}</h3>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Role:</span>
                          <span className="text-sm font-medium">Agent</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Location:</span>
                          <span className="text-sm font-medium">
                            {currentUser.city ? `${currentUser.city}, ${currentUser.district}, ${currentUser.state}` : 'Not assigned'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Verifications:</span>
                          <span className="text-sm font-medium">{currentUser.totalVerifications || 0}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Completion Rate:</span>
                          <span className="text-sm font-medium">{currentUser.completionRate || 0}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="md:col-span-2">
                    <AgentDocuments user={currentUser} onUpdate={updateProfile} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="leave" className="mt-4">
                <LeaveManagement user={currentUser} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentProfile;
