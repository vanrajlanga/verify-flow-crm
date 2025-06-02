
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface VehicleBrand {
  id: string;
  name: string;
}

export interface VehicleModel {
  id: string;
  name: string;
  brandId: string;
}

const VehicleManager = () => {
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newModel, setNewModel] = useState({ name: '', brandId: '' });

  useEffect(() => {
    // Load existing data from localStorage
    const storedBrands = localStorage.getItem('vehicleBrands');
    const storedModels = localStorage.getItem('vehicleModels');
    
    if (storedBrands) {
      setVehicleBrands(JSON.parse(storedBrands));
    } else {
      // Initialize with default brands
      const defaultBrands: VehicleBrand[] = [
        { id: 'brand-1', name: 'Maruti Suzuki' },
        { id: 'brand-2', name: 'Hyundai' },
        { id: 'brand-3', name: 'Tata Motors' },
        { id: 'brand-4', name: 'Mahindra' },
        { id: 'brand-5', name: 'Honda' }
      ];
      setVehicleBrands(defaultBrands);
      localStorage.setItem('vehicleBrands', JSON.stringify(defaultBrands));
    }

    if (storedModels) {
      setVehicleModels(JSON.parse(storedModels));
    } else {
      // Initialize with default models
      const defaultModels: VehicleModel[] = [
        { id: 'model-1', name: 'Swift', brandId: 'brand-1' },
        { id: 'model-2', name: 'Alto', brandId: 'brand-1' },
        { id: 'model-3', name: 'i20', brandId: 'brand-2' },
        { id: 'model-4', name: 'Creta', brandId: 'brand-2' },
        { id: 'model-5', name: 'Nexon', brandId: 'brand-3' }
      ];
      setVehicleModels(defaultModels);
      localStorage.setItem('vehicleModels', JSON.stringify(defaultModels));
    }
  }, []);

  const addVehicleBrand = () => {
    if (!newBrandName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a brand name",
        variant: "destructive"
      });
      return;
    }

    const brand: VehicleBrand = {
      id: `brand-${Date.now()}`,
      name: newBrandName.trim()
    };

    const updatedBrands = [...vehicleBrands, brand];
    setVehicleBrands(updatedBrands);
    localStorage.setItem('vehicleBrands', JSON.stringify(updatedBrands));
    setNewBrandName('');

    toast({
      title: "Success",
      description: "Vehicle brand added successfully"
    });
  };

  const addVehicleModel = () => {
    if (!newModel.name.trim() || !newModel.brandId) {
      toast({
        title: "Error",
        description: "Please enter model name and select a brand",
        variant: "destructive"
      });
      return;
    }

    const model: VehicleModel = {
      id: `model-${Date.now()}`,
      name: newModel.name.trim(),
      brandId: newModel.brandId
    };

    const updatedModels = [...vehicleModels, model];
    setVehicleModels(updatedModels);
    localStorage.setItem('vehicleModels', JSON.stringify(updatedModels));
    setNewModel({ name: '', brandId: '' });

    toast({
      title: "Success",
      description: "Vehicle model added successfully"
    });
  };

  const removeBrand = (id: string) => {
    const updatedBrands = vehicleBrands.filter(brand => brand.id !== id);
    setVehicleBrands(updatedBrands);
    localStorage.setItem('vehicleBrands', JSON.stringify(updatedBrands));

    // Also remove models for this brand
    const updatedModels = vehicleModels.filter(model => model.brandId !== id);
    setVehicleModels(updatedModels);
    localStorage.setItem('vehicleModels', JSON.stringify(updatedModels));

    toast({
      title: "Success",
      description: "Vehicle brand and its models removed successfully"
    });
  };

  const removeModel = (id: string) => {
    const updatedModels = vehicleModels.filter(model => model.id !== id);
    setVehicleModels(updatedModels);
    localStorage.setItem('vehicleModels', JSON.stringify(updatedModels));

    toast({
      title: "Success",
      description: "Vehicle model removed successfully"
    });
  };

  const getBrandName = (brandId: string) => {
    return vehicleBrands.find(brand => brand.id === brandId)?.name || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Vehicle Brands & Models</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="brands">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brands">Vehicle Brands</TabsTrigger>
            <TabsTrigger value="models">Vehicle Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="brands" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter brand name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addVehicleBrand()}
              />
              <Button onClick={addVehicleBrand}>
                <Plus className="h-4 w-4 mr-1" />
                Add Brand
              </Button>
            </div>

            <div className="space-y-2">
              {vehicleBrands.map((brand) => (
                <div key={brand.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{brand.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBrand(brand.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="models" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter model name"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              />
              <select
                className="px-3 py-2 border rounded"
                value={newModel.brandId}
                onChange={(e) => setNewModel({ ...newModel, brandId: e.target.value })}
              >
                <option value="">Select Brand</option>
                {vehicleBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              <Button onClick={addVehicleModel}>
                <Plus className="h-4 w-4 mr-1" />
                Add Model
              </Button>
            </div>

            <div className="space-y-2">
              {vehicleModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{model.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({getBrandName(model.brandId)})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeModel(model.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VehicleManager;
