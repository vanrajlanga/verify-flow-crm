import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { Address, AdditionalDetails, Bank, Lead, User, VerificationData, mockBanks, mockUsers } from '@/utils/mockData';

interface AddLeadFormProps {
  onAddLead: (newLead: Lead) => void;
  onClose: () => void;
  locationData: LocationData;
  agents: User[];
  banks: Bank[];
}

const leadFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.coerce.number().min(18, {
    message: "Age must be at least 18.",
  }),
  job: z.string().min(2, {
    message: "Job must be at least 2 characters.",
  }),
  street: z.string().min(2, {
    message: "Street must be at least 2 characters.",
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
  pincode: z.string().min(6).max(6, {
    message: "Pincode must be exactly 6 characters.",
  }),
  company: z.string().min(2, {
    message: "Company must be at least 2 characters.",
  }),
  jobTitle: z.string().min(2, {
    message: "Job Title must be at least 2 characters.",
  }),
  workExperience: z.string().min(2, {
    message: "Work Experience must be at least 2 characters.",
  }),
  propertyType: z.string().min(2, {
    message: "Property Type must be at least 2 characters.",
  }),
  ownershipStatus: z.string().min(2, {
    message: "Ownership Status must be at least 2 characters.",
  }),
  propertyAge: z.string().min(2, {
    message: "Property Age must be at least 2 characters.",
  }),
  monthlyIncome: z.string().min(2, {
    message: "Monthly Income must be at least 2 characters.",
  }),
  annualIncome: z.string().min(2, {
    message: "Annual Income must be at least 2 characters.",
  }),
  otherIncome: z.string().min(2, {
    message: "Other Income must be at least 2 characters.",
  }),
  bank: z.string().min(2, {
    message: "Please select a bank.",
  }),
  visitType: z.string().min(2, {
    message: "Please select a visit type.",
  }),
  assignedAgent: z.string().min(2, {
    message: "Please select an agent.",
  }),
  instructions: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const AddLeadForm = ({ onAddLead, onClose, locationData, agents, banks }: AddLeadFormProps) => {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const navigate = useNavigate();

  // Find the district options for the selected state
  const availableDistricts = locationData.states.find((s: any) => s.name === state)?.districts || [];
  
  // Find the city options for the selected district
  const availableCities = availableDistricts.find((d: any) => d.name === district)?.cities || [];

  useEffect(() => {
    // Fetch banks from localStorage
    const storedBanks = localStorage.getItem('mockBanks');
    if (storedBanks) {
      try {
        const parsedBanks = JSON.parse(storedBanks);
        setBanks(parsedBanks);
      } catch (error) {
        console.error("Error loading banks:", error);
        setBanks(mockBanks);
        localStorage.setItem('mockBanks', JSON.stringify(mockBanks));
      }
    } else {
      setBanks(mockBanks);
      localStorage.setItem('mockBanks', JSON.stringify(mockBanks));
    }

    // Fetch agents from localStorage
    const storedAgents = localStorage.getItem('mockUsers');
    if (storedAgents) {
      try {
        const parsedAgents = JSON.parse(storedAgents);
        const agentUsers = parsedAgents.filter((user: User) => user.role === 'agent');
        setAgents(agentUsers);
      } catch (error) {
        console.error("Error loading agents:", error);
        setAgents(mockUsers.filter(user => user.role === 'agent'));
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }
    } else {
      setAgents(mockUsers.filter(user => user.role === 'agent'));
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    }
  }, []);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      age: 18,
      job: "",
      street: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      company: "",
      jobTitle: "",
      workExperience: "",
      propertyType: "",
      ownershipStatus: "",
      propertyAge: "",
      monthlyIncome: "",
      annualIncome: "",
      otherIncome: "",
      bank: "",
      visitType: "",
      assignedAgent: "",
      instructions: "",
    },
  });

  const onSubmit = (values: LeadFormValues) => {
    createNewLead(
      values.name,
      values.age,
      values.job,
      values.street,
      values.city,
      values.district,
      values.state,
      values.pincode,
      values.company,
      values.jobTitle,
      values.workExperience,
      values.propertyType,
      values.ownershipStatus,
      values.propertyAge,
      values.monthlyIncome,
      values.annualIncome,
      values.otherIncome,
      values.bank,
      values.visitType,
      values.assignedAgent,
      values.instructions
    );
  };

  const createNewLead = (
    name: string,
    age: number,
    job: string,
    street: string,
    city: string,
    district: string,
    state: string,
    pincode: string,
    company: string,
    jobTitle: string,
    workExperience: string,
    propertyType: string,
    ownershipStatus: string,
    propertyAge: string,
    monthlyIncome: string,
    annualIncome: string,
    otherIncome: string,
    bank: string,
    visitType: string,
    assignedAgent: string,
    instructions?: string
  ) => {
    const newLeadId = `lead-${uuidv4()}`;
    const newAddress: Address = {
    street,
    city,
    district,
    state,
    postalCode: pincode // Using pincode variable but assigning to the correct property name
  };
  
  const newAdditionalDetails: AdditionalDetails = {
    jobDetails: {
      employer: company, // Using company variable to assign to the employer property
      designation: jobTitle,
      workExperience: workExperience
      // company property is now optional but we'll use employer instead
    },
    propertyDetails: {
      propertyType: propertyType,
      ownership: ownershipStatus,
      propertyAge: propertyAge
    },
    incomeDetails: {
      monthlyIncome: monthlyIncome,
      annualIncome: annualIncome,
      otherIncome: otherIncome
    }
  };
    const newLead: Lead = {
      id: newLeadId,
      name,
      age,
      job,
      address: newAddress,
      additionalDetails: newAdditionalDetails,
      status: 'Pending',
      bank: bank,
      visitType: visitType as 'Office' | 'Residence' | 'Both',
      assignedTo: assignedAgent,
      createdAt: new Date(),
      documents: [],
      instructions: instructions,
      verification: {
        id: `v-${Date.now()}`,
        agentId: assignedAgent,
        status: 'Not Started',
        documents: [],
        notes: ''
      }
    };

    // Get existing leads from localStorage
    const storedLeads = localStorage.getItem('mockLeads');
    let existingLeads: Lead[] = [];
    if (storedLeads) {
      try {
        existingLeads = JSON.parse(storedLeads);
      } catch (error) {
        console.error("Error loading leads from localStorage:", error);
      }
    }

    // Add the new lead to the existing leads
    const updatedLeads = [...existingLeads, newLead];

    // Store the updated leads back in localStorage
    localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

    onAddLead(newLead);
    toast({
      title: "Lead added",
      description: `${name} has been added successfully.`,
    });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of the lead</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lead Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Age" {...field} />
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
                  <FormLabel>Job</FormLabel>
                  <FormControl>
                    <Input placeholder="Job" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>Enter the address details of the lead</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
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
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={availableDistricts.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            state ? (availableDistricts.length === 0 ? "No districts available" : "Select district") : "Select a state first"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setState(value);
                        setDistrict('');
                        setCity('');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
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
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Pincode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Enter the additional details of the lead</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Job Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Experience</FormLabel>
                  <FormControl>
                    <Input placeholder="Work Experience" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Property Type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownershipStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ownership Status</FormLabel>
                  <FormControl>
                    <Input placeholder="Ownership Status" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Age</FormLabel>
                  <FormControl>
                    <Input placeholder="Property Age" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly Income" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annualIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Income</FormLabel>
                  <FormControl>
                    <Input placeholder="Annual Income" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otherIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Income</FormLabel>
                  <FormControl>
                    <Input placeholder="Other Income" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
            <CardDescription>Assign the lead to a bank and agent</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
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
                        <SelectValue placeholder="Select a bank" />
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
                        <SelectValue placeholder="Select a visit type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Residence">Residence</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedAgent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Agent</FormLabel>
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
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Add instructions for the agent</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instructions for the agent"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Lead
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddLeadForm;
