
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step1Props {
  banks: any[];
  products: any[];
  branches: any[];
  vehicleBrands: any[];
  vehicleModels: any[];
}

const Step1LeadTypeBasicInfo = ({ banks = [], products = [], branches = [], vehicleBrands = [], vehicleModels = [] }: Step1Props) => {
  const { control, watch, setValue } = useFormContext();
  const [openProductCombobox, setOpenProductCombobox] = useState(false);
  
  const selectedBankId = watch('bankName');
  const selectedLeadType = watch('leadType');
  const selectedVehicleBrand = watch('vehicleBrand');
  
  // Filter products based on selected bank
  const filteredProducts = products.filter(product => 
    product.banks && product.banks.includes(selectedBankId)
  );
  
  // Filter vehicle models based on selected brand
  const filteredVehicleModels = vehicleModels.filter(model => 
    model.brandId === selectedVehicleBrand
  );
  
  // Check if lead type requires vehicle selection
  const requiresVehicleSelection = selectedLeadType && (
    selectedLeadType.includes('Auto') || 
    selectedLeadType.includes('Vehicle') || 
    selectedLeadType.includes('CVCE') || 
    selectedLeadType.includes('Commercial')
  );
  
  // Filter branches based on selected bank
  const filteredBranches = branches.filter(branch => 
    branch.bankId === selectedBankId
  );

  console.log('Step1 props:', { banks, products, branches, vehicleBrands, vehicleModels });
  console.log('Filtered products:', filteredProducts);
  console.log('Selected lead type:', selectedLeadType);
  console.log('Requires vehicle selection:', requiresVehicleSelection);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
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
              <Popover open={openProductCombobox} onOpenChange={setOpenProductCombobox}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProductCombobox}
                      className="w-full justify-between"
                    >
                      {field.value ? field.value : "Select product..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search products..." />
                    <CommandList>
                      <CommandEmpty>No product found.</CommandEmpty>
                      <CommandGroup>
                        {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={(currentValue) => {
                                setValue('leadType', currentValue === field.value ? "" : product.name);
                                setOpenProductCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === product.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {product.name}
                            </CommandItem>
                          ))
                        ) : (
                          <CommandItem disabled>
                            {selectedBankId ? "No products available for selected bank" : "Please select a bank first"}
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Vehicle Selection - Show only for Auto/Vehicle/CVCE/Commercial related products */}
      {requiresVehicleSelection && (
        <div className="border p-4 rounded-lg bg-muted/30">
          <h3 className="text-lg font-medium mb-4">Vehicle Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="vehicleBrand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Brand</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
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
                    value={field.value}
                    disabled={!selectedVehicleBrand}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedVehicleBrand ? "Select vehicle model" : "Select brand first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredVehicleModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="initiatedBranch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initiated Under Branch</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </SelectItem>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="agencyFileNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agency File No <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter agency file number" {...field} />
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <FormField
        control={control}
        name="loanAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Loan Amount</FormLabel>
            <FormControl>
              <Input placeholder="Enter loan amount" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step1LeadTypeBasicInfo;
