
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Lead, User, Bank, Address } from '@/utils/mockData';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";

interface Product {
  id: string;
  name: string;
  description: string;
  banks: string[];
}

interface BankBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  bankId: string;
  bankName: string;
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

interface CoApplicant {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: string;
}

interface DocumentUpload {
  id: string;
  title: string;
  file: File | null;
}

interface HomeAddress {
  id: string;
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
  onAddLead: (lead: Lead) => void;
  onClose: () => void;
  locationData: LocationData;
}

const AddLeadFormMultiStep = ({ agents, banks, onAddLead, onClose, locationData }: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredInitiatedBranches, setFilteredInitiatedBranches] = useState<BankBranch[]>([]);
  const [filteredBuildBranches, setFilteredBuildBranches] = useState<BankBranch[]>([]);
  
  const [formData, setFormData] = useState({
    // Step 1: Lead Type & Basic Info
    bankName: '',
    leadType: '',
    leadTypeId: '',
    initiatedUnderBranch: '',
    buildUnderBranch: '',
    agencyFileNo: '',
    applicationBarcode: '',
    caseId: '',
    schemeDescription: '',
    loanAmount: '',
    
    // Step 2: Personal Information
    customerName: '',
    phoneNumber: '',
    email: '',
    age: '',
    gender: '',
    fatherName: '',
    motherName: '',
    maritalStatus: '',
    coApplicants: [] as CoApplicant[],
    
    // Step 3: Job Details
    companyName: '',
    designation: '',
    workExperience: '',
    employmentType: '',
    currentJobDuration: '',
    
    // Step 4: Property & Income
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    
    // Step 5: Home Addresses
    homeAddresses: [] as HomeAddress[],
    
    // Step 6: Work & Office Address
    workState: '',
    workDistrict: '',
    workCity: '',
    officeAddress: '',
    workPincode: '',
    
    // Step 7: Document Upload
    documents: [] as DocumentUpload[],
    
    // Step 8: Verification Options
    visitType: 'Residence',
    verificationDate: undefined as Date | undefined,
    specialInstructions: '',
    
    // Step 9: Agent Assignment
    assignedTo: ''
  });

  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        setProducts(parsedProducts);
      } catch (error) {
        console.error('Error parsing stored products:', error);
        setProducts([]);
      }
    }

    const storedBranches = localStorage.getItem('bankBranches');
    if (storedBranches) {
      try {
        const parsedBranches = JSON.parse(storedBranches);
        setBankBranches(parsedBranches);
      } catch (error) {
        console.error('Error parsing stored bank branches:', error);
        setBankBranches([]);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.bankName && products.length > 0) {
      const selectedBank = banks.find(b => b.name === formData.bankName);
      if (selectedBank) {
        const availableProducts = products.filter(product => 
          product.banks && product.banks.includes(selectedBank.id)
        );
        setFilteredProducts(availableProducts);
      } else {
        setFilteredProducts([]);
      }
    } else {
      setFilteredProducts([]);
    }
  }, [formData.bankName, products, banks]);

  useEffect(() => {
    if (formData.bankName && bankBranches.length > 0) {
      const selectedBank = banks.find(b => b.name === formData.bankName);
      if (selectedBank) {
        const availableBranches = bankBranches.filter(branch => 
          branch.bankId === selectedBank.id
        );
        setFilteredInitiatedBranches(availableBranches);
        setFilteredBuildBranches(availableBranches);
      } else {
        setFilteredInitiatedBranches([]);
        setFilteredBuildBranches([]);
      }
    } else {
      setFilteredInitiatedBranches([]);
      setFilteredBuildBranches([]);
    }
  }, [formData.bankName, bankBranches, banks]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'bankName') {
      setFormData(prev => ({
        ...prev,
        leadType: '',
        leadTypeId: '',
        initiatedUnderBranch: '',
        buildUnderBranch: ''
      }));
    }

    if (field === 'leadType') {
      const selectedProduct = filteredProducts.find(p => p.name === value);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          leadTypeId: selectedProduct.id
        }));
      }
    }
  };

  const addCoApplicant = () => {
    const newCoApplicant: CoApplicant = {
      id: uuidv4(),
      name: '',
      phone: '',
      email: '',
      relation: ''
    };
    setFormData(prev => ({
      ...prev,
      coApplicants: [...prev.coApplicants, newCoApplicant]
    }));
  };

  const removeCoApplicant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      coApplicants: prev.coApplicants.filter(co => co.id !== id)
    }));
  };

  const updateCoApplicant = (id: string, field: keyof CoApplicant, value: string) => {
    setFormData(prev => ({
      ...prev,
      coApplicants: prev.coApplicants.map(co => 
        co.id === id ? { ...co, [field]: value } : co
      )
    }));
  };

  const addHomeAddress = () => {
    const newAddress: HomeAddress = {
      id: uuidv4(),
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

  const removeHomeAddress = (id: string) => {
    setFormData(prev => ({
      ...prev,
      homeAddresses: prev.homeAddresses.filter(addr => addr.id !== id)
    }));
  };

  const updateHomeAddress = (id: string, field: keyof HomeAddress, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      homeAddresses: prev.homeAddresses.map(addr => 
        addr.id === id ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const addDocument = () => {
    const newDocument: DocumentUpload = {
      id: uuidv4(),
      title: '',
      file: null
    };
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument]
    }));
  };

  const removeDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
  };

  const updateDocument = (id: string, field: keyof DocumentUpload, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === id ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.agencyFileNo.trim() !== '';
      case 2:
        return formData.customerName.trim() !== '' && formData.phoneNumber.trim() !== '';
      case 9:
        return formData.assignedTo.trim() !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;

    const newLead: Lead = {
      id: uuidv4(),
      name: formData.customerName,
      age: parseInt(formData.age) || 0,
      job: formData.designation,
      address: {
        street: formData.homeAddresses[0]?.street || '',
        city: formData.homeAddresses[0]?.city || '',
        district: formData.homeAddresses[0]?.district || '',
        state: formData.homeAddresses[0]?.state || '',
        pincode: formData.homeAddresses[0]?.pincode || ''
      },
      additionalDetails: {
        company: formData.companyName,
        designation: formData.designation,
        workExperience: formData.workExperience,
        propertyType: formData.propertyType,
        ownershipStatus: formData.ownershipStatus,
        propertyAge: formData.propertyAge,
        monthlyIncome: formData.monthlyIncome,
        annualIncome: formData.annualIncome,
        otherIncome: formData.otherIncome,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        agencyFileNo: formData.agencyFileNo,
        applicationBarcode: formData.applicationBarcode,
        caseId: formData.caseId,
        schemeDesc: formData.schemeDescription,
        bankBranch: formData.initiatedUnderBranch,
        additionalComments: formData.specialInstructions,
        leadType: formData.leadType,
        leadTypeId: formData.leadTypeId,
        loanAmount: formData.loanAmount,
        addresses: formData.homeAddresses.map(addr => ({
          type: 'Residence' as const,
          street: addr.street,
          city: addr.city,
          district: addr.district,
          state: addr.state,
          pincode: addr.pincode
        }))
      },
      status: 'Pending',
      bank: formData.bankName,
      visitType: formData.visitType as 'Residence' | 'Office' | 'Both',
      assignedTo: formData.assignedTo,
      createdAt: new Date(),
      verificationDate: formData.verificationDate,
      documents: [],
      instructions: formData.specialInstructions
    };

    onAddLead(newLead);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lead Type & Basic Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <Select value={formData.bankName} onValueChange={(value) => handleInputChange('bankName', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.name}>{bank.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lead Type/Product</label>
                <Select 
                  value={formData.leadType} 
                  onValueChange={(value) => handleInputChange('leadType', value)}
                  disabled={!formData.bankName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-products" disabled>
                        {formData.bankName ? 'No products available for this bank' : 'Please select a bank first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Initiated Under Branch</label>
                <Select 
                  value={formData.initiatedUnderBranch} 
                  onValueChange={(value) => handleInputChange('initiatedUnderBranch', value)}
                  disabled={!formData.bankName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select initiated branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredInitiatedBranches.length > 0 ? (
                      filteredInitiatedBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name} ({branch.code}) - {branch.city}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-branches" disabled>
                        {formData.bankName ? 'No branches available for this bank' : 'Please select a bank first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Build Under Branch</label>
                <Select 
                  value={formData.buildUnderBranch} 
                  onValueChange={(value) => handleInputChange('buildUnderBranch', value)}
                  disabled={!formData.bankName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select build branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBuildBranches.length > 0 ? (
                      filteredBuildBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name} ({branch.code}) - {branch.city}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-branches" disabled>
                        {formData.bankName ? 'No branches available for this bank' : 'Please select a bank first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agency File No. *</label>
                <Input
                  value={formData.agencyFileNo}
                  onChange={(e) => handleInputChange('agencyFileNo', e.target.value)}
                  placeholder="Enter agency file number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Application Barcode</label>
                <Input
                  value={formData.applicationBarcode}
                  onChange={(e) => handleInputChange('applicationBarcode', e.target.value)}
                  placeholder="Enter application barcode"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Case ID</label>
                <Input
                  value={formData.caseId}
                  onChange={(e) => handleInputChange('caseId', e.target.value)}
                  placeholder="Enter case ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Loan Amount</label>
                <Input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                  placeholder="Enter loan amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Scheme Description</label>
              <Textarea
                value={formData.schemeDescription}
                onChange={(e) => handleInputChange('schemeDescription', e.target.value)}
                placeholder="Enter scheme description"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <p className="text-sm text-muted-foreground">Enter customer personal details</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer Name *</label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter age"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
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
              <div>
                <label className="block text-sm font-medium mb-2">Marital Status</label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Father's Name</label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Enter father's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mother's Name</label>
                <Input
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Enter mother's name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium">Co-Applicants</h4>
                <Button type="button" onClick={addCoApplicant} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Co-Applicant
                </Button>
              </div>

              {formData.coApplicants.map((coApplicant, index) => (
                <Card key={coApplicant.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium">Co-Applicant {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoApplicant(coApplicant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <Input
                        value={coApplicant.name}
                        onChange={(e) => updateCoApplicant(coApplicant.id, 'name', e.target.value)}
                        placeholder="Enter co-applicant name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        value={coApplicant.phone}
                        onChange={(e) => updateCoApplicant(coApplicant.id, 'phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={coApplicant.email}
                        onChange={(e) => updateCoApplicant(coApplicant.id, 'email', e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Relation</label>
                      <Select 
                        value={coApplicant.relation} 
                        onValueChange={(value) => updateCoApplicant(coApplicant.id, 'relation', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Details</h3>
            <p className="text-sm text-muted-foreground">Enter employment and job details</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Designation</label>
                <Input
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Enter designation"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Work Experience (Years)</label>
                <Input
                  value={formData.workExperience}
                  onChange={(e) => handleInputChange('workExperience', e.target.value)}
                  placeholder="Enter work experience"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Job Duration (Years)</label>
                <Input
                  value={formData.currentJobDuration}
                  onChange={(e) => handleInputChange('currentJobDuration', e.target.value)}
                  placeholder="Enter current job duration"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Employment Type</label>
              <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property & Income</h3>
            <p className="text-sm text-muted-foreground">Enter property and income information</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Property Type</label>
                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Plot">Plot</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ownership Status</label>
                <Select value={formData.ownershipStatus} onValueChange={(value) => handleInputChange('ownershipStatus', value)}>
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Property Age (Years)</label>
              <Input
                value={formData.propertyAge}
                onChange={(e) => handleInputChange('propertyAge', e.target.value)}
                placeholder="Enter property age"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Income</label>
                <Input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="Enter monthly income"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Annual Income</label>
                <Input
                  type="number"
                  value={formData.annualIncome}
                  onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                  placeholder="Enter annual income"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Other Income</label>
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

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Home Addresses</h3>
            <p className="text-sm text-muted-foreground">Enter home address details (you can add multiple addresses)</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium">Home Addresses</h4>
                <Button type="button" onClick={addHomeAddress} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Address
                </Button>
              </div>

              {formData.homeAddresses.map((address, index) => (
                <Card key={address.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium">Address {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHomeAddress(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <Select 
                        value={address.state} 
                        onValueChange={(value) => updateHomeAddress(address.id, 'state', value)}
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
                      <label className="block text-sm font-medium mb-2">District</label>
                      <Select 
                        value={address.district} 
                        onValueChange={(value) => updateHomeAddress(address.id, 'district', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationData.states.map(state => 
                            state.districts.map(district => (
                              <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Select 
                        value={address.city} 
                        onValueChange={(value) => updateHomeAddress(address.id, 'city', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationData.states.map(state => 
                            state.districts.map(district => 
                              district.cities.map(city => (
                                <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                              ))
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address</label>
                      <Textarea
                        value={address.street}
                        onChange={(e) => updateHomeAddress(address.id, 'street', e.target.value)}
                        placeholder="Enter complete address"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pincode</label>
                      <Input
                        value={address.pincode}
                        onChange={(e) => updateHomeAddress(address.id, 'pincode', e.target.value)}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id={`verification-${address.id}`}
                      checked={address.requireVerification}
                      onCheckedChange={(checked) => updateHomeAddress(address.id, 'requireVerification', checked as boolean)}
                    />
                    <label htmlFor={`verification-${address.id}`} className="text-sm font-medium">
                      Require verification for this address
                    </label>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Work & Office Address</h3>
            <p className="text-sm text-muted-foreground">Enter work and office address</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Select value={formData.workState} onValueChange={(value) => handleInputChange('workState', value)}>
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
                <label className="block text-sm font-medium mb-2">District</label>
                <Select value={formData.workDistrict} onValueChange={(value) => handleInputChange('workDistrict', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData.states.map(state => 
                      state.districts.map(district => (
                        <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Select value={formData.workCity} onValueChange={(value) => handleInputChange('workCity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData.states.map(state => 
                      state.districts.map(district => 
                        district.cities.map(city => (
                          <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                        ))
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Office Address</label>
                <Textarea
                  value={formData.officeAddress}
                  onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                  placeholder="Enter office address"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <Input
                  value={formData.workPincode}
                  onChange={(e) => handleInputChange('workPincode', e.target.value)}
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Document Upload</h3>
            <p className="text-sm text-muted-foreground">Upload required documents</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Document Title</label>
                  <Input value="PAN Card" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload File</label>
                  <Input type="file" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Document Title</label>
                  <Input value="Aadhar Card" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload File</label>
                  <Input type="file" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium">Additional Documents</h4>
                <Button type="button" onClick={addDocument} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add More Document
                </Button>
              </div>

              {formData.documents.map((document, index) => (
                <Card key={document.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium">Document {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Document Title</label>
                      <Input
                        value={document.title}
                        onChange={(e) => updateDocument(document.id, 'title', e.target.value)}
                        placeholder="Enter document title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Upload File</label>
                      <Input
                        type="file"
                        onChange={(e) => updateDocument(document.id, 'file', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Verification Options</h3>
            <p className="text-sm text-muted-foreground">Set verification preferences</p>
            
            <div>
              <label className="block text-sm font-medium mb-2">Visit Type</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="residence"
                    name="visitType"
                    value="Residence"
                    checked={formData.visitType === 'Residence'}
                    onChange={(e) => handleInputChange('visitType', e.target.value)}
                  />
                  <label htmlFor="residence" className="text-sm">Residence Verification</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="office"
                    name="visitType"
                    value="Office"
                    checked={formData.visitType === 'Office'}
                    onChange={(e) => handleInputChange('visitType', e.target.value)}
                  />
                  <label htmlFor="office" className="text-sm">Office Verification</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="both"
                    name="visitType"
                    value="Both"
                    checked={formData.visitType === 'Both'}
                    onChange={(e) => handleInputChange('visitType', e.target.value)}
                  />
                  <label htmlFor="both" className="text-sm">Both Residence & Office</label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preferred Verification Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.verificationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.verificationDate ? format(formData.verificationDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.verificationDate}
                    onSelect={(date) => handleInputChange('verificationDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Special Instructions</label>
              <Textarea
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="Enter any special instructions"
                rows={3}
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Agent Assignment</h3>
            <p className="text-sm text-muted-foreground">Assign agent and review</p>
            
            <div>
              <label className="block text-sm font-medium mb-2">Assign to Agent</label>
              <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent to assign" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add New Lead - Step {currentStep} of 9</CardTitle>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 9) * 100}%` }}
          ></div>
        </div>
      </CardHeader>

      <CardContent>
        {renderStep()}

        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep === 9 ? (
            <Button 
              onClick={handleSubmit}
              disabled={!validateStep(currentStep)}
            >
              Create Lead
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AddLeadFormMultiStep;
