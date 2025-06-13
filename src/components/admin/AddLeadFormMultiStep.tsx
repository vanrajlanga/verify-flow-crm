import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, ArrowRight, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BankProduct {
  id: string;
  name: string;
  description?: string;
  bank_id: string;
}

interface BankBranch {
  id: string;
  name: string;
  location: string;
  bank_id: string;
}

interface Bank {
  id: string;
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

interface AddLeadFormMultiStepProps {
  onSubmit: (data: any) => void;
  locationData: LocationData;
}

// Define step names
const STEP_NAMES = [
  'Bank Details',
  'Applicant Info',
  'Co-Applicant',
  'Addresses',
  'Additional Details',
  'Documents & Instructions'
];

const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  bankProduct: z.string().min(1, "Bank product is required"),
  initiatedBranch: z.string().min(1, "Initiated branch is required"),
  buildBranch: z.string().min(1, "Build branch is required"),
  agencyFileNo: z.string().min(1, "Agency file number is required"),
  applicationBarcode: z.string().optional(),
  caseId: z.string().optional(),
  schemeDesc: z.string().optional(),
  leadType: z.string().min(1, "Lead type is required"),
  loanAmount: z.string().min(1, "Loan amount is required"),
  loanType: z.string().optional(),
  vehicleBrandName: z.string().optional(),
  vehicleModelName: z.string().optional(),
  vehicleVariant: z.string().optional(),
});

const applicantInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  maritalStatus: z.string().min(1, "Marital status is required"),
  spouseName: z.string().optional(),
});

const coApplicantSchema = z.object({
  hasCoApplicant: z.boolean(),
  coApplicantName: z.string().optional(),
  coApplicantPhone: z.string().optional(),
  coApplicantRelation: z.string().optional(),
  coApplicantEmail: z.string().optional(),
  coApplicantAge: z.string().optional(),
});

const addressesSchema = z.object({
  residenceStreet: z.string().min(1, "Residence street is required"),
  residenceCity: z.string().min(1, "Residence city is required"),
  residenceDistrict: z.string().min(1, "Residence district is required"),
  residenceState: z.string().min(1, "Residence state is required"),
  residencePincode: z.string().min(1, "Residence pincode is required"),
  officeStreet: z.string().optional(),
  officeCity: z.string().optional(),
  officeDistrict: z.string().optional(),
  officeState: z.string().optional(),
  officePincode: z.string().optional(),
});

const additionalDetailsSchema = z.object({
  company: z.string().optional(),
  designation: z.string().optional(),
  workExperience: z.string().optional(),
  currentJobDuration: z.string().optional(),
  employmentType: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualIncome: z.string().optional(),
  otherIncome: z.string().optional(),
  propertyType: z.string().optional(),
  ownershipStatus: z.string().optional(),
  propertyAge: z.string().optional(),
});

const documentsInstructionsSchema = z.object({
  visitType: z.string().min(1, "Visit type is required"),
  verificationDate: z.string().min(1, "Verification date is required"),
  instructions: z.string().optional(),
  documents: z.array(z.any()).optional(),
});

const AddLeadFormMultiStep: React.FC<AddLeadFormMultiStepProps> = ({ onSubmit, locationData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankProducts, setBankProducts] = useState<BankProduct[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BankProduct[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<BankBranch[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  const bankDetailsForm = useForm({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bankName: '',
      bankProduct: '',
      initiatedBranch: '',
      buildBranch: '',
      agencyFileNo: '',
      applicationBarcode: '',
      caseId: '',
      schemeDesc: '',
      leadType: '',
      loanAmount: '',
      loanType: '',
      vehicleBrandName: '',
      vehicleModelName: '',
      vehicleVariant: '',
    }
  });

  const applicantInfoForm = useForm({
    resolver: zodResolver(applicantInfoSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: '',
      age: '',
      gender: '',
      fatherName: '',
      motherName: '',
      maritalStatus: '',
      spouseName: '',
    }
  });

  const coApplicantForm = useForm({
    resolver: zodResolver(coApplicantSchema),
    defaultValues: {
      hasCoApplicant: false,
      coApplicantName: '',
      coApplicantPhone: '',
      coApplicantRelation: '',
      coApplicantEmail: '',
      coApplicantAge: '',
    }
  });

  const addressesForm = useForm({
    resolver: zodResolver(addressesSchema),
    defaultValues: {
      residenceStreet: '',
      residenceCity: '',
      residenceDistrict: '',
      residenceState: '',
      residencePincode: '',
      officeStreet: '',
      officeCity: '',
      officeDistrict: '',
      officeState: '',
      officePincode: '',
    }
  });

  const additionalDetailsForm = useForm({
    resolver: zodResolver(additionalDetailsSchema),
    defaultValues: {
      company: '',
      designation: '',
      workExperience: '',
      currentJobDuration: '',
      employmentType: '',
      monthlyIncome: '',
      annualIncome: '',
      otherIncome: '',
      propertyType: '',
      ownershipStatus: '',
      propertyAge: '',
    }
  });

  const documentsInstructionsForm = useForm({
    resolver: zodResolver(documentsInstructionsSchema),
    defaultValues: {
      visitType: '',
      verificationDate: '',
      instructions: '',
      documents: [],
    }
  });

  useEffect(() => {
    fetchBanks();
    fetchBankProducts();
    fetchBankBranches();
  }, []);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const fetchBankProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBankProducts(data || []);
    } catch (error) {
      console.error('Error fetching bank products:', error);
    }
  };

  const fetchBankBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_branches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBankBranches(data || []);
    } catch (error) {
      console.error('Error fetching bank branches:', error);
    }
  };

  const handleBankChange = (bankId: string) => {
    const filtered = bankProducts.filter(product => product.bank_id === bankId);
    setFilteredProducts(filtered);
    
    const filteredBranches = bankBranches.filter(branch => branch.bank_id === bankId);
    setFilteredBranches(filteredBranches);
    
    bankDetailsForm.setValue('bankProduct', '');
    bankDetailsForm.setValue('initiatedBranch', '');
    bankDetailsForm.setValue('buildBranch', '');
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const validateCurrentStep = async () => {
    try {
      switch (currentStep) {
        case 0:
          await bankDetailsForm.trigger();
          return bankDetailsForm.formState.isValid;
        case 1:
          await applicantInfoForm.trigger();
          return applicantInfoForm.formState.isValid;
        case 2:
          await coApplicantForm.trigger();
          return coApplicantForm.formState.isValid;
        case 3:
          await addressesForm.trigger();
          return addressesForm.formState.isValid;
        case 4:
          await additionalDetailsForm.trigger();
          return additionalDetailsForm.formState.isValid;
        case 5:
          await documentsInstructionsForm.trigger();
          return documentsInstructionsForm.formState.isValid;
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep) {
      // Allow going back to previous steps
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1) {
      // Validate current step before going to next
      const isValid = await validateCurrentStep();
      if (isValid) {
        setCurrentStep(stepIndex);
      } else {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields before proceeding to the next step.",
          variant: "destructive"
        });
      }
    } else if (stepIndex > currentStep + 1) {
      toast({
        title: "Complete Previous Steps",
        description: "Please complete the previous steps in order.",
        variant: "destructive"
      });
    } else {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEP_NAMES.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const bankDetailsData = bankDetailsForm.getValues();
    const applicantInfoData = applicantInfoForm.getValues();
    const coApplicantData = coApplicantForm.getValues();
    const addressesData = addressesForm.getValues();
    const additionalDetailsData = additionalDetailsForm.getValues();
    const documentsInstructionsData = documentsInstructionsForm.getValues();

    const formData = {
      id: `lead-${Date.now()}`,
      name: applicantInfoData.name,
      age: parseInt(applicantInfoData.age),
      job: additionalDetailsData.designation || '',
      address: {
        street: addressesData.residenceStreet,
        city: addressesData.residenceCity,
        district: addressesData.residenceDistrict,
        state: addressesData.residenceState,
        pincode: addressesData.residencePincode
      },
      additionalDetails: {
        ...bankDetailsData,
        ...applicantInfoData,
        ...additionalDetailsData,
        hasCoApplicant: coApplicantData.hasCoApplicant,
        coApplicant: coApplicantData.hasCoApplicant ? {
          name: coApplicantData.coApplicantName || '',
          phone: coApplicantData.coApplicantPhone || '',
          relation: coApplicantData.coApplicantRelation || '',
          email: coApplicantData.coApplicantEmail || '',
          age: coApplicantData.coApplicantAge || ''
        } : undefined,
        addresses: [
          {
            type: 'Residence',
            street: addressesData.residenceStreet,
            city: addressesData.residenceCity,
            district: addressesData.residenceDistrict,
            state: addressesData.residenceState,
            pincode: addressesData.residencePincode
          },
          ...(addressesData.officeStreet ? [{
            type: 'Office',
            street: addressesData.officeStreet,
            city: addressesData.officeCity,
            district: addressesData.officeDistrict,
            state: addressesData.officeState,
            pincode: addressesData.officePincode
          }] : [])
        ]
      },
      status: 'Pending',
      bank: bankDetailsData.bankName,
      visitType: documentsInstructionsData.visitType,
      verificationDate: new Date(documentsInstructionsData.verificationDate),
      instructions: documentsInstructionsData.instructions,
      documents: uploadedDocuments.map(file => ({
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: 'Document',
        uploadedBy: 'bank',
        uploadDate: new Date(),
        size: file.size
      })),
      createdAt: new Date()
    };

    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Lead</CardTitle>
          <CardDescription>Fill in the lead information step by step</CardDescription>
          
          {/* Step Navigation */}
          <div className="flex flex-wrap gap-2 mt-4 p-4 bg-muted/30 rounded-lg">
            {STEP_NAMES.map((stepName, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentStep === index
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > index
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {stepName}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Bank Details */}
          {currentStep === 0 && (
            <Form {...bankDetailsForm}>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Bank Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={bankDetailsForm.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleBankChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank" />
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
                    control={bankDetailsForm.control}
                    name="bankProduct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Product *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="initiatedBranch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initiated Branch *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredBranches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name} - {branch.location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="buildBranch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Build Branch *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredBranches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name} - {branch.location}
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
                    control={bankDetailsForm.control}
                    name="agencyFileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency File No. *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter agency file number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="applicationBarcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Barcode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter application barcode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="caseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter case ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="schemeDesc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheme Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter scheme description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="leadType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lead type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Home Loan">Home Loan</SelectItem>
                            <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                            <SelectItem value="Auto Loan">Auto Loan</SelectItem>
                            <SelectItem value="Business Loan">Business Loan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="loanAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter loan amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="loanType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter loan type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="vehicleBrandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vehicle brand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="vehicleModelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vehicle model" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankDetailsForm.control}
                    name="vehicleVariant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Variant</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vehicle variant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          )}

          {/* Step 2: Applicant Info */}
          {currentStep === 1 && (
            <Form {...applicantInfoForm}>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Applicant Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={applicantInfoForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter father's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mother's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applicantInfoForm.control}
                    name="spouseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spouse Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter spouse name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          )}

          {/* Step 3: Co-Applicant */}
          {currentStep === 2 && (
            <Form {...coApplicantForm}>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Co-Applicant Information</h3>
                
                <FormField
                  control={coApplicantForm.control}
                  name="hasCoApplicant"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Has Co-Applicant</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {coApplicantForm.watch('hasCoApplicant') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={coApplicantForm.control}
                      name="coApplicantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-Applicant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter co-applicant name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={coApplicantForm.control}
                      name="coApplicantPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-Applicant Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter co-applicant phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={coApplicantForm.control}
                      name="coApplicantRelation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Spouse">Spouse</SelectItem>
                              <SelectItem value="Father">Father</SelectItem>
                              <SelectItem value="Mother">Mother</SelectItem>
                              <SelectItem value="Brother">Brother</SelectItem>
                              <SelectItem value="Sister">Sister</SelectItem>
                              <SelectItem value="Friend">Friend</SelectItem>
                              <SelectItem value="Business Partner">Business Partner</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={coApplicantForm.control}
                      name="coApplicantEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-Applicant Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter co-applicant email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={coApplicantForm.control}
                      name="coApplicantAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-Applicant Age</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter co-applicant age" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </Form>
          )}

          {/* Step 4: Addresses */}
          {currentStep === 3 && (
            <Form {...addressesForm}>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Address Information</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium mb-4">Residence Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={addressesForm.control}
                        name="residenceStreet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressesForm.control}
                        name="residenceCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressesForm.control}
                        name="residenceDistrict"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter district" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressesForm.control}
                        name="residenceState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressesForm.control}
                        name="residencePincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium mb-4">Office Address (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={addressesForm.control}
                        name="officeStreet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter office street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressesForm.control}
                        name="officeCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter office city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressesForm.control}
                        name="officeDistrict"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter office district" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressesForm.control}
                        name="officeState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter office state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addressesForm.control}
                        name="officePincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter office pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}

          {/* Step 5: Additional Details */}
          {currentStep === 4 && (
            <Form {...additionalDetailsForm}>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Additional Details</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium mb-4">Professional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={additionalDetailsForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalDetailsForm.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter designation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalDetailsForm.control}
                        name="workExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Experience</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter work experience" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalDetailsForm.control}
                        name="currentJobDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Job Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter current job duration" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalDetailsForm.control}
                        name="employmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Salaried">Salaried</SelectItem>
                                <SelectItem value="Self Employed">Self Employed</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Professional">Professional</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium mb-4">Financial Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={additionalDetailsForm.control}
                        name="monthlyIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Income</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter monthly income" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalDetailsForm.control}
                        name="annualIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annual Income</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter annual income" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalDetailsForm.control}
                        name="otherIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other Income</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter other income" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium mb-4">Property Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={additionalDetailsForm.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Apartment">Apartment</SelectItem>
                                <SelectItem value="House">House</SelectItem>
                                <SelectItem value="Villa">Villa</SelectItem>
                                <SelectItem value="Plot">Plot</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalDetailsForm.control}
                        name="ownershipStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ownership Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ownership status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Owned">Owned</SelectItem>
                                <SelectItem value="Rented">Rented</SelectItem>
                                <SelectItem value="Family Owned">Family Owned</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalDetailsForm.control}
                        name="propertyAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Age</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter property age in years" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}

          {/* Step 6: Documents & Instructions */}
          {currentStep === 5 && (
            <Form {...documentsInstructionsForm}>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Documents & Instructions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={documentsInstructionsForm.control}
                    name="visitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Residence">Residence</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={documentsInstructionsForm.control}
                    name="verificationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={documentsInstructionsForm.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any special instructions for the verification"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Upload Documents</FormLabel>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload documents
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleDocumentUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {uploadedDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Uploaded Documents:</h4>
                      {uploadedDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Form>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < STEP_NAMES.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFormSubmit}
                className="flex items-center gap-2"
              >
                Submit Lead
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLeadFormMultiStep;
