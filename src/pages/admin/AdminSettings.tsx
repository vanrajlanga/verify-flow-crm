
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LeadTypeManager from '@/components/admin/LeadTypeManager';
import BankBranchManager from '@/components/admin/BankBranchManager';
import VehicleManager from '@/components/admin/VehicleManager';

const AdminSettings = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get the active tab from URL params, default to 'lead-types'
  const activeTab = searchParams.get('tab') || 'lead-types';

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

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
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

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid grid-cols-7 w-full">
                <TabsTrigger value="lead-types">Lead Types</TabsTrigger>
                <TabsTrigger value="bank-branches">Bank Branches</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicle Brands</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
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

              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                    <CardDescription>
                      Configure system-wide settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="app-name">Application Name</Label>
                      <Input id="app-name" defaultValue="KYC Verification Portal" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Default Timezone</Label>
                      <Select defaultValue="asia-kolkata">
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia-kolkata">Asia/Kolkata</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="america-new-york">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="maintenance-mode" />
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="debug-mode" />
                      <Label htmlFor="debug-mode">Debug Mode</Label>
                    </div>

                    <Button>Save System Settings</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>
                      Configure email settings and templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input id="smtp-host" placeholder="smtp.gmail.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input id="smtp-port" type="number" placeholder="587" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="from-email">From Email</Label>
                      <Input id="from-email" type="email" placeholder="noreply@kycportal.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="from-name">From Name</Label>
                      <Input id="from-name" placeholder="KYC Portal" />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="email-notifications" defaultChecked />
                      <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                    </div>

                    <Button>Save Email Settings</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Configure security policies and authentication settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input id="session-timeout" type="number" defaultValue="60" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-policy">Minimum Password Length</Label>
                      <Input id="password-policy" type="number" defaultValue="8" />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="two-factor" />
                      <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="password-complexity" defaultChecked />
                      <Label htmlFor="password-complexity">Enforce Password Complexity</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="account-lockout" defaultChecked />
                      <Label htmlFor="account-lockout">Enable Account Lockout</Label>
                    </div>

                    <Button>Save Security Settings</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>
                      Manage account settings and user preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="default-role">Default User Role</Label>
                      <Select defaultValue="agent">
                        <SelectTrigger>
                          <SelectValue placeholder="Select default role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="auto-approve" />
                      <Label htmlFor="auto-approve">Auto-approve new user registrations</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="email-verification" defaultChecked />
                      <Label htmlFor="email-verification">Require email verification</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="welcome-message">Welcome Message</Label>
                      <Textarea 
                        id="welcome-message" 
                        placeholder="Welcome to the KYC Verification Portal..."
                        defaultValue="Welcome to the KYC Verification Portal. Your account has been created successfully."
                      />
                    </div>

                    <Button>Save Account Settings</Button>
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
