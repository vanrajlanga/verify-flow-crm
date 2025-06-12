
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const Step8VerificationOptions = () => {
  const { control, watch } = useFormContext();
  const addresses = watch('addresses') || [];
  const officeAddress = {
    state: watch('officeState'),
    district: watch('officeDistrict'),
    city: watch('officeCity'),
    address: watch('officeAddress'),
    pincode: watch('officePincode')
  };

  const verificationAddresses = addresses.filter((addr: any) => addr.requireVerification);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 8: Verification Options</CardTitle>
        <CardDescription>Set verification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="visitType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Visit Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="residence" id="residence" />
                    <Label htmlFor="residence">Residence Verification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office" id="office" />
                    <Label htmlFor="office">Office Verification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both Residence & Office</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Show selected addresses for verification */}
        {verificationAddresses.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Addresses Selected for Verification:</Label>
            <div className="space-y-2">
              {verificationAddresses.map((addr: any, index: number) => (
                <div key={addr.id || index} className="border rounded-lg p-3 bg-muted/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">Residence {index + 1}</Badge>
                      <p className="text-sm">
                        <strong>Address:</strong> {addr.streetAddress}
                        {addr.streetAddress && ', '}
                        {addr.city && `${addr.city}, `}
                        {addr.district && `${addr.district}, `}
                        {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show office address if provided */}
        {(officeAddress.state || officeAddress.address) && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Office Address:</Label>
            <div className="border rounded-lg p-3 bg-muted/20">
              <Badge variant="outline" className="mb-2">Office</Badge>
              <p className="text-sm">
                <strong>Address:</strong> {officeAddress.address}
                {officeAddress.address && ', '}
                {officeAddress.city && `${officeAddress.city}, `}
                {officeAddress.district && `${officeAddress.district}, `}
                {officeAddress.state} - {officeAddress.pincode}
              </p>
            </div>
          </div>
        )}

        <FormField
          control={control}
          name="preferredDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Preferred Verification Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd-MM-yyyy")
                      ) : (
                        <span>dd-mm-yyyy</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="specialInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any special instructions for the verification agent..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default Step8VerificationOptions;
