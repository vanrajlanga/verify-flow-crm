
import React, { useState, useEffect } from 'react';
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
  const { setValue, watch } = useFormContext();
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

  // Update form value whenever addresses change
  useEffect(() => {
    setValue('addresses', addresses);
    console.log('Step5 - Addresses updated:', addresses);
  }, [addresses, setValue]);

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
    console.log(`Step5 - Updating address ${id}, field: ${field}, value:`, value);
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const getDistrictsForState = (stateId: string) => {
    console.log('Step5 - Getting districts for state:', stateId);
    console.log('Step5 - Available location data:', locationData);
    
    if (!locationData?.states) {
      console.log('Step5 - No location data available');
      return [];
    }
    
    const state = locationData.states.find(s => s.id === stateId);
    const districts = state?.districts || [];
    console.log('Step5 - Found districts:', districts);
    return districts;
  };

  const getCitiesForDistrict = (stateId: string, districtId: string) => {
    console.log('Step5 - Getting cities for state:', stateId, 'district:', districtId);
    
    if (!locationData?.states) {
      console.log('Step5 - No location data available');
      return [];
    }
    
    const state = locationData.states.find(s => s.id === stateId);
    const district = state?.districts.find(d => d.id === districtId);
    const cities = district?.cities || [];
    console.log('Step5 - Found cities:', cities);
    return cities;
  };

  const getStateName = (stateId: string) => {
    if (!locationData?.states) return '';
    return locationData.states.find(s => s.id === stateId)?.name || '';
  };

  const getDistrictName = (stateId: string, districtId: string) => {
    if (!locationData?.states) return '';
    const state = locationData.states.find(s => s.id === stateId);
    return state?.districts.find(d => d.id === districtId)?.name || '';
  };

  const getCityName = (stateId: string, districtId: string, cityId: string) => {
    if (!locationData?.states) return '';
    const state = locationData.states.find(s => s.id === stateId);
    const district = state?.districts.find(d => d.id === districtId);
    return district?.cities.find(c => c.id === cityId)?.name || '';
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
                    console.log('Step5 - State selected:', value);
                    updateAddress(address.id, 'state', value);
                    updateAddress(address.id, 'district', '');
                    updateAddress(address.id, 'city', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData?.states?.map((state) => (
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
                    console.log('Step5 - District selected:', value);
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
                  onValueChange={(value) => {
                    console.log('Step5 - City selected:', value);
                    updateAddress(address.id, 'city', value);
                  }}
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

            {address.state && address.district && address.city && (
              <div className="text-sm text-muted-foreground bg-muted/20 p-2 rounded">
                <strong>Complete Address:</strong> {address.streetAddress && `${address.streetAddress}, `}
                {getCityName(address.state, address.district, address.city)}, 
                {getDistrictName(address.state, address.district)}, 
                {getStateName(address.state)} - {address.pincode}
              </div>
            )}
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
