
import { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lead, User, getBankById } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus, X } from 'lucide-react';
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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

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
  assignmentType: z.enum(["auto", "manual"]),
  assignedTo: z.string().optional(),
  instructions: z.string().optional(),
});

interface Document {
  id: string;
  file: File;
  name: string;
}

interface LocationData {
  states: {
    id: string;
    name: string;
    districts: {
      id: string;
      name: string;
      cities: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
}

interface AddLeadFormProps {
  agents: User[];
  banks: { id: string; name: string }[];
  onAddLead: (lead: Lead) => void;
  onClose: () => void;
  locationData: LocationData;
}

const AddLeadForm = ({ agents, banks, onAddLead, onClose, locationData }: AddLeadFormProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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
      assignmentType: "auto",
      assignedTo: "",
      instructions: ""
    },
  });

  // Watch form values for state, district, and assignment type
  const selectedStateName = form.watch("state");
  const selectedDistrictName = form.watch("district");
  const assignmentType = form.watch("assignmentType");
  
  // Find selected state and district objects
  const selectedState = locationData.states.find(state => state.name === selectedStateName);
  const availableDistricts = selectedState?.districts || [];
  const selectedDistrict = selectedState?.districts.find(district => district.name === selectedDistrictName);
  const availableCities = selectedDistrict?.cities || [];
  
  // Filter agents based on selected district
  const filteredAgents = agents.filter(agent => 
    agent.district === selectedDistrictName || !agent.district
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addDocument = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!documentName) {
      toast({
        title: "Missing document name",
        description: "Please provide a name for the document",
        variant: "destructive",
      });
      return;
    }

    const newDocument: Document = {
      id: `doc-${Date.now()}-${documents.length}`,
      file: selectedFile,
      name: documentName
    };

    setDocuments([...documents, newDocument]);
    setDocumentName('');
    setSelectedFile(null);
    
    // Reset the file input
    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Create documents array from the uploaded files
    const uploadedDocuments = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: 'Other' as const,
      uploadedBy: 'bank' as const,
      url: '/placeholder.svg',
      uploadDate: new Date()
    }));

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
      assignedTo: values.assignmentType === 'manual' && values.assignedTo ? values.assignedTo : '',
      createdAt: new Date(),
      documents: uploadedDocuments,
      instructions: values.instructions || '',
      verification: {
        status: 'Not Started',
        agentId: values.assignmentType === 'manual' && values.assignedTo ? values.assignedTo : '',
        leadId: `lead-${Date.now()}`,
        id: `verification-${Date.now()}`,
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
                        {locationData.states.map((state) => (
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
                        {availableDistricts.map((district) => (
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
                        {availableCities.map((city) => (
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
                name="assignmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Assignment</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="auto" id="auto" />
                          <label htmlFor="auto" className="cursor-pointer">Auto-assign based on district</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id="manual" />
                          <label htmlFor="manual" className="cursor-pointer">Manually select agent</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {assignmentType === "manual" && (
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Agent</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an agent" />
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
              )}
            </div>
          </div>
          
          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Documents</h3>
            
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-grow">
                  <Input
                    placeholder="Document name (e.g. ID Proof, Address Proof)"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </div>
                <Input
                  id="document-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="max-w-[220px]"
                />
                <Button 
                  type="button" 
                  onClick={addDocument}
                  disabled={!selectedFile || !documentName}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              
              {documents.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Uploaded Documents:</h4>
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">({doc.file.name})</span>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeDocument(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
