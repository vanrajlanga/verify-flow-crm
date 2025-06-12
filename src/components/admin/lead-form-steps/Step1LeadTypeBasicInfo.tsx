
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface Step1Props {
  banks: Array<{ id: string; name: string; }>;
  products: Array<{ id: string; name: string; banks: string[]; }>;
  branches: Array<{ id: string; name: string; bankId: string; }>;
  vehicleBrands: Array<{ id: string; name: string; }>;
  vehicleModels: Array<{ id: string; name: string; brandId: string; }>;
}

const Step1LeadTypeBasicInfo = ({ banks, products, branches, vehicleBrands, vehicleModels }: Step1Props) => {
  const { control, watch, setValue } = useFormContext();
  const selectedBank = watch('bankName');
  const selectedLeadType = watch('leadType');
  const selectedVehicleBrand = watch('vehicleBrand');

  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<any[]>([]);
  const [filteredVehicleModels, setFilteredVehicleModels] = useState<any[]>([]);

  // Generate automatic agency file number
  useEffect(() => {
    const agencyFileNo = `AGN-${Date.now()}`;
    setValue('agencyFileNo', agencyFileNo);
  }, [setValue]);

  // Initialize dummy data if needed
  useEffect(() => {
    // Add dummy products if none exist
    const storedProducts = localStorage.getItem('products');
    if (!storedProducts || JSON.parse(storedProducts).length === 0) {
      const dummyProducts = [
        { id: 'home-loan', name: 'Home Loan', description: 'Residential property loan', banks: banks.map(b => b.id) },
        { id: 'personal-loan', name: 'Personal Loan', description: 'Personal loan verification', banks: banks.map(b => b.id) },
        { id: 'auto-loan', name: 'Auto Loan', description: 'Vehicle loan verification', banks: banks.map(b => b.id) },
        { id: 'business-loan', name: 'Business Loan', description: 'Business loan verification', banks: banks.map(b => b.id) },
        { id: 'credit-card', name: 'Credit Card', description: 'Credit card application', banks: banks.map(b => b.id) }
      ];
      localStorage.setItem('products', JSON.stringify(dummyProducts));
    }

    // Add dummy vehicle brands if none exist
    const storedBrands = localStorage.getItem('vehicleBrands');
    if (!storedBrands || JSON.parse(storedBrands).length === 0) {
      const dummyBrands = [
        { id: 'maruti', name: 'Maruti Suzuki' },
        { id: 'hyundai', name: 'Hyundai' },
        { id: 'honda', name: 'Honda' },
        { id: 'toyota', name: 'Toyota' },
        { id: 'tata', name: 'Tata Motors' }
      ];
      localStorage.setItem('vehicleBrands', JSON.stringify(dummyBrands));
    }

    // Add dummy vehicle models if none exist
    const storedModels = localStorage.getItem('vehicleModels');
    if (!storedModels || JSON.parse(storedModels).length === 0) {
      const dummyModels = [
        { id: 'swift', name: 'Swift', brandId: 'maruti' },
        { id: 'baleno', name: 'Baleno', brandId: 'maruti' },
        { id: 'i20', name: 'i20', brandId: 'hyundai' },
        { id: 'creta', name: 'Creta', brandId: 'hyundai' },
        { id: 'city', name: 'City', brandId: 'honda' },
        { id: 'civic', name: 'Civic', brandId: 'honda' }
      ];
      localStorage.setItem('vehicleModels', JSON.stringify(dummyModels));
    }
  }, [banks]);

  useEffect(() => {
    console.log('Step1 - Selected Bank:', selectedBank);
    console.log('Step1 - Available Products:', products);
    console.log('Step1 - Available Branches:', branches);

    if (selectedBank) {
      // Get updated products from localStorage
      const storedProducts = localStorage.getItem('products');
      const allProducts = storedProducts ? JSON.parse(storedProducts) : products;
      
      // Filter products - check if products array exists and has items
      if (allProducts && allProducts.length > 0) {
        const bankProducts = allProducts.filter((product: any) => {
          console.log('Checking product:', product.name, 'Banks:', product.banks, 'Looking for:', selectedBank);
          return product.banks && Array.isArray(product.banks) && product.banks.includes(selectedBank);
        });
        console.log('Step1 - Filtered Products for bank:', selectedBank, 'Result:', bankProducts);
        setFilteredProducts(bankProducts);
      } else {
        console.log('Step1 - No products available');
        setFilteredProducts([]);
      }

      // Filter branches - check if branches array exists and has items
      if (branches && branches.length > 0) {
        const bankBranches = branches.filter(branch => {
          console.log('Checking branch:', branch.name, 'BankId:', branch.bankId, 'Looking for:', selectedBank);
          return branch.bankId === selectedBank;
        });
        console.log('Step1 - Filtered Branches for bank:', selectedBank, 'Result:', bankBranches);
        setFilteredBranches(bankBranches);
      } else {
        console.log('Step1 - No branches available');
        setFilteredBranches([]);
      }
    } else {
      console.log('Step1 - No bank selected, clearing filters');
      setFilteredProducts([]);
      setFilteredBranches([]);
    }
  }, [selectedBank, products, branches]);

  useEffect(() => {
    console.log('Step1 - Selected Vehicle Brand:', selectedVehicleBrand);
    
    // Get updated vehicle models from localStorage
    const storedModels = localStorage.getItem('vehicleModels');
    const allModels = storedModels ? JSON.parse(storedModels) : vehicleModels;
    console.log('Step1 - Available Vehicle Models:', allModels);

    if (selectedVehicleBrand && allModels && allModels.length > 0) {
      const brandModels = allModels.filter((model: any) => model.brandId === selectedVehicleBrand);
      console.log('Step1 - Filtered Vehicle Models:', brandModels);
      setFilteredVehicleModels(brandModels);
    } else {
      setFilteredVehicleModels([]);
    }
  }, [selectedVehicleBrand, vehicleModels]);

  // Get updated vehicle brands from localStorage
  const getVehicleBrands = () => {
    const storedBrands = localStorage.getItem('vehicleBrands');
    return storedBrands ? JSON.parse(storedBrands) : vehicleBrands;
  };

  const isAutoLoan = selectedLeadType && filteredProducts.length > 0 && 
    (selectedLeadType === 'auto-loan' || 
     filteredProducts.find(p => p.id === selectedLeadType)?.name?.toLowerCase().includes('auto') ||
     filteredProducts.find(p => p.id === selectedLeadType)?.name?.toLowerCase().includes('vehicle'));

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
                    console.log('Step1 - Bank selected:', value);
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
                <Select 
                  onValueChange={(value) => {
                    console.log('Step1 - Lead type selected:', value);
                    field.onChange(value);
                    setValue('vehicleBrand', '');
                    setValue('vehicleModel', '');
                  }} 
                  value={field.value || ''}
                  disabled={!selectedBank}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedBank ? "Select bank first" : filteredProducts.length === 0 ? "No products available" : "Select lead type"} />
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
                        console.log('Step1 - Vehicle brand selected:', value);
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
                        {getVehicleBrands() && getVehicleBrands().length > 0 ? getVehicleBrands().map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        )) : (
                          <SelectItem value="no-brands" disabled>No vehicle brands available</SelectItem>
                        )}
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
                      onValueChange={(value) => {
                        console.log('Step1 - Vehicle model selected:', value);
                        field.onChange(value);
                      }} 
                      value={field.value || ''}
                      disabled={!selectedVehicleBrand}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedVehicleBrand ? "Select brand first" : filteredVehicleModels.length === 0 ? "No models available" : "Select vehicle model"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {filteredVehicleModels.length > 0 ? filteredVehicleModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                        )) : (
                          <SelectItem value="no-models" disabled>No models available for this brand</SelectItem>
                        )}
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
                  onValueChange={(value) => {
                    console.log('Step1 - Initiated branch selected:', value);
                    field.onChange(value);
                  }} 
                  value={field.value || ''} 
                  disabled={!selectedBank}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedBank ? "Select bank first" : filteredBranches.length === 0 ? "No branches available" : "Select initiated branch"} />
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
                  onValueChange={(value) => {
                    console.log('Step1 - Build branch selected:', value);
                    field.onChange(value);
                  }} 
                  value={field.value || ''} 
                  disabled={!selectedBank}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedBank ? "Select bank first" : filteredBranches.length === 0 ? "No branches available" : "Select build branch"} />
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
