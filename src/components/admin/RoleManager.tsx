
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
}

const defaultPermissions: Permission[] = [
  // Dashboard permissions
  { id: 'dashboard_view', name: 'View Dashboard', module: 'Dashboard', description: 'View dashboard statistics and overview' },
  
  // Leads permissions
  { id: 'leads_view', name: 'View Leads', module: 'Leads', description: 'View leads list and details' },
  { id: 'leads_create', name: 'Create Leads', module: 'Leads', description: 'Create new leads' },
  { id: 'leads_edit', name: 'Edit Leads', module: 'Leads', description: 'Edit existing leads' },
  { id: 'leads_delete', name: 'Delete Leads', module: 'Leads', description: 'Delete leads' },
  { id: 'leads_assign', name: 'Assign Leads', module: 'Leads', description: 'Assign leads to agents' },
  { id: 'leads_export', name: 'Export Leads', module: 'Leads', description: 'Export leads data' },
  
  // Agent permissions
  { id: 'agents_view', name: 'View Agents', module: 'Agents', description: 'View agents list and details' },
  { id: 'agents_create', name: 'Create Agents', module: 'Agents', description: 'Create new agents' },
  { id: 'agents_edit', name: 'Edit Agents', module: 'Agents', description: 'Edit agent details' },
  { id: 'agents_delete', name: 'Delete Agents', module: 'Agents', description: 'Delete agents' },
  
  // Reports permissions
  { id: 'reports_view', name: 'View Reports', module: 'Reports', description: 'View reports and analytics' },
  { id: 'reports_export', name: 'Export Reports', module: 'Reports', description: 'Export reports data' },
  
  // Settings permissions
  { id: 'settings_view', name: 'View Settings', module: 'Settings', description: 'View system settings' },
  { id: 'settings_edit', name: 'Edit Settings', module: 'Settings', description: 'Modify system settings' },
  
  // Role permissions
  { id: 'roles_view', name: 'View Roles', module: 'Roles', description: 'View roles and permissions' },
  { id: 'roles_create', name: 'Create Roles', module: 'Roles', description: 'Create new roles' },
  { id: 'roles_edit', name: 'Edit Roles', module: 'Roles', description: 'Edit existing roles' },
  { id: 'roles_delete', name: 'Delete Roles', module: 'Roles', description: 'Delete roles' },
];

const RoleManager = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions] = useState<Permission[]>(defaultPermissions);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    const storedRoles = localStorage.getItem('systemRoles');
    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        setRoles(parsedRoles);
      } catch (error) {
        console.error('Error parsing stored roles:', error);
        initializeDefaultRoles();
      }
    } else {
      initializeDefaultRoles();
    }
  }, []);

  const initializeDefaultRoles = () => {
    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: permissions.map(p => p.id),
        createdAt: new Date()
      },
      {
        id: 'agent',
        name: 'Field Agent',
        description: 'Limited access for field verification work',
        permissions: ['dashboard_view', 'leads_view', 'leads_edit'],
        createdAt: new Date()
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Management level access with reporting capabilities',
        permissions: ['dashboard_view', 'leads_view', 'leads_create', 'leads_edit', 'leads_assign', 'agents_view', 'reports_view', 'reports_export'],
        createdAt: new Date()
      }
    ];
    
    setRoles(defaultRoles);
    localStorage.setItem('systemRoles', JSON.stringify(defaultRoles));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }

    if (editingRole) {
      // Update existing role
      const updatedRoles = roles.map(role =>
        role.id === editingRole.id
          ? { ...role, name: formData.name, description: formData.description, permissions: formData.permissions }
          : role
      );
      setRoles(updatedRoles);
      localStorage.setItem('systemRoles', JSON.stringify(updatedRoles));
      
      toast({
        title: "Success",
        description: "Role updated successfully"
      });
    } else {
      // Create new role
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        createdAt: new Date()
      };
      
      const updatedRoles = [...roles, newRole];
      setRoles(updatedRoles);
      localStorage.setItem('systemRoles', JSON.stringify(updatedRoles));
      
      toast({
        title: "Success",
        description: "Role created successfully"
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setEditingRole(null);
    setIsCreateDialogOpen(false);
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setIsCreateDialogOpen(true);
  };

  const deleteRole = (roleId: string) => {
    if (roleId === 'admin' || roleId === 'agent') {
      toast({
        title: "Error",
        description: "Cannot delete system default roles",
        variant: "destructive"
      });
      return;
    }

    const updatedRoles = roles.filter(role => role.id !== roleId);
    setRoles(updatedRoles);
    localStorage.setItem('systemRoles', JSON.stringify(updatedRoles));
    
    toast({
      title: "Success",
      description: "Role deleted successfully"
    });
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Roles & Permissions</h2>
          <p className="text-muted-foreground">Create and manage user roles with specific permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ name: '', description: '', permissions: [] })}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
              <DialogDescription>
                {editingRole ? 'Update role details and permissions' : 'Define a new role with specific permissions'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Role description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Permissions</h3>
                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <Card key={module}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{module}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {modulePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={permission.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission.name}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {role.permissions.length} permissions assigned
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(role)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {role.id !== 'admin' && role.id !== 'agent' && (
                    <Button variant="ghost" size="sm" onClick={() => deleteRole(role.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {role.permissions.slice(0, 6).map((permissionId) => {
                  const permission = permissions.find(p => p.id === permissionId);
                  return permission ? (
                    <span key={permissionId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {permission.name}
                    </span>
                  ) : null;
                })}
                {role.permissions.length > 6 && (
                  <span className="text-xs text-muted-foreground">
                    +{role.permissions.length - 6} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleManager;
