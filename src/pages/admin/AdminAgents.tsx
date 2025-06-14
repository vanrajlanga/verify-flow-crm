
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/utils/mockData';

const AdminAgents = () => {
  const [agents, setAgents] = useState<User[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    state: '',
    city: '',
    baseLocation: '',
    maxTravelDistance: '',
    extraChargePerKm: '',
    password: ''
  });

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, filterStatus]);

  const loadAgents = () => {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const agentUsers = users.filter((user: User) => user.role === 'agent' || user.role === 'tvtteam');
        setAgents(agentUsers);
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(agent => agent.status === filterStatus);
    }

    setFilteredAgents(filtered);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    const storedUsers = localStorage.getItem('mockUsers');
    const allUsers = storedUsers ? JSON.parse(storedUsers) : [];

    if (editingAgent) {
      // Update existing agent
      const updatedUsers = allUsers.map((user: User) =>
        user.id === editingAgent.id
          ? { 
              ...user, 
              name: formData.name, 
              email: formData.email, 
              phone: formData.phone,
              district: formData.district,
              state: formData.state,
              city: formData.city,
              baseLocation: formData.baseLocation,
              maxTravelDistance: parseInt(formData.maxTravelDistance) || 0,
              extraChargePerKm: parseFloat(formData.extraChargePerKm) || 0,
              ...(formData.password && { password: formData.password })
            }
          : user
      );
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "Success",
        description: "Agent updated successfully"
      });
    } else {
      // Create new agent
      const newAgent: User = {
        id: `agent-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'agent',
        district: formData.district,
        state: formData.state,
        city: formData.city,
        baseLocation: formData.baseLocation,
        maxTravelDistance: parseInt(formData.maxTravelDistance) || 0,
        extraChargePerKm: parseFloat(formData.extraChargePerKm) || 0,
        status: 'Active',
        totalVerifications: 0,
        completionRate: 0,
        password: formData.password || 'defaultPassword123',
        profilePicture: null,
        documents: [],
        managedBankId: ''
      };
      
      const updatedUsers = [...allUsers, newAgent];
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "Success",
        description: "Agent created successfully"
      });
    }

    resetForm();
    loadAgents();
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', district: '', state: '', city: '', baseLocation: '', maxTravelDistance: '', extraChargePerKm: '', password: '' });
    setEditingAgent(null);
    setIsCreateDialogOpen(false);
  };

  const startEdit = (agent: User) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone || '',
      district: agent.district || '',
      state: agent.state || '',
      city: agent.city || '',
      baseLocation: agent.baseLocation || '',
      maxTravelDistance: agent.maxTravelDistance?.toString() || '',
      extraChargePerKm: agent.extraChargePerKm?.toString() || '',
      password: ''
    });
    setIsCreateDialogOpen(true);
  };

  const deleteAgent = (agentId: string) => {
    const storedUsers = localStorage.getItem('mockUsers');
    const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
    const updatedUsers = allUsers.filter((user: User) => user.id !== agentId);
    localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Success",
      description: "Agent deleted successfully"
    });
    
    loadAgents();
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'tvtteam': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Agents Management</h2>
          <p className="text-muted-foreground">Manage verification agents and TVT team members</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ name: '', email: '', phone: '', district: '', state: '', city: '', baseLocation: '', maxTravelDistance: '', extraChargePerKm: '', password: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
              <DialogDescription>
                {editingAgent ? 'Update agent details' : 'Create a new verification agent'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    placeholder="District"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Location</label>
                  <Input
                    value={formData.baseLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseLocation: e.target.value }))}
                    placeholder="Base Location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Travel Distance (km)</label>
                  <Input
                    type="number"
                    value={formData.maxTravelDistance}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTravelDistance: e.target.value }))}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Extra Charge per km</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.extraChargePerKm}
                    onChange={(e) => setFormData(prev => ({ ...prev, extraChargePerKm: e.target.value }))}
                    placeholder="10.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {editingAgent ? 'New Password (optional)' : 'Password'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={editingAgent ? "Leave blank to keep current password" : "Enter password"}
                />
                {editingAgent && (
                  <p className="text-xs text-muted-foreground">
                    Leave blank to keep the current password
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingAgent ? 'Update Agent' : 'Add Agent'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-4">
        {filteredAgents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                    <Badge className={getRoleColor(agent.role)}>
                      {agent.role === 'tvtteam' ? 'TVT Team' : 'Agent'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                  {agent.phone && (
                    <p className="text-sm text-muted-foreground">{agent.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(agent)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteAgent(agent.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{agent.city}, {agent.state}</p>
                  <p>{agent.district}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Service Area</p>
                  <p>Base: {agent.baseLocation}</p>
                  <p>Max Distance: {agent.maxTravelDistance}km</p>
                  <p>Extra Charge: ₹{agent.extraChargePerKm}/km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Performance</p>
                  <p>Total Verifications: {agent.totalVerifications || 0}</p>
                  <p>Completion Rate: {agent.completionRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No agents found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAgents;
