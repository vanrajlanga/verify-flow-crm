
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash, Building2, MapPin, CreditCard } from 'lucide-react';
import { Bank, BankProduct, BankBranch } from '@/types/bank-product';
import {
  getBanks,
  createBank,
  updateBank,
  deleteBank,
  getBankProducts,
  createBankProduct,
  updateBankProduct,
  deleteBankProduct,
  getBankBranches,
  createBankBranch,
  updateBankBranch,
  deleteBankBranch
} from '@/lib/bank-product-operations';

const BankProductModule = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankProducts, setBankProducts] = useState<BankProduct[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  
  // Form states
  const [newBank, setNewBank] = useState({ name: '' });
  const [newProduct, setNewProduct] = useState({ name: '', description: '', bank_id: '' });
  const [newBranch, setNewBranch] = useState({ name: '', location: '', bank_id: '', address: '', phone: '', email: '' });
  
  // Edit states
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [editingProduct, setEditingProduct] = useState<BankProduct | null>(null);
  const [editingBranch, setEditingBranch] = useState<BankBranch | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [banksData, productsData, branchesData] = await Promise.all([
        getBanks(),
        getBankProducts(),
        getBankBranches()
      ]);
      
      setBanks(banksData);
      setBankProducts(productsData);
      setBankBranches(branchesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  // Bank operations
  const handleAddBank = async () => {
    if (!newBank.name) return;
    
    const bank = await createBank(newBank);
    if (bank) {
      setBanks(prev => [...prev, bank]);
      setNewBank({ name: '' });
      setBankDialogOpen(false);
      toast({
        title: "Success",
        description: "Bank added successfully"
      });
    }
  };

  const handleEditBank = async () => {
    if (!editingBank) return;
    
    const updated = await updateBank(editingBank.id, editingBank);
    if (updated) {
      setBanks(prev => prev.map(b => b.id === updated.id ? updated : b));
      setEditingBank(null);
      setBankDialogOpen(false);
      toast({
        title: "Success",
        description: "Bank updated successfully"
      });
    }
  };

  const handleDeleteBank = async (id: string) => {
    const success = await deleteBank(id);
    if (success) {
      setBanks(prev => prev.filter(b => b.id !== id));
      toast({
        title: "Success",
        description: "Bank deleted successfully"
      });
    }
  };

  // Product operations
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.bank_id) return;
    
    const product = await createBankProduct(newProduct);
    if (product) {
      setBankProducts(prev => [...prev, product]);
      setNewProduct({ name: '', description: '', bank_id: '' });
      setProductDialogOpen(false);
      toast({
        title: "Success",
        description: "Product added successfully"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;
    
    const updated = await updateBankProduct(editingProduct.id, editingProduct);
    if (updated) {
      setBankProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingProduct(null);
      setProductDialogOpen(false);
      toast({
        title: "Success",
        description: "Product updated successfully"
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const success = await deleteBankProduct(id);
    if (success) {
      setBankProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    }
  };

  // Branch operations
  const handleAddBranch = async () => {
    if (!newBranch.name || !newBranch.location || !newBranch.bank_id) return;
    
    const branch = await createBankBranch(newBranch);
    if (branch) {
      setBankBranches(prev => [...prev, branch]);
      setNewBranch({ name: '', location: '', bank_id: '', address: '', phone: '', email: '' });
      setBranchDialogOpen(false);
      toast({
        title: "Success",
        description: "Branch added successfully"
      });
    }
  };

  const handleEditBranch = async () => {
    if (!editingBranch) return;
    
    const updated = await updateBankBranch(editingBranch.id, editingBranch);
    if (updated) {
      setBankBranches(prev => prev.map(b => b.id === updated.id ? updated : b));
      setEditingBranch(null);
      setBranchDialogOpen(false);
      toast({
        title: "Success",
        description: "Branch updated successfully"
      });
    }
  };

  const handleDeleteBranch = async (id: string) => {
    const success = await deleteBankBranch(id);
    if (success) {
      setBankBranches(prev => prev.filter(b => b.id !== id));
      toast({
        title: "Success",
        description: "Branch deleted successfully"
      });
    }
  };

  const getBankName = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.name || bankId;
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading data...</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar user={currentUser} isOpen={sidebarOpen} />
      
      <div className="flex flex-col flex-1">
        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bank & Product Management</h1>
              <p className="text-muted-foreground">
                Manage banks, branches, and products
              </p>
            </div>

            <Tabs defaultValue="banks" className="space-y-4">
              <TabsList>
                <TabsTrigger value="banks">Banks</TabsTrigger>
                <TabsTrigger value="branches">Branches</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>

              <TabsContent value="banks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Banks</CardTitle>
                        <CardDescription>Manage bank information</CardDescription>
                      </div>
                      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => { setEditingBank(null); setNewBank({ name: '' }); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Bank
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{editingBank ? 'Edit Bank' : 'Add New Bank'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="bankName">Bank Name</Label>
                              <Input
                                id="bankName"
                                value={editingBank ? editingBank.name : newBank.name}
                                onChange={(e) => editingBank 
                                  ? setEditingBank({...editingBank, name: e.target.value})
                                  : setNewBank({...newBank, name: e.target.value})
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={editingBank ? handleEditBank : handleAddBank}>
                              {editingBank ? 'Update' : 'Add'} Bank
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Applications</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {banks.map((bank) => (
                          <TableRow key={bank.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                {bank.name}
                              </div>
                            </TableCell>
                            <TableCell>{bank.total_applications || 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setEditingBank(bank);
                                    setBankDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteBank(bank.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="branches" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Bank Branches</CardTitle>
                        <CardDescription>Manage bank branch information</CardDescription>
                      </div>
                      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => { 
                            setEditingBranch(null); 
                            setNewBranch({ name: '', location: '', bank_id: '', address: '', phone: '', email: '' }); 
                          }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Branch
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="branchBank">Bank</Label>
                              <Select 
                                value={editingBranch ? editingBranch.bank_id : newBranch.bank_id}
                                onValueChange={(value) => editingBranch 
                                  ? setEditingBranch({...editingBranch, bank_id: value})
                                  : setNewBranch({...newBranch, bank_id: value})
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                                <SelectContent>
                                  {banks.map((bank) => (
                                    <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="branchName">Branch Name</Label>
                              <Input
                                id="branchName"
                                value={editingBranch ? editingBranch.name : newBranch.name}
                                onChange={(e) => editingBranch 
                                  ? setEditingBranch({...editingBranch, name: e.target.value})
                                  : setNewBranch({...newBranch, name: e.target.value})
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="branchLocation">Location</Label>
                              <Input
                                id="branchLocation"
                                value={editingBranch ? editingBranch.location : newBranch.location}
                                onChange={(e) => editingBranch 
                                  ? setEditingBranch({...editingBranch, location: e.target.value})
                                  : setNewBranch({...newBranch, location: e.target.value})
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={editingBranch ? handleEditBranch : handleAddBranch}>
                              {editingBranch ? 'Update' : 'Add'} Branch
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bank</TableHead>
                          <TableHead>Branch Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankBranches.map((branch) => (
                          <TableRow key={branch.id}>
                            <TableCell>{getBankName(branch.bank_id)}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                {branch.name}
                              </div>
                            </TableCell>
                            <TableCell>{branch.location}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setEditingBranch(branch);
                                    setBranchDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteBranch(branch.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Bank Products</CardTitle>
                        <CardDescription>Manage bank products and services</CardDescription>
                      </div>
                      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => { 
                            setEditingProduct(null); 
                            setNewProduct({ name: '', description: '', bank_id: '' }); 
                          }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="productBank">Bank</Label>
                              <Select 
                                value={editingProduct ? editingProduct.bank_id : newProduct.bank_id}
                                onValueChange={(value) => editingProduct 
                                  ? setEditingProduct({...editingProduct, bank_id: value})
                                  : setNewProduct({...newProduct, bank_id: value})
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                                <SelectContent>
                                  {banks.map((bank) => (
                                    <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="productName">Product Name</Label>
                              <Input
                                id="productName"
                                value={editingProduct ? editingProduct.name : newProduct.name}
                                onChange={(e) => editingProduct 
                                  ? setEditingProduct({...editingProduct, name: e.target.value})
                                  : setNewProduct({...newProduct, name: e.target.value})
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="productDescription">Description</Label>
                              <Input
                                id="productDescription"
                                value={editingProduct ? editingProduct.description || '' : newProduct.description}
                                onChange={(e) => editingProduct 
                                  ? setEditingProduct({...editingProduct, description: e.target.value})
                                  : setNewProduct({...newProduct, description: e.target.value})
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={editingProduct ? handleEditProduct : handleAddProduct}>
                              {editingProduct ? 'Update' : 'Add'} Product
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bank</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{getBankName(product.bank_id)}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                                {product.name}
                              </div>
                            </TableCell>
                            <TableCell>{product.description || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BankProductModule;
