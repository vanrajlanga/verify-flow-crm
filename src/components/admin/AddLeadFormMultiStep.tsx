import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from '@/components/ui/use-toast';
import { User, Bank, Lead } from '@/utils/mockData';
import { X, Plus } from 'lucide-react';

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

// Define a custom address interface for the form
interface FormAddress {
  id: string;
  type: 'Residence' | 'Office';
  state: string;
  district: string;
  city: string;
  street: string;
  pincode: string;
  requireVerification: boolean;
}

interface AddLeadFormMultiStepProps {
  agents: User[];
  banks: Bank[];
  onAddLead: (lead: any) => void;
  onClose: () => void;
  locationData: LocationData;
  editLead?: Lead | null;
}

const AddLeadFormMultiStep = ({ 
  agents, 
  banks, 
  onAddLead, 
  onClose, 
  locationData,
  editLead 
}: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Lead Type & Basic Info
    bankName: editLead?.bank || '',
    leadType: editLead?.additionalDetails?.leadType || '',
    loanType: editLead?.additionalDetails?.loanType || '',
    vehicleBrandName: editLead?.additionalDetails?.vehicleBrandName || '',
    vehicleModelName: editLead?.additionalDetails?.vehicleModelName || '',
    initiatedBranch: editLead?.additionalDetails?.bankBranch || '',
    buildBranch: editLead?.additionalDetails?.bankBranch || '',
    agencyFileNo: editLead?.additionalDetails?.agencyFileNo || `AGF${Date.now()}`,
    applicationBarcode: editLead?.additionalDetails?.applicationBarcode || '',
    caseId: editLead?.additionalDetails?.caseId || '',
    schemeDescription: editLead?.additionalDetails?.schemeDesc || '',
    loanAmount: editLead?.additionalDetails?.loanAmount || '',
    
    // Step 2: Personal Information
    customerName: editLead?.name || '',
    phoneNumbers: editLead?.additionalDetails?.phoneNumbers || (editLead?.additionalDetails?.phoneNumber ? [editLead.additionalDetails.phoneNumber] : ['']),
    email: editLead?.additionalDetails?.email || '',
    age: editLead?.age?.toString() || '',
    gender: '',
    fatherName: '',
    motherName: '',
    maritalStatus: '',
    
    // Step 3: Job Details
    companyName: editLead?.additionalDetails?.company || '',
    designation: editLead?.additionalDetails?.designation || '',
    workExperience: editLead?.additionalDetails?.workExperience || '',
    employmentType: '',
    currentJobDuration: '',
    
    // Step 4: Property & Income
    propertyType: editLead?.additionalDetails?.propertyType || '',
    ownershipStatus: editLead?.additionalDetails?.ownershipStatus || '',
    propertyAge: editLead?.additionalDetails?.propertyAge || '',
    monthlyIncome: editLead?.additionalDetails?.monthlyIncome || '',
    annualIncome: editLead?.additionalDetails?.annualIncome || '',
    otherIncome: editLead?.additionalDetails?.otherIncome || '',
    
    // Step 5: Home Addresses
    homeAddresses: editLead?.additionalDetails?.addresses?.filter(addr => addr.type === 'Residence').map(addr => ({
      id: addr.id || Date.now().toString(),
      type: 'Residence' as const,
      state: addr.state || '',
      district: addr.district || '',
      city: addr.city || '',
      street: addr.street || '',
      pincode: addr.pincode || '',
      requireVerification: true
    })) || [{
      id: Date.now().toString(),
      type: 'Residence' as const,
      state: editLead?.address?.state || '',
      district: editLead?.address?.district || '',
      city: editLead?.address?.city || '',
      street: editLead?.address?.street || '',
      pincode: editLead?.address?.pincode || '',
      requireVerification: true
    }] as FormAddress[],
    
    // Step 6: Work & Office Address
    officeAddress: {
      id: Date.now().toString(),
      type: 'Office' as const,
      state: '',
      district: '',
      city: '',
      street: '',
      pincode: '',
      requireVerification: false
    } as FormAddress,
    
    // Step 7: Document Upload
    documents: editLead?.documents || [],
    
    // Step 8: Verification Options
    visitType: editLead?.visitType || 'Residence',
    preferredDate: '',
    specialInstructions: editLead?.instructions || '',
    selectedAddresses: [] as string[],
    
    // Step 9: Agent Assignment
    assignedAgent: editLead?.assignedTo || ''
  });

  // Load branches and other data
  const [branches, setBranches] = useState<any[]>([]);
  const [leadTypes, setLeadTypes] = useState<any[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<any[]>([]);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  
  useEffect(() => {
    loadBranches();
    loadLeadTypes();
    loadVehicleData();
  }, []);

  const loadBranches = () => {
    try {
      const storedBranches = localStorage.getItem('bankBranches');
      if (storedBranches) {
        setBranches(JSON.parse(storedBranches));
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadLeadTypes = () => {
    try {
      const storedLeadTypes = localStorage.getItem('leadTypes');
      if (storedLeadTypes) {
        setLeadTypes(JSON.parse(storedLeadTypes));
      }
    } catch (error) {
      console.error('Error loading lead types:', error);
    }
  };

  const loadVehicleData = () => {
    try {
      const storedVehicleBrands = localStorage.getItem('vehicleBrands');
      const storedVehicleModels = localStorage.getItem('vehicleModels');
      
      if (storedVehicleBrands) {
        setVehicleBrands(JSON.parse(storedVehicleBrands));
      }
      if (storedVehicleModels) {
        setVehicleModels(JSON.parse(storedVehicleModels));
      }
    } catch (error) {
      console.error('Error loading vehicle data:', error);
    }
  };

  // Check if vehicle fields should be shown
  const shouldShowVehicleFields = () => {
    const vehicleLoanTypes = ['Commercial Vehicles', 'AUTO LOANS', 'CVCE'];
    return vehicleLoanTypes.includes(formData.loanType);
  };

  const steps = [
    'Lead Type & Basic Info',
    'Personal Information', 
    'Job Details',
    'Property & Income',
    'Home Addresses',
    'Work & Office Address',
    'Document Upload',
    'Verification Options',
    'Agent Assignment'
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, '']
    }));
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index] = value;
    setFormData(prev => ({
      ...prev,
      phoneNumbers: newPhoneNumbers
    }));
  };

  const removePhoneNumber = (index: number) => {
    if (formData.phoneNumbers.length > 1) {
      const newPhoneNumbers = formData.phoneNumbers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        phoneNumbers: newPhoneNumbers
      }));
    }
  };

  const addHomeAddress = () => {
    const newAddress: FormAddress = {
      id: Date.now().toString(),
      type: 'Residence',
      state: '',
      district: '',
      city: '',
      street: '',
      pincode: '',
      requireVerification: false
    };
    setFormData(prev => ({
      ...prev,
      homeAddresses: [...prev.homeAddresses, newAddress]
    }));
  };

  const updateHomeAddress = (index: number, field: keyof FormAddress, value: any) => {
    const newAddresses = [...formData.homeAddresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      homeAddresses: newAddresses
    }));
  };

  const removeHomeAddress = (index: number) => {
    if (formData.homeAddresses.length > 1) {
      const newAddresses = formData.homeAddresses.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        homeAddresses: newAddresses
      }));
    }
  };

  const getAddressesToVerify = () => {
    const addressesToVerify = [];
    
    // Add home addresses that require verification
    formData.homeAddresses.forEach((addr, index) => {
      if (addr.requireVerification) {
        addressesToVerify.push({
          id: `home-${index}`,
          label: `Home Address ${index + 1}`,
          address: `${addr.street}, ${addr.city}, ${addr.district}, ${addr.state} - ${addr.pincode}`,
          type: 'Residence'
        });
      }
    });
    
    // Add office address if it requires verification
    if (formData.officeAddress.requireVerification) {
      addressesToVerify.push({
        id: 'office',
        label: 'Office Address',
        address: `${formData.officeAddress.street}, ${formData.officeAddress.city}, ${formData.officeAddress.district}, ${formData.officeAddress.state} - ${formData.officeAddress.pincode}`,
        type: 'Office'
      });
    }
    
    return addressesToVerify;
  };

  const handleSubmit = async () => {
    try {
      const addressesToVerify = getAddressesToVerify();
      
      const leadData = {
        id: editLead?.id || `lead-${Date.now()}`,
        name: formData.customerName,
        age: parseInt(formData.age) || 0,
        job: formData.designation,
        address: formData.homeAddresses[0] || {
          street: '',
          city: '',
          district: '',
          state: '',
          pincode: ''
        },
        additionalDetails: {
          // Step 1 data
          agencyFileNo: formData.agencyFileNo,
          applicationBarcode: formData.applicationBarcode,
          caseId: formData.caseId,
          schemeDesc: formData.schemeDescription,
          loanAmount: formData.loanAmount,
          loanType: formData.loanType,
          bankBranch: formData.initiatedBranch,
          leadType: formData.leadType,
          
          // Vehicle data (if applicable)
          ...(shouldShowVehicleFields() && {
            vehicleBrandName: formData.vehicleBrandName,
            vehicleModelName: formData.vehicleModelName
          }),
          
          // Step 2 data
          phoneNumber: formData.phoneNumbers[0],
          phoneNumbers: formData.phoneNumbers,
          email: formData.email,
          
          // Step 3 data
          company: formData.companyName,
          designation: formData.designation,
          workExperience: formData.workExperience,
          
          // Step 4 data
          propertyType: formData.propertyType,
          ownershipStatus: formData.ownershipStatus,
          propertyAge: formData.propertyAge,
          monthlyIncome: formData.monthlyIncome,
          annualIncome: formData.annualIncome,
          otherIncome: formData.otherIncome,
          
          // Addresses
          addresses: [
            ...formData.homeAddresses,
            ...(formData.officeAddress.street ? [formData.officeAddress] : [])
          ]
        },
        status: editLead?.status || 'Pending',
        bank: formData.bankName,
        visitType: formData.visitType,
        assignedTo: formData.assignedAgent,
        createdAt: editLead?.createdAt || new Date(),
        documents: formData.documents,
        instructions: formData.specialInstructions,
        verification: editLead?.verification || {
          id: `verification-${Date.now()}`,
          leadId: editLead?.id || `lead-${Date.now()}`,
          status: 'Not Started',
          agentId: formData.assignedAgent,
          photos: [],
          documents: [],
          addressesToVerify: addressesToVerify
        }
      };

      await onAddLead(leadData);
      toast({
        title: editLead ? "Lead Updated" : "Lead Created",
        description: `Lead has been ${editLead ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit the form. Please try again.",
        variant: "destructive"
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const renderStepNavigation = () => (
    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-muted/30 rounded-lg">
      {steps.map((step, index) => (
        <button
          key={index}
          onClick={() => goToStep(index + 1)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentStep === index + 1
              ? 'bg-primary text-primary-foreground'
              : currentStep > index + 1
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {index + 1}. {step}
        </button>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lead Type & Basic Info</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bankName">Bank Name *</Label>
          <Select value={formData.bankName} onValueChange={(value) => updateFormData('bankName', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select bank" />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="leadType">Lead Type/Product</Label>
          <Select value={formData.leadType} onValueChange={(value) => updateFormData('leadType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select lead type" />
            </SelectTrigger>
            <SelectContent>
              {leadTypes.map((type) => (
                <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="loanType">Loan Type</Label>
          <Select value={formData.loanType} onValueChange={(value) => updateFormData('loanType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select loan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Home Loan">Home Loan</SelectItem>
              <SelectItem value="Commercial Vehicles">Commercial Vehicles</SelectItem>
              <SelectItem value="AUTO LOANS">AUTO LOANS</SelectItem>
              <SelectItem value="CVCE">CVCE</SelectItem>
              <SelectItem value="Personal Loan">Personal Loan</SelectItem>
              <SelectItem value="Business Loan">Business Loan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {shouldShowVehicleFields() && (
          <>
            <div>
              <Label htmlFor="vehicleBrandName">Vehicle Brand Name *</Label>
              <Select value={formData.vehicleBrandName} onValueChange={(value) => updateFormData('vehicleBrandName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle brand" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicleModelName">Vehicle Model Name *</Label>
              <Select value={formData.vehicleModelName} onValueChange={(value) => updateFormData('vehicleModelName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle model" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleModels
                    .filter(model => model.brandId === vehicleBrands.find(b => b.name === formData.vehicleBrandName)?.id)
                    .map((model) => (
                      <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div>
          <Label htmlFor="initiatedBranch">Initiated Under Branch</Label>
          <Select value={formData.initiatedBranch} onValueChange={(value) => updateFormData('initiatedBranch', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select initiated branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name} ({branch.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="buildBranch">Build Under Branch</Label>
          <Select value={formData.buildBranch} onValueChange={(value) => updateFormData('buildBranch', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select build branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name} ({branch.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="agencyFileNo">Agency File No. *</Label>
          <Input
            id="agencyFileNo"
            value={formData.agencyFileNo}
            onChange={(e) => updateFormData('agencyFileNo', e.target.value)}
            placeholder="Auto-generated"
            readOnly
          />
        </div>

        <div>
          <Label htmlFor="applicationBarcode">Application Barcode</Label>
          <Input
            id="applicationBarcode"
            value={formData.applicationBarcode}
            onChange={(e) => updateFormData('applicationBarcode', e.target.value)}
            placeholder="Enter application barcode"
          />
        </div>

        <div>
          <Label htmlFor="caseId">Case ID</Label>
          <Input
            id="caseId"
            value={formData.caseId}
            onChange={(e) => updateFormData('caseId', e.target.value)}
            placeholder="Enter case ID"
          />
        </div>

        <div>
          <Label htmlFor="loanAmount">Loan Amount</Label>
          <Input
            id="loanAmount"
            value={formData.loanAmount}
            onChange={(e) => updateFormData('loanAmount', e.target.value)}
            placeholder="Enter loan amount"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="schemeDescription">Scheme Description</Label>
          <Textarea
            id="schemeDescription"
            value={formData.schemeDescription}
            onChange={(e) => updateFormData('schemeDescription', e.target.value)}
            placeholder="Enter scheme description"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <p className="text-sm text-muted-foreground">Enter customer personal details</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => updateFormData('customerName', e.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>

        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData('age', e.target.value)}
            placeholder="Enter age"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="Enter email"
          />
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
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
          <Label htmlFor="fatherName">Father's Name</Label>
          <Input
            id="fatherName"
            value={formData.fatherName}
            onChange={(e) => updateFormData('fatherName', e.target.value)}
            placeholder="Enter father's name"
          />
        </div>

        <div>
          <Label htmlFor="motherName">Mother's Name</Label>
          <Input
            id="motherName"
            value={formData.motherName}
            onChange={(e) => updateFormData('motherName', e.target.value)}
            placeholder="Enter mother's name"
          />
        </div>

        <div>
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData('maritalStatus', value)}>
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Phone Numbers *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPhoneNumber}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phone
          </Button>
        </div>
        
        {formData.phoneNumbers.map((phone, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={phone}
              onChange={(e) => updatePhoneNumber(index, e.target.value)}
              placeholder="Enter phone number"
              required={index === 0}
            />
            {formData.phoneNumbers.length > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => removePhoneNumber(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div>
        <Button type="button" variant="outline" className="mt-4">
          Add Co-Applicant
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Job Details</h3>
      <p className="text-sm text-muted-foreground">Enter employment and job details</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            placeholder="Enter company name"
          />
        </div>

        <div>
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            value={formData.designation}
            onChange={(e) => updateFormData('designation', e.target.value)}
            placeholder="Enter designation"
          />
        </div>

        <div>
          <Label htmlFor="workExperience">Work Experience (Years)</Label>
          <Input
            id="workExperience"
            value={formData.workExperience}
            onChange={(e) => updateFormData('workExperience', e.target.value)}
            placeholder="Enter work experience"
          />
        </div>

        <div>
          <Label htmlFor="employmentType">Employment Type</Label>
          <Select value={formData.employmentType} onValueChange={(value) => updateFormData('employmentType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Self-employed">Self-employed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="currentJobDuration">Current Job Duration (Years)</Label>
          <Input
            id="currentJobDuration"
            value={formData.currentJobDuration}
            onChange={(e) => updateFormData('currentJobDuration', e.target.value)}
            placeholder="Enter current job duration"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Property & Income</h3>
      <p className="text-sm text-muted-foreground">Enter property and income information</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="propertyType">Property Type</Label>
          <Select value={formData.propertyType} onValueChange={(value) => updateFormData('propertyType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="House">House</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Plot">Plot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ownershipStatus">Ownership Status</Label>
          <Select value={formData.ownershipStatus} onValueChange={(value) => updateFormData('ownershipStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ownership status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Owned">Owned</SelectItem>
              <SelectItem value="Rented">Rented</SelectItem>
              <SelectItem value="Family Owned">Family Owned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="propertyAge">Property Age (Years)</Label>
          <Input
            id="propertyAge"
            value={formData.propertyAge}
            onChange={(e) => updateFormData('propertyAge', e.target.value)}
            placeholder="Enter property age"
          />
        </div>

        <div>
          <Label htmlFor="monthlyIncome">Monthly Income</Label>
          <Input
            id="monthlyIncome"
            value={formData.monthlyIncome}
            onChange={(e) => updateFormData('monthlyIncome', e.target.value)}
            placeholder="Enter monthly income"
          />
        </div>

        <div>
          <Label htmlFor="annualIncome">Annual Income</Label>
          <Input
            id="annualIncome"
            value={formData.annualIncome}
            onChange={(e) => updateFormData('annualIncome', e.target.value)}
            placeholder="Enter annual income"
          />
        </div>

        <div>
          <Label htmlFor="otherIncome">Other Income</Label>
          <Input
            id="otherIncome"
            value={formData.otherIncome}
            onChange={(e) => updateFormData('otherIncome', e.target.value)}
            placeholder="Enter other income"
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Home Addresses</h3>
      <p className="text-sm text-muted-foreground">Enter home address details (you can add multiple addresses)</p>
      
      <div className="flex justify-between items-center">
        <Label>Home Addresses</Label>
        <Button type="button" variant="outline" size="sm" onClick={addHomeAddress}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {formData.homeAddresses.map((address, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Address {index + 1}</h4>
            {formData.homeAddresses.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeHomeAddress(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>State</Label>
              <Select 
                value={address.state} 
                onValueChange={(value) => updateHomeAddress(index, 'state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {locationData.states.map((state) => (
                    <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>District</Label>
              <Select 
                value={address.district} 
                onValueChange={(value) => updateHomeAddress(index, 'district', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
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

            <div>
              <Label>City</Label>
              <Select 
                value={address.city} 
                onValueChange={(value) => updateHomeAddress(index, 'city', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
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

            <div>
              <Label>Pincode</Label>
              <Input
                value={address.pincode}
                onChange={(e) => updateHomeAddress(index, 'pincode', e.target.value)}
                placeholder="Enter pincode"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Street Address</Label>
              <Textarea
                value={address.street}
                onChange={(e) => updateHomeAddress(index, 'street', e.target.value)}
                placeholder="Enter complete address"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`verification-${index}`}
                  checked={address.requireVerification}
                  onCheckedChange={(checked) => updateHomeAddress(index, 'requireVerification', !!checked)}
                />
                <Label htmlFor={`verification-${index}`}>Require verification for this address</Label>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Work & Office Address</h3>
      <p className="text-sm text-muted-foreground">Enter work and office address</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>State</Label>
          <Select 
            value={formData.officeAddress.state} 
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              officeAddress: { ...prev.officeAddress, state: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {locationData.states.map((state) => (
                <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>District</Label>
          <Select 
            value={formData.officeAddress.district} 
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              officeAddress: { ...prev.officeAddress, district: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {locationData.states
                .find(s => s.name === formData.officeAddress.state)?.districts
                .map((district) => (
                  <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                )) || []}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>City</Label>
          <Select 
            value={formData.officeAddress.city} 
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              officeAddress: { ...prev.officeAddress, city: value }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {locationData.states
                .find(s => s.name === formData.officeAddress.state)?.districts
                .find(d => d.name === formData.officeAddress.district)?.cities
                .map((city) => (
                  <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                )) || []}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Pincode</Label>
          <Input
            value={formData.officeAddress.pincode}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              officeAddress: { ...prev.officeAddress, pincode: e.target.value }
            }))}
            placeholder="Enter pincode"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Office Address</Label>
          <Textarea
            value={formData.officeAddress.street}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              officeAddress: { ...prev.officeAddress, street: e.target.value }
            }))}
            placeholder="Enter office address"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="office-verification"
              checked={formData.officeAddress.requireVerification}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                officeAddress: { ...prev.officeAddress, requireVerification: !!checked }
              }))}
            />
            <Label htmlFor="office-verification">Require verification for office address</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Document Upload</h3>
      <p className="text-sm text-muted-foreground">Upload required documents</p>
      
      <div className="space-y-4">
        <div>
          <Label>Document Title</Label>
          <Input placeholder="PAN Card" readOnly />
          <div className="mt-2">
            <Input type="file" />
          </div>
        </div>

        <div>
          <Label>Document Title</Label>
          <Input placeholder="Aadhar Card" readOnly />
          <div className="mt-2">
            <Input type="file" />
          </div>
        </div>

        <Button type="button" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add More Document
        </Button>
      </div>
    </div>
  );

  const renderStep8 = () => {
    const addressesToVerify = getAddressesToVerify();
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Verification Options</h3>
        <p className="text-sm text-muted-foreground">Set verification preferences</p>
        
        <div className="space-y-4">
          <div>
            <Label>Visit Type</Label>
            {addressesToVerify.length > 0 ? (
              <div className="space-y-2 mt-2">
                <p className="text-sm text-muted-foreground">Select addresses to verify:</p>
                {addressesToVerify.map((addr) => (
                  <div key={addr.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={addr.id}
                      checked={formData.selectedAddresses.includes(addr.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            selectedAddresses: [...prev.selectedAddresses, addr.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            selectedAddresses: prev.selectedAddresses.filter(id => id !== addr.id)
                          }));
                        }
                      }}
                    />
                    <div>
                      <Label htmlFor={addr.id} className="font-medium">{addr.label}</Label>
                      <p className="text-sm text-muted-foreground">{addr.address}</p>
                      <Badge variant="outline" className="mt-1">{addr.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup value={formData.visitType} onValueChange={(value) => updateFormData('visitType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Residence" id="residence" />
                  <Label htmlFor="residence">Residence Verification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Office" id="office" />
                  <Label htmlFor="office">Office Verification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Both" id="both" />
                  <Label htmlFor="both">Both Residence & Office</Label>
                </div>
              </RadioGroup>
            )}
          </div>

          <div>
            <Label htmlFor="preferredDate">Preferred Verification Date</Label>
            <Input
              id="preferredDate"
              type="date"
              value={formData.preferredDate}
              onChange={(e) => updateFormData('preferredDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => updateFormData('specialInstructions', e.target.value)}
              placeholder="Enter any special instructions"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStep9 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Agent Assignment</h3>
      <p className="text-sm text-muted-foreground">Assign agent and review</p>
      
      <div>
        <Label htmlFor="assignedAgent">Assign to Agent</Label>
        <Select value={formData.assignedAgent} onValueChange={(value) => updateFormData('assignedAgent', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select agent to assign" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name} - {agent.district} ({agent.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium mb-2">Review Summary</h4>
        <div className="space-y-1 text-sm">
          <p><strong>Customer:</strong> {formData.customerName}</p>
          <p><strong>Phone:</strong> {formData.phoneNumbers.join(', ')}</p>
          <p><strong>Bank:</strong> {banks.find(b => b.id === formData.bankName)?.name}</p>
          <p><strong>Lead Type:</strong> {formData.leadType}</p>
          <p><strong>Loan Amount:</strong> {formData.loanAmount}</p>
          {shouldShowVehicleFields() && (
            <>
              <p><strong>Vehicle Brand:</strong> {formData.vehicleBrandName}</p>
              <p><strong>Vehicle Model:</strong> {formData.vehicleModelName}</p>
            </>
          )}
          <p><strong>Agent:</strong> {agents.find(a => a.id === formData.assignedAgent)?.name || 'Not assigned'}</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      case 9: return renderStep9();
      default: return renderStep1();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{editLead ? 'Edit Lead' : 'Add New Lead'}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderStepNavigation()}
        
        <div className="min-h-[400px]">
          {renderCurrentStep()}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                {editLead ? 'Update Lead' : 'Create Lead'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddLeadFormMultiStep;
