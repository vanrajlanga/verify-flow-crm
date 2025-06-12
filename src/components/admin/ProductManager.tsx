
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface Product {
  id: string;
  name: string;
  description: string;
  banks: string[];
}

export interface Bank {
  id: string;
  name: string;
}

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', banks: [] as string[] });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Load existing products from localStorage
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Initialize with default products
      const defaultProducts: Product[] = [
        { id: 'product-1', name: 'Home Loan', description: 'Residential property loan verification', banks: ['1', '2'] },
        { id: 'product-2', name: 'Personal Loan', description: 'Personal loan verification', banks: ['1', '3'] },
        { id: 'product-3', name: 'Auto Loan', description: 'Vehicle loan verification', banks: ['2', '4'] },
        { id: 'product-4', name: 'Business Loan', description: 'Business loan verification', banks: ['3', '5'] },
        { id: 'product-5', name: 'Credit Card', description: 'Credit card application verification', banks: ['1', '2', '3'] }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('products', JSON.stringify(defaultProducts));
    }

    // Load banks
    const storedBanks = localStorage.getItem('mockBanks');
    if (storedBanks) {
      setBanks(JSON.parse(storedBanks));
    } else {
      const defaultBanks: Bank[] = [
        { id: '1', name: 'State Bank of India' },
        { id: '2', name: 'HDFC Bank' },
        { id: '3', name: 'ICICI Bank' },
        { id: '4', name: 'Axis Bank' },
        { id: '5', name: 'Punjab National Bank' }
      ];
      setBanks(defaultBanks);
      localStorage.setItem('mockBanks', JSON.stringify(defaultBanks));
    }
  }, []);

  const addProduct = () => {
    if (!newProduct.name.trim() || !newProduct.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const product: Product = {
      id: `product-${Date.now()}`,
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      banks: newProduct.banks
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setNewProduct({ name: '', description: '', banks: [] });
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: "Product added successfully"
    });
  };

  const updateProduct = () => {
    if (!editingProduct) return;

    const updatedProducts = products.map(product =>
      product.id === editingProduct.id
        ? { ...editingProduct, name: newProduct.name, description: newProduct.description, banks: newProduct.banks }
        : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setEditingProduct(null);
    setNewProduct({ name: '', description: '', banks: [] });
    setIsDialogOpen(false);

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

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      banks: [...(product.banks || [])]
    });
    setIsDialogOpen(true);
  };

  const toggleBank = (bankId: string) => {
    setNewProduct(prev => ({
      ...prev,
      banks: prev.banks.includes(bankId)
        ? prev.banks.filter(id => id !== bankId)
        : [...prev.banks, bankId]
    }));
  };

  const resetForm = () => {
    setNewProduct({ name: '', description: '', banks: [] });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const getBankNames = (bankIds: string[] | undefined) => {
    if (!bankIds || !Array.isArray(bankIds)) return 'No banks selected';
    return bankIds.map(bankId => banks.find(b => b.id === bankId)?.name || 'Unknown Bank').join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manage Products</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setNewProduct({ name: '', description: '', banks: [] })}>
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update product details and select banks that offer this product' : 'Create a new product and select banks that offer this product'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    placeholder="Product name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Product description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Available Banks</label>
                  <div className="space-y-2 mt-2">
                    {banks.map((bank) => (
                      <div key={bank.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={bank.id}
                          checked={newProduct.banks.includes(bank.id)}
                          onCheckedChange={() => toggleBank(bank.id)}
                        />
                        <label htmlFor={bank.id} className="text-sm">{bank.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={editingProduct ? updateProduct : addProduct}>
                    {editingProduct ? 'Update' : 'Add'} Product
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <span className="font-medium">{product.name}</span>
                <span className="text-sm text-muted-foreground ml-2">- {product.description}</span>
                <div className="text-xs text-muted-foreground mt-1">
                  Banks: {getBankNames(product.banks)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
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
