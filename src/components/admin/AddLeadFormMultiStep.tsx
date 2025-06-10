import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

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

type AddressType = 'Residence' | 'Office' | 'Permanent';
type VisitType = 'Office' | 'Residence' | 'Both';

const AddLeadFormMultiStep = ({ agents, banks, onAddLead, onClose, locationData }: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    job: '',
    addressType: 'Residence' as AddressType,
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    bank: '',
    visitType: 'Office' as VisitType,
    assignedTo: '',
    instructions: ''
  });
  const [additionalDetails, setAdditionalDetails] = useState({
    company: '',
    designation: '',
    workExperience: '',
    employmentType: 'Full-time',
    currentJobDuration: '',
    propertyType: 'Apartment',
    ownershipStatus: 'Owned',
    propertyAge: 'New',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    agencyFileNo: '',
    applicationBarcode: '',
    caseId: '',
    schemeDesc: '',
    bankBranch: '',
    additionalComments: '',
    leadType: '',
    leadTypeId: '',
    loanAmount: '',
    loanType: '',
    vehicleBrandName: '',
    vehicleBrandId: '',
    vehicleModelName: '',
    vehicleModelId: '',
    vehicleVariant: '',
    gender: 'Male',
    fatherName: '',
    motherName: '',
    maritalStatus: 'Single',
    spouseName: '',
    coApplicant: {
      name: '',
      phone: '',
      relation: ''
    }
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  
  // Auto-generate Agency File No.
  const generateAgencyFileNo = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AGF${timestamp}${random}`;
  };

  // Initialize form data with auto-generated Agency File No.
  useEffect(() => {
    setAdditionalDetails(prev => ({
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
    if (formData.bank) {
      const selectedBank = banks.find(bank => bank.name === formData.bank);
      if (selectedBank) {
        const filtered = products.filter(product => 
          product.banks && Array.isArray(product.banks) && product.banks.includes(selectedBank.id)
        );
        setFilteredProducts(filtered);
      }
    } else {
      setFilteredProducts(products);
    }
  }, [formData.bank, products, banks]);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdditionalDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdditionalDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCoApplicantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdditionalDetails(prev => ({
      ...prev,
      coApplicant: {
        ...prev.coApplicant,
        [name]: value
      }
    }));
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    }
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const updated = [...phoneNumbers];
    updated[index] = value;
    setPhoneNumbers(updated);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.job.trim() || !formData.street.trim() ||
      !formData.city.trim() || !formData.district.trim() || !formData.state.trim() ||
      !formData.pincode.trim() || !formData.bank || !formData.visitType || !formData.assignedTo ||
      !additionalDetails.agencyFileNo || !additionalDetails.leadType) {
      alert('Please fill in all required fields.');
      return;
    }

    const leadData = {
      id: `lead-${Date.now()}`,
      name: formData.name,
      age: formData.age,
      job: formData.job,
      address: {
        type: formData.addressType,
        street: formData.street,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode
      },
      additionalDetails: {
        ...additionalDetails,
        phoneNumbers: phoneNumbers.filter(phone => phone.trim()),
        secondaryPhones: phoneNumbers.slice(1).filter(phone => phone.trim())
      },
      status: 'Pending' as const,
      bank: formData.bank,
      visitType: formData.visitType,
      assignedTo: formData.assignedTo,
      createdAt: new Date(),
      documents: [],
      instructions: formData.instructions
    };

    onAddLead(leadData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter lead name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job">Job *</Label>
                <Input
                  id="job"
                  name="job"
                  value={formData.job}
                  onChange={handleInputChange}
                  placeholder="Enter job title"
                  required
                />
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Primary Phone Number *</Label>
                  <Input
                    id="phone"
                    value={phoneNumbers[0]}
                    onChange={(e) => updatePhoneNumber(0, e.target.value)}
                    placeholder="Enter primary phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={additionalDetails.email}
                    onChange={(e) => setAdditionalDetails({...additionalDetails, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              {phoneNumbers.length > 1 && (
                <div className="space-y-2">
                  <Label>Additional Phone Numbers</Label>
                  {phoneNumbers.slice(1).map((phone, index) => (
                    <div key={index + 1} className="flex gap-2">
                      <Input
                        value={phone}
                        onChange={(e) => updatePhoneNumber(index + 1, e.target.value)}
                        placeholder={`Phone number ${index + 2}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePhoneNumber(index + 1)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={addPhoneNumber}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Phone Number
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={additionalDetails.gender} onValueChange={(value) => setAdditionalDetails({...additionalDetails, gender: value})}>
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
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select value={additionalDetails.maritalStatus} onValueChange={(value) => setAdditionalDetails({...additionalDetails, maritalStatus: value})}>
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
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    value={additionalDetails.fatherName}
                    onChange={(e) => setAdditionalDetails({...additionalDetails, fatherName: e.target.value})}
                    placeholder="Enter father's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    value={additionalDetails.motherName}
                    onChange={(e) => setAdditionalDetails({...additionalDetails, motherName: e.target.value})}
                    placeholder="Enter mother's name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressType">Address Type *</Label>
                  <Select value={formData.addressType} onValueChange={(value: AddressType) => setFormData({...formData, addressType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residence">Residence</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street *</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
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
                  <Label htmlFor="district">District *</Label>
                  <Select value={formData.district} onValueChange={(value) => setFormData({...formData, district: value})}>
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
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
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
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={additionalDetails.company}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    name="designation"
                    value={additionalDetails.designation}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter designation"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workExperience">Work Experience</Label>
                  <Input
                    id="workExperience"
                    name="workExperience"
                    value={additionalDetails.workExperience}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter work experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={additionalDetails.employmentType} onValueChange={(value) => setAdditionalDetails({...additionalDetails, employmentType: value})}>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentJobDuration">Current Job Duration</Label>
                <Input
                  id="currentJobDuration"
                  name="currentJobDuration"
                  value={additionalDetails.currentJobDuration}
                  onChange={handleAdditionalDetailsChange}
                  placeholder="Enter current job duration"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select value={additionalDetails.propertyType} onValueChange={(value) => setAdditionalDetails({...additionalDetails, propertyType: value})}>
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
                  <Select value={additionalDetails.ownershipStatus} onValueChange={(value) => setAdditionalDetails({...additionalDetails, ownershipStatus: value})}>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyAge">Property Age</Label>
                  <Select value={additionalDetails.propertyAge} onValueChange={(value) => setAdditionalDetails({...additionalDetails, propertyAge: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="1-5 years">1-5 years</SelectItem>
                      <SelectItem value="5-10 years">5-10 years</SelectItem>
                      <SelectItem value="10+ years">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Income Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    name="monthlyIncome"
                    value={additionalDetails.monthlyIncome}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter monthly income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income</Label>
                  <Input
                    id="annualIncome"
                    name="annualIncome"
                    value={additionalDetails.annualIncome}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter annual income"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherIncome">Other Income</Label>
                <Input
                  id="otherIncome"
                  name="otherIncome"
                  value={additionalDetails.otherIncome}
                  onChange={handleAdditionalDetailsChange}
                  placeholder="Enter other income"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyFileNo">Agency File No. *</Label>
                  <Input
                    id="agencyFileNo"
                    value={additionalDetails.agencyFileNo}
                    onChange={(e) => setAdditionalDetails({...additionalDetails, agencyFileNo: e.target.value})}
                    placeholder="Agency file number"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated, but can be edited</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadType">Product *</Label>
                  <Select value={additionalDetails.leadType} onValueChange={(value) => setAdditionalDetails({...additionalDetails, leadType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.bank && filteredProducts.length === 0 && (
                    <p className="text-xs text-red-500">No products available for selected bank</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    name="loanAmount"
                    value={additionalDetails.loanAmount}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter loan amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Input
                    id="loanType"
                    name="loanType"
                    value={additionalDetails.loanType}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter loan type"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleBrandName">Vehicle Brand</Label>
                  <Input
                    id="vehicleBrandName"
                    name="vehicleBrandName"
                    value={additionalDetails.vehicleBrandName}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter vehicle brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModelName">Vehicle Model</Label>
                  <Input
                    id="vehicleModelName"
                    name="vehicleModelName"
                    value={additionalDetails.vehicleModelName}
                    onChange={handleAdditionalDetailsChange}
                    placeholder="Enter vehicle model"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bank & Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank *</Label>
                  <Select value={formData.bank} onValueChange={(value) => setFormData({...formData, bank: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.name} value={bank.name}>{bank.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitType">Visit Type *</Label>
                  <Select value={formData.visitType} onValueChange={(value: VisitType) => setFormData({...formData, visitType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Residence">Residence</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankBranch">Bank Branch</Label>
                <Input
                  id="bankBranch"
                  name="bankBranch"
                  value={additionalDetails.bankBranch}
                  onChange={handleAdditionalDetailsChange}
                  placeholder="Enter bank branch"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Assignment & Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To *</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.name}>{agent.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    placeholder="Enter special instructions"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coApplicantName">Co-Applicant Name</Label>
                  <Input
                    id="coApplicantName"
                    name="name"
                    value={additionalDetails.coApplicant.name}
                    onChange={handleCoApplicantChange}
                    placeholder="Enter co-applicant name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coApplicantPhone">Co-Applicant Phone</Label>
                  <Input
                    id="coApplicantPhone"
                    name="phone"
                    value={additionalDetails.coApplicant.phone}
                    onChange={handleCoApplicantChange}
                    placeholder="Enter co-applicant phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coApplicantRelation">Co-Applicant Relation</Label>
                  <Input
                    id="coApplicantRelation"
                    name="relation"
                    value={additionalDetails.coApplicant.relation}
                    onChange={handleCoApplicantChange}
                    placeholder="Enter co-applicant relation"
                  />
                </div>
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
