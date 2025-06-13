import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { 
  getAgentsFromDatabase, 
  addAgentToDatabase, 
  updateAgentInDatabase, 
  deleteAgentFromDatabase 
} from '@/lib/agent-operations';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"

const roleSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  district: z.string().min(2, {
    message: "District must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  baseLocation: z.string().min(2, {
    message: "Base location must be at least 2 characters.",
  }),
  maxTravelDistance: z.string().refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  }, {
    message: "Max travel distance must be a non-negative number.",
  }),
  extraChargePerKm: z.string().refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  }, {
    message: "Extra charge per km must be a non-negative number.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

const AdminAgents = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<User[]>([]);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<User | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      district: "",
      state: "",
      city: "",
      baseLocation: "",
      maxTravelDistance: "50",
      extraChargePerKm: "0",
      password: "",
    },
  })

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
    loadAgents();
  }, [navigate]);

  const loadAgents = async () => {
    try {
      // Load agents from database
      const dbAgents = await getAgentsFromDatabase();
      if (dbAgents.length > 0) {
        console.log('Loaded agents from database:', dbAgents.length);
        setAgents(dbAgents);
      } else {
        // Fall back to localStorage if no database agents
        const storedUsers = localStorage.getItem('mockUsers');
        if (storedUsers) {
          try {
            const parsedUsers = JSON.parse(storedUsers);
            const filteredAgents = parsedUsers.filter((user: User) => user.role === 'agent');
            setAgents(filteredAgents);
          } catch (error) {
            console.error("Error parsing stored users:", error);
            setAgents([]);
          }
        } else {
          setAgents([]);
        }
      }
    } catch (error) {
      console.error('Error in loadAgents:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleAddAgent = async (agentData: any) => {
    try {
      const newAgent: User = {
        id: `agent-${Date.now()}`,
        name: agentData.name,
        email: agentData.email,
        phone: agentData.phone,
        role: 'agent',
        district: agentData.district,
        status: 'active',
        state: agentData.state,
        city: agentData.city,
        baseLocation: agentData.baseLocation,
        maxTravelDistance: parseInt(agentData.maxTravelDistance) || 50,
        extraChargePerKm: parseFloat(agentData.extraChargePerKm) || 0,
        profilePicture: '',
        totalVerifications: 0,
        completionRate: 0,
        password: agentData.password
      };

      // Add to database
      try {
        await addAgentToDatabase(newAgent);
        
        // Update local state
        setAgents(prevAgents => [...prevAgents, newAgent]);
        setIsAddingAgent(false);

        toast({
          title: "Agent added",
          description: `${newAgent.name} has been added successfully.`,
        });

        // Reload data from database
        loadAgents();
      } catch (dbError) {
        console.error('Error adding agent to database:', dbError);
        
        // Fall back to localStorage update
        setAgents(prevAgents => [...prevAgents, newAgent]);
        localStorage.setItem('mockUsers', JSON.stringify([...agents, newAgent]));
        setIsAddingAgent(false);

        toast({
          title: "Agent added",
          description: `${newAgent.name} has been added successfully (saved locally).`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding agent:', error);
      toast({
        title: "Error",
        description: "Failed to add agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAgent = async (agent: User) => {
    try {
      // Update in database
      await updateAgentInDatabase(agent);
      
      // Update local state
      const updatedAgents = agents.map(a => a.id === agent.id ? agent : a);
      setAgents(updatedAgents);
      setEditingAgent(null);

      toast({
        title: "Agent updated",
        description: `${agent.name} has been updated successfully.`,
      });

      // Reload data from database
      loadAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
      
      // Fall back to localStorage update
      const updatedAgents = agents.map(a => a.id === agent.id ? agent : a);
      setAgents(updatedAgents);
      localStorage.setItem('mockUsers', JSON.stringify(updatedAgents));
      setEditingAgent(null);

      toast({
        title: "Agent updated",
        description: `${agent.name} has been updated successfully (saved locally).`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      // Delete from database
      await deleteAgentFromDatabase(agentId);
      
      // Update local state
      const updatedAgents = agents.filter(agent => agent.id !== agentId);
      setAgents(updatedAgents);

      toast({
        title: "Agent deleted",
        description: `Agent ${agentId} has been removed.`,
      });

      // Reload data from database
      loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      
      // Fall back to localStorage delete
      const updatedAgents = agents.filter(agent => agent.id !== agentId);
      setAgents(updatedAgents);
      localStorage.setItem('mockUsers', JSON.stringify(updatedAgents));

      toast({
        title: "Agent deleted",
        description: `Agent ${agentId} has been removed (saved locally).`,
        variant: "destructive"
      });
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Agents Management</h1>
                <p className="text-muted-foreground">
                  Manage and track all verification agents
                </p>
              </div>
              <Button onClick={() => setIsAddingAgent(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Agent
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Agents List</CardTitle>
                <CardDescription>
                  A comprehensive list of all agents in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>{agent.name}</TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>{agent.phone}</TableCell>
                        <TableCell>{agent.district}</TableCell>
                        <TableCell>{agent.status}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingAgent(agent)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteAgent(agent.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Agent Dialog */}
      <Dialog open={isAddingAgent} onOpenChange={() => setIsAddingAgent(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new agent account
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddAgent)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Agent Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="agent@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+919999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input placeholder="District" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Base Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxTravelDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Travel Distance (KM)</FormLabel>
                    <FormControl>
                      <Input placeholder="50" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="extraChargePerKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra Charge Per KM</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Add Agent</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Edit agent details
            </DialogDescription>
          </DialogHeader>
          {editingAgent && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => handleUpdateAgent({
                ...editingAgent,
                name: values.name,
                email: values.email,
                phone: values.phone,
                district: values.district,
                state: values.state,
                city: values.city,
                baseLocation: values.baseLocation,
                maxTravelDistance: parseInt(values.maxTravelDistance) || 50,
                extraChargePerKm: parseFloat(values.extraChargePerKm) || 0,
                password: values.password
              }))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Agent Name" defaultValue={editingAgent.name} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="agent@example.com" defaultValue={editingAgent.email} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+919999999999" defaultValue={editingAgent.phone} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="District" defaultValue={editingAgent.district} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" defaultValue={editingAgent.state} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" defaultValue={editingAgent.city} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baseLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Base Location" defaultValue={editingAgent.baseLocation} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxTravelDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Travel Distance (KM)</FormLabel>
                      <FormControl>
                        <Input placeholder="50" type="number" defaultValue={editingAgent.maxTravelDistance.toString()} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="extraChargePerKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra Charge Per KM</FormLabel>
                      <FormControl>
                        <Input placeholder="0" type="number" defaultValue={editingAgent.extraChargePerKm.toString()} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Update Agent</Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgents;
