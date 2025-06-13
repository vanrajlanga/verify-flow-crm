
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  getPropertyTypes, 
  addPropertyType, 
  updatePropertyType, 
  deletePropertyType,
  PropertyType 
} from '@/lib/property-operations';

const PropertyTypeManager = () => {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [newPropertyType, setNewPropertyType] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPropertyTypes();
  }, []);

  const loadPropertyTypes = async () => {
    const types = await getPropertyTypes();
    setPropertyTypes(types);
  };

  const handleAdd = async () => {
    if (!newPropertyType.trim()) return;
    
    setLoading(true);
    const result = await addPropertyType(newPropertyType.trim());
    
    if (result) {
      setPropertyTypes([...propertyTypes, result]);
      setNewPropertyType('');
      toast({
        title: "Success",
        description: "Property type added successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add property type",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) return;
    
    setLoading(true);
    const result = await updatePropertyType(id, editingName.trim());
    
    if (result) {
      setPropertyTypes(propertyTypes.map(type => 
        type.id === id ? result : type
      ));
      setEditingId(null);
      setEditingName('');
      toast({
        title: "Success",
        description: "Property type updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update property type",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const success = await deletePropertyType(id);
    
    if (success) {
      setPropertyTypes(propertyTypes.filter(type => type.id !== id));
      toast({
        title: "Success",
        description: "Property type deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete property type",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const startEdit = (type: PropertyType) => {
    setEditingId(type.id);
    setEditingName(type.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Type Management</CardTitle>
        <CardDescription>
          Manage property types for the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new property type */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newPropertyType">Add New Property Type</Label>
            <Input
              id="newPropertyType"
              value={newPropertyType}
              onChange={(e) => setNewPropertyType(e.target.value)}
              placeholder="Enter property type name"
            />
          </div>
          <Button 
            onClick={handleAdd} 
            disabled={!newPropertyType.trim() || loading}
            className="self-end"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Property types list */}
        <div className="space-y-2">
          <Label>Existing Property Types</Label>
          {propertyTypes.length === 0 ? (
            <p className="text-muted-foreground">No property types found</p>
          ) : (
            <div className="space-y-2">
              {propertyTypes.map((type) => (
                <div key={type.id} className="flex items-center gap-2 p-2 border rounded">
                  {editingId === type.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleEdit(type.id)}
                        disabled={!editingName.trim() || loading}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEdit}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{type.name}</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => startEdit(type)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(type.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyTypeManager;
