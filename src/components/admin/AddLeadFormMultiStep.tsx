
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { banks, bankBranches, leadTypes, agents, Bank, User, Lead } from '@/utils/mockData';

interface Address {
  id: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  requiresVerification: boolean;
}

interface CoApplicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  pan: string;
  dateOfBirth: string;
  relationship: string;
  occupation: string;
  income: string;
}

interface FormData {
  bank: string;
  leadType: string;
  agencyFileNo: string;
  applicationBarcode: string;
  caseId: string;
  schemeDesc: string;
  initiatedUnderBranch: string;
  buildUnderBranch: string;
  additionalComments: string;
  loanAmount: string;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  pan: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  occupation: string;
  income: string;
  workAddress: string;
  workCity: string;
  workDistrict: string;
  workState: string;
  workPincode: string;
  officeAddress: string;
  officeCity: string;
  officeDistrict: string;
  officeState: string;
  officePincode: string;
  instructions: string;
  // Vehicle details for auto loans
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleVariant: string;
  // Job details
  company: string;
  designation: string;
  workExperience: string;
  workingFrom: string;
  workingTo: string;
  // Property and income details
  propertyType: string;
  ownershipStatus: string;
  propertyAge: string;
  monthlyIncome: string;
  annualIncome: string;
  otherIncome: string;
  sourceOfIncome: string;
  // Verification options
  residenceVerification: boolean;
  officeVerification: boolean;
  bankStatement: boolean;
  salarySlip: boolean;
  itrVerification: boolean;
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
  banks: Bank[];
  onAddLead: (newLead: Lead) => void;
  onClose: () => void;
  locationData: LocationData;
}

const vehicleBrands = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Ford', 'Renault', 'Nissan', 'Volkswagen'
];

const vehicleModels: { [key: string]: string[] } = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'WagonR', 'Alto', 'Vitara Brezza', 'Ertiga'],
  'Hyundai': ['i20', 'Creta', 'Verna', 'Grand i10', 'Venue', 'Tucson'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tigor', 'Punch'],
  'Mahindra': ['XUV700', 'Scorpio', 'Bolero', 'XUV300', 'Thar', 'KUV100'],
  'Honda': ['City', 'Amaze', 'WR-V', 'Jazz', 'CR-V', 'Civic'],
  'Toyota': ['Innova', 'Fortuner', 'Glanza', 'Urban Cruiser', 'Camry', 'Yaris']
};

const AddLeadFormMultiStep: React.FC<AddLeadFormProps> = ({ 
  agents: propAgents, 
  banks: propBanks, 
  onAddLead, 
  onClose, 
  locationData 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    bank: '',
    leadType: '',
    agencyFileNo: '',
    applicationBarcode: '',
    caseId: '',
    schemeDesc: '',
    initiatedUnderBranch: '',
    buildUnderBranch: '',
    additionalComments: '',
    loanAmount: '',
    name: '',
    email: '',
    phone: '',
    aadhaar: '',
    pan: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    occupation: '',
    income: '',
    workAddress: '',
    workCity: '',
    workDistrict: '',
    workState: '',
    workPincode: '',
    officeAddress: '',
    officeCity: '',
    officeDistrict: '',
    officeState: '',
    officePincode: '',
    instructions: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleVariant: '',
    company: '',
    designation: '',
    workExperience: '',
    workingFrom: '',
    workingTo: '',
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    sourceOfIncome: '',
    residenceVerification: false,
    officeVerification: false,
    bankStatement: false,
    salarySlip: false,
    itrVerification: false
  });

  const [addresses, setAddresses] = useState<Address[]>([{
    id: '1',
    type: 'Permanent',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    requiresVerification: false
  }]);

  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');

  const availableOfficeDistricts = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'];
  const availableOfficeCities = ['Mumbai Central', 'Pune City', 'Nashik Road', 'Nagpur Central', 'Aurangabad'];

  const availableBranches = bankBranches.filter(branch => 
    formData.bank ? branch.bank === formData.bank : true
  );

  const filteredAgents = agents.filter(agent => 
    formData.initiatedUnderBranch || formData.buildUnderBranch 
      ? agent.branch === formData.initiatedUnderBranch || agent.branch === formData.buildUnderBranch
      : true
  );

  const isAutoLoan = formData.leadType === 'Auto Loan';
  const isHomeLoan = formData.leadType === 'Home Loan';
  const isPersonalLoan = formData.leadType === 'Personal Loan';

  const steps = [
    { number: 1, title: 'Lead Type & Basic Information' },
    { number: 2, title: 'Personal Information' },
    { number: 3, title: 'Job Details' },
    { number: 4, title: 'Property & Income Details' },
    { number: 5, title: 'Home Addresses' },
    { number: 6, title: 'Work & Office Address' },
    { number: 7, title: 'Verification Options' },
    { number: 8, title: 'Agent Assignment & Review' }
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      type: addresses.length === 0 ? 'Permanent' : 'Temporary',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      requiresVerification: false
    };
    setAddresses([...addresses, newAddress]);
  };

  const removeAddress = (id: string) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const updateAddress = (id: string, field: keyof Address, value: string | boolean) => {
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const addCoApplicant = () => {
    const newCoApplicant: CoApplicant = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      aadhaar: '',
      pan: '',
      dateOfBirth: '',
      relationship: '',
      occupation: '',
      income: ''
    };
    setCoApplicants([...coApplicants, newCoApplicant]);
  };

  const removeCoApplicant = (id: string) => {
    setCoApplicants(coApplicants.filter(co => co.id !== id));
  };

  const updateCoApplicant = (id: string, field: keyof CoApplicant, value: string) => {
    setCoApplicants(coApplicants.map(co => 
      co.id === id ? { ...co, [field]: value } : co
    ));
  };

  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.bank && formData.leadType;
      case 2:
        return formData.name && formData.email && formData.phone;
      case 3:
        return formData.company && formData.designation;
      case 4:
        return formData.monthlyIncome;
      case 5:
        return addresses.length > 0 && addresses[0].addressLine1;
      case 6:
        return true; // Work address is optional
      case 7:
        return true; // Verification options are optional
      case 8:
        return selectedAgent;
      default:
        return true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formData.name,
      age: 30,
      job: formData.occupation,
      address: {
        street: addresses[0]?.addressLine1 || '',
        city: addresses[0]?.city || '',
        district: addresses[0]?.district || '',
        state: addresses[0]?.state || '',
        pincode: addresses[0]?.pincode || ''
      },
      additionalDetails: {
        company: formData.company,
        designation: formData.designation,
        workExperience: formData.workExperience,
        propertyType: formData.propertyType,
        ownershipStatus: formData.ownershipStatus,
        propertyAge: formData.propertyAge,
        monthlyIncome: formData.monthlyIncome,
        annualIncome: formData.annualIncome,
        otherIncome: formData.otherIncome,
        addresses: addresses.map(addr => ({
          type: addr.type as 'Residence' | 'Office' | 'Permanent',
          street: addr.addressLine1,
          city: addr.city,
          district: addr.district,
          state: addr.state,
          pincode: addr.pincode
        })),
        phoneNumber: formData.phone,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        agencyFileNo: formData.agencyFileNo,
        applicationBarcode: formData.applicationBarcode,
        caseId: formData.caseId,
        schemeDesc: formData.schemeDesc,
        additionalComments: formData.additionalComments,
        leadType: formData.leadType,
        loanAmount: formData.loanAmount,
        vehicleBrandName: formData.vehicleBrand,
        vehicleModelName: formData.vehicleModel
      },
      status: 'Pending',
      bank: formData.bank,
      visitType: 'Both',
      assignedTo: selectedAgent,
      createdAt: new Date(),
      documents: [],
      instructions: formData.instructions
    };
    
    onAddLead(newLead);
    toast.success('Lead added successfully!');
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6 overflow-x-auto">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep === step.number 
              ? 'bg-blue-600 text-white' 
              : currentStep > step.number 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-600'
          }`}>
            {step.number}
          </div>
          <div className="ml-2 text-sm font-medium hidden md:block whitespace-nowrap">
            {step.title}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-2 ${
              currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Lead Type & Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Bank Name</Label>
            <Select value={formData.bank} onValueChange={(value) => handleInputChange('bank', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadType">Lead Type</Label>
            <Select value={formData.leadType} onValueChange={(value) => handleInputChange('leadType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lead type" />
              </SelectTrigger>
              <SelectContent>
                {leadTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initiatedUnderBranch">Initiated Under Branch</Label>
            <Select 
              value={formData.initiatedUnderBranch} 
              onValueChange={(value) => handleInputChange('initiatedUnderBranch', value)}
              disabled={!formData.bank}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select initiated branch" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildUnderBranch">Build Under Branch</Label>
            <Select 
              value={formData.buildUnderBranch} 
              onValueChange={(value) => handleInputChange('buildUnderBranch', value)}
              disabled={!formData.bank}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select build branch" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agencyFileNo">Agency File No.</Label>
            <Input
              id="agencyFileNo"
              value={formData.agencyFileNo}
              onChange={(e) => handleInputChange('agencyFileNo', e.target.value)}
            />
          </div>

          {!isAutoLoan && (
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <Input
                id="loanAmount"
                type="number"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
              />
            </div>
          )}
        </div>

        {isAutoLoan && (
          <>
            <Separator />
            <h3 className="text-lg font-semibold">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleYear">Vehicle Year</Label>
                <Input
                  id="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                  placeholder="e.g., 2023"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleVariant">Vehicle Variant</Label>
                <Input
                  id="vehicleVariant"
                  value={formData.vehicleVariant}
                  onChange={(e) => handleInputChange('vehicleVariant', e.target.value)}
                  placeholder="e.g., VXI, ZXI"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="schemeDesc">Scheme Description</Label>
          <Textarea
            id="schemeDesc"
            value={formData.schemeDesc}
            onChange={(e) => handleInputChange('schemeDesc', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadhaar">Aadhaar Number</Label>
            <Input
              id="aadhaar"
              value={formData.aadhaar}
              onChange={(e) => handleInputChange('aadhaar', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pan">PAN Number</Label>
            <Input
              id="pan"
              value={formData.pan}
              onChange={(e) => handleInputChange('pan', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fatherName">Father's Name</Label>
            <Input
              id="fatherName"
              value={formData.fatherName}
              onChange={(e) => handleInputChange('fatherName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motherName">Mother's Name</Label>
            <Input
              id="motherName"
              value={formData.motherName}
              onChange={(e) => handleInputChange('motherName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spouseName">Spouse Name</Label>
            <Input
              id="spouseName"
              value={formData.spouseName}
              onChange={(e) => handleInputChange('spouseName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
            />
          </div>
        </div>

        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasCoApplicant"
              checked={hasCoApplicant}
              onCheckedChange={(checked) => setHasCoApplicant(checked as boolean)}
            />
            <Label htmlFor="hasCoApplicant">Add Co-Applicant</Label>
          </div>

          {hasCoApplicant && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Co-Applicants</h3>
                <Button type="button" onClick={addCoApplicant} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Co-Applicant
                </Button>
              </div>

              {coApplicants.map((coApplicant, index) => (
                <div key={coApplicant.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Co-Applicant {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeCoApplicant(coApplicant.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={coApplicant.name}
                        onChange={(e) => updateCoApplicant(coApplicant.id, 'name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={coApplicant.email}
                        onChange={(e) => updateCoApplicant(coApplicant.id, 'email', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={coApplicant.phone}
                        onChange={(e) => updateCoApplicant(coApplicant.id, 'phone', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Select
                        value={coApplicant.relationship}
                        onValueChange={(value) => updateCoApplicant(coApplicant.id, 'relationship', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation *</Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workExperience">Work Experience (Years)</Label>
            <Input
              id="workExperience"
              value={formData.workExperience}
              onChange={(e) => handleInputChange('workExperience', e.target.value)}
              placeholder="e.g., 5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingFrom">Working From</Label>
            <Input
              id="workingFrom"
              type="date"
              value={formData.workingFrom}
              onChange={(e) => handleInputChange('workingFrom', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingTo">Working To</Label>
            <Input
              id="workingTo"
              type="date"
              value={formData.workingTo}
              onChange={(e) => handleInputChange('workingTo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceOfIncome">Source of Income</Label>
            <Select value={formData.sourceOfIncome} onValueChange={(value) => handleInputChange('sourceOfIncome', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select source of income" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="investments">Investments</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Property & Income Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isHomeLoan && (
          <>
            <h3 className="text-lg font-semibold">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownershipStatus">Ownership Status</Label>
                <Select value={formData.ownershipStatus} onValueChange={(value) => handleInputChange('ownershipStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="family">Family Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyAge">Property Age (Years)</Label>
                <Input
                  id="propertyAge"
                  value={formData.propertyAge}
                  onChange={(e) => handleInputChange('propertyAge', e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        <h3 className="text-lg font-semibold">Income Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Monthly Income *</Label>
            <Input
              id="monthlyIncome"
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualIncome">Annual Income</Label>
            <Input
              id="annualIncome"
              type="number"
              value={formData.annualIncome}
              onChange={(e) => handleInputChange('annualIncome', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherIncome">Other Income</Label>
            <Input
              id="otherIncome"
              type="number"
              value={formData.otherIncome}
              onChange={(e) => handleInputChange('otherIncome', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Home Addresses</span>
          <Button type="button" onClick={addAddress} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.map((address, index) => (
          <div key={address.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{address.type} Address</h4>
              {addresses.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeAddress(address.id)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address Type</Label>
                <Select
                  value={address.type}
                  onValueChange={(value) => updateAddress(address.id, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Address Line 1 *</Label>
                <Input
                  value={address.addressLine1}
                  onChange={(e) => updateAddress(address.id, 'addressLine1', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input
                  value={address.addressLine2}
                  onChange={(e) => updateAddress(address.id, 'addressLine2', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Landmark</Label>
                <Input
                  value={address.landmark}
                  onChange={(e) => updateAddress(address.id, 'landmark', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={address.city}
                  onChange={(e) => updateAddress(address.id, 'city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  value={address.district}
                  onChange={(e) => updateAddress(address.id, 'district', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={address.state}
                  onChange={(e) => updateAddress(address.id, 'state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={address.pincode}
                  onChange={(e) => updateAddress(address.id, 'pincode', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`verification-${address.id}`}
                checked={address.requiresVerification}
                onCheckedChange={(checked) => updateAddress(address.id, 'requiresVerification', checked as boolean)}
              />
              <Label htmlFor={`verification-${address.id}`}>
                Requires Verification
              </Label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Work Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workAddress">Work Address</Label>
              <Textarea
                id="workAddress"
                value={formData.workAddress}
                onChange={(e) => handleInputChange('workAddress', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workCity">Work City</Label>
              <Input
                id="workCity"
                value={formData.workCity}
                onChange={(e) => handleInputChange('workCity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workDistrict">Work District</Label>
              <Select value={formData.workDistrict} onValueChange={(value) => handleInputChange('workDistrict', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work district" />
                </SelectTrigger>
                <SelectContent>
                  {availableOfficeDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workState">Work State</Label>
              <Input
                id="workState"
                value={formData.workState}
                onChange={(e) => handleInputChange('workState', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workPincode">Work Pincode</Label>
              <Input
                id="workPincode"
                value={formData.workPincode}
                onChange={(e) => handleInputChange('workPincode', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Office Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="officeAddress">Office Address</Label>
              <Textarea
                id="officeAddress"
                value={formData.officeAddress}
                onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeCity">Office City</Label>
              <Select value={formData.officeCity} onValueChange={(value) => handleInputChange('officeCity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select office city" />
                </SelectTrigger>
                <SelectContent>
                  {availableOfficeCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeDistrict">Office District</Label>
              <Select value={formData.officeDistrict} onValueChange={(value) => handleInputChange('officeDistrict', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select office district" />
                </SelectTrigger>
                <SelectContent>
                  {availableOfficeDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeState">Office State</Label>
              <Input
                id="officeState"
                value={formData.officeState}
                onChange={(e) => handleInputChange('officeState', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officePincode">Office Pincode</Label>
              <Input
                id="officePincode"
                value={formData.officePincode}
                onChange={(e) => handleInputChange('officePincode', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep7 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Verification Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Required Verifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="residenceVerification"
                checked={formData.residenceVerification}
                onCheckedChange={(checked) => handleInputChange('residenceVerification', checked as boolean)}
              />
              <Label htmlFor="residenceVerification">Residence Verification</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="officeVerification"
                checked={formData.officeVerification}
                onCheckedChange={(checked) => handleInputChange('officeVerification', checked as boolean)}
              />
              <Label htmlFor="officeVerification">Office Verification</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bankStatement"
                checked={formData.bankStatement}
                onCheckedChange={(checked) => handleInputChange('bankStatement', checked as boolean)}
              />
              <Label htmlFor="bankStatement">Bank Statement Verification</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="salarySlip"
                checked={formData.salarySlip}
                onCheckedChange={(checked) => handleInputChange('salarySlip', checked as boolean)}
              />
              <Label htmlFor="salarySlip">Salary Slip Verification</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="itrVerification"
                checked={formData.itrVerification}
                onCheckedChange={(checked) => handleInputChange('itrVerification', checked as boolean)}
              />
              <Label htmlFor="itrVerification">ITR Verification</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep8 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Agent Assignment & Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Required Verifications</Label>
          <div className="p-3 bg-gray-50 rounded-lg">
            {[
              formData.residenceVerification && "Residence Verification",
              formData.officeVerification && "Office Verification", 
              formData.bankStatement && "Bank Statement Verification",
              formData.salarySlip && "Salary Slip Verification",
              formData.itrVerification && "ITR Verification"
            ].filter(Boolean).length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {[
                  formData.residenceVerification && "Residence Verification",
                  formData.officeVerification && "Office Verification",
                  formData.bankStatement && "Bank Statement Verification", 
                  formData.salarySlip && "Salary Slip Verification",
                  formData.itrVerification && "ITR Verification"
                ].filter(Boolean).map((verification, index) => (
                  <li key={index} className="text-sm">{verification}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No verifications selected</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="selectedAgent">Assign Agent *</Label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger>
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {filteredAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.name}>
                  {agent.name} - {agent.district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Special Instructions</Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            rows={3}
            placeholder="Any special instructions for the agent..."
          />
        </div>

        {isAutoLoan && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold">Vehicle Details Summary</h4>
            <p className="text-sm">Brand: {formData.vehicleBrand || 'Not specified'}</p>
            <p className="text-sm">Model: {formData.vehicleModel || 'Not specified'}</p>
            <p className="text-sm">Year: {formData.vehicleYear || 'Not specified'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Lead</h1>
        <div className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </div>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderCurrentStep()}

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < 8 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={!canProceedToNextStep()}
              >
                Add Lead
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddLeadFormMultiStep;
