import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { User, Bank } from '@/utils/mockData';

// Import all step components
import Step1LeadTypeBasicInfo from './lead-form-steps/Step1LeadTypeBasicInfo';
import Step2PersonalInfo from './lead-form-steps/Step2PersonalInfo';
import Step3JobDetails from './lead-form-steps/Step3JobDetails';
import Step4PropertyIncome from './lead-form-steps/Step4PropertyIncome';
import Step5HomeAddresses from './lead-form-steps/Step5HomeAddresses';
import Step6WorkOfficeAddress from './lead-form-steps/Step6WorkOfficeAddress';
import Step7DocumentUpload from './lead-form-steps/Step7DocumentUpload';
import Step8VerificationOptions from './lead-form-steps/Step8VerificationOptions';
import Step9AgentAssignment from './lead-form-steps/Step9AgentAssignment';

// Form schema
const formSchema = z.object({
  // Step 1
  bankName: z.string().min(1, "Bank name is required"),
  leadType: z.string().min(1, "Lead type is required"),
  initiatedBranch: z.string().optional(),
  buildBranch: z.string().optional(),
  agencyFileNo: z.string().min(1, "Agency file number is required"),
  applicationBarcode: z.string().optional(),
  caseId: z.string().optional(),
  schemeDescription: z.string().optional(),
  loanAmount: z.string().optional(),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  
  // Step 2
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email().optional().or(z.literal('')),
  age: z.string().optional(),
  gender: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  maritalStatus: z.string().optional(),
  hasCoApplicant: z.boolean().optional(),
  coApplicantName: z.string().optional(),
  coApplicantPhone: z.string().optional(),
  coApplicantRelation: z.string().optional(),
  coApplicantEmail: z.string().email().optional().or(z.literal('')),
  
  // Step 3
  companyName: z.string().optional(),
  designation: z.string().optional(),
  workExperience: z.string().optional(),
  employmentType: z.string().optional(),
  currentJobDuration: z.string().optional(),
  
  // Step 4
  propertyType: z.string().optional(),
  ownershipStatus: z.string().optional(),
  propertyAge: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualIncome: z.string().optional(),
  otherIncome: z.string().optional(),
  
  // Step 5
  addresses: z.array(z.object({
    state: z.string(),
    district: z.string(),
    city: z.string(),
    streetAddress: z.string(),
    pincode: z.string(),
    requireVerification: z.boolean()
  })).optional(),
  
  // Step 6
  officeState: z.string().optional(),
  officeDistrict: z.string().optional(),
  officeCity: z.string().optional(),
  officeAddress: z.string().optional(),
  officePincode: z.string().optional(),
  
  // Step 8
  visitType: z.string().min(1, "Visit type is required"),
  preferredDate: z.date().optional(),
  specialInstructions: z.string().optional(),
  
  // Step 9
  assignedAgent: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MultiStepLeadFormProps {
  banks: Bank[];
  agents: User[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  locationData: any;
}

const MultiStepLeadForm = ({ banks, agents, onSubmit, onCancel, locationData }: MultiStepLeadFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<any[]>([]);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: '',
      leadType: '',
      agencyFileNo: '',
      customerName: '',
      phoneNumber: '',
      email: '',
      visitType: 'residence',
      hasCoApplicant: false,
      addresses: []
    }
  });

  const totalSteps = 9;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    loadProducts();
    loadBranches();
    loadVehicleData();
  }, []);

  const loadProducts = () => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  };

  const loadBranches = () => {
    const storedBranches = localStorage.getItem('branches');
    if (storedBranches) {
      setBranches(JSON.parse(storedBranches));
    } else {
      // Create default branches with correct bank IDs matching mockBanks
      const defaultBranches = [
        { id: 'branch-1', name: 'Main Branch', bankId: banks[0]?.id || 'hdfc' },
        { id: 'branch-2', name: 'City Center Branch', bankId: banks[0]?.id || 'hdfc' },
        { id: 'branch-3', name: 'Airport Branch', bankId: banks[1]?.id || 'sbi' },
        { id: 'branch-4', name: 'Mall Branch', bankId: banks[1]?.id || 'sbi' },
        { id: 'branch-5', name: 'Downtown Branch', bankId: banks[2]?.id || 'icici' },
      ];
      setBranches(defaultBranches);
      localStorage.setItem('branches', JSON.stringify(defaultBranches));
    }
  };

  const loadVehicleData = () => {
    const storedBrands = localStorage.getItem('vehicleBrands');
    const storedModels = localStorage.getItem('vehicleModels');
    
    if (storedBrands) {
      setVehicleBrands(JSON.parse(storedBrands));
    }
    if (storedModels) {
      setVehicleModels(JSON.parse(storedModels));
    }
  };

  const stepTitles = [
    "Lead Type & Basic Info",
    "Personal Information", 
    "Job Details",
    "Property & Income",
    "Home Addresses",
    "Work & Office Address",
    "Document Upload",
    "Verification Options",
    "Agent Assignment"
  ];

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

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

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Form data being submitted:', data);
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Lead created successfully!",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1LeadTypeBasicInfo 
          banks={banks} 
          products={products} 
          branches={branches}
          vehicleBrands={vehicleBrands}
          vehicleModels={vehicleModels}
        />;
      case 2:
        return <Step2PersonalInfo />;
      case 3:
        return <Step3JobDetails />;
      case 4:
        return <Step4PropertyIncome />;
      case 5:
        return <Step5HomeAddresses locationData={locationData} />;
      case 6:
        return <Step6WorkOfficeAddress locationData={locationData} />;
      case 7:
        return <Step7DocumentUpload />;
      case 8:
        return <Step8VerificationOptions />;
      case 9:
        return <Step9AgentAssignment agents={agents} />;
      default:
        return <Step1LeadTypeBasicInfo 
          banks={banks} 
          products={products} 
          branches={branches}
          vehicleBrands={vehicleBrands}
          vehicleModels={vehicleModels}
        />;
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Add New Lead - Step {currentStep} of {totalSteps}</CardTitle>
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
            
            {/* Step Navigation */}
            <div className="grid grid-cols-3 md:grid-cols-9 gap-2 mt-4">
              {stepTitles.map((title, index) => (
                <Button
                  key={index + 1}
                  type="button"
                  variant={currentStep === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToStep(index + 1)}
                  className="text-xs p-2 h-auto"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{index + 1}</span>
                    <span className="hidden md:block text-center leading-tight">{title}</span>
                  </div>
                </Button>
              ))}
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{stepTitles[currentStep - 1]}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>
          
          <CardContent>
            {renderCurrentStep()}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Lead'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};

export default MultiStepLeadForm;
