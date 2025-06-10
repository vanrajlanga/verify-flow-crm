
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AddLeadFormMultiStepProps {
  agents: any[];
  banks: any[];
  onAddLead: (lead: any) => void;
  onClose: () => void;
  locationData: any;
}

interface Product {
  id: string;
  name: string;
  description: string;
  banks: string[];
}

interface Address {
  id: string;
  state: string;
  district: string;
  city: string;
  street: string;
  pincode: string;
  requiresVerification: boolean;
}

interface Document {
  id: string;
  title: string;
  file: File | null;
}

interface CoApplicant {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  fatherName: string;
  motherName: string;
  maritalStatus: string;
}

const AddLeadFormMultiStep = ({ agents, banks, onAddLead, onClose, locationData }: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Lead Type & Basic Info
    bankName: '',
    leadType: '',
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
    gender: 'Male',
    fatherName: '',
    motherName: '',
    maritalStatus: 'Single',
    
    // Step 3: Job Details
    companyName: '',
    designation: '',
    workExperience: '',
    employmentType: 'Full-time',
    currentJobDuration: '',
    
    // Step 4: Property & Income
    propertyType: 'Apartment',
    ownershipStatus: 'Owned',
    propertyAge: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    
    // Step 6: Work & Office Address
    workState: '',
    workDistrict: '',
    workCity: '',
    officeAddress: '',
    workPincode: '',
    
    // Step 8: Verification Options
    visitType: 'Residence Verification',
    preferredVerificationDate: undefined as Date | undefined,
    specialInstructions: '',
    
    // Step 9: Agent Assignment
    assignedAgent: ''
  });

  const [addresses, setAddresses] = useState<Address[]>([{
    id: '1',
    state: '',
    district: '',
    city: '',
    street: '',
    pincode: '',
    requiresVerification: false
  }]);

  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', title: 'PAN Card', file: null },
    { id: '2', title: 'Aadhar Card', file: null }
  ]);

  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Auto-generate Agency File No.
  const generateAgencyFileNo = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AGF${timestamp}${random}`;
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      agencyFileNo: generateAgencyFileNo()
    }));
    
    // Load products
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      setProducts(parsedProducts);
      setFilteredProducts(parsedProducts);
    }
  }, []);

  // Filter products when bank is selected
  useEffect(() => {
    if (formData.bankName) {
      const selectedBank = banks.find(bank => bank.name === formData.bankName);
      if (selectedBank) {
        const filtered = products.filter(product => 
          product.banks && Array.isArray(product.banks) && product.banks.includes(selectedBank.id)
        );
        setFilteredProducts(filtered);
      }
    } else {
      setFilteredProducts(products);
    }
  }, [formData.bankName, products, banks]);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      state: '',
      district: '',
      city: '',
      street: '',
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

  const updateAddress = (id: string, field: keyof Address, value: any) => {
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const addDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      title: '',
      file: null
    };
    setDocuments([...documents, newDocument]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const updateDocument = (id: string, field: keyof Document, value: any) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const addCoApplicant = () => {
    const newCoApplicant: CoApplicant = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      age: '',
      gender: 'Male',
      fatherName: '',
      motherName: '',
      maritalStatus: 'Single'
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

  const handleSubmit = () => {
    if (!formData.customerName.trim() || !formData.phoneNumber.trim() || !formData.bankName || !formData.assignedAgent) {
      alert('Please fill in all required fields.');
      return;
    }

    const leadData = {
      id: `lead-${Date.now()}`,
      name: formData.customerName,
      age: parseInt(formData.age) || 30,
      job: formData.designation || 'Not specified',
      address: {
        type: 'Residence',
        street: addresses[0]?.street || '',
        city: addresses[0]?.city || '',
        district: addresses[0]?.district || '',
        state: addresses[0]?.state || '',
        pincode: addresses[0]?.pincode || ''
      },
      additionalDetails: {
        company: formData.companyName,
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
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        dateOfBirth: '',
        agencyFileNo: formData.agencyFileNo,
        applicationBarcode: formData.applicationBarcode,
        caseId: formData.caseId,
        schemeDesc: formData.schemeDescription,
        additionalComments: '',
        leadType: formData.leadType,
        loanAmount: formData.loanAmount,
        gender: formData.gender,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        maritalStatus: formData.maritalStatus,
        addresses: addresses,
        coApplicants: coApplicants
      },
      status: 'Pending' as const,
      bank: formData.bankName,
      visitType: formData.visitType === 'Both Residence & Office' ? 'Both' : 
                 formData.visitType === 'Office Verification' ? 'Office' : 'Residence',
      assignedTo: formData.assignedAgent,
      createdAt: new Date(),
      documents: documents.filter(doc => doc.file !== null),
      instructions: formData.specialInstructions
    };

    onAddLead(leadData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Step 1: Lead Type & Basic Info
        return (
          <Card>
            <CardHeader>
              <CardTitle>Lead Type & Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="leadType">Lead Type/Product</Label>
                  <Select value={formData.leadType} onValueChange={(value) => handleInputChange('leadType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead type" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.name}>{product.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initiatedUnderBranch">Initiated Under Branch</Label>
                  <Select value={formData.initiatedUnderBranch} onValueChange={(value) => handleInputChange('initiatedUnderBranch', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select initiated branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Branch">Main Branch</SelectItem>
                      <SelectItem value="Secondary Branch">Secondary Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildUnderBranch">Build Under Branch</Label>
                  <Select value={formData.buildUnderBranch} onValueChange={(value) => handleInputChange('buildUnderBranch', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select build branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Branch">Main Branch</SelectItem>
                      <SelectItem value="Secondary Branch">Secondary Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agencyFileNo">Agency File No. *</Label>
                  <Input
                    id="agencyFileNo"
                    value={formData.agencyFileNo}
                    onChange={(e) => handleInputChange('agencyFileNo', e.target.value)}
                    placeholder="Enter agency file number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationBarcode">Application Barcode</Label>
                  <Input
                    id="applicationBarcode"
                    value={formData.applicationBarcode}
                    onChange={(e) => handleInputChange('applicationBarcode', e.target.value)}
                    placeholder="Enter application barcode"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseId">Case ID</Label>
                  <Input
                    id="caseId"
                    value={formData.caseId}
                    onChange={(e) => handleInputChange('caseId', e.target.value)}
                    placeholder="Enter case ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    placeholder="Enter loan amount"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schemeDescription">Scheme Description</Label>
                <Textarea
                  id="schemeDescription"
                  value={formData.schemeDescription}
                  onChange={(e) => handleInputChange('schemeDescription', e.target.value)}
                  placeholder="Enter scheme description"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 1: // Step 2: Personal Information
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <p className="text-sm text-muted-foreground">Enter customer personal details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter age"
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    placeholder="Enter father's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    placeholder="Enter mother's name"
                  />
                </div>
                <div className="space-y-2">
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
              </div>

              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="hasCoApplicant"
                    checked={hasCoApplicant}
                    onCheckedChange={(checked) => setHasCoApplicant(checked as boolean)}
                  />
                  <Label htmlFor="hasCoApplicant">Add Co-Applicant</Label>
                </div>

                {hasCoApplicant && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Co-Applicants</h4>
                      <Button type="button" onClick={addCoApplicant} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Co-Applicant
                      </Button>
                    </div>

                    {coApplicants.map((coApplicant, index) => (
                      <div key={coApplicant.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Co-Applicant {index + 1}</h5>
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
                            <Label>Name</Label>
                            <Input
                              value={coApplicant.name}
                              onChange={(e) => updateCoApplicant(coApplicant.id, 'name', e.target.value)}
                              placeholder="Enter name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={coApplicant.phone}
                              onChange={(e) => updateCoApplicant(coApplicant.id, 'phone', e.target.value)}
                              placeholder="Enter phone"
                            />
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

      case 2: // Step 3: Job Details
        return (
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <p className="text-sm text-muted-foreground">Enter employment and job details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    placeholder="Enter designation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workExperience">Work Experience (Years)</Label>
                  <Input
                    id="workExperience"
                    value={formData.workExperience}
                    onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    placeholder="Enter work experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Self-employed">Self-employed</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentJobDuration">Current Job Duration (Years)</Label>
                  <Input
                    id="currentJobDuration"
                    value={formData.currentJobDuration}
                    onChange={(e) => handleInputChange('currentJobDuration', e.target.value)}
                    placeholder="Enter current job duration"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3: // Step 4: Property & Income
        return (
          <Card>
            <CardHeader>
              <CardTitle>Property & Income</CardTitle>
              <p className="text-sm text-muted-foreground">Enter property and income information</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
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
                      <SelectItem value="Owned">Owned</SelectItem>
                      <SelectItem value="Rented">Rented</SelectItem>
                      <SelectItem value="Leased">Leased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyAge">Property Age (Years)</Label>
                  <Input
                    id="propertyAge"
                    value={formData.propertyAge}
                    onChange={(e) => handleInputChange('propertyAge', e.target.value)}
                    placeholder="Enter property age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    placeholder="Enter monthly income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income</Label>
                  <Input
                    id="annualIncome"
                    value={formData.annualIncome}
                    onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                    placeholder="Enter annual income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherIncome">Other Income</Label>
                  <Input
                    id="otherIncome"
                    value={formData.otherIncome}
                    onChange={(e) => handleInputChange('otherIncome', e.target.value)}
                    placeholder="Enter other income"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4: // Step 5: Home Addresses
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h3>Home Addresses</h3>
                  <p className="text-sm text-muted-foreground">Enter home address details (you can add multiple addresses)</p>
                </div>
                <Button type="button" onClick={addAddress} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {addresses.map((address, index) => (
                <div key={address.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Address {index + 1}</h4>
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
                      <Label>State</Label>
                      <Select value={address.state} onValueChange={(value) => updateAddress(address.id, 'state', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationData.states.map(state => (
                            <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Select value={address.district} onValueChange={(value) => updateAddress(address.id, 'district', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationData.states.map(state => (
                            state.districts.map(district => (
                              <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                            ))
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Select value={address.city} onValueChange={(value) => updateAddress(address.id, 'city', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationData.states.map(state => (
                            state.districts.map(district => (
                              district.cities.map(city => (
                                <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                              ))
                            ))
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Street Address</Label>
                      <Input
                        value={address.street}
                        onChange={(e) => updateAddress(address.id, 'street', e.target.value)}
                        placeholder="Enter complete address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input
                        value={address.pincode}
                        onChange={(e) => updateAddress(address.id, 'pincode', e.target.value)}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`verification-${address.id}`}
                      checked={address.requiresVerification}
                      onCheckedChange={(checked) => updateAddress(address.id, 'requiresVerification', checked)}
                    />
                    <Label htmlFor={`verification-${address.id}`}>
                      Require verification for this address
                    </Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 5: // Step 6: Work & Office Address
        return (
          <Card>
            <CardHeader>
              <CardTitle>Work & Office Address</CardTitle>
              <p className="text-sm text-muted-foreground">Enter work and office address</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workState">State</Label>
                  <Select value={formData.workState} onValueChange={(value) => handleInputChange('workState', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationData.states.map(state => (
                        <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workDistrict">District</Label>
                  <Select value={formData.workDistrict} onValueChange={(value) => handleInputChange('workDistrict', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationData.states.map(state => (
                        state.districts.map(district => (
                          <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                        ))
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workCity">City</Label>
                  <Select value={formData.workCity} onValueChange={(value) => handleInputChange('workCity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationData.states.map(state => (
                        state.districts.map(district => (
                          district.cities.map(city => (
                            <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                          ))
                        ))
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officeAddress">Office Address</Label>
                  <Textarea
                    id="officeAddress"
                    value={formData.officeAddress}
                    onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                    placeholder="Enter office address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workPincode">Pincode</Label>
                  <Input
                    id="workPincode"
                    value={formData.workPincode}
                    onChange={(e) => handleInputChange('workPincode', e.target.value)}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 6: // Step 7: Document Upload
        return (
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <p className="text-sm text-muted-foreground">Upload required documents</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.map((document, index) => (
                <div key={document.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Document {index + 1}</h4>
                    {documents.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => removeDocument(document.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Document Title</Label>
                      <Input
                        value={document.title}
                        onChange={(e) => updateDocument(document.id, 'title', e.target.value)}
                        placeholder="Enter document title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Upload File</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          onChange={(e) => updateDocument(document.id, 'file', e.target.files?.[0] || null)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        <Upload className="w-4 h-4" />
                      </div>
                      {!document.file && <p className="text-xs text-muted-foreground">No file chosen</p>}
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={addDocument} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add More Document
              </Button>
            </CardContent>
          </Card>
        );

      case 7: // Step 8: Verification Options
        return (
          <Card>
            <CardHeader>
              <CardTitle>Verification Options</CardTitle>
              <p className="text-sm text-muted-foreground">Set verification preferences</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Visit Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="residence"
                        name="visitType"
                        value="Residence Verification"
                        checked={formData.visitType === 'Residence Verification'}
                        onChange={(e) => handleInputChange('visitType', e.target.value)}
                      />
                      <Label htmlFor="residence">Residence Verification</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="office"
                        name="visitType"
                        value="Office Verification"
                        checked={formData.visitType === 'Office Verification'}
                        onChange={(e) => handleInputChange('visitType', e.target.value)}
                      />
                      <Label htmlFor="office">Office Verification</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="both"
                        name="visitType"
                        value="Both Residence & Office"
                        checked={formData.visitType === 'Both Residence & Office'}
                        onChange={(e) => handleInputChange('visitType', e.target.value)}
                      />
                      <Label htmlFor="both">Both Residence & Office</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Verification Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.preferredVerificationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.preferredVerificationDate ? format(formData.preferredVerificationDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.preferredVerificationDate}
                        onSelect={(date) => handleInputChange('preferredVerificationDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Enter special instructions"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 8: // Step 9: Agent Assignment
        return (
          <Card>
            <CardHeader>
              <CardTitle>Agent Assignment</CardTitle>
              <p className="text-sm text-muted-foreground">Assign agent and review</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignedAgent">Assign to Agent</Label>
                <Select value={formData.assignedAgent} onValueChange={(value) => handleInputChange('assignedAgent', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.name}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Add New Lead</h2>
      
      {/* Step Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep + 1} of 9</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / 9) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / 9) * 100}%` }}
          ></div>
        </div>
      </div>

      {renderStep()}
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <div>
          {currentStep > 0 && (
            <Button onClick={prevStep} className="mr-2">
              Previous
            </Button>
          )}
          {currentStep < 8 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeadFormMultiStep;
