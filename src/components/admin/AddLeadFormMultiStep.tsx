
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Paperclip } from 'lucide-react';
import { saveLeadToDatabase } from '@/lib/lead-operations';
import { Lead } from '@/utils/mockData';

const formSchema = z.object({
  // Step 1: Bank & Product Details
  bankName: z.string().min(1, "Bank name is required"),
  bankProduct: z.string().min(1, "Bank product is required"),
  initiatedBranch: z.string().min(1, "Initiated branch is required"),
  buildBranch: z.string().min(1, "Build branch is required"),
  
  // Step 2: Applicant Information
  applicantName: z.string().min(1, "Applicant name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  applicantAge: z.number().min(18, "Age must be at least 18"),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]),
  spouseName: z.string().optional(),
  applicantPhone: z.string().min(10, "Valid phone number is required"),
  applicantEmail: z.string().email("Valid email is required"),
  
  // Step 3: Co-Applicant (Optional)
  hasCoApplicant: z.boolean().default(false),
  coApplicantName: z.string().optional(),
  coApplicantPhone: z.string().optional(),
  coApplicantRelation: z.string().optional(),
  coApplicantEmail: z.string().optional(),
  coApplicantAge: z.string().optional(),
  
  // Step 4: Address Information
  primaryStreet: z.string().min(1, "Street address is required"),
  primaryCity: z.string().min(1, "City is required"),
  primaryDistrict: z.string().min(1, "District is required"),
  primaryState: z.string().min(1, "State is required"),
  primaryPincode: z.string().min(6, "Valid pincode is required"),
  
  // Step 5: Professional Details
  companyName: z.string().min(1, "Company name is required"),
  designation: z.string().min(1, "Designation is required"),
  employmentType: z.enum(["Salaried", "Self Employed", "Business"]),
  workExperience: z.string().min(1, "Work experience is required"),
  currentJobDuration: z.string().min(1, "Current job duration is required"),
  
  // Step 6: Financial Details
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  annualIncome: z.string().min(1, "Annual income is required"),
  otherIncome: z.string().optional(),
  loanAmount: z.string().min(1, "Loan amount is required"),
  propertyType: z.string().optional(),
  propertyOwnership: z.string().optional(),
  propertyAge: z.string().optional(),
  
  // Step 7: Vehicle Details (for auto loans)
  vehicleBrandName: z.string().optional(),
  vehicleModelName: z.string().optional(),
  vehicleVariant: z.string().optional(),
  vehicleType: z.string().optional(),
  vehiclePrice: z.string().optional(),
  downPayment: z.string().optional(),
  
  // Step 8: Instructions & Assignment
  visitType: z.enum(["Office", "Residence", "Both"]).default("Residence"),
  specialInstructions: z.string().optional(),
  
  // Additional fields
  leadType: z.string().min(1, "Lead type is required"),
  agencyFileNo: z.string().optional(),
  applicationId: z.string().optional(),
  caseId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddLeadFormMultiStepProps {
  onSubmit?: (lead: any) => Promise<void>;
  locationData?: any;
}

const AddLeadFormMultiStep = ({ onSubmit, locationData }: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [additionalAddresses, setAdditionalAddresses] = useState<any[]>([]);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasCoApplicant: false,
      visitType: "Residence",
      employmentType: "Salaried",
      gender: "Male",
      maritalStatus: "Single",
    },
  });

  const totalSteps = 9;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedDocuments(prev => [...prev, ...Array.from(files)]);
      toast({
        title: "Documents uploaded",
        description: `${files.length} document(s) uploaded successfully.`,
      });
    }
  };

  const addAddress = () => {
    setAdditionalAddresses(prev => [...prev, {
      type: 'Office',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    }]);
  };

  const removeAddress = (index: number) => {
    setAdditionalAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const updateAddress = (index: number, field: string, value: string) => {
    setAdditionalAddresses(prev => prev.map((addr, i) => 
      i === index ? { ...addr, [field]: value } : addr
    ));
  };

  const handleSubmit = async (data: FormData) => {
    try {
      // Create lead object
      const leadId = `lead-${Date.now()}`;
      
      const newLead: any = {
        id: leadId,
        name: data.applicantName,
        age: data.applicantAge,
        status: 'Pending',
        visitType: data.visitType,
        assignedTo: '',
        instructions: data.specialInstructions || '',
        createdAt: new Date().toISOString(),
        address: {
          street: data.primaryStreet,
          city: data.primaryCity,
          district: data.primaryDistrict,
          state: data.primaryState,
          pincode: data.primaryPincode
        },
        additionalDetails: {
          // Bank Details
          bankName: data.bankName,
          bankProduct: data.bankProduct,
          initiatedBranch: data.initiatedBranch,
          buildBranch: data.buildBranch,
          
          // Applicant Details
          fatherName: data.fatherName,
          motherName: data.motherName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          maritalStatus: data.maritalStatus,
          spouseName: data.spouseName,
          phoneNumber: data.applicantPhone,
          email: data.applicantEmail,
          
          // Co-Applicant
          coApplicant: data.hasCoApplicant ? {
            name: data.coApplicantName,
            phone: data.coApplicantPhone,
            relation: data.coApplicantRelation,
            email: data.coApplicantEmail,
            age: data.coApplicantAge
          } : null,
          
          // Addresses
          addresses: additionalAddresses,
          
          // Professional
          company: data.companyName,
          designation: data.designation,
          employmentType: data.employmentType,
          workExperience: data.workExperience,
          currentJobDuration: data.currentJobDuration,
          
          // Financial
          monthlyIncome: data.monthlyIncome,
          annualIncome: data.annualIncome,
          otherIncome: data.otherIncome,
          loanAmount: data.loanAmount,
          propertyType: data.propertyType,
          ownershipStatus: data.propertyOwnership,
          
          // Vehicle
          vehicleBrandName: data.vehicleBrandName,
          vehicleModelName: data.vehicleModelName,
          vehicleVariant: data.vehicleVariant,
          vehicleType: data.vehicleType,
          vehiclePrice: data.vehiclePrice,
          downPayment: data.downPayment,
          
          // Lead Type and IDs
          leadType: data.leadType,
          agencyFileNo: data.agencyFileNo,
          applicationId: data.applicationId,
          caseId: data.caseId
        },
        documents: uploadedDocuments.map((file, index) => ({
          id: `doc-${index}`,
          name: file.name,
          type: file.type,
          uploadDate: new Date().toISOString(),
          url: URL.createObjectURL(file)
        }))
      };

      if (onSubmit) {
        await onSubmit(newLead);
      } else {
        // Default save behavior
        await saveLeadToDatabase(newLead);
        
        // Also save to localStorage as backup
        const storedLeads = localStorage.getItem('mockLeads');
        let currentLeads = [];
        if (storedLeads) {
          try {
            currentLeads = JSON.parse(storedLeads);
          } catch (error) {
            console.error("Error parsing stored leads:", error);
            currentLeads = [];
          }
        }
        
        const updatedLeads = [...currentLeads, newLead];
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
        
        toast({
          title: "Lead created successfully",
          description: `Lead for ${data.applicantName} has been created and saved.`,
        });
        
        navigate('/admin/leads');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Lead</CardTitle>
          <CardDescription>
            Step {currentStep} of {totalSteps}: Complete all required information
          </CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs value={`step${currentStep}`} className="w-full">
              <TabsList className="grid w-full grid-cols-9">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
                  <TabsTrigger
                    key={step}
                    value={`step${step}`}
                    onClick={() => setCurrentStep(step)}
                    className="text-xs"
                  >
                    {step}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Step 1: Bank & Product Details */}
              <TabsContent value="step1" className="space-y-4">
                <h3 className="text-lg font-semibold">Bank & Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bank Name *</label>
                    <Input {...form.register("bankName")} />
                    {form.formState.errors.bankName && (
                      <p className="text-sm text-red-500">{form.formState.errors.bankName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bank Product *</label>
                    <Input {...form.register("bankProduct")} />
                    {form.formState.errors.bankProduct && (
                      <p className="text-sm text-red-500">{form.formState.errors.bankProduct.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Initiated Branch *</label>
                    <Input {...form.register("initiatedBranch")} />
                    {form.formState.errors.initiatedBranch && (
                      <p className="text-sm text-red-500">{form.formState.errors.initiatedBranch.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Build Branch *</label>
                    <Input {...form.register("buildBranch")} />
                    {form.formState.errors.buildBranch && (
                      <p className="text-sm text-red-500">{form.formState.errors.buildBranch.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Step 2: Applicant Information */}
              <TabsContent value="step2" className="space-y-4">
                <h3 className="text-lg font-semibold">Applicant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input {...form.register("applicantName")} />
                    {form.formState.errors.applicantName && (
                      <p className="text-sm text-red-500">{form.formState.errors.applicantName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Father's Name *</label>
                    <Input {...form.register("fatherName")} />
                    {form.formState.errors.fatherName && (
                      <p className="text-sm text-red-500">{form.formState.errors.fatherName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mother's Name</label>
                    <Input {...form.register("motherName")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender *</label>
                    <Select onValueChange={(value) => form.setValue("gender", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth *</label>
                    <Input type="date" {...form.register("dateOfBirth")} />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Age *</label>
                    <Input 
                      type="number" 
                      {...form.register("applicantAge", { valueAsNumber: true })} 
                    />
                    {form.formState.errors.applicantAge && (
                      <p className="text-sm text-red-500">{form.formState.errors.applicantAge.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Marital Status *</label>
                    <Select onValueChange={(value) => form.setValue("maritalStatus", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.watch("maritalStatus") === "Married" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Spouse Name</label>
                      <Input {...form.register("spouseName")} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number *</label>
                    <Input {...form.register("applicantPhone")} />
                    {form.formState.errors.applicantPhone && (
                      <p className="text-sm text-red-500">{form.formState.errors.applicantPhone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input type="email" {...form.register("applicantEmail")} />
                    {form.formState.errors.applicantEmail && (
                      <p className="text-sm text-red-500">{form.formState.errors.applicantEmail.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Step 3: Co-Applicant */}
              <TabsContent value="step3" className="space-y-4">
                <h3 className="text-lg font-semibold">Co-Applicant Information</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasCoApplicant"
                    {...form.register("hasCoApplicant")}
                  />
                  <label htmlFor="hasCoApplicant" className="text-sm font-medium">
                    Add Co-Applicant
                  </label>
                </div>
                
                {form.watch("hasCoApplicant") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Co-Applicant Name</label>
                      <Input {...form.register("coApplicantName")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input {...form.register("coApplicantPhone")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Relation</label>
                      <Input {...form.register("coApplicantRelation")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" {...form.register("coApplicantEmail")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Age</label>
                      <Input {...form.register("coApplicantAge")} />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Step 4: Address Information */}
              <TabsContent value="step4" className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Street Address *</label>
                      <Input {...form.register("primaryStreet")} />
                      {form.formState.errors.primaryStreet && (
                        <p className="text-sm text-red-500">{form.formState.errors.primaryStreet.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City *</label>
                      <Input {...form.register("primaryCity")} />
                      {form.formState.errors.primaryCity && (
                        <p className="text-sm text-red-500">{form.formState.errors.primaryCity.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">District *</label>
                      <Input {...form.register("primaryDistrict")} />
                      {form.formState.errors.primaryDistrict && (
                        <p className="text-sm text-red-500">{form.formState.errors.primaryDistrict.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State *</label>
                      <Input {...form.register("primaryState")} />
                      {form.formState.errors.primaryState && (
                        <p className="text-sm text-red-500">{form.formState.errors.primaryState.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pincode *</label>
                      <Input {...form.register("primaryPincode")} />
                      {form.formState.errors.primaryPincode && (
                        <p className="text-sm text-red-500">{form.formState.errors.primaryPincode.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Additional Addresses</h4>
                      <Button type="button" variant="outline" onClick={addAddress}>
                        Add Address
                      </Button>
                    </div>
                    
                    {additionalAddresses.map((addr, index) => (
                      <div key={index} className="border p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Address {index + 1}</h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAddress(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select
                              value={addr.type}
                              onValueChange={(value) => updateAddress(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Office">Office</SelectItem>
                                <SelectItem value="Residence">Residence</SelectItem>
                                <SelectItem value="Property">Property</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Street</label>
                            <Input
                              value={addr.street}
                              onChange={(e) => updateAddress(index, 'street', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <Input
                              value={addr.city}
                              onChange={(e) => updateAddress(index, 'city', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">District</label>
                            <Input
                              value={addr.district}
                              onChange={(e) => updateAddress(index, 'district', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">State</label>
                            <Input
                              value={addr.state}
                              onChange={(e) => updateAddress(index, 'state', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Pincode</label>
                            <Input
                              value={addr.pincode}
                              onChange={(e) => updateAddress(index, 'pincode', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Step 5: Professional Details */}
              <TabsContent value="step5" className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name *</label>
                    <Input {...form.register("companyName")} />
                    {form.formState.errors.companyName && (
                      <p className="text-sm text-red-500">{form.formState.errors.companyName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Designation *</label>
                    <Input {...form.register("designation")} />
                    {form.formState.errors.designation && (
                      <p className="text-sm text-red-500">{form.formState.errors.designation.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Employment Type *</label>
                    <Select onValueChange={(value) => form.setValue("employmentType", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Salaried">Salaried</SelectItem>
                        <SelectItem value="Self Employed">Self Employed</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Work Experience *</label>
                    <Input {...form.register("workExperience")} />
                    {form.formState.errors.workExperience && (
                      <p className="text-sm text-red-500">{form.formState.errors.workExperience.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Job Duration *</label>
                    <Input {...form.register("currentJobDuration")} />
                    {form.formState.errors.currentJobDuration && (
                      <p className="text-sm text-red-500">{form.formState.errors.currentJobDuration.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Step 6: Financial Details */}
              <TabsContent value="step6" className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Income *</label>
                    <Input {...form.register("monthlyIncome")} />
                    {form.formState.errors.monthlyIncome && (
                      <p className="text-sm text-red-500">{form.formState.errors.monthlyIncome.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Annual Income *</label>
                    <Input {...form.register("annualIncome")} />
                    {form.formState.errors.annualIncome && (
                      <p className="text-sm text-red-500">{form.formState.errors.annualIncome.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Other Income</label>
                    <Input {...form.register("otherIncome")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Loan Amount *</label>
                    <Input {...form.register("loanAmount")} />
                    {form.formState.errors.loanAmount && (
                      <p className="text-sm text-red-500">{form.formState.errors.loanAmount.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Type</label>
                    <Input {...form.register("propertyType")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Ownership</label>
                    <Input {...form.register("propertyOwnership")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Age</label>
                    <Input {...form.register("propertyAge")} />
                  </div>
                </div>
              </TabsContent>

              {/* Step 7: Vehicle Details */}
              <TabsContent value="step7" className="space-y-4">
                <h3 className="text-lg font-semibold">Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Brand</label>
                    <Input {...form.register("vehicleBrandName")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Model</label>
                    <Input {...form.register("vehicleModelName")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Variant</label>
                    <Input {...form.register("vehicleVariant")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Type</label>
                    <Input {...form.register("vehicleType")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Price</label>
                    <Input {...form.register("vehiclePrice")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Down Payment</label>
                    <Input {...form.register("downPayment")} />
                  </div>
                </div>
              </TabsContent>

              {/* Step 8: Documents */}
              <TabsContent value="step8" className="space-y-4">
                <h3 className="text-lg font-semibold">Document Upload</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload documents
                          </span>
                        </label>
                        <input
                          id="upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </div>
                      <Button type="button" variant="outline" onClick={() => document.getElementById('upload')?.click()}>
                        <Paperclip className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>
                  
                  {uploadedDocuments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Uploaded Documents:</h4>
                      <ul className="space-y-1">
                        {uploadedDocuments.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Step 9: Instructions & Assignment */}
              <TabsContent value="step9" className="space-y-4">
                <h3 className="text-lg font-semibold">Instructions & Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lead Type *</label>
                    <Select onValueChange={(value) => form.setValue("leadType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home Loan">Home Loan</SelectItem>
                        <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                        <SelectItem value="Auto Loan">Auto Loan</SelectItem>
                        <SelectItem value="Business Loan">Business Loan</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.leadType && (
                      <p className="text-sm text-red-500">{form.formState.errors.leadType.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visit Type *</label>
                    <Select onValueChange={(value) => form.setValue("visitType", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Residence">Residence</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Agency File No</label>
                    <Input {...form.register("agencyFileNo")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Application ID</label>
                    <Input {...form.register("applicationId")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Case ID</label>
                    <Input {...form.register("caseId")} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Instructions</label>
                  <Textarea 
                    {...form.register("specialInstructions")}
                    placeholder="Any special instructions for this lead..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  Create Lead
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLeadFormMultiStep;
