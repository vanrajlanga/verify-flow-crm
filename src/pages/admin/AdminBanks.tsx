import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, mockBanks } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { ArrowUp, Building2, Edit, FileUp, Plus, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AdminBanks = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [banks, setBanks] = useState(mockBanks);
  const [newBank, setNewBank] = useState({
    name: '',
    apiKey: '',
    contactEmail: ''
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleAddBank = () => {
    // In a real app, we would make an API call to create the bank
    const newBankId = `b${Date.now()}`;
    
    setBanks(prev => [...prev, { 
      id: newBankId, 
      name: newBank.name, 
      totalApplications: 0,
      branches: [] // Add empty branches array
    }]);
    
    toast({
      title: "Bank added",
      description: `${newBank.name} has been added to the system.`,
    });
    
    // Reset form
    setNewBank({
      name: '',
      apiKey: '',
      contactEmail: ''
    });
  };

  const handleDeleteBank = (bankId: string) => {
    // In a real app, we would make an API call to delete the bank
    setBanks(prev => prev.filter(bank => bank.id !== bankId));
    
    toast({
      title: "Bank removed",
      description: "The bank has been removed from the system.",
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
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Bank Integration</h1>
                <p className="text-muted-foreground">
                  Manage bank integrations and data submission settings
                </p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Bank
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Bank</DialogTitle>
                    <DialogDescription>
                      Enter details for the new bank integration.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bankName" className="text-right">
                        Bank Name
                      </Label>
                      <Input
                        id="bankName"
                        value={newBank.name}
                        onChange={(e) => setNewBank({...newBank, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="apiKey" className="text-right">
                        API Key
                      </Label>
                      <Input
                        id="apiKey"
                        value={newBank.apiKey}
                        onChange={(e) => setNewBank({...newBank, apiKey: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contactEmail" className="text-right">
                        Contact Email
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={newBank.contactEmail}
                        onChange={(e) => setNewBank({...newBank, contactEmail: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddBank}>Add Bank</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Banks</CardTitle>
                  <CardDescription>
                    List of all banks integrated with the verification system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bank Name</TableHead>
                          <TableHead>Applications</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {banks.map((bank) => (
                          <TableRow key={bank.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                {bank.name}
                              </div>
                            </TableCell>
                            <TableCell>{bank.totalApplications}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteBank(bank.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Integration Settings</CardTitle>
                  <CardDescription>
                    Configure how verification data is sent to banks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Data Format</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" className="flex-1">JSON</Button>
                      <Button variant="outline" className="flex-1">PDF</Button>
                      <Button variant="default" className="flex-1">Both</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Submission Method</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="default" className="flex-1">API</Button>
                      <Button variant="outline" className="flex-1">Email</Button>
                      <Button variant="outline" className="flex-1">Manual</Button>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Webhook URL</h3>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="https://api.bank.com/webhooks/kyc" 
                        className="flex-1"
                      />
                      <Button variant="outline">Test</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verification data will be sent to this URL when approved
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full">Save Integration Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Data Submissions</CardTitle>
                <CardDescription>
                  History of verification data sent to banks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Sent Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Amit Kumar</TableCell>
                        <TableCell>State Bank of India</TableCell>
                        <TableCell>{format(new Date(), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <span className="flex items-center text-green-600">
                            <ArrowUp className="h-4 w-4 mr-1" /> Sent
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileUp className="h-4 w-4 mr-1" /> Resend
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper function to format date
const format = (date: Date, formatStr: string) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

export default AdminBanks;
