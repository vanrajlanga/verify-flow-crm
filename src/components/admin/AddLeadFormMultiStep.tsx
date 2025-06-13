
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { User, ChevronRight, ChevronLeft, Building, FileText, MapPin, Plus, X } from 'lucide-react';

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

interface FormData {
  // Step 1: Lead Type & Basic Information
  bankName: string;
  bankProduct: string;
  initiatedBranch: string;
  buildBranch: string;
  
  // Step 2: Applicant Information
  applicantName: string;
  applicantPhone: string;
  applicantAge: string;
  applicantEmail: string;
  hasCoApplicant: boolean;
  coApplicantName: string;
  coApplicantPhone: string;
  coApplicantAge: string;
  coApplicantEmail: string;
  
  // Step 3: Address Information
  addresses: Array<{
    type: string;
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    requiresVerification: boolean;
  }>;
  
  // Step 4: Additional Details
  monthlyIncome: string;
  annualIncome: string;
  company: string;
  designation: string;
  workExperience: string;
  propertyType: string;
  ownershipStatus: string;
  
  // Step 5: Documents & Instructions
  documents: File[];
  instructions: string;
}

interface AddLeadFormMultiStepProps {
  onSubmit: (leadData: any) => void;
  locationData: LocationData;
}

const AddLeadFormMultiStep = ({ onSubmit, locationData }: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Lead Type & Basic Information
    bankName: '',
    bankProduct: '',
    initiatedBranch: '',
    buildBranch: '',
    
    // Step 2: Applicant Information
    applicantName: '',
    applicantPhone: '',
    applicantAge: '',
    applicantEmail: '',
    hasCoApplicant: false,
    coApplicantName: '',
    coApplicantPhone: '',
    coApplicantAge: '',
    coApplicantEmail: '',
    
    // Step 3: Address Information
    addresses: [{
      type: 'Residence',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      requiresVerification: true
    }],
    
    // Step 4: Additional Details
    monthlyIncome: '',
    annualIncome: '',
    company: '',
    designation: '',
    workExperience: '',
    propertyType: '',
    ownershipStatus: '',
    
    // Step 5: Documents & Instructions
    documents: [],
    instructions: ''
  });

  // Get bank and product data from localStorage
  const [banks, setBanks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<any[]>([]);

  useEffect(() => {
    loadBankData();
  }, []);

  const loadBankData = () => {
    try {
      const storedBanks = localStorage.getItem('banks');
      const storedProducts = localStorage.getItem('bankProducts');
      const storedBranches = localStorage.getItem('bankBranches');
      
      if (storedBanks) setBanks(JSON.parse(storedBanks));
      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedBranches) setBranches(JSON.parse(storedBranches));
    } catch (error) {
      console.error('Error loading bank data:', error);
    }
  };

  // Filter products and branches based on selected bank
  useEffect(() => {
    if (formData.bankName) {
      const bankProducts = products.filter(product => product.bankId === formData.bankName);
      setFilteredProducts(bankProducts);
      
      const bankBranches = branches.filter(branch => branch.bankId === formData.bankName);
      setFilteredBranches(bankBranches);
    } else {
      setFilteredProducts([]);
      setFilteredBranches([]);
    }
  }, [formData.bankName, products, branches]);

  const steps = [
    { id: 1, title: 'Lead Type & Basic Information', icon: Building },
    { id: 2, title: 'Applicant Information', icon: User },
    { id: 3, title: 'Address Information', icon: MapPin },
    { id: 4, title: 'Additional Details', icon: FileText },
    { id: 5, title: 'Documents & Instructions', icon: FileText }
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.bankName && formData.bankProduct && formData.initiatedBranch && formData.buildBranch);
      case 2:
        const basicValid = !!(formData.applicantName && formData.applicantPhone && formData.applicantAge && formData.applicantEmail);
        if (!formData.hasCoApplicant) return basicValid;
        return basicValid && !!(formData.coApplicantName && formData.coApplicantPhone && formData.coApplicantAge && formData.coApplicantEmail);
      case 3:
        return formData.addresses.every(addr => 
          addr.street && addr.city && addr.district && addr.state && addr.pincode
        );
      case 4:
        return !!(formData.monthlyIncome && formData.company && formData.designation);
      case 5:
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    // Allow going to previous steps without validation
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    } else if (stepId === currentStep + 1) {
      // Validate current step before going to next
      if (validateStep(currentStep)) {
        setCurrentStep(stepId);
      } else {
        toast({
          title: "Missing Required Fields",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
      }
    } else {
      // For steps further ahead, validate all previous steps
      let canProceed = true;
      for (let i = currentStep; i < stepId; i++) {
        if (!validateStep(i)) {
          canProceed = false;
          break;
        }
      }
      if (canProceed) {
        setCurrentStep(stepId);
      } else {
        toast({
          title: "Missing Required Fields",
          description: "Please complete all previous steps before proceeding.",
          variant: "destructive",
        });
      }
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        type: 'Office',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        requiresVerification: false
      }]
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const updateAddress = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const handleSubmit = () => {
    if (!validateStep(5)) {
      toast({
        title: "Form Incomplete",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    const leadData = {
      id: `lead-${Date.now()}`,
      name: formData.applicantName,
      age: parseInt(formData.applicantAge) || 0,
      job: formData.designation || 'Not specified',
      address: formData.addresses[0] || {},
      additionalDetails: {
        phoneNumber: formData.applicantPhone,
        email: formData.applicantEmail,
        company: formData.company,
        designation: formData.designation,
        workExperience: formData.workExperience,
        propertyType: formData.propertyType,
        ownershipStatus: formData.ownershipStatus,
        monthlyIncome: formData.monthlyIncome,
        annualIncome: formData.annualIncome,
        bankName: formData.bankName,
        bankProduct: formData.bankProduct,
        initiatedBranch: formData.initiatedBranch,
        buildBranch: formData.buildBranch,
        hasCoApplicant: formData.hasCoApplicant,
        coApplicant: formData.hasCoApplicant ? {
          name: formData.coApplicantName,
          phone: formData.coApplicantPhone,
          age: formData.coApplicantAge,
          email: formData.coApplicantEmail
        } : null,
        addresses: formData.addresses
      },
      status: 'Pending' as const,
      bank: formData.bankName,
      visitType: 'Residence' as const,
      assignedTo: '',
      createdAt: new Date(),
      documents: formData.documents.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: 'Document',
        url: URL.createObjectURL(file),
        uploadedBy: 'admin',
        uploadDate: new Date(),
        size: file.size
      })),
      instructions: formData.instructions
    };

    onSubmit(leadData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Select value={formData.bankName} onValueChange={(value) => updateFormData('bankName', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankProduct">Bank Product *</Label>
                <Select 
                  value={formData.bankProduct} 
                  onValueChange={(value) => updateFormData('bankProduct', value)}
                  disabled={!formData.bankName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initiatedBranch">Initiated Branch *</Label>
                <Select 
                  value={formData.initiatedBranch} 
                  onValueChange={(value) => updateFormData('initiatedBranch', value)}
                  disabled={!formData.bankName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Initiated Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildBranch">Build Branch *</Label>
                <Select 
                  value={formData.buildBranch} 
                  onValueChange={(value) => updateFormData('buildBranch', value)}
                  disabled={!formData.bankName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Build Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-lg">Applicant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Full Name *</Label>
                  <Input
                    id="applicantName"
                    value={formData.applicantName}
                    onChange={(e) => updateFormData('applicantName', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicantPhone">Phone Number * (10 digits)</Label>
                  <Input
                    id="applicantPhone"
                    value={formData.applicantPhone}
                    onChange={(e) => updateFormData('applicantPhone', e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicantAge">Age *</Label>
                  <Input
                    id="applicantAge"
                    type="number"
                    value={formData.applicantAge}
                    onChange={(e) => updateFormData('applicantAge', e.target.value)}
                    placeholder="Enter age"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicantEmail">Email *</Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    value={formData.applicantEmail}
                    onChange={(e) => updateFormData('applicantEmail', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCoApplicant"
                checked={formData.hasCoApplicant}
                onCheckedChange={(checked) => updateFormData('hasCoApplicant', !!checked)}
              />
              <Label htmlFor="hasCoApplicant">Add Co-Applicant</Label>
            </div>

            {formData.hasCoApplicant && (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">Co-Applicant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coApplicantName">Full Name *</Label>
                    <Input
                      id="coApplicantName"
                      value={formData.coApplicantName}
                      onChange={(e) => updateFormData('coApplicantName', e.target.value)}
                      placeholder="Enter co-applicant full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coApplicantPhone">Phone Number * (10 digits)</Label>
                    <Input
                      id="coApplicantPhone"
                      value={formData.coApplicantPhone}
                      onChange={(e) => updateFormData('coApplicantPhone', e.target.value)}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coApplicantAge">Age *</Label>
                    <Input
                      id="coApplicantAge"
                      type="number"
                      value={formData.coApplicantAge}
                      onChange={(e) => updateFormData('coApplicantAge', e.target.value)}
                      placeholder="Enter age"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coApplicantEmail">Email *</Label>
                    <Input
                      id="coApplicantEmail"
                      type="email"
                      value={formData.coApplicantEmail}
                      onChange={(e) => updateFormData('coApplicantEmail', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {formData.addresses.map((address, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {address.type} Address {index > 0 && `#${index + 1}`}
                  </h3>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAddress(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address Type</Label>
                    <Select 
                      value={address.type} 
                      onValueChange={(value) => updateAddress(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residence">Residence</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Street Address *</Label>
                    <Input
                      value={address.street}
                      onChange={(e) => updateAddress(index, 'street', e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select 
                      value={address.state} 
                      onValueChange={(value) => updateAddress(index, 'state', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.states.map((state) => (
                          <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>District *</Label>
                    <Select 
                      value={address.district} 
                      onValueChange={(value) => updateAddress(index, 'district', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.states
                          .find(s => s.name === address.state)?.districts
                          .map((district) => (
                            <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                          )) || []}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Select 
                      value={address.city} 
                      onValueChange={(value) => updateAddress(index, 'city', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.states
                          .find(s => s.name === address.state)?.districts
                          .find(d => d.name === address.district)?.cities
                          .map((city) => (
                            <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                          )) || []}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pincode *</Label>
                    <Input
                      value={address.pincode}
                      onChange={(e) => updateAddress(index, 'pincode', e.target.value)}
                      placeholder="Enter pincode"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`verification-${index}`}
                    checked={address.requiresVerification}
                    onCheckedChange={(checked) => updateAddress(index, 'requiresVerification', !!checked)}
                  />
                  <Label htmlFor={`verification-${index}`}>Requires Verification</Label>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addAddress} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Address
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income *</Label>
                <Input
                  id="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={(e) => updateFormData('monthlyIncome', e.target.value)}
                  placeholder="Enter monthly income"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualIncome">Annual Income</Label>
                <Input
                  id="annualIncome"
                  value={formData.annualIncome}
                  onChange={(e) => updateFormData('annualIncome', e.target.value)}
                  placeholder="Enter annual income"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => updateFormData('designation', e.target.value)}
                  placeholder="Enter designation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workExperience">Work Experience</Label>
                <Input
                  id="workExperience"
                  value={formData.workExperience}
                  onChange={(e) => updateFormData('workExperience', e.target.value)}
                  placeholder="Enter work experience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => updateFormData('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owned">Owned</SelectItem>
                    <SelectItem value="Rented">Rented</SelectItem>
                    <SelectItem value="Family Owned">Family Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ownershipStatus">Ownership Status</Label>
                <Input
                  id="ownershipStatus"
                  value={formData.ownershipStatus}
                  onChange={(e) => updateFormData('ownershipStatus', e.target.value)}
                  placeholder="Enter ownership status"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documents">Upload Documents</Label>
              <Input
                id="documents"
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  updateFormData('documents', files);
                }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {formData.documents.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formData.documents.length} file(s) selected
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => updateFormData('instructions', e.target.value)}
                placeholder="Enter any special instructions for verification"
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep || (step.id === currentStep && validateStep(step.id));
                const isCurrent = step.id === currentStep;
                const isAccessible = step.id <= currentStep || (step.id === currentStep + 1 && validateStep(currentStep));
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isAccessible && step.id > currentStep}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isCurrent 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : isAccessible 
                            ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:block">{step.title}</span>
                    <span className="sm:hidden">{step.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </h2>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Lead
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLeadFormMultiStep;
