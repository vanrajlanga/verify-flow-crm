
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

  useEffect(() => {
    console.log('Step1 - Selected Bank:', selectedBank);
    console.log('Step1 - Available Products:', products);
    console.log('Step1 - Available Branches:', branches);

    if (selectedBank && products && products.length > 0) {
      // Map bank names to IDs for filtering
      const bankMap: { [key: string]: string } = {
        'hdfc': 'bank-1',
        'icici': 'bank-2', 
        'sbi': 'bank-3'
      };

      const bankId = bankMap[selectedBank] || selectedBank;
      console.log('Step1 - Mapped Bank ID:', bankId);

      // Filter products based on mapped bank ID
      const bankProducts = products.filter(product => {
        console.log('Checking product:', product, 'Banks:', product.banks, 'Looking for:', bankId);
        return product.banks && product.banks.includes(bankId);
      });
      console.log('Step1 - Filtered Products:', bankProducts);
      setFilteredProducts(bankProducts);

      // Filter branches based on mapped bank ID  
      const bankBranches = branches.filter(branch => {
        console.log('Checking branch:', branch, 'BankId:', branch.bankId, 'Looking for:', bankId);
        return branch.bankId === bankId;
      });
      console.log('Step1 - Filtered Branches:', bankBranches);
      setFilteredBranches(bankBranches);
    } else {
      setFilteredProducts([]);
      setFilteredBranches([]);
    }
  }, [selectedBank, products, branches]);

  useEffect(() => {
    console.log('Step1 - Selected Vehicle Brand:', selectedVehicleBrand);
    console.log('Step1 - Available Vehicle Models:', vehicleModels);

    if (selectedVehicleBrand && vehicleModels && vehicleModels.length > 0) {
      const brandModels = vehicleModels.filter(model => model.brandId === selectedVehicleBrand);
      console.log('Step1 - Filtered Vehicle Models:', brandModels);
      setFilteredVehicleModels(brandModels);
    } else {
      setFilteredVehicleModels([]);
    }
  }, [selectedVehicleBrand, vehicleModels]);

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
                    setValue('leadType', ''); // Reset lead type when bank changes
                    setValue('initiatedBranch', '');
                    setValue('buildBranch', '');
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {banks && banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                    ))}
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
                  value={field.value}
                  disabled={!selectedBank || filteredProducts.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBank ? "Select lead type" : "Select bank first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                    ))}
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleBrands && vehicleBrands.map((brand) => (
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
                      onValueChange={(value) => {
                        console.log('Step1 - Vehicle model selected:', value);
                        field.onChange(value);
                      }} 
                      value={field.value}
                      disabled={!selectedVehicleBrand || filteredVehicleModels.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedVehicleBrand ? "Select vehicle model" : "Select brand first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                  onValueChange={(value) => {
                    console.log('Step1 - Initiated branch selected:', value);
                    field.onChange(value);
                  }} 
                  value={field.value} 
                  disabled={!selectedBank || filteredBranches.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBank ? "Select initiated branch" : "Select bank first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
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
                  value={field.value} 
                  disabled={!selectedBank || filteredBranches.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBank ? "Select build branch" : "Select bank first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
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
                  <Input placeholder="Auto-generated" {...field} readOnly />
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
