
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Mail, Phone, MapPin, User as UserIcon, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AgentProfile = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    district: '',
    phone: '123-456-7890', // Mock data
    address: 'KYC Agency Office, Main Street', // Mock data
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
    setProfileData({
      ...profileData,
      name: parsedUser.name,
      email: parsedUser.email,
      district: parsedUser.district || '',
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = () => {
    // In a real app, we would make an API call to update the profile
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleChangePassword = () => {
    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would verify the current password and update with the new one
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });
    
    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
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
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground">
                View and manage your personal information
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardContent className="pt-6 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                      <p className="text-sm text-muted-foreground flex items-center justify-center">
                        <BadgeCheck className="h-4 w-4 mr-1 text-green-500" /> Verification Agent
                      </p>
                    </div>
                    
                    <div className="space-y-2 w-full text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{currentUser.email}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{currentUser.district} District</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{profileData.phone}</span>
                      </div>
                    </div>
                    
                    <div className="border-t w-full pt-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {currentUser.totalVerifications || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Verifications</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {currentUser.completionRate || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6 md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserIcon className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input 
                          id="district"
                          name="district"
                          value={profileData.district}
                          onChange={handleProfileChange}
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Office Address</Label>
                      <Input 
                        id="address"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="h-5 w-5 mr-2" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleChangePassword}>Change Password</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentProfile;
