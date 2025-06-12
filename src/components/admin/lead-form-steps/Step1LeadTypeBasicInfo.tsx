
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Step1Props {
  banks: Array<{ id: string; name: string; }>;
  products: Array<{ id: string; name: string; banks: string[]; }>;
  branches: Array<{ id: string; name: string; bankId: string; }>;
  vehicleBrands: Array<{ id: string; name: string; }>;
  vehicleModels: Array<{ id: string; name: string; brandId: string; }>;
}

const Step1LeadTypeBasicInfo = ({ banks, products, branches, vehicleBrands, vehicleModels }: Step1Props) => {
  const { control, watch, setValue } = useFormContext();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [selectedBanksForProduct, setSelectedBanksForProduct] = useState<string[]>([]);
  const [localProducts, setLocalProducts] = useState(products);
  
  const selectedBank = watch('bankName');
  const selectedLeadType = watch('leadType');
  const selectedVehicleBrand = watch('vehicleBrand');

  // Generate automatic agency file number
  useEffect(() => {
    const agencyFileNo = `AGN-${Date.now()}`;
    setValue('agencyFileNo', agencyFileNo);
  }, [setValue]);

  // Update local products when props change
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  // Get products for selected bank
  const getProductsForBank = (bankId: string) => {
    return localProducts.filter((product: any) => product.banks && product.banks.includes(bankId));
  };

  // Get branches for selected bank
  const getBranchesForBank = (bankId: string) => {
    return branches.filter(branch => branch.bankId === bankId);
  };

  // Get vehicle models for selected brand
  const getModelsForBrand = (brandId: string) => {
    return vehicleModels.filter((model: any) => model.brandId === brandId);
  };

  const handleAddProduct = () => {
    if (newProductName && selectedBanksForProduct.length > 0) {
      const newProduct = {
        id: `prod-${Date.now()}`,
        name: newProductName,
        banks: selectedBanksForProduct
      };
      
      const updatedProducts = [...localProducts, newProduct];
      setLocalProducts(updatedProducts);
      
      // Update localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // Reset form
      setNewProductName('');
      setSelectedBanksForProduct([]);
      setIsProductDialogOpen(false);
      
      // Auto-select the new product if current bank is included
      if (selectedBank && selectedBanksForProduct.includes(selectedBank)) {
        setValue('leadType', newProduct.id);
      }
    }
  };

  const handleBankToggleForProduct = (bankId: string) => {
    setSelectedBanksForProduct(prev => 
      prev.includes(bankId) 
        ? prev.filter(id => id !== bankId)
        : [...prev, bankId]
    );
  };

  const filteredProducts = selectedBank ? getProductsForBank(selectedBank) : [];
  const filteredBranches = selectedBank ? getBranchesForBank(selectedBank) : [];
  const filteredVehicleModels = selectedVehicleBrand ? getModelsForBrand(selectedVehicleBrand) : [];

  const isAutoLoan = selectedLeadType && (
    selectedLeadType === 'auto-loan' || 
    filteredProducts.find(p => p.id === selectedLeadType)?.name?.toLowerCase().includes('auto')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Lead Type & Basic Info</CardTitle>
        <CardDescription>Select bank details and lead information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name <span className="text-red-500">*</span></FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue('leadType', '');
                    setValue('initiatedBranch', '');
                    setValue('buildBranch', '');
                  }} 
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    {banks && banks.length > 0 ? banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                    )) : (
                      <SelectItem value="no-banks" disabled>No banks available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="leadType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Type/Product <span className="text-red-500">*</span></FormLabel>
                <div className="flex gap-2">
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue('vehicleBrand', '');
                      setValue('vehicleModel', '');
                    }} 
                    value={field.value || ''}
                    disabled={!selectedBank}
                  >
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={!selectedBank ? "Select bank first" : "Select lead type"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                      )) : (
                        <SelectItem value="no-products" disabled>No products available for this bank</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon" disabled={!selectedBank}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                          Create a new product type for the selected banks.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Product Name</label>
                          <Input
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder="Enter product name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Select Banks</label>
                          <div className="space-y-2 mt-2">
                            {banks.map((bank) => (
                              <div key={bank.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={bank.id}
                                  checked={selectedBanksForProduct.includes(bank.id)}
                                  onCheckedChange={() => handleBankToggleForProduct(bank.id)}
                                />
                                <label htmlFor={bank.id} className="text-sm">{bank.name}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddProduct}
                          disabled={!newProductName || selectedBanksForProduct.length === 0}
                        >
                          Add Product
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {isAutoLoan && (
            <>
              <FormField
                control={control}
                name="vehicleBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Brand</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue('vehicleModel', '');
                      }} 
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {vehicleBrands.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Model</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ''}
                      disabled={!selectedVehicleBrand}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedVehicleBrand ? "Select brand first" : "Select vehicle model"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {filteredVehicleModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={control}
            name="initiatedBranch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initiated Under Branch</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''} 
                  disabled={!selectedBank}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedBank ? "Select bank first" : "Select initiated branch"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    {filteredBranches.length > 0 ? filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    )) : (
                      <SelectItem value="no-branches" disabled>No branches available for this bank</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="buildBranch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Build Under Branch</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''} 
                  disabled={!selectedBank}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedBank ? "Select bank first" : "Select build branch"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    {filteredBranches.length > 0 ? filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    )) : (
                      <SelectItem value="no-branches" disabled>No branches available for this bank</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="agencyFileNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agency File No. <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Auto-generated" {...field} readOnly className="bg-muted" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="applicationBarcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="Enter application barcode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="caseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter case ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="schemeDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheme Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter scheme description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="loanAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Amount</FormLabel>
                <FormControl>
                  <Input placeholder="Enter loan amount" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Step1LeadTypeBasicInfo;
