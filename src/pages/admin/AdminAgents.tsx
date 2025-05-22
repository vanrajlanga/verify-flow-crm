import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User, mockUsers } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Edit, Plus, Search, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditAgentForm from '@/components/admin/EditAgentForm';
import LocationManager from '@/components/admin/LocationManager';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminAgents = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('agents');
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    state: '',
    district: '',
    city: '',
    password: '',
    phone: '',
  });
  const [editingAgent, setEditingAgent] = useState<User | null>(null);
  const [locationData, setLocationData] = useState({
    states: [
      {
        id: 'state-1',
        name: 'Maharashtra',
        districts: [
          {
            id: 'district-1',
            name: 'Mumbai',
            cities: [
              { id: 'city-1', name: 'Mumbai City' },
              { id: 'city-2', name: 'Navi Mumbai' }
            ]
          },
          {
            id: 'district-2',
            name: 'Pune',
            cities: [
              { id: 'city-3', name: 'Pune City' },
              { id: 'city-4', name: 'Pimpri-Chinchwad' }
            ]
          }
        ]
      },
      {
        id: 'state-2',
        name: 'Karnataka',
        districts: [
          {
            id: 'district-3',
            name: 'Bangalore',
            cities: [
              { id: 'city-5', name: 'Bangalore City' },
              { id: 'city-6', name: 'Electronic City' }
            ]
          }
        ]
      }
    ]
  });
  
  // Computed values for dropdowns
  const availableDistricts = locationData.states.find(s => s.name === newAgent.state)?.districts || [];
  const availableCities = availableDistricts.find(d => d.name === newAgent.district)?.cities || [];
  
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
    
    // Get agents from localStorage or use mockUsers
    const storedAgents = localStorage.getItem('mockAgents');
    if (storedAgents) {
      try {
        const parsedAgents = JSON.parse(storedAgents);
        setAgents(parsedAgents.filter((user: User) => user.role === 'agent'));
      } catch (error) {
        console.error("Error parsing stored agents:", error);
        // Fallback to mock data
        const agentUsers = mockUsers.filter(user => user.role === 'agent');
        setAgents(agentUsers);
        localStorage.setItem('mockAgents', JSON.stringify(mockUsers));
      }
    } else {
      const agentUsers = mockUsers.filter(user => user.role === 'agent');
      setAgents(agentUsers);
      localStorage.setItem('mockAgents', JSON.stringify(mockUsers));
    }
    
    // Get location data from localStorage or use default
    const storedLocationData = localStorage.getItem('locationData');
    if (storedLocationData) {
      try {
        const parsedLocationData = JSON.parse(storedLocationData);
        setLocationData(parsedLocationData);
      } catch (error) {
        console.error("Error parsing stored location data:", error);
        // Default data is already set in the state
        localStorage.setItem('locationData', JSON.stringify(locationData));
      }
    } else {
      localStorage.setItem('locationData', JSON.stringify(locationData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAgent = () => {
    // Validate form inputs
    if (!newAgent.name.trim() || !newAgent.email.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide name and email for the new agent.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we would make an API call to create the agent
    const newAgentId = `a${Date.now()}`;
    const agentToAdd: User = {
      id: newAgentId,
      name: newAgent.name,
      email: newAgent.email,
      phone: newAgent.phone,
      password: newAgent.password || "defaultPassword123", // Add a default password if none provided
      role: 'agent',
      state: newAgent.state,
      district: newAgent.district,
      city: newAgent.city,
      totalVerifications: 0,
      completionRate: 0,
      profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(newAgent.name)}&background=4F46E5&color=fff`
    };
    
    const updatedAgents = [...agents, agentToAdd];
    setAgents(updatedAgents);
    
    // Update in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('mockAgents') || '[]');
    const updatedUsers = [...storedUsers, agentToAdd];
    localStorage.setItem('mockAgents', JSON.stringify(updatedUsers));
    
    toast({
      title: "Agent created",
      description: `${newAgent.name} has been added as an agent.`,
    });
    
    // Reset form
    setNewAgent({
      name: '',
      email: '',
      state: '',
      district: '',
      city: '',
      password: '',
      phone: '',
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    // In a real app, we would make an API call to delete the agent
    const updatedAgents = agents.filter(agent => agent.id !== agentId);
    setAgents(updatedAgents);
    
    // Update in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('mockAgents') || '[]');
    const updatedUsers = storedUsers.filter((user: User) => user.id !== agentId);
    localStorage.setItem('mockAgents', JSON.stringify(updatedUsers));
    
    toast({
      title: "Agent deleted",
      description: "The agent has been removed from the system.",
    });
  };
  
  const handleEditAgent = (agent: User) => {
    setEditingAgent(agent);
  };
  
  const handleUpdateAgent = (updatedAgent: User) => {
    const updatedAgents = agents.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    );
    setAgents(updatedAgents);
    
    // Update in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('mockAgents') || '[]');
    const updatedUsers = storedUsers.map((user: User) => 
      user.id === updatedAgent.id ? updatedAgent : user
    );
    localStorage.setItem('mockAgents', JSON.stringify(updatedUsers));
    
    setEditingAgent(null);
  };
  
  const handleLocationDataChange = (newLocationData: any) => {
    setLocationData(newLocationData);
    localStorage.setItem('locationData', JSON.stringify(newLocationData));
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
                <h1 className="text-2xl font-bold tracking-tight">Agent Management</h1>
                <p className="text-muted-foreground">
                  Add, edit, and manage verification agents
                </p>
              </div>
              
              {activeTab === 'agents' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Agent</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new verification agent.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newAgent.name}
                          onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newAgent.email}
                          onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={newAgent.phone}
                          onChange={(e) => setNewAgent({...newAgent, phone: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="state" className="text-right">
                          State
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={newAgent.state}
                            onValueChange={(value) => setNewAgent({
                              ...newAgent, 
                              state: value,
                              district: '',
                              city: ''
                            })}
                          >
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {locationData.states.map((state) => (
                                <SelectItem key={state.id} value={state.name}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="district" className="text-right">
                          District
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={newAgent.district}
                            onValueChange={(value) => setNewAgent({
                              ...newAgent, 
                              district: value,
                              city: ''
                            })}
                            disabled={availableDistricts.length === 0}
                          >
                            <SelectTrigger id="district">
                              <SelectValue placeholder={newAgent.state ? "Select district" : "Select state first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableDistricts.map((district) => (
                                <SelectItem key={district.id} value={district.name}>
                                  {district.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">
                          City
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={newAgent.city}
                            onValueChange={(value) => setNewAgent({...newAgent, city: value})}
                            disabled={availableCities.length === 0}
                          >
                            <SelectTrigger id="city">
                              <SelectValue placeholder={newAgent.district ? "Select city" : "Select district first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCities.map((city) => (
                                <SelectItem key={city.id} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={newAgent.password}
                          onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleCreateAgent}>Save Agent</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
              </TabsList>
              <TabsContent value="agents" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Directory</CardTitle>
                    <CardDescription>
                      Complete list of all verification agents in the system
                    </CardDescription>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search agents by name, email, or district..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border bg-white overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Verifications</TableHead>
                            <TableHead>Completion Rate</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAgents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center">
                                No agents found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredAgents.map((agent) => (
                              <TableRow key={agent.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage src={agent.profilePicture} alt={agent.name} />
                                      <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{agent.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{agent.email}</TableCell>
                                <TableCell>{agent.phone || 'N/A'}</TableCell>
                                <TableCell>{agent.state || 'N/A'}</TableCell>
                                <TableCell>{agent.district || 'N/A'}</TableCell>
                                <TableCell>{agent.totalVerifications}</TableCell>
                                <TableCell>
                                  {agent.completionRate}%
                                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                                    <div 
                                      className="h-1.5 bg-green-500 rounded-full" 
                                      style={{ width: `${agent.completionRate}%` }}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleEditAgent(agent)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleDeleteAgent(agent.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="locations" className="mt-4">
                <LocationManager 
                  locationData={locationData}
                  setLocationData={handleLocationDataChange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Edit Agent Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={(open) => !open && setEditingAgent(null)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information
            </DialogDescription>
          </DialogHeader>
          {editingAgent && (
            <EditAgentForm
              agent={editingAgent}
              onUpdate={handleUpdateAgent}
              onClose={() => setEditingAgent(null)}
              locationData={locationData}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgents;
