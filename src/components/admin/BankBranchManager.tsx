
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface BankBranch {
  id: string;
  name: string;
  code: string;
  city: string;
}

const BankBranchManager = () => {
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [newBranch, setNewBranch] = useState({ name: '', code: '', city: '' });

  useEffect(() => {
    // Load existing bank branches from localStorage
    const storedBranches = localStorage.getItem('bankBranches');
    if (storedBranches) {
      setBankBranches(JSON.parse(storedBranches));
    } else {
      // Initialize with default branches
      const defaultBranches: BankBranch[] = [
        { id: 'branch-1', name: 'Main Branch', code: 'MB001', city: 'Mumbai' },
        { id: 'branch-2', name: 'Delhi Branch', code: 'DB001', city: 'Delhi' },
        { id: 'branch-3', name: 'Bangalore Branch', code: 'BB001', city: 'Bangalore' }
      ];
      setBankBranches(defaultBranches);
      localStorage.setItem('bankBranches', JSON.stringify(defaultBranches));
    }
  }, []);

  const addBankBranch = () => {
    if (!newBranch.name.trim() || !newBranch.code.trim() || !newBranch.city.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const branch: BankBranch = {
      id: `branch-${Date.now()}`,
      name: newBranch.name.trim(),
      code: newBranch.code.trim(),
      city: newBranch.city.trim()
    };

    const updatedBranches = [...bankBranches, branch];
    setBankBranches(updatedBranches);
    localStorage.setItem('bankBranches', JSON.stringify(updatedBranches));
    setNewBranch({ name: '', code: '', city: '' });

    toast({
      title: "Success",
      description: "Bank branch added successfully"
    });
  };

  const removeBankBranch = (id: string) => {
    const updatedBranches = bankBranches.filter(branch => branch.id !== id);
    setBankBranches(updatedBranches);
    localStorage.setItem('bankBranches', JSON.stringify(updatedBranches));

    toast({
      title: "Success",
      description: "Bank branch removed successfully"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Bank Branches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            placeholder="Branch name"
            value={newBranch.name}
            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
          />
          <Input
            placeholder="Branch code"
            value={newBranch.code}
            onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
          />
          <Input
            placeholder="City"
            value={newBranch.city}
            onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
          />
          <Button onClick={addBankBranch}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {bankBranches.map((branch) => (
            <div key={branch.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <span className="font-medium">{branch.name}</span>
                <span className="text-sm text-muted-foreground ml-2">({branch.code}) - {branch.city}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeBankBranch(branch.id)}
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

export default BankBranchManager;
