import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '@/utils/mockData';
import { saveCompleteLeadToDatabase } from '@/lib/enhanced-lead-operations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Form schema
const leadFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, { message: "Name is required" }),
  age: z.string().refine((val) => !isNaN(Number(val)), { message: "Age must be a number" }),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  jobTitle: z.string().optional(),
  
  // Contact Information
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits" }).optional(),
  
  // Address
  street: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  
  // Professional Details
  company: z.string().optional(),
  designation: z.string().optional(),
  workExperience: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualIncome: z.string().optional(),
  
  // Family Details
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  spouseName: z.string().optional(),
  
  // Co-Applicant Details
  hasCoApplicant: z.boolean().optional(),
  coApplicantName: z.string().optional(),
  coApplicantPhone: z.string().optional(),
  coApplicantRelation: z.string().optional(),
  coApplicantEmail: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  coApplicantOccupation: z.string().optional(),
  coApplicantMonthlyIncome: z.string().optional(),
  
  // Property Details
  propertyType: z.string().optional(),
  ownershipStatus: z.string().optional(),
  propertyAge: z.string().optional(),
  
  // Loan Details
  leadType: z.string().min(1, { message: "Lead type is required" }),
  leadTypeId: z.string().optional(),
  loanAmount: z.string().optional(),
  loanType: z.string().optional(),
  
  // Vehicle Details (for Auto Loans)
  vehicleBrandId: z.string().optional(),
  vehicleBrandName: z.string().optional(),
  vehicleModelId: z.string().optional(),
  vehicleModelName: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleYear: z.string().optional(),
  vehiclePrice: z.string().optional(),
  downPayment: z.string().optional(),
  
  // Bank Details
  bank: z.string().min(1, { message: "Bank is required" }),
  bankBranch: z.string().optional(),
  agencyFileNo: z.string().optional(),
  applicationBarcode: z.string().optional(),
  caseId: z.string().optional(),
  schemeDesc: z.string().optional(),
  
  // Verification Details
  visitType: z.string().min(1, { message: "Visit type is required" }),
  assignedAgent: z.string().optional(),
  verificationDate: z.date().optional(),
  instructions: z.string().optional(),
  
  // Additional Comments
  additionalComments: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface AddLeadFormMultiStepProps {
  banks: any[];
  agents: any[];
  vehicleBrands: any[];
  vehicleModels: any[];
  leadTypes: any[];
}

interface PhoneNumber {
  id: string;
  number: string;
  type: string;
  isPrimary: boolean;
}

interface Address {
  id: string;
  type: 'Residence' | 'Office' | 'Permanent';
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

const AddLeadFormMultiStep: React.FC<AddLeadFormMultiStepProps> = ({
  banks,
  agents,
  vehicleBrands,
  vehicleModels,
  leadTypes
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [homeAddresses, setHomeAddresses] = useState<Address[]>([
    { id: uuidv4(), type: 'Residence', street: '', city: '', district: '', state: '', pincode: '' }
  ]);
  const [officeAddresses, setOfficeAddresses] = useState<Address[]>([]);
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState<string>('');
  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: '',
      maritalStatus: '',
      jobTitle: '',
      email: '',
      phoneNumber: '',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      company: '',
      designation: '',
      workExperience: '',
      monthlyIncome: '',
      annualIncome: '',
      fatherName: '',
      motherName: '',
      spouseName: '',
      hasCoApplicant: false,
      coApplicantName: '',
      coApplicantPhone: '',
      coApplicantRelation: '',
      coApplicantEmail: '',
      coApplicantOccupation: '',
      coApplicantMonthlyIncome: '',
      propertyType: '',
      ownershipStatus: '',
      propertyAge: '',
      leadType: '',
      leadTypeId: '',
      loanAmount: '',
      loanType: '',
      vehicleBrandId: '',
      vehicleBrandName: '',
      vehicleModelId: '',
      vehicleModelName: '',
      vehicleType: '',
      vehicleYear: '',
      vehiclePrice: '',
      downPayment: '',
      bank: '',
      bankBranch: '',
      agencyFileNo: '',
      applicationBarcode: '',
      caseId: '',
      schemeDesc: '',
      visitType: 'Residence',
      assignedAgent: '',
      instructions: '',
      additionalComments: '',
    }
  });
  
  const { register, handleSubmit: formHandleSubmit, watch, setValue, formState: { errors } } = form;
  
  const watchLeadType = watch('leadType');
  const watchHasCoApplicant = watch('hasCoApplicant');
  const watchVehicleBrand = watch('vehicleBrandId');
  
  // Filter vehicle models when brand changes
  useEffect(() => {
    if (watchVehicleBrand) {
      const brandModels = vehicleModels.filter(model => model.brandId === watchVehicleBrand);
      setFilteredModels(brandModels);
      setSelectedVehicleBrand(watchVehicleBrand);
      
      // Set brand name
      const brand = vehicleBrands.find(b => b.id === watchVehicleBrand);
      if (brand) {
        setValue('vehicleBrandName', brand.name);
      }
    } else {
      setFilteredModels([]);
    }
  }, [watchVehicleBrand, vehicleModels, vehicleBrands, setValue]);
  
  // Update model name when model ID is selected
  const handleModelChange = (modelId: string) => {
    setValue('vehicleModelId', modelId);
    const model = vehicleModels.find(m => m.id === modelId);
    if (model) {
      setValue('vehicleModelName', model.name);
    }
  };
  
  // Handle lead type selection
  const handleLeadTypeChange = (typeId: string) => {
    setValue('leadTypeId', typeId);
    const type = leadTypes.find(t => t.id === typeId);
    if (type) {
      setValue('leadType', type.name);
    }
  };
  
  // Phone number management
  const addPhoneNumber = () => {
    setPhoneNumbers([
      ...phoneNumbers,
      { id: uuidv4(), number: '', type: 'mobile', isPrimary: phoneNumbers.length === 0 }
    ]);
  };
  
  const updatePhoneNumber = (id: string, field: keyof PhoneNumber, value: any) => {
    setPhoneNumbers(phoneNumbers.map(phone => 
      phone.id === id ? { ...phone, [field]: value } : phone
    ));
  };
  
  const removePhoneNumber = (id: string) => {
    const updatedPhones = phoneNumbers.filter(phone => phone.id !== id);
    // Ensure at least one phone is primary if any exist
    if (updatedPhones.length > 0 && !updatedPhones.some(p => p.isPrimary)) {
      updatedPhones[0].isPrimary = true;
    }
    setPhoneNumbers(updatedPhones);
  };
  
  const setPrimaryPhone = (id: string) => {
    setPhoneNumbers(phoneNumbers.map(phone => ({
      ...phone,
      isPrimary: phone.id === id
    })));
  };
  
  // Address management
  const updateHomeAddress = (id: string, field: keyof Address, value: string) => {
    setHomeAddresses(homeAddresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };
  
  const addOfficeAddress = () => {
    setOfficeAddresses([
      ...officeAddresses,
      { id: uuidv4(), type: 'Office', street: '', city: '', district: '', state: '', pincode: '' }
    ]);
  };
  
  const updateOfficeAddress = (id: string, field: keyof Address, value: string) => {
    setOfficeAddresses(officeAddresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };
  
  const removeOfficeAddress = (id: string) => {
    setOfficeAddresses(officeAddresses.filter(addr => addr.id !== id));
  };
  
  // Navigation between steps
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Reset form
  const resetForm = () => {
    form.reset();
    setPhoneNumbers([]);
    setHomeAddresses([
      { id: uuidv4(), type: 'Residence', street: '', city: '', district: '', state: '', pincode: '' }
    ]);
    setOfficeAddresses([]);
    setSelectedVehicleBrand('');
    setFilteredModels([]);
  };
  
  // Form submission handler
  const onSubmitForm = async (formData: LeadFormValues) => {
    try {
      setIsSubmitting(true);
      
      const leadData: Lead = {
        id: `lead-${Date.now()}`,
        name: formData.name,
        age: parseInt(formData.age) || 0,
        job: formData.jobTitle || '',
        address: {
          street: homeAddresses[0]?.street || '',
          city: homeAddresses[0]?.city || '',
          district: homeAddresses[0]?.district || '',
          state: homeAddresses[0]?.state || '',
          pincode: homeAddresses[0]?.pincode || ''
        },
        additionalDetails: {
          company: formData.company || '',
          designation: formData.designation || '',
          workExperience: formData.workExperience || '',
          propertyType: formData.propertyType || '',
          ownershipStatus: formData.ownershipStatus || '',
          propertyAge: formData.propertyAge || '',
          monthlyIncome: formData.monthlyIncome || '',
          annualIncome: formData.annualIncome || '',
          otherIncome: '',
          phoneNumber: formData.phoneNumber || '',
          email: formData.email || '',
          dateOfBirth: '',
          gender: formData.gender || '',
          maritalStatus: formData.maritalStatus || '',
          fatherName: formData.fatherName || '',
          motherName: formData.motherName || '',
          spouseName: formData.spouseName || '',
          agencyFileNo: formData.agencyFileNo || '',
          applicationBarcode: formData.applicationBarcode || '',
          caseId: formData.caseId || '',
          schemeDesc: formData.schemeDesc || '',
          bankBranch: formData.bankBranch || '',
          additionalComments: formData.additionalComments || '',
          leadType: formData.leadType || '',
          leadTypeId: formData.leadTypeId || '',
          loanAmount: formData.loanAmount || '',
          loanType: formData.loanType || '',
          vehicleBrandName: formData.vehicleBrandName || '',
          vehicleBrandId: formData.vehicleBrandId || '',
          vehicleModelName: formData.vehicleModelName || '',
          vehicleModelId: formData.vehicleModelId || '',
          addresses: [
            ...homeAddresses,
            ...officeAddresses
          ] as any[],
          phoneNumbers: phoneNumbers.map(phone => ({
            id: phone.id,
            number: phone.number,
            type: phone.type as 'mobile' | 'landline' | 'work',
            isPrimary: phone.isPrimary
          })),
          coApplicant: formData.hasCoApplicant ? {
            name: formData.coApplicantName || '',
            phone: formData.coApplicantPhone || '',
            relation: formData.coApplicantRelation || '',
            email: formData.coApplicantEmail || '',
            occupation: formData.coApplicantOccupation || '',
            monthlyIncome: formData.coApplicantMonthlyIncome || ''
          } : undefined,
          vehicleDetails: formData.leadType === 'Auto Loan' ? {
            brandId: formData.vehicleBrandId || '',
            brandName: formData.vehicleBrandName || '',
            modelId: formData.vehicleModelId || '',
            modelName: formData.vehicleModelName || '',
            type: formData.vehicleType || '',
            year: formData.vehicleYear ? parseInt(formData.vehicleYear) : undefined,
            price: formData.vehiclePrice || '',
            downPayment: formData.downPayment || ''
          } : undefined
        },
        status: 'Pending',
        bank: formData.bank,
        visitType: formData.visitType as 'Residence' | 'Office',
        assignedTo: formData.assignedAgent || '',
        createdAt: new Date(),
        verificationDate: formData.verificationDate ? new Date(formData.verificationDate) : undefined,
        documents: [],
        instructions: formData.instructions || ''
      };

      console.log('Submitting lead data:', leadData);

      // Save to database using enhanced function
      await saveCompleteLeadToDatabase(leadData);

      // Also update localStorage for immediate access
      const existingLeads = JSON.parse(localStorage.getItem('mockLeads') || '[]');
      const updatedLeads = [...existingLeads, leadData];
      localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));

      toast({
        title: "Success!",
        description: "Lead has been created and saved to database successfully.",
      });

      // Reset form
      resetForm();
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render form steps
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
            <Input id="age" {...register('age')} />
            {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={(value) => setValue('gender', value)}>
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
          
          <div>
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select onValueChange={(value) => setValue('maritalStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          
          <div>
            <Label>Phone Numbers</Label>
            {phoneNumbers.map((phone, index) => (
              <div key={phone.id} className="flex items-center space-x-2 mb-2">
                <Input
                  value={phone.number}
                  onChange={(e) => updatePhoneNumber(phone.id, 'number', e.target.value)}
                  placeholder="Phone number"
                  className="flex-1"
                />
                <Select
                  value={phone.type}
                  onValueChange={(value) => updatePhoneNumber(phone.id, 'type', value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="landline">Landline</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={phone.isPrimary}
                    onChange={() => setPrimaryPhone(phone.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-xs">Primary</span>
                </div>
                {phoneNumbers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhoneNumber(phone.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPhoneNumber}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Phone Number
            </Button>
          </div>
          
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" {...register('jobTitle')} />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Residence Address</h3>
        {homeAddresses.map((address, index) => (
          <div key={address.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor={`home-street-${index}`}>Street Address</Label>
              <Input
                id={`home-street-${index}`}
                value={address.street}
                onChange={(e) => updateHomeAddress(address.id, 'street', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`home-city-${index}`}>City</Label>
              <Input
                id={`home-city-${index}`}
                value={address.city}
                onChange={(e) => updateHomeAddress(address.id, 'city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`home-district-${index}`}>District</Label>
              <Input
                id={`home-district-${index}`}
                value={address.district}
                onChange={(e) => updateHomeAddress(address.id, 'district', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`home-state-${index}`}>State</Label>
              <Input
                id={`home-state-${index}`}
                value={address.state}
                onChange={(e) => updateHomeAddress(address.id, 'state', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`home-pincode-${index}`}>Pincode</Label>
              <Input
                id={`home-pincode-${index}`}
                value={address.pincode}
                onChange={(e) => updateHomeAddress(address.id, 'pincode', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Office Address</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOfficeAddress}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Office Address
          </Button>
        </div>
        
        {officeAddresses.map((address, index) => (
          <div key={address.id} className="border p-4 rounded-md mb-4">
            <div className="flex justify-between mb-2">
              <h4 className="font-medium">Office Address {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOfficeAddress(address.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`office-street-${index}`}>Street Address</Label>
                <Input
                  id={`office-street-${index}`}
                  value={address.street}
                  onChange={(e) => updateOfficeAddress(address.id, 'street', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`office-city-${index}`}>City</Label>
                <Input
                  id={`office-city-${index}`}
                  value={address.city}
                  onChange={(e) => updateOfficeAddress(address.id, 'city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`office-district-${index}`}>District</Label>
                <Input
                  id={`office-district-${index}`}
                  value={address.district}
                  onChange={(e) => updateOfficeAddress(address.id, 'district', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`office-state-${index}`}>State</Label>
                <Input
                  id={`office-state-${index}`}
                  value={address.state}
                  onChange={(e) => updateOfficeAddress(address.id, 'state', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`office-pincode-${index}`}>Pincode</Label>
                <Input
                  id={`office-pincode-${index}`}
                  value={address.pincode}
                  onChange={(e) => updateOfficeAddress(address.id, 'pincode', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="company">Company/Organization</Label>
            <Input id="company" {...register('company')} />
          </div>
          
          <div>
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" {...register('designation')} />
          </div>
          
          <div>
            <Label htmlFor="workExperience">Work Experience (years)</Label>
            <Input id="workExperience" {...register('workExperience')} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
            <Input id="monthlyIncome" {...register('monthlyIncome')} />
          </div>
          
          <div>
            <Label htmlFor="annualIncome">Annual Income (₹)</Label>
            <Input id="annualIncome" {...register('annualIncome')} />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Family Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fatherName">Father's Name</Label>
            <Input id="fatherName" {...register('fatherName')} />
          </div>
          
          <div>
            <Label htmlFor="motherName">Mother's Name</Label>
            <Input id="motherName" {...register('motherName')} />
          </div>
          
          <div>
            <Label htmlFor="spouseName">Spouse Name</Label>
            <Input id="spouseName" {...register('spouseName')} />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasCoApplicant"
            checked={watchHasCoApplicant}
            onCheckedChange={(checked) => setValue('hasCoApplicant', checked === true)}
          />
          <Label htmlFor="hasCoApplicant">Has Co-Applicant</Label>
        </div>
        
        {watchHasCoApplicant && (
          <div className="border p-4 rounded-md">
            <h4 className="font-medium mb-4">Co-Applicant Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coApplicantName">Name</Label>
                <Input id="coApplicantName" {...register('coApplicantName')} />
              </div>
              
              <div>
                <Label htmlFor="coApplicantPhone">Phone</Label>
                <Input id="coApplicantPhone" {...register('coApplicantPhone')} />
              </div>
              
              <div>
                <Label htmlFor="coApplicantRelation">Relationship</Label>
                <Select onValueChange={(value) => setValue('coApplicantRelation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="coApplicantEmail">Email</Label>
                <Input id="coApplicantEmail" type="email" {...register('coApplicantEmail')} />
              </div>
              
              <div>
                <Label htmlFor="coApplicantOccupation">Occupation</Label>
                <Input id="coApplicantOccupation" {...register('coApplicantOccupation')} />
              </div>
              
              <div>
                <Label htmlFor="coApplicantMonthlyIncome">Monthly Income (₹)</Label>
                <Input id="coApplicantMonthlyIncome" {...register('coApplicantMonthlyIncome')} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="leadType">Lead Type <span className="text-red-500">*</span></Label>
            <Select onValueChange={handleLeadTypeChange} value={watch('leadTypeId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select lead type" />
              </SelectTrigger>
              <SelectContent>
                {leadTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leadType && <p className="text-sm text-red-500">{errors.leadType.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
            <Input id="loanAmount" {...register('loanAmount')} />
          </div>
          
          <div>
            <Label htmlFor="loanType">Loan Type</Label>
            <Select onValueChange={(value) => setValue('loanType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Refinance">Refinance</SelectItem>
                <SelectItem value="Top-up">Top-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="bank">Bank <span className="text-red-500">*</span></Label>
            <Select onValueChange={(value) => setValue('bank', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bank && <p className="text-sm text-red-500">{errors.bank.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="bankBranch">Bank Branch</Label>
            <Input id="bankBranch" {...register('bankBranch')} />
          </div>
          
          <div>
            <Label htmlFor="agencyFileNo">Agency File No.</Label>
            <Input id="agencyFileNo" {...register('agencyFileNo')} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="applicationBarcode">Application Barcode</Label>
          <Input id="applicationBarcode" {...register('applicationBarcode')} />
        </div>
        
        <div>
          <Label htmlFor="caseId">Case ID</Label>
          <Input id="caseId" {...register('caseId')} />
        </div>
        
        <div>
          <Label htmlFor="schemeDesc">Scheme Description</Label>
          <Input id="schemeDesc" {...register('schemeDesc')} />
        </div>
      </div>
      
      {watchLeadType === 'Auto Loan' && (
        <div className="border p-4 rounded-md">
          <h4 className="font-medium mb-4">Vehicle Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
              <Select onValueChange={(value) => setValue('vehicleBrandId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle brand" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="vehicleModel">Vehicle Model</Label>
              <Select 
                onValueChange={handleModelChange}
                disabled={!selectedVehicleBrand}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedVehicleBrand ? "Select vehicle model" : "Select a brand first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select onValueChange={(value) => setValue('vehicleType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="vehicleYear">Year</Label>
              <Input id="vehicleYear" {...register('vehicleYear')} />
            </div>
            
            <div>
              <Label htmlFor="vehiclePrice">Vehicle Price (₹)</Label>
              <Input id="vehiclePrice" {...register('vehiclePrice')} />
            </div>
            
            <div>
              <Label htmlFor="downPayment">Down Payment (₹)</Label>
              <Input id="downPayment" {...register('downPayment')} />
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select onValueChange={(value) => setValue('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Independent House">Independent House</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Plot">Plot</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="ownershipStatus">Ownership Status</Label>
            <Select onValueChange={(value) => setValue('ownershipStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select ownership status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Self Owned">Self Owned</SelectItem>
                <SelectItem value="Rented">Rented</SelectItem>
                <SelectItem value="Family Owned">Family Owned</SelectItem>
                <SelectItem value="Company Provided">Company Provided</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="propertyAge">Property Age (years)</Label>
            <Input id="propertyAge" {...register('propertyAge')} />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="visitType">Visit Type <span className="text-red-500">*</span></Label>
            <RadioGroup
              value={watch('visitType')}
              onValueChange={(value) => setValue('visitType', value)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Residence" id="visit-residence" />
                <Label htmlFor="visit-residence">Residence</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Office" id="visit-office" />
                <Label htmlFor="visit-office">Office</Label>
              </div>
            </RadioGroup>
            {errors.visitType && <p className="text-sm text-red-500">{errors.visitType.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="assignedAgent">Assign Agent</Label>
            <Select onValueChange={(value) => setValue('assignedAgent', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="verificationDate">Verification Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('verificationDate') ? (
                    format(watch('verificationDate'), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('verificationDate')}
                  onSelect={(date) => setValue('verificationDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              {...register('instructions')}
              className="min-h-[120px]"
              placeholder="Any special instructions for the agent..."
            />
          </div>
          
          <div>
            <Label htmlFor="additionalComments">Additional Comments</Label>
            <Textarea
              id="additionalComments"
              {...register('additionalComments')}
              className="min-h-[120px]"
              placeholder="Any additional comments..."
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Lead</CardTitle>
        <CardDescription>
          Create a new lead for verification. Fill in all required fields.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex flex-col items-center",
                  currentStep === step ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                <span className="text-xs hidden md:block">
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Address"}
                  {step === 3 && "Professional"}
                  {step === 4 && "Loan Details"}
                  {step === 5 && "Verification"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 w-full bg-muted">
            <div
              className="h-1 bg-primary transition-all"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
        </div>
        
        <form onSubmit={formHandleSubmit(onSubmitForm)}>
          {renderCurrentStep()}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        {currentStep < 5 ? (
          <Button type="button" onClick={nextStep}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} onClick={formHandleSubmit(onSubmitForm)}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
              </>
            ) : (
              'Submit'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AddLeadFormMultiStep;
