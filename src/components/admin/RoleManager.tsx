
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const RoleManager = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });
  const [showAddRole, setShowAddRole] = useState(false);

  useEffect(() => {
    loadRolesAndPermissions();
  }, []);

  const loadRolesAndPermissions = () => {
    // Load from localStorage or set defaults
    const storedRoles = localStorage.getItem('roles');
    const storedPermissions = localStorage.getItem('permissions');

    const defaultPermissions: Permission[] = [
      { id: 'leads.view', name: 'View Leads', description: 'Can view lead information', category: 'Leads' },
      { id: 'leads.create', name: 'Create Leads', description: 'Can create new leads', category: 'Leads' },
      { id: 'leads.edit', name: 'Edit Leads', description: 'Can edit lead information', category: 'Leads' },
      { id: 'leads.delete', name: 'Delete Leads', description: 'Can delete leads', category: 'Leads' },
      { id: 'leads.assign', name: 'Assign Leads', description: 'Can assign leads to agents', category: 'Leads' },
      { id: 'agents.view', name: 'View Agents', description: 'Can view agent information', category: 'Users' },
      { id: 'agents.manage', name: 'Manage Agents', description: 'Can create, edit, and delete agents', category: 'Users' },
      { id: 'verifications.view', name: 'View Verifications', description: 'Can view verification data', category: 'Verifications' },
      { id: 'verifications.conduct', name: 'Conduct Verifications', description: 'Can perform verifications', category: 'Verifications' },
      { id: 'verifications.approve', name: 'Approve Verifications', description: 'Can approve verification results', category: 'Verifications' },
      { id: 'reports.view', name: 'View Reports', description: 'Can view system reports', category: 'Reports' },
      { id: 'settings.manage', name: 'Manage Settings', description: 'Can manage system settings', category: 'System' },
      { id: 'roles.manage', name: 'Manage Roles', description: 'Can manage user roles and permissions', category: 'System' }
    ];

    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: 'Admin',
        description: 'Full system access and management capabilities',
        permissions: defaultPermissions.map(p => p.id),
        isSystem: true
      },
      {
        id: 'agent',
        name: 'Agent',
        description: 'Field verification agent with limited access',
        permissions: ['leads.view', 'verifications.view', 'verifications.conduct'],
        isSystem: true
      },
      {
        id: 'inhouse-team',
        name: 'Inhouse Team',
        description: 'Internal team members with verification capabilities',
        permissions: ['leads.view', 'verifications.view', 'verifications.conduct', 'verifications.approve'],
        isSystem: false
      }
    ];

    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        // Ensure Inhouse Team role exists
        const hasInhouseTeam = parsedRoles.some((role: Role) => role.id === 'inhouse-team');
        if (!hasInhouseTeam) {
          parsedRoles.push(defaultRoles.find(r => r.id === 'inhouse-team'));
        }
        setRoles(parsedRoles);
      } catch (error) {
        console.error('Error parsing stored roles:', error);
        setRoles(defaultRoles);
      }
    } else {
      setRoles(defaultRoles);
      localStorage.setItem('roles', JSON.stringify(defaultRoles));
    }

    if (storedPermissions) {
      try {
        setPermissions(JSON.parse(storedPermissions));
      } catch (error) {
        console.error('Error parsing stored permissions:', error);
        setPermissions(defaultPermissions);
      }
    } else {
      setPermissions(defaultPermissions);
      localStorage.setItem('permissions', JSON.stringify(defaultPermissions));
    }
  };

  const saveRoles = (updatedRoles: Role[]) => {
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
  };

  const handleAddRole = () => {
    if (!newRole.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }

    const roleExists = roles.some(role => role.name.toLowerCase() === newRole.name.toLowerCase());
    if (roleExists) {
      toast({
        title: "Error",
        description: "A role with this name already exists",
        variant: "destructive"
      });
      return;
    }

    const role: Role = {
      id: `role-${Date.now()}`,
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      isSystem: false
    };

    const updatedRoles = [...roles, role];
    saveRoles(updatedRoles);
    setNewRole({ name: '', description: '', permissions: [] });
    setShowAddRole(false);

    toast({
      title: "Success",
      description: "Role created successfully"
    });
  };

  const handleEditRole = (roleId: string, updatedRole: Partial<Role>) => {
    const updatedRoles = roles.map(role =>
      role.id === roleId ? { ...role, ...updatedRole } : role
    );
    saveRoles(updatedRoles);
    setEditingRole(null);

    toast({
      title: "Success",
      description: "Role updated successfully"
    });
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast({
        title: "Error",
        description: "Cannot delete system roles",
        variant: "destructive"
      });
      return;
    }

    const updatedRoles = roles.filter(role => role.id !== roleId);
    saveRoles(updatedRoles);

    toast({
      title: "Success",
      description: "Role deleted successfully"
    });
  };

  const togglePermission = (roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const hasPermission = role.permissions.includes(permissionId);
    const updatedPermissions = hasPermission
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    handleEditRole(roleId, { permissions: updatedPermissions });
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
        </div>
        <Button onClick={() => setShowAddRole(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Manage Roles</TabsTrigger>
          <TabsTrigger value="permissions">View Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {showAddRole && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description</Label>
                    <Textarea
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter role description"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Permissions</Label>
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Switch
                              checked={newRole.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewRole(prev => ({
                                    ...prev,
                                    permissions: [...prev.permissions, permission.id]
                                  }));
                                } else {
                                  setNewRole(prev => ({
                                    ...prev,
                                    permissions: prev.permissions.filter(p => p !== permission.id)
                                  }));
                                }
                              }}
                            />
                            <Label className="text-sm">{permission.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddRole}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Role
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddRole(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      {role.isSystem && <Badge variant="secondary">System</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRole(editingRole === role.id ? null : role.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{role.description}</p>
                  {editingRole === role.id && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Permissions</h4>
                      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                        <div key={category} className="space-y-2">
                          <h5 className="font-medium text-sm text-muted-foreground">{category}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {categoryPermissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Switch
                                  checked={role.permissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(role.id, permission.id)}
                                  disabled={role.isSystem}
                                />
                                <Label className="text-sm">{permission.name}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {editingRole !== role.id && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Assigned Permissions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permissionId) => {
                          const permission = permissions.find(p => p.id === permissionId);
                          return permission ? (
                            <Badge key={permissionId} variant="outline">
                              {permission.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category} Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">{permission.name}</span>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                      <Badge variant="outline">{permission.id}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleManager;
