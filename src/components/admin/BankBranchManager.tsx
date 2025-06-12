
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface BankBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  bankId: string;
  bankName: string;
}

export interface Bank {
  id: string;
  name: string;
}

const BankBranchManager = () => {
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [newBranch, setNewBranch] = useState({ name: '', code: '', city: '', bankId: '', bankName: '' });

  useEffect(() => {
    loadBanks();
    loadBankBranches();
  }, []);

  const loadBanks = () => {
    // Load banks from mockBanks (consistent IDs)
    const storedBanks = localStorage.getItem('mockBanks');
    if (storedBanks) {
      const parsedBanks = JSON.parse(storedBanks);
      console.log('Loaded banks for BankBranchManager:', parsedBanks);
      setBanks(parsedBanks);
    } else {
      // Initialize with default banks with consistent IDs
      const defaultBanks: Bank[] = [
        { id: '1', name: 'State Bank of India' },
        { id: '2', name: 'HDFC Bank' },
        { id: '3', name: 'ICICI Bank' },
        { id: '4', name: 'Axis Bank' },
        { id: '5', name: 'Punjab National Bank' }
      ];
      setBanks(defaultBanks);
      localStorage.setItem('mockBanks', JSON.stringify(defaultBanks));
      console.log('Initialized default banks for branches:', defaultBanks);
    }
  };

  const loadBankBranches = () => {
    const storedBranches = localStorage.getItem('bankBranches');
    if (storedBranches) {
      const parsedBranches = JSON.parse(storedBranches);
      console.log('Loaded existing bank branches:', parsedBranches);
      setBankBranches(parsedBranches);
    } else {
      // Initialize with default branches using correct bank IDs
      const defaultBranches: BankBranch[] = [
        { id: 'branch-1', name: 'Main Branch', code: 'MB001', city: 'Mumbai', bankId: '1', bankName: 'State Bank of India' },
        { id: 'branch-2', name: 'Delhi Branch', code: 'DB001', city: 'Delhi', bankId: '1', bankName: 'State Bank of India' },
        { id: 'branch-3', name: 'Bangalore Branch', code: 'BB001', city: 'Bangalore', bankId: '2', bankName: 'HDFC Bank' },
        { id: 'branch-4', name: 'Chennai Branch', code: 'CB001', city: 'Chennai', bankId: '3', bankName: 'ICICI Bank' },
        { id: 'branch-5', name: 'Pune Branch', code: 'PB001', city: 'Pune', bankId: '2', bankName: 'HDFC Bank' }
      ];
      setBankBranches(defaultBranches);
      localStorage.setItem('bankBranches', JSON.stringify(defaultBranches));
      console.log('Initialized default bank branches:', defaultBranches);
    }
  };

  const addBankBranch = () => {
    if (!newBranch.name.trim() || !newBranch.code.trim() || !newBranch.city.trim() || !newBranch.bankId) {
      toast({
        title: "Error",
        description: "Please fill all fields including bank selection",
        variant: "destructive"
      });
      return;
    }

    const selectedBank = banks.find(bank => bank.id === newBranch.bankId);
    if (!selectedBank) {
      toast({
        title: "Error",
        description: "Please select a valid bank",
        variant: "destructive"
      });
      return;
    }

    const branch: BankBranch = {
      id: `branch-${Date.now()}`,
      name: newBranch.name.trim(),
      code: newBranch.code.trim(),
      city: newBranch.city.trim(),
      bankId: newBranch.bankId,
      bankName: selectedBank.name
    };

    console.log('Adding new bank branch:', branch);
    const updatedBranches = [...bankBranches, branch];
    setBankBranches(updatedBranches);
    localStorage.setItem('bankBranches', JSON.stringify(updatedBranches));
    setNewBranch({ name: '', code: '', city: '', bankId: '', bankName: '' });

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

  const handleBankSelect = (bankId: string) => {
    const selectedBank = banks.find(bank => bank.id === bankId);
    console.log('Selected bank for branch:', bankId, selectedBank);
    setNewBranch({
      ...newBranch,
      bankId,
      bankName: selectedBank?.name || ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Bank Branches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <Select value={newBranch.bankId} onValueChange={handleBankSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select Bank" />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <div className="text-xs text-muted-foreground">Bank: {branch.bankName}</div>
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
        {bankBranches.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No bank branches found. Add a branch to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankBranchManager;
