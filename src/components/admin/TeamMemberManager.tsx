
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/utils/mockData';

interface TeamMember extends User {
  permissions: string[];
}

const TeamMemberManager = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'agent' as 'admin' | 'agent',
    phone: '',
    district: '',
    state: '',
    city: '',
    password: 'password'
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = () => {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const members = users.map((user: User) => ({
          ...user,
          permissions: user.role === 'admin' ? ['all'] : ['leads_view', 'leads_edit']
        }));
        setTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    }
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

    if (editingMember) {
      // Update existing member
      const updatedMember = {
        ...editingMember,
        ...formData
      };
      
      const updatedMembers = teamMembers.map(member =>
        member.id === editingMember.id ? updatedMember : member
      );
      setTeamMembers(updatedMembers);
      
      // Update localStorage
      const updatedUsers = updatedMembers.map(({ permissions, ...user }) => user);
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "Success",
        description: "Team member updated successfully"
      });
    } else {
      // Create new member
      const newMember: TeamMember = {
        id: `user-${Date.now()}`,
        ...formData,
        status: 'Active',
        totalVerifications: 0,
        completionRate: 0,
        permissions: formData.role === 'admin' ? ['all'] : ['leads_view', 'leads_edit']
      };
      
      const updatedMembers = [...teamMembers, newMember];
      setTeamMembers(updatedMembers);
      
      // Update localStorage
      const updatedUsers = updatedMembers.map(({ permissions, ...user }) => user);
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "Success",
        description: "Team member created successfully"
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'agent',
      phone: '',
      district: '',
      state: '',
      city: '',
      password: 'password'
    });
    setEditingMember(null);
    setIsCreateDialogOpen(false);
  };

  const startEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role as 'admin' | 'agent',
      phone: member.phone || '',
      district: member.district || '',
      state: member.state || '',
      city: member.city || '',
      password: member.password
    });
    setIsCreateDialogOpen(true);
  };

  const deleteMember = (memberId: string) => {
    if (memberId === 'admin-1' || memberId === 'agent-1') {
      toast({
        title: "Error",
        description: "Cannot delete default system users",
        variant: "destructive"
      });
      return;
    }

    const updatedMembers = teamMembers.filter(member => member.id !== memberId);
    setTeamMembers(updatedMembers);
    
    // Update localStorage
    const updatedUsers = updatedMembers.map(({ permissions, ...user }) => user);
    localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Success",
      description: "Team member deleted successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Team Members</h2>
          <p className="text-muted-foreground">Manage team members and their access</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ name: '', email: '', role: 'agent', phone: '', district: '', state: '', city: '', password: 'password' })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
              <DialogDescription>
                {editingMember ? 'Update team member details' : 'Create a new team member account'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                    type="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={formData.role} onValueChange={(value: 'admin' | 'agent') => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    placeholder="Enter district"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  type="password"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingMember ? 'Update' : 'Create'} Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{member.email}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Role: {member.role} | {member.district || 'No district'}, {member.state || 'No state'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {member.id !== 'admin-1' && member.id !== 'agent-1' && (
                    <Button variant="ghost" size="sm" onClick={() => deleteMember(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {member.permissions.map((permission) => (
                  <span key={permission} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {permission === 'all' ? 'All Permissions' : permission.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamMemberManager;
