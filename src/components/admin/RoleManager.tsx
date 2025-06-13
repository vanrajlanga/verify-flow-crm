
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/use-toast';
import { Plus, Shield, Users, Settings, Eye, Edit, Trash } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  isSystem?: boolean;
}

const defaultPermissions: Permission[] = [
  // Lead Management
  { id: 'leads.view', name: 'View Leads', description: 'View lead information', category: 'Leads' },
  { id: 'leads.create', name: 'Create Leads', description: 'Create new leads', category: 'Leads' },
  { id: 'leads.edit', name: 'Edit Leads', description: 'Edit lead information', category: 'Leads' },
  { id: 'leads.delete', name: 'Delete Leads', description: 'Delete leads', category: 'Leads' },
  { id: 'leads.assign', name: 'Assign Leads', description: 'Assign leads to agents/TVT', category: 'Leads' },
  { id: 'leads.verify', name: 'Verify Lead Data', description: 'Verify and validate lead information', category: 'Leads' },
  
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user information', category: 'Users' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users', category: 'Users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user information', category: 'Users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete users', category: 'Users' },
  
  // Verification
  { id: 'verification.view', name: 'View Verifications', description: 'View verification data', category: 'Verification' },
  { id: 'verification.perform', name: 'Perform Verification', description: 'Perform field verification', category: 'Verification' },
  { id: 'verification.review', name: 'Review Verification', description: 'Review verification results', category: 'Verification' },
  
  // Reports & Analytics
  { id: 'reports.view', name: 'View Reports', description: 'View system reports', category: 'Reports' },
  { id: 'reports.export', name: 'Export Data', description: 'Export data and reports', category: 'Reports' },
  
  // System Settings
  { id: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'Settings' },
  { id: 'settings.manage', name: 'Manage Settings', description: 'Manage system configuration', category: 'Settings' },
  { id: 'roles.manage', name: 'Manage Roles', description: 'Manage user roles and permissions', category: 'Settings' },
];

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access with all permissions',
    permissions: defaultPermissions.map(p => p.id),
    createdAt: new Date(),
    isSystem: true
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Field agent with verification capabilities',
    permissions: [
      'leads.view', 'leads.verify', 'verification.view', 'verification.perform'
    ],
    createdAt: new Date(),
    isSystem: true
  },
  {
    id: 'tvtteam',
    name: 'TVTTEAM',
    description: 'TVT team members with data verification and validation capabilities',
    permissions: [
      'leads.view', 'leads.verify', 'verification.view', 'verification.perform', 'verification.review'
    ],
    createdAt: new Date(),
    isSystem: true
  }
];

const RoleManager = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions] = useState<Permission[]>(defaultPermissions);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const storedRoles = localStorage.getItem('systemRoles');
    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        setRoles(parsedRoles);
      } catch (error) {
        console.error('Error parsing stored roles:', error);
        setRoles(defaultRoles);
        saveRoles(defaultRoles);
      }
    } else {
      setRoles(defaultRoles);
      saveRoles(defaultRoles);
    }
  };

  const saveRoles = (rolesToSave: Role[]) => {
    localStorage.setItem('systemRoles', JSON.stringify(rolesToSave));
  };

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }

    const roleExists = roles.some(role => 
      role.name.toLowerCase() === newRole.name.toLowerCase()
    );

    if (roleExists) {
      toast({
        title: "Error",
        description: "A role with this name already exists",
        variant: "destructive"
      });
      return;
    }

    const role: Role = {
      id: newRole.name.toLowerCase().replace(/\s+/g, '-'),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      createdAt: new Date(),
      isSystem: false
    };

    const updatedRoles = [...roles, role];
    setRoles(updatedRoles);
    saveRoles(updatedRoles);

    toast({
      title: "Role Created",
      description: `Role "${role.name}" has been created successfully`
    });

    setNewRole({ name: '', description: '', permissions: [] });
    setIsCreating(false);
  };

  const handleUpdateRole = (role: Role) => {
    const updatedRoles = roles.map(r => r.id === role.id ? role : r);
    setRoles(updatedRoles);
    saveRoles(updatedRoles);

    toast({
      title: "Role Updated",
      description: `Role "${role.name}" has been updated successfully`
    });
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast({
        title: "Error",
        description: "System roles cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    const updatedRoles = roles.filter(r => r.id !== roleId);
    setRoles(updatedRoles);
    saveRoles(updatedRoles);

    toast({
      title: "Role Deleted",
      description: `Role has been deleted successfully`
    });
  };

  const handlePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const updatedPermissions = checked
      ? [...role.permissions, permissionId]
      : role.permissions.filter(p => p !== permissionId);

    const updatedRole = { ...role, permissions: updatedPermissions };
    handleUpdateRole(updatedRole);
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const permissionCategories = getPermissionsByCategory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Role Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Roles
            </CardTitle>
            <CardDescription>
              Available roles in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRole?.id === role.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{role.name}</h3>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {role.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {role.permissions.length} permissions
                    </p>
                  </div>
                  {!role.isSystem && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {isCreating && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleDescription">Description</Label>
                    <Input
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      placeholder="Enter role description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateRole} size="sm">
                      Create
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsCreating(false);
                        setNewRole({ name: '', description: '', permissions: [] });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Permissions
              {selectedRole && (
                <Badge variant="outline" className="ml-auto">
                  {selectedRole.name}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedRole 
                ? `Configure permissions for ${selectedRole.name} role`
                : 'Select a role to configure permissions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <div className="space-y-6">
                {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm mb-3">{category}</h4>
                    <div className="space-y-3">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={permission.id}
                            checked={selectedRole.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(selectedRole.id, permission.id, !!checked)
                            }
                            disabled={selectedRole.isSystem}
                          />
                          <div className="flex-1">
                            <Label htmlFor={permission.id} className="text-sm font-medium">
                              {permission.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a role from the left to configure its permissions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleManager;
