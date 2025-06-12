
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';

interface Address {
  id: string;
  state: string;
  district: string;
  city: string;
  streetAddress: string;
  pincode: string;
  requireVerification: boolean;
}

interface Step5Props {
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

const Step5HomeAddresses = ({ locationData }: Step5Props) => {
  const { control, watch, setValue } = useFormContext();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      state: '',
      district: '',
      city: '',
      streetAddress: '',
      pincode: '',
      requireVerification: true
    }
  ]);

  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      state: '',
      district: '',
      city: '',
      streetAddress: '',
      pincode: '',
      requireVerification: false
    };
    setAddresses([...addresses, newAddress]);
  };

  const removeAddress = (id: string) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const updateAddress = (id: string, field: keyof Address, value: any) => {
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Home Addresses</CardTitle>
        <CardDescription>Enter home address details (you can add multiple addresses)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.map((address, index) => (
          <div key={address.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Address {index + 1}</h4>
              {addresses.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAddress(address.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>State</Label>
                <Select 
                  value={address.state} 
                  onValueChange={(value) => {
                    updateAddress(address.id, 'state', value);
                    updateAddress(address.id, 'district', '');
                    updateAddress(address.id, 'city', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData.states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>District</Label>
                <Select 
                  value={address.district} 
                  onValueChange={(value) => {
                    updateAddress(address.id, 'district', value);
                    updateAddress(address.id, 'city', '');
                  }}
                  disabled={!address.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDistrictsForState(address.state).map((district) => (
                      <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>City</Label>
                <Select 
                  value={address.city} 
                  onValueChange={(value) => updateAddress(address.id, 'city', value)}
                  disabled={!address.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCitiesForDistrict(address.state, address.district).map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Street Address</Label>
                <Input 
                  placeholder="Enter complete address" 
                  value={address.streetAddress}
                  onChange={(e) => updateAddress(address.id, 'streetAddress', e.target.value)}
                />
              </div>

              <div>
                <Label>Pincode</Label>
                <Input 
                  placeholder="Enter pincode" 
                  value={address.pincode}
                  onChange={(e) => updateAddress(address.id, 'pincode', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`verification-${address.id}`}
                checked={address.requireVerification}
                onCheckedChange={(checked) => 
                  updateAddress(address.id, 'requireVerification', checked === true)
                }
              />
              <Label htmlFor={`verification-${address.id}`}>
                Require verification for this address
              </Label>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addAddress} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </CardContent>
    </Card>
  );
};

export default Step5HomeAddresses;
