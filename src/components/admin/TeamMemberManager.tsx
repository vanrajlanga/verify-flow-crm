
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
import { Plus, Edit, Trash2, Key } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/utils/mockData';
import { Role } from './RoleManager';

const TeamMemberManager = () => {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: ''
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    // Load team members
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        setTeamMembers(users);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    }

    // Load roles
    const storedRoles = localStorage.getItem('systemRoles');
    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        setRoles(parsedRoles);
      } catch (error) {
        console.error('Error loading roles:', error);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.role) {
      toast({
        title: "Error",
        description: "Name, email, and role are required",
        variant: "destructive"
      });
      return;
    }

    if (editingMember) {
      // Update existing member
      const updatedMembers = teamMembers.map(member =>
        member.id === editingMember.id
          ? { 
              ...member, 
              name: formData.name, 
              email: formData.email, 
              phone: formData.phone,
              role: formData.role as 'admin' | 'agent',
              ...(formData.password && { password: formData.password })
            }
          : member
      );
      setTeamMembers(updatedMembers);
      localStorage.setItem('mockUsers', JSON.stringify(updatedMembers));
      
      toast({
        title: "Success",
        description: "Team member updated successfully"
      });
    } else {
      // Create new member
      const newMember: User = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as 'admin' | 'agent',
        password: formData.password || 'defaultPassword123',
        district: '',
        status: 'Active', // Changed from 'active' to 'Active'
        totalVerifications: 0,
        completionRate: 0
      };
      
      const updatedMembers = [...teamMembers, newMember];
      setTeamMembers(updatedMembers);
      localStorage.setItem('mockUsers', JSON.stringify(updatedMembers));
      
      toast({
        title: "Success",
        description: "Team member created successfully"
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', role: '', password: '' });
    setEditingMember(null);
    setIsCreateDialogOpen(false);
  };

  const startEdit = (member: User) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      password: ''
    });
    setIsCreateDialogOpen(true);
  };

  const deleteMember = (memberId: string) => {
    const updatedMembers = teamMembers.filter(member => member.id !== memberId);
    setTeamMembers(updatedMembers);
    localStorage.setItem('mockUsers', JSON.stringify(updatedMembers));
    
    toast({
      title: "Success",
      description: "Team member deleted successfully"
    });
  };

  const handleResetPassword = () => {
    if (!newPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive"
      });
      return;
    }

    if (resetPasswordUser) {
      const updatedMembers = teamMembers.map(member =>
        member.id === resetPasswordUser.id
          ? { ...member, password: newPassword }
          : member
      );
      setTeamMembers(updatedMembers);
      localStorage.setItem('mockUsers', JSON.stringify(updatedMembers));
      
      toast({
        title: "Success",
        description: "Password reset successfully"
      });
      
      setResetPasswordUser(null);
      setNewPassword('');
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Team Members</h2>
          <p className="text-muted-foreground">Manage team members and their role assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ name: '', email: '', phone: '', role: '', password: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
              <DialogDescription>
                {editingMember ? 'Update team member details and role assignment' : 'Create a new team member with role assignment'}
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {editingMember ? 'New Password (optional)' : 'Password'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={editingMember ? "Leave blank to keep current password" : "Enter password"}
                />
                {editingMember && (
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
                {editingMember ? 'Update Member' : 'Add Member'}
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
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <Badge className={getRoleColor(member.role)}>
                      {getRoleName(member.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  {member.phone && (
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setResetPasswordUser(member)}>
                        <Key className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter a new password for {member.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">New Password</label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setResetPasswordUser(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleResetPassword}>
                          Reset Password
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => deleteMember(member.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>District: {member.district || 'Not assigned'}</p>
                <p>Total Verifications: {member.totalVerifications || 0}</p>
                <p>Completion Rate: {member.completionRate || 0}%</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamMemberManager;
