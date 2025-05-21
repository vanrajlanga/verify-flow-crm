
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Bell, Globe, Lock, Mail, ShieldAlert, User as UserIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AdminSettings = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'Bank Verification CRM',
    systemEmail: 'admin@bankkyc.com',
    autoAssign: true,
    requireApproval: true,
    
    // Email Settings
    emailServer: 'smtp.example.com',
    emailPort: '587',
    emailUser: 'notifications@bankkyc.com',
    emailPassword: '********',
    
    // Security Settings
    maxLoginAttempts: '5',
    sessionTimeout: '30',
    twoFactorAuth: false,
    passwordExpiry: '90'
  });

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

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveSettings = (section: string) => {
    // In a real app, we would make an API call to save the settings
    toast({
      title: "Settings saved",
      description: `${section} settings have been updated successfully.`,
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage system configuration and preferences
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="system" className="space-y-4">
              <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[400px]">
                <TabsTrigger value="system">
                  <Globe className="h-4 w-4 mr-2" />
                  System
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="security">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="account">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                      Configure general system behavior and defaults
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="systemName">System Name</Label>
                          <Input 
                            id="systemName"
                            name="systemName"
                            value={settings.systemName}
                            onChange={handleSettingChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            The name displayed in emails and system notifications
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="systemEmail">System Email</Label>
                          <Input 
                            id="systemEmail"
                            name="systemEmail"
                            value={settings.systemEmail}
                            onChange={handleSettingChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            Primary contact email for system notifications
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-4">
                        <h3 className="font-medium">Process Automation</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Automatic Agent Assignment</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically assign leads to agents based on district
                            </p>
                          </div>
                          <Switch 
                            name="autoAssign"
                            checked={settings.autoAssign}
                            onCheckedChange={(checked) => 
                              setSettings({...settings, autoAssign: checked})
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Require Admin Approval</Label>
                            <p className="text-sm text-muted-foreground">
                              All verifications require admin review before completion
                            </p>
                          </div>
                          <Switch 
                            name="requireApproval"
                            checked={settings.requireApproval}
                            onCheckedChange={(checked) => 
                              setSettings({...settings, requireApproval: checked})
                            }
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={() => handleSaveSettings('System')}>
                        Save System Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>
                      Configure email notifications and server settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">SMTP Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="emailServer">SMTP Server</Label>
                          <Input 
                            id="emailServer"
                            name="emailServer"
                            value={settings.emailServer}
                            onChange={handleSettingChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emailPort">SMTP Port</Label>
                          <Input 
                            id="emailPort"
                            name="emailPort"
                            value={settings.emailPort}
                            onChange={handleSettingChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="emailUser">SMTP Username</Label>
                          <Input 
                            id="emailUser"
                            name="emailUser"
                            value={settings.emailUser}
                            onChange={handleSettingChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emailPassword">SMTP Password</Label>
                          <Input 
                            id="emailPassword"
                            name="emailPassword"
                            type="password"
                            value={settings.emailPassword}
                            onChange={handleSettingChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <h3 className="font-medium">Notification Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Agent Assignment Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Send email when a new lead is assigned
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Verification Completion Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify admins when verification is complete
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Daily Digest</Label>
                          <p className="text-sm text-muted-foreground">
                            Send daily summary of all activities
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={() => handleSaveSettings('Email')}>
                        Save Email Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Configure system security and access controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                          <Input 
                            id="maxLoginAttempts"
                            name="maxLoginAttempts"
                            type="number"
                            value={settings.maxLoginAttempts}
                            onChange={handleSettingChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            Number of failed attempts before account lockout
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <Input 
                            id="sessionTimeout"
                            name="sessionTimeout"
                            type="number"
                            value={settings.sessionTimeout}
                            onChange={handleSettingChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            Automatically log out after inactivity period
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                          <Input 
                            id="passwordExpiry"
                            name="passwordExpiry"
                            type="number"
                            value={settings.passwordExpiry}
                            onChange={handleSettingChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            Number of days before password change required
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <h3 className="font-medium">Authentication Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Require 2FA for all admin users
                          </p>
                        </div>
                        <Switch 
                          name="twoFactorAuth"
                          checked={settings.twoFactorAuth}
                          onCheckedChange={(checked) => 
                            setSettings({...settings, twoFactorAuth: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Strong Password Policy</Label>
                          <p className="text-sm text-muted-foreground">
                            Require complex passwords with mixed case, numbers, and symbols
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>IP Restriction</Label>
                          <p className="text-sm text-muted-foreground">
                            Limit system access to specific IP addresses
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={() => handleSaveSettings('Security')}>
                        Save Security Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Update your personal account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="adminName">Your Name</Label>
                          <Input 
                            id="adminName"
                            defaultValue={currentUser.name}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adminEmail">Email Address</Label>
                          <Input 
                            id="adminEmail"
                            type="email"
                            defaultValue={currentUser.email}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-4">
                        <h3 className="font-medium">Change Password</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input 
                              id="currentPassword"
                              type="password"
                            />
                          </div>
                          <div></div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input 
                              id="newPassword"
                              type="password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input 
                              id="confirmPassword"
                              type="password"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={() => handleSaveSettings('Account')}>
                        Save Account Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
