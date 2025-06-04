
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
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface LeadType {
  id: string;
  name: string;
  category: 'loan' | 'vehicle';
}

const LeadTypeManager = () => {
  const [leadTypes, setLeadTypes] = useState<LeadType[]>([]);
  const [newLeadType, setNewLeadType] = useState('');
  const [editingType, setEditingType] = useState<LeadType | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const storedLeadTypes = localStorage.getItem('leadTypes');
    if (storedLeadTypes) {
      setLeadTypes(JSON.parse(storedLeadTypes));
    } else {
      const defaultLeadTypes: LeadType[] = [
        { id: 'commercial-vehicles', name: 'Commercial Vehicles', category: 'vehicle' },
        { id: 'auto-loans', name: 'AUTO LOANS', category: 'vehicle' },
        { id: 'cvce', name: 'CVCE', category: 'vehicle' },
        { id: 'lap', name: 'LOAN AGAINST PROPERTY', category: 'loan' },
        { id: 'personal-loan', name: 'PERSONAL LOAN', category: 'loan' },
        { id: 'home-loan', name: 'HOME LOAN', category: 'loan' },
        { id: 'business-loan', name: 'BUSINESS LOAN', category: 'loan' }
      ];
      setLeadTypes(defaultLeadTypes);
      localStorage.setItem('leadTypes', JSON.stringify(defaultLeadTypes));
    }
  }, []);

  const addLeadType = () => {
    if (!newLeadType.trim()) {
      toast({
        title: "Error",
        description: "Please enter a lead type name",
        variant: "destructive"
      });
      return;
    }

    const newType: LeadType = {
      id: `lead-type-${Date.now()}`,
      name: newLeadType.trim(),
      category: 'loan'
    };

    const updatedTypes = [...leadTypes, newType];
    setLeadTypes(updatedTypes);
    localStorage.setItem('leadTypes', JSON.stringify(updatedTypes));
    setNewLeadType('');

    toast({
      title: "Success",
      description: "Lead type added successfully"
    });
  };

  const startEdit = (type: LeadType) => {
    setEditingType(type);
    setEditName(type.name);
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Lead type name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const updatedTypes = leadTypes.map(type => 
      type.id === editingType?.id 
        ? { ...type, name: editName.trim() }
        : type
    );

    setLeadTypes(updatedTypes);
    localStorage.setItem('leadTypes', JSON.stringify(updatedTypes));
    setEditingType(null);
    setEditName('');

    toast({
      title: "Success",
      description: "Lead type updated successfully"
    });
  };

  const removeLeadType = (id: string) => {
    const updatedTypes = leadTypes.filter(type => type.id !== id);
    setLeadTypes(updatedTypes);
    localStorage.setItem('leadTypes', JSON.stringify(updatedTypes));

    toast({
      title: "Success",
      description: "Lead type removed successfully"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Lead Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter new lead type"
            value={newLeadType}
            onChange={(e) => setNewLeadType(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addLeadType()}
          />
          <Button onClick={addLeadType}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {leadTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">{type.name}</span>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(type)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Lead Type</DialogTitle>
                      <DialogDescription>
                        Update the lead type name.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Lead type name"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingType(null)}>
                        Cancel
                      </Button>
                      <Button onClick={saveEdit}>
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLeadType(type.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadTypeManager;
