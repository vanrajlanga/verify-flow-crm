
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

interface Step6Props {
  locationData: {
    states: Array<{
      id: string;
      name: string;
      districts: Array<{
        id: string;
        name: string;
        cities: Array<{ id: string; name: string; }>;
      }>;
    }>;
  };
}

const Step6WorkOfficeAddress = ({ locationData }: Step6Props) => {
  const { control, watch, setValue } = useFormContext();
  const officeAddresses = watch('officeAddresses') || [];

  const addOfficeAddress = () => {
    const newAddress = {
      id: `office-addr-${Date.now()}`,
      state: '',
      district: '',
      city: '',
      streetAddress: '',
      pincode: '',
      requireVerification: false
    };
    setValue('officeAddresses', [...officeAddresses, newAddress]);
  };

  const removeOfficeAddress = (index: number) => {
    const updatedAddresses = officeAddresses.filter((_: any, i: number) => i !== index);
    setValue('officeAddresses', updatedAddresses);
  };

  const updateOfficeAddress = (index: number, field: string, value: any) => {
    const updatedAddresses = [...officeAddresses];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
    
    // Reset dependent fields when parent changes
    if (field === 'state') {
      updatedAddresses[index].district = '';
      updatedAddresses[index].city = '';
    } else if (field === 'district') {
      updatedAddresses[index].city = '';
    }
    
    setValue('officeAddresses', updatedAddresses);
  };

  const getDistrictsForState = (stateId: string) => {
    const state = locationData.states.find(s => s.id === stateId);
    return state ? state.districts : [];
  };

  const getCitiesForDistrict = (stateId: string, districtId: string) => {
    const state = locationData.states.find(s => s.id === stateId);
    const district = state?.districts.find(d => d.id === districtId);
    return district ? district.cities : [];
  };

  // Initialize with one address if none exist
  React.useEffect(() => {
    if (officeAddresses.length === 0) {
      addOfficeAddress();
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 6: Work & Office Address</CardTitle>
        <CardDescription>Enter work and office address details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {officeAddresses.map((address: any, index: number) => (
          <div key={address.id || index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Office Address {index + 1}</h4>
              {officeAddresses.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOfficeAddress(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FormLabel>State</FormLabel>
                <Select 
                  onValueChange={(value) => updateOfficeAddress(index, 'state', value)} 
                  value={address.state || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    {locationData.states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FormLabel>District</FormLabel>
                <Select 
                  onValueChange={(value) => updateOfficeAddress(index, 'district', value)} 
                  value={address.district || ''}
                  disabled={!address.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    {getDistrictsForState(address.state).map((district) => (
                      <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FormLabel>City</FormLabel>
                <Select 
                  onValueChange={(value) => updateOfficeAddress(index, 'city', value)} 
                  value={address.city || ''}
                  disabled={!address.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    {getCitiesForDistrict(address.state, address.district).map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <FormLabel>Street Address</FormLabel>
                <Input
                  placeholder="Enter office address"
                  value={address.streetAddress || ''}
                  onChange={(e) => updateOfficeAddress(index, 'streetAddress', e.target.value)}
                />
              </div>

              <div>
                <FormLabel>Pincode</FormLabel>
                <Input
                  placeholder="Enter pincode"
                  value={address.pincode || ''}
                  onChange={(e) => updateOfficeAddress(index, 'pincode', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`office-verification-${index}`}
                checked={address.requireVerification || false}
                onCheckedChange={(checked) => updateOfficeAddress(index, 'requireVerification', checked)}
              />
              <FormLabel htmlFor={`office-verification-${index}`} className="text-sm font-normal">
                Require verification for this office address
              </FormLabel>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addOfficeAddress}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Office Address
        </Button>
      </CardContent>
    </Card>
  );
};

export default Step6WorkOfficeAddress;
