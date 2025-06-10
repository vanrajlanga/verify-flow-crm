
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface Product {
  id: string;
  name: string;
  category: 'loan' | 'vehicle';
  availableBanks: string[];
}

export interface Bank {
  id: string;
  name: string;
}

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editSelectedBanks, setEditSelectedBanks] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
    loadBanks();
  }, []);

  const loadProducts = () => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      const defaultProducts: Product[] = [
        { id: 'commercial-vehicles', name: 'Commercial Vehicles', category: 'vehicle', availableBanks: ['bank-1', 'bank-2'] },
        { id: 'auto-loans', name: 'AUTO LOANS', category: 'vehicle', availableBanks: ['bank-1', 'bank-3'] },
        { id: 'cvce', name: 'CVCE', category: 'vehicle', availableBanks: ['bank-2'] },
        { id: 'lap', name: 'LOAN AGAINST PROPERTY', category: 'loan', availableBanks: ['bank-1', 'bank-2', 'bank-3'] },
        { id: 'personal-loan', name: 'PERSONAL LOAN', category: 'loan', availableBanks: ['bank-1', 'bank-2'] },
        { id: 'home-loan', name: 'HOME LOAN', category: 'loan', availableBanks: ['bank-1', 'bank-3'] },
        { id: 'business-loan', name: 'BUSINESS LOAN', category: 'loan', availableBanks: ['bank-2', 'bank-3'] }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
  };

  const loadBanks = () => {
    const storedBanks = localStorage.getItem('banks');
    if (storedBanks) {
      setBanks(JSON.parse(storedBanks));
    } else {
      const defaultBanks: Bank[] = [
        { id: 'bank-1', name: 'State Bank of India' },
        { id: 'bank-2', name: 'HDFC Bank' },
        { id: 'bank-3', name: 'ICICI Bank' }
      ];
      setBanks(defaultBanks);
      localStorage.setItem('banks', JSON.stringify(defaultBanks));
    }
  };

  const addProduct = () => {
    if (!newProductName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name",
        variant: "destructive"
      });
      return;
    }

    if (selectedBanks.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one bank",
        variant: "destructive"
      });
      return;
    }

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: newProductName.trim(),
      category: 'loan',
      availableBanks: [...selectedBanks]
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setNewProductName('');
    setSelectedBanks([]);

    toast({
      title: "Success",
      description: "Product added successfully"
    });
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditSelectedBanks([...product.availableBanks]);
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Product name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (editSelectedBanks.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one bank",
        variant: "destructive"
      });
      return;
    }

    const updatedProducts = products.map(product => 
      product.id === editingProduct?.id 
        ? { ...product, name: editName.trim(), availableBanks: [...editSelectedBanks] }
        : product
    );

    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setEditingProduct(null);
    setEditName('');
    setEditSelectedBanks([]);

    toast({
      title: "Success",
      description: "Product updated successfully"
    });
  };

  const removeProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    toast({
      title: "Success",
      description: "Product removed successfully"
    });
  };

  const toggleBankSelection = (bankId: string, isEditing = false) => {
    if (isEditing) {
      setEditSelectedBanks(prev => 
        prev.includes(bankId) 
          ? prev.filter(id => id !== bankId)
          : [...prev, bankId]
      );
    } else {
      setSelectedBanks(prev => 
        prev.includes(bankId) 
          ? prev.filter(id => id !== bankId)
          : [...prev, bankId]
      );
    }
  };

  const getBankName = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank ? bank.name : bankId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <Input
            placeholder="Enter new product name"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Banks for this Product:</label>
            <div className="grid grid-cols-2 gap-2">
              {banks.map((bank) => (
                <div key={bank.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bank-${bank.id}`}
                    checked={selectedBanks.includes(bank.id)}
                    onCheckedChange={() => toggleBankSelection(bank.id)}
                  />
                  <label htmlFor={`bank-${bank.id}`} className="text-sm">
                    {bank.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={addProduct} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>

        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <span className="font-medium">{product.name}</span>
                <div className="text-xs text-muted-foreground mt-1">
                  Available in: {product.availableBanks.map(getBankName).join(', ')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                      <DialogDescription>
                        Update the product name and bank availability.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Product name"
                      />
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Banks:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {banks.map((bank) => (
                            <div key={bank.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-bank-${bank.id}`}
                                checked={editSelectedBanks.includes(bank.id)}
                                onCheckedChange={() => toggleBankSelection(bank.id, true)}
                              />
                              <label htmlFor={`edit-bank-${bank.id}`} className="text-sm">
                                {bank.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingProduct(null)}>
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
                  onClick={() => removeProduct(product.id)}
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

export default ProductManager;
