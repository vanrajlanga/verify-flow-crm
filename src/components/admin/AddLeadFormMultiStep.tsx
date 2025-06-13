
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lead, Address, AdditionalDetails } from '@/utils/mockData';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Bank, BankProduct, BankBranch } from '@/types/bank-product';
import { getBanks, getBankProducts, getBankBranches, getBankProductsByBankId, getBankBranchesByBankId } from '@/lib/bank-product-operations';

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
  banks: any[];
  onAddLead: (lead: Lead) => void;
  onClose: () => void;
  locationData: LocationData;
}

const AddLeadFormMultiStep = ({ agents, banks: oldBanks, onAddLead, onClose, locationData }: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankProducts, setBankProducts] = useState<BankProduct[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BankProduct[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<BankBranch[]>([]);

  // Form data state - restored to original 9-step structure
  const [formData, setFormData] = useState({
    // Step 1: Lead Type & Basic Info
    leadType: '',
    bankProduct: '',
    name: '',
    age: '',
    phoneNumber: '',
    email: '',
    selectedBank: '',
    initiatedUnderBranch: '',
    buildUnderBranch: '',
    
    // Step 2: Address Information
    streetAddress: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    visitType: 'Residence' as 'Residence' | 'Office' | 'Both',
    
    // Step 3: Professional Details
    job: '',
    company: '',
    designation: '',
    workExperience: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    
    // Step 4: Property Details
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    
    // Step 5: Vehicle Details (restored)
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePrice: '',
    downPayment: '',
    
    // Step 6: Loan Details (restored)
    loanAmount: '',
    loanTenure: '',
    loanPurpose: '',
    existingLoans: '',
    
    // Step 7: Documents (restored)
    documentsRequired: [] as string[],
    documentsReceived: [] as string[],
    pendingDocuments: '',
    
    // Step 8: References (restored)
    reference1Name: '',
    reference1Phone: '',
    reference1Relation: '',
    reference2Name: '',
    reference2Phone: '',
    reference2Relation: '',
    
    // Step 9: Final Details & Assignment
    hasCoApplicant: false,
    coApplicantName: '',
    coApplicantPhone: '',
    coApplicantRelation: '',
    assignedAgent: '',
    verificationDate: '',
    instructions: '',
    additionalComments: ''
  });

  useEffect(() => {
    loadBankData();
  }, []);

  useEffect(() => {
    if (formData.selectedBank) {
      loadBankProducts(formData.selectedBank);
      loadBankBranches(formData.selectedBank);
    }
  }, [formData.selectedBank]);

  const loadBankData = async () => {
    try {
      const banksData = await getBanks();
      setBanks(banksData);
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const loadBankProducts = async (bankId: string) => {
    try {
      const products = await getBankProductsByBankId(bankId);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error loading bank products:', error);
    }
  };

  const loadBankBranches = async (bankId: string) => {
    try {
      const branches = await getBankBranchesByBankId(bankId);
      setFilteredBranches(branches);
    } catch (error) {
      console.error('Error loading bank branches:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // No required fields for now
      case 2:
        return true; // No required fields for now
      case 3:
        return true; // No required fields for now
      case 4:
        return true; // No required fields for now
      case 5:
        return true; // No required fields for now
      case 6:
        return true; // No required fields for now
      case 7:
        return true; // No required fields for now
      case 8:
        return true; // No required fields for now
      case 9:
        return true; // No required fields for now
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // Create the lead object
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formData.name || 'Unknown',
      age: parseInt(formData.age) || 0,
      job: formData.job || '',
      address: {
        street: formData.streetAddress || '',
        city: formData.city || '',
        district: formData.district || '',
        state: formData.state || '',
        pincode: formData.pincode || ''
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
        otherIncome: formData.otherIncome || '',
        phoneNumber: formData.phoneNumber || '',
        email: formData.email || '',
        leadType: formData.leadType || '',
        bankBranch: formData.initiatedUnderBranch || '',
        additionalComments: formData.additionalComments || '',
        addresses: []
      },
      status: 'Pending',
      bank: formData.selectedBank || '',
      visitType: formData.visitType,
      assignedTo: formData.assignedAgent || '',
      createdAt: new Date(),
      verificationDate: formData.verificationDate ? new Date(formData.verificationDate) : undefined,
      documents: [],
      instructions: formData.instructions || ''
    };

    onAddLead(newLead);
  };

  // Document options for step 7
  const documentOptions = [
    'Aadhar Card',
    'PAN Card',
    'Salary Slips',
    'Bank Statements',
    'Property Documents',
    'Income Tax Returns',
    'Form 16',
    'Passport Size Photos',
    'Utility Bills',
    'Employment Certificate'
  ];

  const handleDocumentChange = (document: string, checked: boolean, type: 'required' | 'received') => {
    const field = type === 'required' ? 'documentsRequired' : 'documentsReceived';
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], document]
        : prev[field].filter(doc => doc !== document)
    }));
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Lead Type & Basic Information</CardTitle>
        <CardDescription>Enter basic lead information and bank details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Select value={formData.selectedBank} onValueChange={(value) => handleInputChange('selectedBank', value)}>
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
            <Label htmlFor="bankProduct">Bank Product</Label>
            <Select 
              value={formData.bankProduct} 
              onValueChange={(value) => handleInputChange('bankProduct', value)}
              disabled={!formData.selectedBank}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="initiatedUnderBranch">Initiated Under Branch</Label>
            <Select 
              value={formData.initiatedUnderBranch} 
              onValueChange={(value) => handleInputChange('initiatedUnderBranch', value)}
              disabled={!formData.selectedBank}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {filteredBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="buildUnderBranch">Build Under Branch</Label>
            <Select 
              value={formData.buildUnderBranch} 
              onValueChange={(value) => handleInputChange('buildUnderBranch', value)}
              disabled={!formData.selectedBank}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {filteredBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter age"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Address Information</CardTitle>
        <CardDescription>Enter customer address details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="streetAddress">Street Address</Label>
            <Textarea
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              placeholder="Enter street address"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter city"
            />
          </div>

          <div>
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              placeholder="Enter district"
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Enter state"
            />
          </div>

          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              placeholder="Enter pincode"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Visit Type</Label>
            <RadioGroup
              value={formData.visitType}
              onValueChange={(value) => handleInputChange('visitType', value)}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Residence" id="residence" />
                <Label htmlFor="residence">Residence</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Office" id="office" />
                <Label htmlFor="office">Office</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Both" id="both" />
                <Label htmlFor="both">Both</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Professional Details</CardTitle>
        <CardDescription>Enter employment and income information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="job">Job Title</Label>
            <Input
              id="job"
              value={formData.job}
              onChange={(e) => handleInputChange('job', e.target.value)}
              placeholder="Enter job title"
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              placeholder="Enter designation"
            />
          </div>

          <div>
            <Label htmlFor="workExperience">Work Experience</Label>
            <Input
              id="workExperience"
              value={formData.workExperience}
              onChange={(e) => handleInputChange('workExperience', e.target.value)}
              placeholder="Enter work experience"
            />
          </div>

          <div>
            <Label htmlFor="monthlyIncome">Monthly Income</Label>
            <Input
              id="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
              placeholder="Enter monthly income"
            />
          </div>

          <div>
            <Label htmlFor="annualIncome">Annual Income</Label>
            <Input
              id="annualIncome"
              value={formData.annualIncome}
              onChange={(e) => handleInputChange('annualIncome', e.target.value)}
              placeholder="Enter annual income"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="otherIncome">Other Income Sources</Label>
            <Textarea
              id="otherIncome"
              value={formData.otherIncome}
              onChange={(e) => handleInputChange('otherIncome', e.target.value)}
              placeholder="Enter other income sources"
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Property Details</CardTitle>
        <CardDescription>Enter property information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Input
              id="propertyType"
              value={formData.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              placeholder="Enter property type"
            />
          </div>

          <div>
            <Label htmlFor="ownershipStatus">Ownership Status</Label>
            <Input
              id="ownershipStatus"
              value={formData.ownershipStatus}
              onChange={(e) => handleInputChange('ownershipStatus', e.target.value)}
              placeholder="Enter ownership status"
            />
          </div>

          <div>
            <Label htmlFor="propertyAge">Property Age</Label>
            <Input
              id="propertyAge"
              value={formData.propertyAge}
              onChange={(e) => handleInputChange('propertyAge', e.target.value)}
              placeholder="Enter property age"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Vehicle Details</CardTitle>
        <CardDescription>Enter vehicle information (if applicable)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Input
              id="vehicleType"
              value={formData.vehicleType}
              onChange={(e) => handleInputChange('vehicleType', e.target.value)}
              placeholder="Enter vehicle type"
            />
          </div>

          <div>
            <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
            <Input
              id="vehicleBrand"
              value={formData.vehicleBrand}
              onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
              placeholder="Enter vehicle brand"
            />
          </div>

          <div>
            <Label htmlFor="vehicleModel">Vehicle Model</Label>
            <Input
              id="vehicleModel"
              value={formData.vehicleModel}
              onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
              placeholder="Enter vehicle model"
            />
          </div>

          <div>
            <Label htmlFor="vehicleYear">Vehicle Year</Label>
            <Input
              id="vehicleYear"
              value={formData.vehicleYear}
              onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
              placeholder="Enter vehicle year"
            />
          </div>

          <div>
            <Label htmlFor="vehiclePrice">Vehicle Price</Label>
            <Input
              id="vehiclePrice"
              value={formData.vehiclePrice}
              onChange={(e) => handleInputChange('vehiclePrice', e.target.value)}
              placeholder="Enter vehicle price"
            />
          </div>

          <div>
            <Label htmlFor="downPayment">Down Payment</Label>
            <Input
              id="downPayment"
              value={formData.downPayment}
              onChange={(e) => handleInputChange('downPayment', e.target.value)}
              placeholder="Enter down payment"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep6 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 6: Loan Details</CardTitle>
        <CardDescription>Enter loan-specific information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              id="loanAmount"
              value={formData.loanAmount}
              onChange={(e) => handleInputChange('loanAmount', e.target.value)}
              placeholder="Enter loan amount"
            />
          </div>

          <div>
            <Label htmlFor="loanTenure">Loan Tenure</Label>
            <Input
              id="loanTenure"
              value={formData.loanTenure}
              onChange={(e) => handleInputChange('loanTenure', e.target.value)}
              placeholder="Enter loan tenure"
            />
          </div>

          <div>
            <Label htmlFor="loanPurpose">Loan Purpose</Label>
            <Input
              id="loanPurpose"
              value={formData.loanPurpose}
              onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
              placeholder="Enter loan purpose"
            />
          </div>

          <div>
            <Label htmlFor="existingLoans">Existing Loans</Label>
            <Textarea
              id="existingLoans"
              value={formData.existingLoans}
              onChange={(e) => handleInputChange('existingLoans', e.target.value)}
              placeholder="Enter details of existing loans"
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep7 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 7: Documents</CardTitle>
        <CardDescription>Select required and received documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-semibold">Documents Required</Label>
            <div className="space-y-2 mt-2">
              {documentOptions.map((doc) => (
                <div key={doc} className="flex items-center space-x-2">
                  <Checkbox
                    id={`required-${doc}`}
                    checked={formData.documentsRequired.includes(doc)}
                    onCheckedChange={(checked) => handleDocumentChange(doc, !!checked, 'required')}
                  />
                  <Label htmlFor={`required-${doc}`} className="text-sm">{doc}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Documents Received</Label>
            <div className="space-y-2 mt-2">
              {documentOptions.map((doc) => (
                <div key={doc} className="flex items-center space-x-2">
                  <Checkbox
                    id={`received-${doc}`}
                    checked={formData.documentsReceived.includes(doc)}
                    onCheckedChange={(checked) => handleDocumentChange(doc, !!checked, 'received')}
                  />
                  <Label htmlFor={`received-${doc}`} className="text-sm">{doc}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="pendingDocuments">Pending Documents / Notes</Label>
          <Textarea
            id="pendingDocuments"
            value={formData.pendingDocuments}
            onChange={(e) => handleInputChange('pendingDocuments', e.target.value)}
            placeholder="Enter details about pending documents or additional notes"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep8 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 8: References</CardTitle>
        <CardDescription>Enter reference contact information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Reference 1</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label htmlFor="reference1Name">Name</Label>
                <Input
                  id="reference1Name"
                  value={formData.reference1Name}
                  onChange={(e) => handleInputChange('reference1Name', e.target.value)}
                  placeholder="Enter reference name"
                />
              </div>
              <div>
                <Label htmlFor="reference1Phone">Phone</Label>
                <Input
                  id="reference1Phone"
                  value={formData.reference1Phone}
                  onChange={(e) => handleInputChange('reference1Phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="reference1Relation">Relationship</Label>
                <Input
                  id="reference1Relation"
                  value={formData.reference1Relation}
                  onChange={(e) => handleInputChange('reference1Relation', e.target.value)}
                  placeholder="Enter relationship"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Reference 2</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label htmlFor="reference2Name">Name</Label>
                <Input
                  id="reference2Name"
                  value={formData.reference2Name}
                  onChange={(e) => handleInputChange('reference2Name', e.target.value)}
                  placeholder="Enter reference name"
                />
              </div>
              <div>
                <Label htmlFor="reference2Phone">Phone</Label>
                <Input
                  id="reference2Phone"
                  value={formData.reference2Phone}
                  onChange={(e) => handleInputChange('reference2Phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="reference2Relation">Relationship</Label>
                <Input
                  id="reference2Relation"
                  value={formData.reference2Relation}
                  onChange={(e) => handleInputChange('reference2Relation', e.target.value)}
                  placeholder="Enter relationship"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep9 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 9: Final Details & Assignment</CardTitle>
        <CardDescription>Co-applicant details and assignment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasCoApplicant"
              checked={formData.hasCoApplicant}
              onCheckedChange={(checked) => handleInputChange('hasCoApplicant', checked)}
            />
            <Label htmlFor="hasCoApplicant">Has Co-Applicant</Label>
          </div>

          {formData.hasCoApplicant && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <Label htmlFor="coApplicantName">Co-Applicant Name</Label>
                <Input
                  id="coApplicantName"
                  value={formData.coApplicantName}
                  onChange={(e) => handleInputChange('coApplicantName', e.target.value)}
                  placeholder="Enter co-applicant name"
                />
              </div>
              <div>
                <Label htmlFor="coApplicantPhone">Co-Applicant Phone</Label>
                <Input
                  id="coApplicantPhone"
                  value={formData.coApplicantPhone}
                  onChange={(e) => handleInputChange('coApplicantPhone', e.target.value)}
                  placeholder="Enter co-applicant phone"
                />
              </div>
              <div>
                <Label htmlFor="coApplicantRelation">Relationship</Label>
                <Input
                  id="coApplicantRelation"
                  value={formData.coApplicantRelation}
                  onChange={(e) => handleInputChange('coApplicantRelation', e.target.value)}
                  placeholder="Enter relationship"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignedAgent">Assign to Agent</Label>
              <Select value={formData.assignedAgent} onValueChange={(value) => handleInputChange('assignedAgent', value)}>
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
              <Input
                id="verificationDate"
                type="date"
                value={formData.verificationDate}
                onChange={(e) => handleInputChange('verificationDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              placeholder="Enter any special instructions for the agent"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="additionalComments">Additional Comments</Label>
            <Textarea
              id="additionalComments"
              value={formData.additionalComments}
              onChange={(e) => handleInputChange('additionalComments', e.target.value)}
              placeholder="Enter any additional comments"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStepContent = () => {
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
      case 9:
        return renderStep9();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Lead</h1>
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
          <div
            key={step}
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs ${
              step === currentStep
                ? 'border-blue-500 bg-blue-500 text-white'
                : step < currentStep
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 bg-white text-gray-400'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {renderStepContent()}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="space-x-2">
          {currentStep < 9 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Create Lead
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeadFormMultiStep;
