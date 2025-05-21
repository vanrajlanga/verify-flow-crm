
import { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lead, User, getBankById } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Age must be a positive number.",
  }),
  job: z.string().min(2, {
    message: "Job must be at least 2 characters.",
  }),
  street: z.string().min(5, {
    message: "Street address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  district: z.string().min(2, {
    message: "District must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  pincode: z.string().min(5, {
    message: "Pincode must be at least 5 characters.",
  }),
  bank: z.string().min(1, {
    message: "Please select a bank.",
  }),
  visitType: z.string().min(1, {
    message: "Please select a visit type.",
  }),
  assignedTo: z.string().optional(),
  instructions: z.string().optional(),
});

interface AddLeadFormProps {
  agents: User[];
  banks: { id: string; name: string }[];
  onAddLead: (lead: Lead) => void;
  onClose: () => void;
  locationData: any;
}

const AddLeadForm = ({ agents, banks, onAddLead, onClose, locationData }: AddLeadFormProps) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      job: "",
      street: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      bank: "",
      visitType: "",
      assignedTo: "",
      instructions: ""
    },
  });

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedDocuments(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Create a new lead object
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: values.name,
      age: parseInt(values.age),
      job: values.job,
      address: {
        street: values.street,
        city: values.city,
        district: values.district,
        state: values.state,
        pincode: values.pincode
      },
      status: 'Pending',
      bank: values.bank,
      visitType: values.visitType as "Home" | "Office" | "Both",
      assignedTo: values.assignedTo || '',
      createdAt: new Date(),
      documents: uploadedDocuments.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: 'ID Proof',
        uploadedBy: 'bank',
        url: '/placeholder.svg', // In a real app, we would upload to storage
        uploadDate: new Date()
      })),
      instructions: values.instructions || '',
      verification: {
        status: 'Pending',
        agent: values.assignedTo || '',
        photos: [],
        documents: [],
        notes: ''
      }
    };
    
    onAddLead(newLead);
    toast({
      title: "Lead created",
      description: `New lead ${values.name} has been created successfully.`,
    });
    onClose();
  };

  const selectedState = form.watch("state");
  const selectedDistrict = form.watch("district");
  
  const availableDistricts = locationData.states.find(s => s.name === selectedState)?.districts || [];
  const availableCities = availableDistricts.find(d => d.name === selectedDistrict)?.cities || [];
  const filteredAgents = agents.filter(agent => 
    agent.district === selectedDistrict || !agent.district
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter applicant's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="job"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="visitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Both">Both (Home & Office)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {banks.map(bank => (
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
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special notes or instructions for the agent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('district', '');
                        form.setValue('city', '');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationData.states.map((state: any) => (
                          <SelectItem key={state.id} value={state.name}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('city', '');
                      }}
                      defaultValue={field.value}
                      disabled={availableDistricts.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            availableDistricts.length === 0 
                              ? "Select a state first" 
                              : "Select district"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableDistricts.map((district: any) => (
                          <SelectItem key={district.id} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={availableCities.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            availableCities.length === 0 
                              ? "Select a district first" 
                              : "Select city"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCities.map((city: any) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pincode"
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
              
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Agent (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-assign based on district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredAgents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} {agent.district ? `(${agent.district})` : ''}
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
          
          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Documents</h3>
            <div className="border-dashed border-2 border-gray-300 p-6 rounded-lg text-center">
              <Button variant="outline" className="w-full" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-6 w-6 mb-2 mx-auto" />
                  <span className="block">Upload KYC Documents</span>
                  <span className="text-xs text-muted-foreground">
                    (ID Proofs, Address Proofs, etc.)
                  </span>
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    multiple 
                    className="hidden" 
                    onChange={handleDocumentUpload}
                  />
                </label>
              </Button>
            </div>
            
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Uploaded Documents:</h4>
                <ul className="space-y-2">
                  {uploadedDocuments.map((file, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                      <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeDocument(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Lead
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddLeadForm;
