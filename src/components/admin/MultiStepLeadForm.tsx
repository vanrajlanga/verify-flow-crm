
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

const formSchema = z.object({
  // Step 1 - Lead Type & Basic Info
  bankName: z.string().min(1, "Bank name is required"),
  leadType: z.string().min(1, "Lead type is required"),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  initiatedBranch: z.string().optional(),
  buildBranch: z.string().optional(),
  agencyFileNo: z.string().min(1, "Agency file number is required"),
  applicationBarcode: z.string().optional(),
  caseId: z.string().optional(),
  schemeDescription: z.string().optional(),
  loanAmount: z.string().optional(),
  
  // Step 2 - Personal Info
  customerName: z.string().min(1, "Customer name is required"),
  age: z.string().min(1, "Age is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email format").optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  spouseName: z.string().optional(),
  
  // Step 3 - Job Details
  companyName: z.string().optional(),
  designation: z.string().optional(),
  workExperience: z.string().optional(),
  
  // Step 4 - Property & Income
  propertyType: z.string().optional(),
  ownershipStatus: z.string().optional(),
  propertyAge: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualIncome: z.string().optional(),
  otherIncome: z.string().optional(),
  
  // Step 5 & 6 - Addresses
  addresses: z.array(z.object({
    type: z.string(),
    streetAddress: z.string(),
    city: z.string(),
    district: z.string(),
    state: z.string(),
    pincode: z.string()
  })).optional(),
  
  // Step 7 - Documents (handled separately)
  
  // Step 8 - Verification Options
  visitType: z.string().optional(),
  preferredDate: z.string().optional(),
  specialInstructions: z.string().optional(),
  
  // Step 9 - Agent Assignment
  assignedAgent: z.string().optional(),
});

interface MultiStepLeadFormProps {
  banks: any[];
  agents: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  locationData: any;
  editingLead?: any;
}

const MultiStepLeadForm = ({ 
  banks, 
  agents, 
  onSubmit, 
  onCancel, 
  locationData,
  editingLead 
}: MultiStepLeadFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load saved products, vehicle brands, and models
  const [products, setProducts] = useState<any[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<any[]>([]);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const totalSteps = 9;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: '',
      leadType: '',
      vehicleBrand: '',
      vehicleModel: '',
      initiatedBranch: '',
      buildBranch: '',
      agencyFileNo: '',
      applicationBarcode: '',
      caseId: '',
      schemeDescription: '',
      loanAmount: '',
      customerName: '',
      age: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: '',
      gender: 'Male',
      maritalStatus: 'Single',
      fatherName: '',
      motherName: '',
      spouseName: '',
      companyName: '',
      designation: '',
      workExperience: '',
      propertyType: '',
      ownershipStatus: '',
      propertyAge: '',
      monthlyIncome: '',
      annualIncome: '',
      otherIncome: '',
      addresses: [],
      visitType: 'Residence',
      preferredDate: '',
      specialInstructions: '',
      assignedAgent: '',
    },
  });

  useEffect(() => {
    loadFormData();
    
    // If editing, populate form with existing data
    if (editingLead) {
      populateFormWithEditData();
    }
  }, [editingLead]);

  const populateFormWithEditData = () => {
    if (!editingLead) return;

    const formData = {
      bankName: editingLead.bank || '',
      leadType: editingLead.additionalDetails?.leadType || '',
      vehicleBrand: editingLead.additionalDetails?.vehicleBrandId || '',
      vehicleModel: editingLead.additionalDetails?.vehicleModelId || '',
      initiatedBranch: editingLead.additionalDetails?.bankBranch || '',
      buildBranch: editingLead.additionalDetails?.bankBranch || '',
      agencyFileNo: editingLead.additionalDetails?.agencyFileNo || '',
      applicationBarcode: editingLead.additionalDetails?.applicationBarcode || '',
      caseId: editingLead.additionalDetails?.caseId || '',
      schemeDescription: editingLead.additionalDetails?.schemeDesc || '',
      loanAmount: editingLead.additionalDetails?.loanAmount || '',
      customerName: editingLead.name || '',
      age: editingLead.age?.toString() || '',
      phoneNumber: editingLead.additionalDetails?.phoneNumber || '',
      email: editingLead.additionalDetails?.email || '',
      dateOfBirth: editingLead.additionalDetails?.dateOfBirth || '',
      gender: editingLead.additionalDetails?.gender || 'Male',
      maritalStatus: editingLead.additionalDetails?.maritalStatus || 'Single',
      fatherName: editingLead.additionalDetails?.fatherName || '',
      motherName: editingLead.additionalDetails?.motherName || '',
      spouseName: editingLead.additionalDetails?.spouseName || '',
      companyName: editingLead.additionalDetails?.company || '',
      designation: editingLead.additionalDetails?.designation || editingLead.job || '',
      workExperience: editingLead.additionalDetails?.workExperience || '',
      propertyType: editingLead.additionalDetails?.propertyType || '',
      ownershipStatus: editingLead.additionalDetails?.ownershipStatus || '',
      propertyAge: editingLead.additionalDetails?.propertyAge || '',
      monthlyIncome: editingLead.additionalDetails?.monthlyIncome || '',
      annualIncome: editingLead.additionalDetails?.annualIncome || '',
      otherIncome: editingLead.additionalDetails?.otherIncome || '',
      addresses: editingLead.additionalDetails?.addresses || [
        {
          type: 'Residence',
          streetAddress: editingLead.address?.street || '',
          city: editingLead.address?.city || '',
          district: editingLead.address?.district || '',
          state: editingLead.address?.state || '',
          pincode: editingLead.address?.pincode || ''
        }
      ],
      visitType: editingLead.visitType || 'Residence',
      preferredDate: editingLead.verificationDate ? new Date(editingLead.verificationDate).toISOString().split('T')[0] : '',
      specialInstructions: editingLead.instructions || '',
      assignedAgent: editingLead.assignedTo || '',
    };

    // Reset form with the populated data
    form.reset(formData);
  };

  const loadFormData = () => {
    // Load products
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }

    // Load vehicle brands
    const storedBrands = localStorage.getItem('vehicleBrands');
    if (storedBrands) {
      setVehicleBrands(JSON.parse(storedBrands));
    }

    // Load vehicle models
    const storedModels = localStorage.getItem('vehicleModels');
    if (storedModels) {
      setVehicleModels(JSON.parse(storedModels));
    }

    // Load branches
    const storedBranches = localStorage.getItem('branches');
    if (storedBranches) {
      setBranches(JSON.parse(storedBranches));
    } else {
      // Set default branches
      const defaultBranches = [
        { id: 'branch-1', name: 'Main Branch', bankId: 'bank-1' },
        { id: 'branch-2', name: 'City Center Branch', bankId: 'bank-1' },
        { id: 'branch-3', name: 'Corporate Branch', bankId: 'bank-2' },
        { id: 'branch-4', name: 'Business Branch', bankId: 'bank-2' },
        { id: 'branch-5', name: 'Central Branch', bankId: 'bank-3' },
        { id: 'branch-6', name: 'Metro Branch', bankId: 'bank-3' }
      ];
      setBranches(defaultBranches);
      localStorage.setItem('branches', JSON.stringify(defaultBranches));
    }
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof z.infer<typeof formSchema>)[] => {
    switch (step) {
      case 1:
        return ['bankName', 'leadType', 'agencyFileNo'];
      case 2:
        return ['customerName', 'age', 'phoneNumber'];
      case 3:
        return [];
      case 4:
        return [];
      case 5:
        return [];
      case 6:
        return [];
      case 7:
        return [];
      case 8:
        return [];
      case 9:
        return [];
      default:
        return [];
    }
  };

  const onFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      banks,
      products,
      branches,
      vehicleBrands,
      vehicleModels,
      agents,
      locationData
    };

    switch (currentStep) {
      case 1:
        return <Step1LeadTypeBasicInfo {...stepProps} />;
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
        return <Step1LeadTypeBasicInfo {...stepProps} />;
    }
  };

  const getStepTitle = () => {
    const titles = [
      "Lead Type & Basic Information",
      "Personal Information",
      "Job Details",
      "Property & Income Details",
      "Home Address",
      "Work/Office Address",
      "Document Upload",
      "Verification Options",
      "Agent Assignment"
    ];
    return titles[currentStep - 1];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {editingLead ? 'Edit Lead' : 'Add New Lead'} - Step {currentStep} of {totalSteps}
            </CardTitle>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{getStepTitle()}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
              {renderStep()}
              
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  {currentStep === totalSteps ? (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? 'Saving...' : (editingLead ? 'Update Lead' : 'Save Lead')}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiStepLeadForm;
