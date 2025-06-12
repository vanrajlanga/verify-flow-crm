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
  const [filteredBranches, setFilteredBranches] = useState<BankBranch[]>([]);
  
  const [formData, setFormData] = useState({
    leadType: '',
    leadTypeId: '',
    name: '',
    age: '',
    job: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: undefined as Date | undefined,
    addressType: 'Residence' as 'Residence' | 'Office' | 'Business',
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
    otherIncome: '',
    bank: '',
    bankBranch: '',
    loanAmount: '',
    loanType: '',
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    vehicleBrandName: '',
    vehicleBrandId: '',
    vehicleModelName: '',
    vehicleModelId: '',
    agencyFileNo: '',
    applicationBarcode: '',
    caseId: '',
    schemeDesc: '',
    additionalComments: '',
    assignedTo: '',
    verificationDate: undefined as Date | undefined,
    visitType: 'Residence' as 'Residence' | 'Office' | 'Both',
    instructions: '',
    additionalAddresses: [] as Address[]
  });

  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        console.log('Loaded products:', parsedProducts);
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
        console.log('Loaded bank branches:', parsedBranches);
        setBankBranches(parsedBranches);
      } catch (error) {
        console.error('Error parsing stored bank branches:', error);
        setBankBranches([]);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.bank && products.length > 0) {
      const selectedBank = banks.find(b => b.name === formData.bank);
      if (selectedBank) {
        const availableProducts = products.filter(product => 
          product.banks && product.banks.includes(selectedBank.id)
        );
        console.log('Filtered products for bank', formData.bank, ':', availableProducts);
        setFilteredProducts(availableProducts);
      } else {
        setFilteredProducts([]);
      }
    } else {
      setFilteredProducts([]);
    }
  }, [formData.bank, products, banks]);

  useEffect(() => {
    if (formData.bank && bankBranches.length > 0) {
      const selectedBank = banks.find(b => b.name === formData.bank);
      if (selectedBank) {
        const availableBranches = bankBranches.filter(branch => 
          branch.bankId === selectedBank.id
        );
        console.log('Filtered branches for bank', formData.bank, ':', availableBranches);
        setFilteredBranches(availableBranches);
      } else {
        setFilteredBranches([]);
      }
    } else {
      setFilteredBranches([]);
    }
  }, [formData.bank, bankBranches, banks]);

  const handleInputChange = (field: string, value: any) => {
    console.log('Updating field:', field, 'with value:', value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'bank') {
      setFormData(prev => ({
        ...prev,
        leadType: '',
        leadTypeId: '',
        bankBranch: ''
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

  const validateStep1 = () => {
    return formData.name.trim() !== '' && 
           formData.age.trim() !== '' && 
           formData.job.trim() !== '';
  };

  const validateStep2 = () => {
    return formData.phoneNumber.trim() !== '' && 
           formData.email.trim() !== '';
  };

  const validateStep3 = () => {
    return formData.street.trim() !== '' && 
           formData.city.trim() !== '' && 
           formData.state.trim() !== '' && 
           formData.pincode.trim() !== '';
  };

  const validateStep5 = () => {
    return formData.bank.trim() !== '';
  };

  const validateStep9 = () => {
    return formData.assignedTo.trim() !== '' && formData.verificationDate;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return validateStep3();
      case 5: return validateStep5();
      case 9: return validateStep9();
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) return;

    const newLead: Lead = {
      id: uuidv4(),
      name: formData.name,
      age: parseInt(formData.age) || 0,
      job: formData.job,
      address: {
        street: formData.street,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode
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
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth?.toISOString().split('T')[0],
        agencyFileNo: formData.agencyFileNo,
        applicationBarcode: formData.applicationBarcode,
        caseId: formData.caseId,
        schemeDesc: formData.schemeDesc,
        bankBranch: formData.bankBranch,
        additionalComments: formData.additionalComments,
        leadType: formData.leadType,
        leadTypeId: formData.leadTypeId,
        loanAmount: formData.loanAmount,
        loanType: formData.loanType,
        vehicleBrandName: formData.vehicleBrandName,
        vehicleBrandId: formData.vehicleBrandId,
        vehicleModelName: formData.vehicleModelName,
        vehicleModelId: formData.vehicleModelId,
        addresses: formData.additionalAddresses
      },
      status: 'Pending',
      bank: formData.bank,
      visitType: formData.visitType,
      assignedTo: formData.assignedTo,
      createdAt: new Date(),
      verificationDate: formData.verificationDate,
      documents: [],
      instructions: formData.instructions
    };

    console.log('Submitting new lead:', newLead);
    onAddLead(newLead);
  };

  const addAdditionalAddress = () => {
    const newAddress: Address = {
      type: 'Residence',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    };
    setFormData(prev => ({
      ...prev,
      additionalAddresses: [...prev.additionalAddresses, newAddress]
    }));
  };

  const removeAdditionalAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalAddresses: prev.additionalAddresses.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalAddress = (index: number, field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalAddresses: prev.additionalAddresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lead Type & Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank *</label>
                <Select value={formData.bank} onValueChange={(value) => handleInputChange('bank', value)}>
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
                  disabled={!formData.bank}
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
                        {formData.bank ? 'No products available for this bank' : 'Please select a bank first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age *</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Occupation *</label>
                <Input
                  value={formData.job}
                  onChange={(e) => handleInputChange('job', e.target.value)}
                  placeholder="Enter occupation"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => handleInputChange('dateOfBirth', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Address Type</label>
              <Select value={formData.addressType} onValueChange={(value: 'Residence' | 'Office' | 'Business') => handleInputChange('addressType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residence">Residence</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Street Address *</label>
              <Textarea
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Enter complete street address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
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
                <Select value={formData.district} onValueChange={(value) => handleInputChange('district', value)}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
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
              <div>
                <label className="block text-sm font-medium mb-2">Pincode *</label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
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

            <div>
              <label className="block text-sm font-medium mb-2">Work Experience</label>
              <Input
                value={formData.workExperience}
                onChange={(e) => handleInputChange('workExperience', e.target.value)}
                placeholder="Enter work experience"
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
            <h3 className="text-lg font-semibold">Loan Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank Branch</label>
                <Select 
                  value={formData.bankBranch} 
                  onValueChange={(value) => handleInputChange('bankBranch', value)}
                  disabled={!formData.bank}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBranches.length > 0 ? (
                      filteredBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name} ({branch.code}) - {branch.city}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-branches" disabled>
                        {formData.bank ? 'No branches available for this bank' : 'Please select a bank first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
              <label className="block text-sm font-medium mb-2">Loan Type</label>
              <Select value={formData.loanType} onValueChange={(value) => handleInputChange('loanType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">Personal Loan</SelectItem>
                  <SelectItem value="Home">Home Loan</SelectItem>
                  <SelectItem value="Auto">Auto Loan</SelectItem>
                  <SelectItem value="Business">Business Loan</SelectItem>
                  <SelectItem value="Education">Education Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Information</h3>
            <p className="text-sm text-muted-foreground">Required for home loans</p>
            
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
              <label className="block text-sm font-medium mb-2">Property Age</label>
              <Input
                value={formData.propertyAge}
                onChange={(e) => handleInputChange('propertyAge', e.target.value)}
                placeholder="Enter property age in years"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vehicle Information</h3>
            <p className="text-sm text-muted-foreground">Required for auto loans</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Brand</label>
                <Input
                  value={formData.vehicleBrandName}
                  onChange={(e) => handleInputChange('vehicleBrandName', e.target.value)}
                  placeholder="Enter vehicle brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Model</label>
                <Input
                  value={formData.vehicleModelName}
                  onChange={(e) => handleInputChange('vehicleModelName', e.target.value)}
                  placeholder="Enter vehicle model"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agency File No.</label>
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
                <label className="block text-sm font-medium mb-2">Scheme Description</label>
                <Input
                  value={formData.schemeDesc}
                  onChange={(e) => handleInputChange('schemeDesc', e.target.value)}
                  placeholder="Enter scheme description"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Comments</label>
              <Textarea
                value={formData.additionalComments}
                onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                placeholder="Enter any additional comments"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium">Additional Addresses</h4>
                <Button type="button" onClick={addAdditionalAddress} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Address
                </Button>
              </div>

              {formData.additionalAddresses.map((address, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium">Address {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdditionalAddress(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Type</label>
                      <Select 
                        value={address.type} 
                        onValueChange={(value) => updateAdditionalAddress(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Residence">Residence</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address</label>
                      <Textarea
                        value={address.street}
                        onChange={(e) => updateAdditionalAddress(index, 'street', e.target.value)}
                        placeholder="Enter street address"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <Select 
                          value={address.state} 
                          onValueChange={(value) => updateAdditionalAddress(index, 'state', value)}
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
                          onValueChange={(value) => updateAdditionalAddress(index, 'district', value)}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <Select 
                          value={address.city} 
                          onValueChange={(value) => updateAdditionalAddress(index, 'city', value)}
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
                      <div>
                        <label className="block text-sm font-medium mb-2">Pincode</label>
                        <Input
                          value={address.pincode}
                          onChange={(e) => updateAdditionalAddress(index, 'pincode', e.target.value)}
                          placeholder="Enter pincode"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assignment & Scheduling</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Assign to Agent *</label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
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
                <label className="block text-sm font-medium mb-2">Visit Type</label>
                <Select value={formData.visitType} onValueChange={(value: 'Residence' | 'Office' | 'Both') => handleInputChange('visitType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residence">Residence</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verification Date *</label>
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
                    {formData.verificationDate ? format(formData.verificationDate, "PPP") : "Pick a date"}
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
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Enter any special instructions for the agent"
                rows={3}
              />
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
              disabled={!validateCurrentStep()}
            >
              Create Lead
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!validateCurrentStep()}
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
