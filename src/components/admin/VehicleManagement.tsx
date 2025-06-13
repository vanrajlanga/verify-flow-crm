
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  getVehicleBrands, 
  addVehicleBrand, 
  updateVehicleBrand, 
  deleteVehicleBrand,
  getVehicleTypes, 
  addVehicleType, 
  updateVehicleType, 
  deleteVehicleType,
  getVehicleModels, 
  addVehicleModel, 
  updateVehicleModel, 
  deleteVehicleModel,
  VehicleBrand,
  VehicleType,
  VehicleModel
} from '@/lib/vehicle-operations';

const VehicleManagement = () => {
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  
  const [newBrand, setNewBrand] = useState('');
  const [newType, setNewType] = useState('');
  const [newModel, setNewModel] = useState('');
  
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  
  const [editingBrandName, setEditingBrandName] = useState('');
  const [editingTypeName, setEditingTypeName] = useState('');
  const [editingModelName, setEditingModelName] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [brands, types, models] = await Promise.all([
      getVehicleBrands(),
      getVehicleTypes(),
      getVehicleModels()
    ]);
    setVehicleBrands(brands);
    setVehicleTypes(types);
    setVehicleModels(models);
  };

  // Brand operations
  const handleAddBrand = async () => {
    if (!newBrand.trim()) return;
    
    setLoading(true);
    const result = await addVehicleBrand(newBrand.trim());
    
    if (result) {
      setVehicleBrands([...vehicleBrands, result]);
      setNewBrand('');
      toast({ title: "Success", description: "Vehicle brand added successfully" });
    } else {
      toast({ title: "Error", description: "Failed to add vehicle brand", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleEditBrand = async (id: string) => {
    if (!editingBrandName.trim()) return;
    
    setLoading(true);
    const result = await updateVehicleBrand(id, editingBrandName.trim());
    
    if (result) {
      setVehicleBrands(vehicleBrands.map(brand => brand.id === id ? result : brand));
      setEditingBrandId(null);
      setEditingBrandName('');
      toast({ title: "Success", description: "Vehicle brand updated successfully" });
    } else {
      toast({ title: "Error", description: "Failed to update vehicle brand", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDeleteBrand = async (id: string) => {
    setLoading(true);
    const success = await deleteVehicleBrand(id);
    
    if (success) {
      setVehicleBrands(vehicleBrands.filter(brand => brand.id !== id));
      toast({ title: "Success", description: "Vehicle brand deleted successfully" });
    } else {
      toast({ title: "Error", description: "Failed to delete vehicle brand", variant: "destructive" });
    }
    setLoading(false);
  };

  // Type operations
  const handleAddType = async () => {
    if (!newType.trim()) return;
    
    setLoading(true);
    const result = await addVehicleType(newType.trim());
    
    if (result) {
      setVehicleTypes([...vehicleTypes, result]);
      setNewType('');
      toast({ title: "Success", description: "Vehicle type added successfully" });
    } else {
      toast({ title: "Error", description: "Failed to add vehicle type", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleEditType = async (id: string) => {
    if (!editingTypeName.trim()) return;
    
    setLoading(true);
    const result = await updateVehicleType(id, editingTypeName.trim());
    
    if (result) {
      setVehicleTypes(vehicleTypes.map(type => type.id === id ? result : type));
      setEditingTypeId(null);
      setEditingTypeName('');
      toast({ title: "Success", description: "Vehicle type updated successfully" });
    } else {
      toast({ title: "Error", description: "Failed to update vehicle type", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDeleteType = async (id: string) => {
    setLoading(true);
    const success = await deleteVehicleType(id);
    
    if (success) {
      setVehicleTypes(vehicleTypes.filter(type => type.id !== id));
      toast({ title: "Success", description: "Vehicle type deleted successfully" });
    } else {
      toast({ title: "Error", description: "Failed to delete vehicle type", variant: "destructive" });
    }
    setLoading(false);
  };

  // Model operations
  const handleAddModel = async () => {
    if (!newModel.trim()) return;
    
    setLoading(true);
    const result = await addVehicleModel(newModel.trim());
    
    if (result) {
      setVehicleModels([...vehicleModels, result]);
      setNewModel('');
      toast({ title: "Success", description: "Vehicle model added successfully" });
    } else {
      toast({ title: "Error", description: "Failed to add vehicle model", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleEditModel = async (id: string) => {
    if (!editingModelName.trim()) return;
    
    setLoading(true);
    const result = await updateVehicleModel(id, editingModelName.trim());
    
    if (result) {
      setVehicleModels(vehicleModels.map(model => model.id === id ? result : model));
      setEditingModelId(null);
      setEditingModelName('');
      toast({ title: "Success", description: "Vehicle model updated successfully" });
    } else {
      toast({ title: "Error", description: "Failed to update vehicle model", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDeleteModel = async (id: string) => {
    setLoading(true);
    const success = await deleteVehicleModel(id);
    
    if (success) {
      setVehicleModels(vehicleModels.filter(model => model.id !== id));
      toast({ title: "Success", description: "Vehicle model deleted successfully" });
    } else {
      toast({ title: "Error", description: "Failed to delete vehicle model", variant: "destructive" });
    }
    setLoading(false);
  };

  const renderManagementSection = (
    items: any[],
    newValue: string,
    setNewValue: (value: string) => void,
    handleAdd: () => void,
    editingId: string | null,
    editingName: string,
    setEditingName: (value: string) => void,
    handleEdit: (id: string) => void,
    handleDelete: (id: string) => void,
    setEditingId: (id: string | null) => void,
    title: string
  ) => (
    <div className="space-y-4">
      {/* Add new item */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor={`new${title}`}>Add New {title}</Label>
          <Input
            id={`new${title}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Enter ${title.toLowerCase()} name`}
          />
        </div>
        <Button 
          onClick={handleAdd} 
          disabled={!newValue.trim() || loading}
          className="self-end"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        <Label>Existing {title}s</Label>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No {title.toLowerCase()}s found</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                {editingId === item.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleEdit(item.id)}
                      disabled={!editingName.trim() || loading}
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingId(null)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{item.name}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingName(item.name);
                      }}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(item.id)}
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
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Management</CardTitle>
        <CardDescription>
          Manage vehicle brands, types, and models for the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="brands" className="space-y-4">
          <TabsList>
            <TabsTrigger value="brands">Vehicle Brands</TabsTrigger>
            <TabsTrigger value="types">Vehicle Types</TabsTrigger>
            <TabsTrigger value="models">Vehicle Models</TabsTrigger>
          </TabsList>

          <TabsContent value="brands">
            {renderManagementSection(
              vehicleBrands,
              newBrand,
              setNewBrand,
              handleAddBrand,
              editingBrandId,
              editingBrandName,
              setEditingBrandName,
              handleEditBrand,
              handleDeleteBrand,
              setEditingBrandId,
              "Brand"
            )}
          </TabsContent>

          <TabsContent value="types">
            {renderManagementSection(
              vehicleTypes,
              newType,
              setNewType,
              handleAddType,
              editingTypeId,
              editingTypeName,
              setEditingTypeName,
              handleEditType,
              handleDeleteType,
              setEditingTypeId,
              "Type"
            )}
          </TabsContent>

          <TabsContent value="models">
            {renderManagementSection(
              vehicleModels,
              newModel,
              setNewModel,
              handleAddModel,
              editingModelId,
              editingModelName,
              setEditingModelName,
              handleEditModel,
              handleDeleteModel,
              setEditingModelId,
              "Model"
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VehicleManagement;
