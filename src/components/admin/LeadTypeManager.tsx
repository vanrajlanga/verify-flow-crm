
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface LeadType {
  id: string;
  name: string;
  category: 'loan' | 'vehicle';
}

const LeadTypeManager = () => {
  const [leadTypes, setLeadTypes] = useState<LeadType[]>([]);
  const [newLeadType, setNewLeadType] = useState('');

  useEffect(() => {
    // Load existing lead types from localStorage
    const storedLeadTypes = localStorage.getItem('leadTypes');
    if (storedLeadTypes) {
      setLeadTypes(JSON.parse(storedLeadTypes));
    } else {
      // Initialize with default lead types
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
      category: 'loan' // Default category, can be customized
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
            <div key={type.id} className="flex items-center justify-between p-2 border rounded">
              <span>{type.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLeadType(type.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadTypeManager;
