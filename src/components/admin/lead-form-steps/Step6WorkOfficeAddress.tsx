
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

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
  const { control, watch } = useFormContext();
  const selectedState = watch('officeState');
  const selectedDistrict = watch('officeDistrict');

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
        <CardTitle>Step 6: Work & Office Address</CardTitle>
        <CardDescription>Enter work and office address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="officeState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locationData.states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="officeDistrict"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedState}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getDistrictsForState(selectedState).map((district) => (
                      <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="officeCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDistrict}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getCitiesForDistrict(selectedState, selectedDistrict).map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="officeAddress"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Office Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter office address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="officePincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pincode" {...field} />
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

export default Step6WorkOfficeAddress;
