
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Upload, FileText } from 'lucide-react';
import { Lead, User, Bank } from '@/utils/mockData';

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
  agents: User[];
  banks: Bank[];
  onAddLead: (lead: Lead) => void;
  onClose: () => void;
  locationData: LocationData;
}

interface DocumentUpload {
  title: string;
  file: File | null;
  type: string;
}

const leadTypes = [
  'Home Loan',
  'Auto Loan', 
  'Personal Loan',
  'Business Loan',
  'Property Loan',
  'Loan Against Property',
  'Credit Card',
  'Insurance',
  'Investment'
];

const vehicleBrands = [
  'Maruti Suzuki', 'Hyundai', 'Mahindra', 'Tata', 'Honda', 'Toyota', 'Ford', 'Renault', 
  'Nissan', 'Volkswagen', 'Skoda', 'BMW', 'Mercedes-Benz', 'Audi', 'Kia', 'MG'
];

const vehicleModels: { [key: string]: string[] } = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Alto', 'Wagon R', 'Dzire', 'Vitara Brezza', 'Ertiga', 'XL6'],
  'Hyundai': ['i20', 'Creta', 'Venue', 'Verna', 'Elite i20', 'Grand i10', 'Santro', 'Tucson'],
  'Mahindra': ['XUV700', 'Scorpio', 'Thar', 'Bolero', 'XUV300', 'KUV100', 'Marazzo'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Punch', 'Altroz', 'Tigor', 'Tiago'],
  'Honda': ['City', 'Amaze', 'Jazz', 'WR-V', 'CR-V', 'Civic'],
  'Toyota': ['Innova Crysta', 'Fortuner', 'Glanza', 'Urban Cruiser', 'Camry'],
};

const stepTitles = [
  'Lead Type & Basic Info',
  'Personal Information', 
  'Job Details',
  'Property & Income',
  'Home Address',
  'Work & Office Address',
  'Document Upload',
  'Verification Options',
  'Agent Assignment'
];

const AddLeadFormMultiStep: React.FC<AddLeadFormMultiStepProps> = ({
  agents,
  banks,
  onAddLead,
  onClose,
  locationData
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    bankName: '',
    leadType: '',
    initiatedBranch: '',
    buildBranch: '',
    agencyFileNo: '',
    loanAmount: '',
    
    // Vehicle Details (for Auto Loan)
    vehicleBrand: '',
    vehicleModel: '',
    vehicleVariant: '',
    
    // Personal Information
    customerName: '',
    phoneNumber: '',
    email: '',
    age: '',
    gender: '',
    fatherName: '',
    motherName: '',
    maritalStatus: '',
    spouseName: '',
    
    // Co-applicant
    hasCoApplicant: false,
    coApplicantName: '',
    coApplicantPhone: '',
    coApplicantRelation: '',
    
    // Job Details
    company: '',
    designation: '',
    workExperience: '',
    employmentType: '',
    currentJobDuration: '',
    
    // Property & Income
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    
    // Home Address
    homeState: '',
    homeDistrict: '',
    homeCity: '',
    homeStreet: '',
    homePincode: '',
    homeVerification: false,
    
    // Work/Office Address
    officeState: '',
    officeDistrict: '',
    officeCity: '',
    officeStreet: '',
    officePincode: '',
    officeVerification: false,
    
    // Verification Options
    visitType: 'Residence',
    verificationDate: '',
    instructions: '',
    
    // Agent Assignment
    assignedAgent: ''
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { title: 'PAN Card', file: null, type: 'PAN Card' },
    { title: 'Aadhar Card', file: null, type: 'Aadhar Card' }
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addDocument = () => {
    setDocuments(prev => [...prev, { title: '', file: null, type: 'Other' }]);
  };

  const removeDocument = (index: number) => {
    if (index > 1) { // Don't allow removing PAN and Aadhar
      setDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateDocument = (index: number, field: string, value: any) => {
    setDocuments(prev => prev.map((doc, i) => 
      i === index ? { ...doc, [field]: value } : doc
    ));
  };

  const handleFileUpload = (index: number, file: File) => {
    updateDocument(index, 'file', file);
  };

  const nextStep = () => {
    if (currentStep < stepTitles.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleSubmit = () => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formData.customerName,
      age: parseInt(formData.age) || 30,
      job: formData.designation || 'Not specified',
      address: {
        street: formData.homeStreet,
        city: formData.homeCity,
        district: formData.homeDistrict,
        state: formData.homeState,
        pincode: formData.homePincode
      },
      additionalDetails: {
        agencyFileNo: formData.agencyFileNo,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        company: formData.company,
        designation: formData.designation,
        workExperience: formData.workExperience,
        employmentType: formData.employmentType,
        currentJobDuration: formData.currentJobDuration,
        propertyType: formData.propertyType,
        ownershipStatus: formData.ownershipStatus,
        propertyAge: formData.propertyAge,
        monthlyIncome: formData.monthlyIncome,
        annualIncome: formData.annualIncome,
        otherIncome: formData.otherIncome,
        leadType: formData.leadType,
        loanAmount: formData.loanAmount,
        vehicleBrandName: formData.vehicleBrand,
        vehicleModelName: formData.vehicleModel,
        vehicleVariant: formData.vehicleVariant,
        gender: formData.gender,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        maritalStatus: formData.maritalStatus,
        spouseName: formData.spouseName,
        addresses: [
          {
            type: 'Home',
            street: formData.homeStreet,
            city: formData.homeCity,
            district: formData.homeDistrict,
            state: formData.homeState,
            pincode: formData.homePincode,
            verification: formData.homeVerification
          },
          ...(formData.officeStreet ? [{
            type: 'Office',
            street: formData.officeStreet,
            city: formData.officeCity,
            district: formData.officeDistrict,
            state: formData.officeState,
            pincode: formData.officePincode,
            verification: formData.officeVerification
          }] : [])
        ],
        coApplicant: formData.hasCoApplicant ? {
          name: formData.coApplicantName,
          phone: formData.coApplicantPhone,
          relation: formData.coApplicantRelation
        } : undefined
      },
      status: 'Pending',
      bank: formData.bankName,
      visitType: formData.visitType as 'Residence' | 'Office',
      assignedTo: formData.assignedAgent,
      createdAt: new Date(),
      documents: documents
        .filter(doc => doc.file)
        .map(doc => ({
          id: `doc-${Date.now()}-${Math.random()}`,
          name: doc.title,
          type: doc.type,
          uploadedBy: 'admin',
          url: URL.createObjectURL(doc.file!),
          uploadDate: new Date(),
          size: doc.file!.size
        })),
      instructions: formData.instructions,
      verificationDate: formData.verificationDate ? new Date(formData.verificationDate) : undefined
    };

    onAddLead(newLead);
  };

  const getSelectedDistricts = (stateId: string) => {
    const state = locationData.states.find(s => s.id === stateId);
    return state?.districts || [];
  };

  const getSelectedCities = (stateId: string, districtId: string) => {
    const state = locationData.states.find(s => s.id === stateId);
    const district = state?.districts.find(d => d.id === districtId);
    return district?.cities || [];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Lead Type & Basic Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Select value={formData.bankName} onValueChange={(value) => handleInputChange('bankName', value)}>
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
                <Label htmlFor="leadType">Lead Type</Label>
                <Select value={formData.leadType} onValueChange={(value) => handleInputChange('leadType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initiatedBranch">Initiated Under Branch</Label>
                <Input
                  value={formData.initiatedBranch}
                  onChange={(e) => handleInputChange('initiatedBranch', e.target.value)}
                  placeholder="Select initiated branch"
                />
              </div>
              
              <div>
                <Label htmlFor="buildBranch">Build Under Branch</Label>
                <Input
                  value={formData.buildBranch}
                  onChange={(e) => handleInputChange('buildBranch', e.target.value)}
                  placeholder="Select build branch"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agencyFileNo">Agency File No.</Label>
                <Input
                  value={formData.agencyFileNo}
                  onChange={(e) => handleInputChange('agencyFileNo', e.target.value)}
                  placeholder="Enter agency file number"
                />
              </div>
              
              {formData.leadType !== 'Auto Loan' && (
                <div>
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    placeholder="Enter loan amount"
                  />
                </div>
              )}
            </div>

            {formData.leadType === 'Auto Loan' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
                    <Select value={formData.vehicleBrand} onValueChange={(value) => {
                      handleInputChange('vehicleBrand', value);
                      handleInputChange('vehicleModel', ''); // Reset model when brand changes
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleBrands.map((brand) => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicleModel">Vehicle Model</Label>
                    <Select 
                      value={formData.vehicleModel} 
                      onValueChange={(value) => handleInputChange('vehicleModel', value)}
                      disabled={!formData.vehicleBrand}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle model" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.vehicleBrand && vehicleModels[formData.vehicleBrand]?.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicleVariant">Vehicle Variant</Label>
                    <Input
                      value={formData.vehicleVariant}
                      onChange={(e) => handleInputChange('vehicleVariant', e.target.value)}
                      placeholder="Enter vehicle variant"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 1: // Personal Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter age"
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Enter father's name"
                />
              </div>
              
              <div>
                <Label htmlFor="motherName">Mother's Name</Label>
                <Input
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Enter mother's name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
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
              
              {formData.maritalStatus === 'Married' && (
                <div>
                  <Label htmlFor="spouseName">Spouse Name</Label>
                  <Input
                    value={formData.spouseName}
                    onChange={(e) => handleInputChange('spouseName', e.target.value)}
                    placeholder="Enter spouse name"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCoApplicant"
                  checked={formData.hasCoApplicant}
                  onCheckedChange={(checked) => handleInputChange('hasCoApplicant', checked)}
                />
                <Label htmlFor="hasCoApplicant">Add Co-Applicant</Label>
              </div>

              {formData.hasCoApplicant && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="coApplicantName">Co-Applicant Name</Label>
                    <Input
                      value={formData.coApplicantName}
                      onChange={(e) => handleInputChange('coApplicantName', e.target.value)}
                      placeholder="Enter co-applicant name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="coApplicantPhone">Co-Applicant Phone</Label>
                    <Input
                      value={formData.coApplicantPhone}
                      onChange={(e) => handleInputChange('coApplicantPhone', e.target.value)}
                      placeholder="Enter co-applicant phone"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="coApplicantRelation">Relation</Label>
                    <Select value={formData.coApplicantRelation} onValueChange={(value) => handleInputChange('coApplicantRelation', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Brother">Brother</SelectItem>
                        <SelectItem value="Sister">Sister</SelectItem>
                        <SelectItem value="Friend">Friend</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Job Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Enter designation"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="workExperience">Work Experience (Years)</Label>
                <Input
                  value={formData.workExperience}
                  onChange={(e) => handleInputChange('workExperience', e.target.value)}
                  placeholder="Enter work experience"
                />
              </div>
              
              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salaried">Salaried</SelectItem>
                    <SelectItem value="Self Employed">Self Employed</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="currentJobDuration">Current Job Duration (Years)</Label>
                <Input
                  value={formData.currentJobDuration}
                  onChange={(e) => handleInputChange('currentJobDuration', e.target.value)}
                  placeholder="Enter current job duration"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Property & Income
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Independent House">Independent House</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Plot">Plot</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="ownershipStatus">Ownership Status</Label>
                <Select value={formData.ownershipStatus} onValueChange={(value) => handleInputChange('ownershipStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owned">Owned</SelectItem>
                    <SelectItem value="Rented">Rented</SelectItem>
                    <SelectItem value="Parental">Parental</SelectItem>
                    <SelectItem value="Company Provided">Company Provided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="propertyAge">Property Age (Years)</Label>
                <Input
                  value={formData.propertyAge}
                  onChange={(e) => handleInputChange('propertyAge', e.target.value)}
                  placeholder="Enter property age"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="Enter monthly income"
                />
              </div>
              
              <div>
                <Label htmlFor="annualIncome">Annual Income</Label>
                <Input
                  type="number"
                  value={formData.annualIncome}
                  onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                  placeholder="Enter annual income"
                />
              </div>
              
              <div>
                <Label htmlFor="otherIncome">Other Income</Label>
                <Input
                  type="number"
                  value={formData.otherIncome}
                  onChange={(e) => handleInputChange('otherIncome', e.target.value)}
                  placeholder="Enter other income"
                />
              </div>
            </div>
          </div>
        );

      case 4: // Home Address
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Home Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="homeState">State</Label>
                <Select value={formData.homeState} onValueChange={(value) => {
                  handleInputChange('homeState', value);
                  handleInputChange('homeDistrict', '');
                  handleInputChange('homeCity', '');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData.states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="homeDistrict">District</Label>
                <Select 
                  value={formData.homeDistrict} 
                  onValueChange={(value) => {
                    handleInputChange('homeDistrict', value);
                    handleInputChange('homeCity', '');
                  }}
                  disabled={!formData.homeState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedDistricts(formData.homeState).map((district) => (
                      <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="homeCity">City</Label>
                <Select 
                  value={formData.homeCity} 
                  onValueChange={(value) => handleInputChange('homeCity', value)}
                  disabled={!formData.homeDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedCities(formData.homeState, formData.homeDistrict).map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homeStreet">Street Address</Label>
                <Textarea
                  value={formData.homeStreet}
                  onChange={(e) => handleInputChange('homeStreet', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="homePincode">Pincode</Label>
                <Input
                  value={formData.homePincode}
                  onChange={(e) => handleInputChange('homePincode', e.target.value)}
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="homeVerification"
                checked={formData.homeVerification}
                onCheckedChange={(checked) => handleInputChange('homeVerification', checked)}
              />
              <Label htmlFor="homeVerification">Require home address verification</Label>
            </div>
          </div>
        );

      case 5: // Work & Office Address
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Work & Office Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="officeState">State</Label>
                <Select value={formData.officeState} onValueChange={(value) => {
                  handleInputChange('officeState', value);
                  handleInputChange('officeDistrict', '');
                  handleInputChange('officeCity', '');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData.states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="officeDistrict">District</Label>
                <Select 
                  value={formData.officeDistrict} 
                  onValueChange={(value) => {
                    handleInputChange('officeDistrict', value);
                    handleInputChange('officeCity', '');
                  }}
                  disabled={!formData.officeState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedDistricts(formData.officeState).map((district) => (
                      <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="officeCity">City</Label>
                <Select 
                  value={formData.officeCity} 
                  onValueChange={(value) => handleInputChange('officeCity', value)}
                  disabled={!formData.officeDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSelectedCities(formData.officeState, formData.officeDistrict).map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="officeStreet">Office Address</Label>
                <Textarea
                  value={formData.officeStreet}
                  onChange={(e) => handleInputChange('officeStreet', e.target.value)}
                  placeholder="Enter office address"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="officePincode">Pincode</Label>
                <Input
                  value={formData.officePincode}
                  onChange={(e) => handleInputChange('officePincode', e.target.value)}
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="officeVerification"
                checked={formData.officeVerification}
                onCheckedChange={(checked) => handleInputChange('officeVerification', checked)}
              />
              <Label htmlFor="officeVerification">Require office address verification</Label>
            </div>
          </div>
        );

      case 6: // Document Upload
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Document Upload</h3>
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <Label htmlFor={`docTitle-${index}`}>Document Title</Label>
                        <Input
                          id={`docTitle-${index}`}
                          value={doc.title}
                          onChange={(e) => updateDocument(index, 'title', e.target.value)}
                          placeholder="Enter document title"
                          disabled={index < 2} // PAN and Aadhar titles are fixed
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`docFile-${index}`}>Upload File</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`docFile-${index}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(index, file);
                            }}
                            className="flex-1"
                          />
                          {doc.file && (
                            <div className="flex items-center text-green-600">
                              <FileText className="h-4 w-4 mr-1" />
                              <span className="text-sm">{doc.file.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {index > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addDocument}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More Document
              </Button>
            </div>
          </div>
        );

      case 7: // Verification Options
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Verification Options</h3>
            <div className="space-y-4">
              <div>
                <Label>Visit Type</Label>
                <RadioGroup 
                  value={formData.visitType} 
                  onValueChange={(value) => handleInputChange('visitType', value)}
                  className="mt-2"
                >
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
              </div>

              <div>
                <Label htmlFor="verificationDate">Preferred Verification Date</Label>
                <Input
                  id="verificationDate"
                  type="date"
                  value={formData.verificationDate}
                  onChange={(e) => handleInputChange('verificationDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Enter any special instructions for the verification agent"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 8: // Agent Assignment
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Agent Assignment</h3>
            <div>
              <Label htmlFor="assignedAgent">Assign to Agent</Label>
              <Select value={formData.assignedAgent} onValueChange={(value) => handleInputChange('assignedAgent', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent to assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Review Summary</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Customer:</strong> {formData.customerName}</div>
                <div><strong>Lead Type:</strong> {formData.leadType}</div>
                <div><strong>Bank:</strong> {banks.find(b => b.id === formData.bankName)?.name}</div>
                <div><strong>Phone:</strong> {formData.phoneNumber}</div>
                <div><strong>Assigned Agent:</strong> {formData.assignedAgent ? agents.find(a => a.id === formData.assignedAgent)?.name : 'Unassigned'}</div>
                <div><strong>Documents:</strong> {documents.filter(d => d.file).length} uploaded</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Lead</h2>
          <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {stepTitles.length}</span>
        </div>
        
        {/* Step Indicators */}
        <div className="flex items-center overflow-x-auto pb-2 space-x-2">
          {stepTitles.map((title, index) => (
            <div
              key={index}
              className={`flex-shrink-0 cursor-pointer px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                index === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index < currentStep
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleStepClick(index)}
            >
              <span className="whitespace-nowrap">{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{stepTitles[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && 'Enter lead type and basic information'}
            {currentStep === 1 && 'Enter customer personal details'}
            {currentStep === 2 && 'Enter employment and job details'}
            {currentStep === 3 && 'Enter property and income information'}
            {currentStep === 4 && 'Enter home address details'}
            {currentStep === 5 && 'Enter work and office address'}
            {currentStep === 6 && 'Upload required documents'}
            {currentStep === 7 && 'Set verification preferences'}
            {currentStep === 8 && 'Assign agent and review'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          {currentStep === stepTitles.length - 1 ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.customerName || !formData.phoneNumber}
            >
              Create Lead
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeadFormMultiStep;
