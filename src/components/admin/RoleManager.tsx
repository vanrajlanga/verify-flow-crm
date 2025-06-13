
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  status: 'Active' | 'Inactive';
  createdAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

const RoleManager = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [],
    status: 'Active' as 'Active' | 'Inactive',
  });
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Mock data for roles including TVTTEAM
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Admin',
        description: 'Administrator role with full access',
        permissions: ['read', 'write', 'update', 'delete'],
        status: 'Active',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Agent',
        description: 'Agent role with limited access',
        permissions: ['read', 'write'],
        status: 'Active',
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'TVTTEAM',
        description: 'TVT Team member role with verification access to assigned leads',
        permissions: ['read', 'verify', 'update_verification'],
        status: 'Active',
        createdAt: new Date(),
      },
    ];
    setRoles(mockRoles);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewRole({ ...newRole, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (status: 'Active' | 'Inactive') => {
    setNewRole({ ...newRole, status });
  };

  const addRole = () => {
    if (newRole.name && newRole.description) {
      const newRoleWithId: Role = {
        id: Date.now().toString(),
        name: newRole.name,
        description: newRole.description,
        permissions: [],
        status: newRole.status,
        createdAt: new Date(),
      };
      setRoles([...roles, newRoleWithId]);
      setNewRole({ name: '', description: '', permissions: [], status: 'Active' });
      toast({
        title: "Role added",
        description: `New role ${newRoleWithId.name} has been created successfully.`,
      });
    } else {
      alert('Please fill in all fields.');
    }
  };

  const startEditing = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const cancelEditing = () => {
    setEditingRole(null);
    setIsModalOpen(false);
  };

  const updateRole = () => {
    if (!editingRole) return;

    setRoles(
      roles.map((role) =>
        role.id === editingRole.id ? { ...editingRole } : role
      )
    );
    setEditingRole(null);
    setIsModalOpen(false);
    toast({
      title: "Role updated",
      description: `Role ${editingRole.name} has been updated successfully.`,
    });
  };

  const deleteRole = (id: string) => {
    setRoles(roles.filter((role) => role.id !== id));
    toast({
      title: "Role deleted",
      description: `Role has been deleted successfully.`,
    });
  };

  return (
    <div className="container mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Add New Role</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={newRole.name}
                    onChange={handleInputChange}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newRole.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={newRole.status === 'Active' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('Active')}
                    >
                      Active
                    </Button>
                    <Button
                      variant={newRole.status === 'Inactive' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('Inactive')}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
                <Button onClick={addRole}>Add Role</Button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Existing Roles</h3>
              <div className="space-y-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{role.name}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        <Badge variant={role.status === 'Active' ? 'default' : 'secondary'}>
                          {role.status}
                        </Badge>
                        {role.name === 'TVTTEAM' && (
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Lead Verification Access
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEditing(role)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteRole(role.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Modal */}
      {isModalOpen && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Edit Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="editName">Role Name</Label>
                <Input
                  type="text"
                  id="editName"
                  value={editingRole.name}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingRole.description}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={editingRole.status === 'Active' ? 'default' : 'outline'}
                    onClick={() =>
                      setEditingRole({ ...editingRole, status: 'Active' })
                    }
                  >
                    Active
                  </Button>
                  <Button
                    variant={editingRole.status === 'Inactive' ? 'default' : 'outline'}
                    onClick={() =>
                      setEditingRole({ ...editingRole, status: 'Inactive' })
                    }
                  >
                    Inactive
                  </Button>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button onClick={updateRole}>
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
