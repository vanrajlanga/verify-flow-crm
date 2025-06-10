
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { User, Bank, Lead } from '@/utils/mockData';
import { ChevronRight, ChevronLeft, X, Plus, Trash2 } from 'lucide-react';

interface AddLeadFormMultiStepProps {
  agents: User[];
  banks: Bank[];
  onAddLead: (lead: Lead) => void;
  onClose: () => void;
  locationData: any;
}

interface PhoneNumber {
  id: string;
  number: string;
  type: string;
}

const AddLeadFormMultiStep = ({ 
  agents, 
  banks, 
  onAddLead, 
  onClose, 
  locationData 
}: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([
    { id: '1', number: '', type: 'Primary' }
  ]);
  
  const [formData, setFormData] = useState({
    // Basic Information
    agencyFileNo: `AGF${Date.now().toString().slice(-6)}`,
    name: '',
    age: '',
    dateOfBirth: '',
    designation: '',
    company: '',
    
    // Contact Information
    email: '',
    
    // Address Information
    addressType: 'Residence' as 'Residence' | 'Office' | 'Both',
    residenceAddress: {
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    },
    officeAddress: {
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    },
    
    // Financial Information
    bank: '',
    product: '',
    loanAmount: '',
    monthlyIncome: '',
    annualIncome: '',
    
    // Vehicle Information (if applicable)
    vehicleBrand: '',
    vehicleModel: '',
    
    // Assignment
    assignedAgent: '',
    
    // Additional Information
    instructions: '',
    applicationBarcode: '',
    caseId: ''
  });

  useEffect(() => {
    loadProducts();
  }, [formData.bank]);

  const loadProducts = () => {
    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        if (formData.bank) {
          const filteredProducts = products.filter((product: any) => 
            product.availableBanks.includes(formData.bank)
          );
          setAvailableProducts(filteredProducts);
        } else {
          setAvailableProducts(products);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setAvailableProducts([]);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (addressType: 'residenceAddress' | 'officeAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value
      }
    }));
  };

  const addPhoneNumber = () => {
    const newPhone: PhoneNumber = {
      id: Date.now().toString(),
      number: '',
      type: 'Secondary'
    };
    setPhoneNumbers([...phoneNumbers, newPhone]);
  };

  const removePhoneNumber = (id: string) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter(phone => phone.id !== id));
    }
  };

  const updatePhoneNumber = (id: string, field: 'number' | 'type', value: string) => {
    setPhoneNumbers(phoneNumbers.map(phone => 
      phone.id === id ? { ...phone, [field]: value } : phone
    ));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          toast({
            title: "Validation Error",
            description: "Customer name is required",
            variant: "destructive"
          });
          return false;
        }
        if (!formData.age || parseInt(formData.age) < 18) {
          toast({
            title: "Validation Error",
            description: "Valid age (18+) is required",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        const primaryPhone = phoneNumbers.find(p => p.type === 'Primary');
        if (!primaryPhone?.number.trim()) {
          toast({
            title: "Validation Error",
            description: "Primary phone number is required",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        if (!formData.bank) {
          toast({
            title: "Validation Error",
            description: "Bank selection is required",
            variant: "destructive"
          });
          return false;
        }
        if (!formData.product) {
          toast({
            title: "Validation Error",
            description: "Product selection is required",
            variant: "destructive"
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) return;

    const primaryPhone = phoneNumbers.find(p => p.type === 'Primary');
    const secondaryPhones = phoneNumbers.filter(p => p.type !== 'Primary' && p.number.trim());

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formData.name,
      age: parseInt(formData.age),
      job: formData.designation || 'Not specified',
      address: {
        street: formData.residenceAddress.street,
        city: formData.residenceAddress.city,
        district: formData.residenceAddress.district,
        state: formData.residenceAddress.state,
        pincode: formData.residenceAddress.pincode
      },
      additionalDetails: {
        agencyFileNo: formData.agencyFileNo,
        phoneNumber: primaryPhone?.number || '',
        secondaryPhones: secondaryPhones,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        company: formData.company,
        designation: formData.designation,
        monthlyIncome: formData.monthlyIncome,
        annualIncome: formData.annualIncome,
        loanAmount: formData.loanAmount,
        leadType: formData.product,
        vehicleBrandName: formData.vehicleBrand,
        vehicleModelName: formData.vehicleModel,
        applicationBarcode: formData.applicationBarcode,
        caseId: formData.caseId,
        workExperience: '',
        propertyType: '',
        ownershipStatus: '',
        propertyAge: '',
        otherIncome: '',
        addresses: formData.addressType === 'Office' || formData.addressType === 'Both' ? [{
          type: 'Office',
          street: formData.officeAddress.street,
          city: formData.officeAddress.city,
          district: formData.officeAddress.district,
          state: formData.officeAddress.state,
          pincode: formData.officeAddress.pincode
        }] : []
      },
      status: 'Pending',
      bank: formData.bank,
      visitType: formData.addressType,
      assignedTo: formData.assignedAgent,
      createdAt: new Date(),
      documents: [],
      instructions: formData.instructions || ''
    };

    onAddLead(newLead);
  };

  const stepTitles = [
    'Personal Information',
    'Contact & Address',
    'Financial Details',
    'Review & Submit'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Lead</h2>
        <Button variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep > index + 1 ? 'bg-green-500 text-white' :
                currentStep === index + 1 ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="ml-2 text-sm">{title}</span>
              {index < stepTitles.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{stepTitles[currentStep - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyFileNo">Agency File No. *</Label>
                  <Input
                    id="agencyFileNo"
                    value={formData.agencyFileNo}
                    onChange={(e) => handleInputChange('agencyFileNo', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter age"
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
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    placeholder="Job title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressType">Address Type</Label>
                  <Select 
                    value={formData.addressType}
                    onValueChange={(value) => handleInputChange('addressType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residence">Residence</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Phone Numbers */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Phone Numbers *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPhoneNumber}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Phone
                  </Button>
                </div>
                {phoneNumbers.map((phone, index) => (
                  <div key={phone.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        value={phone.number}
                        onChange={(e) => updatePhoneNumber(phone.id, 'number', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="w-32">
                      <Select 
                        value={phone.type}
                        onValueChange={(value) => updatePhoneNumber(phone.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="Secondary">Secondary</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {phoneNumbers.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removePhoneNumber(phone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              {/* Residence Address */}
              {(formData.addressType === 'Residence' || formData.addressType === 'Both') && (
                <div className="space-y-4">
                  <h4 className="font-medium">Residence Address</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Street Address</Label>
                      <Input
                        value={formData.residenceAddress.street}
                        onChange={(e) => handleAddressChange('residenceAddress', 'street', e.target.value)}
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={formData.residenceAddress.city}
                        onChange={(e) => handleAddressChange('residenceAddress', 'city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Input
                        value={formData.residenceAddress.district}
                        onChange={(e) => handleAddressChange('residenceAddress', 'district', e.target.value)}
                        placeholder="Enter district"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={formData.residenceAddress.state}
                        onChange={(e) => handleAddressChange('residenceAddress', 'state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input
                        value={formData.residenceAddress.pincode}
                        onChange={(e) => handleAddressChange('residenceAddress', 'pincode', e.target.value)}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Office Address */}
              {(formData.addressType === 'Office' || formData.addressType === 'Both') && (
                <div className="space-y-4">
                  <h4 className="font-medium">Office Address</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Street Address</Label>
                      <Input
                        value={formData.officeAddress.street}
                        onChange={(e) => handleAddressChange('officeAddress', 'street', e.target.value)}
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={formData.officeAddress.city}
                        onChange={(e) => handleAddressChange('officeAddress', 'city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Input
                        value={formData.officeAddress.district}
                        onChange={(e) => handleAddressChange('officeAddress', 'district', e.target.value)}
                        placeholder="Enter district"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={formData.officeAddress.state}
                        onChange={(e) => handleAddressChange('officeAddress', 'state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input
                        value={formData.officeAddress.pincode}
                        onChange={(e) => handleAddressChange('officeAddress', 'pincode', e.target.value)}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Financial Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank *</Label>
                  <Select 
                    value={formData.bank}
                    onValueChange={(value) => {
                      handleInputChange('bank', value);
                      handleInputChange('product', ''); // Reset product when bank changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select 
                    value={formData.product}
                    onValueChange={(value) => handleInputChange('product', value)}
                    disabled={!formData.bank}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.bank ? "Select product" : "Select bank first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    placeholder="Enter amount"
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
              </div>

              {/* Vehicle Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
                  <Input
                    id="vehicleBrand"
                    value={formData.vehicleBrand}
                    onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                    placeholder="Enter vehicle brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <Input
                    id="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    placeholder="Enter vehicle model"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedAgent">Assign Agent</Label>
                <Select 
                  value={formData.assignedAgent}
                  onValueChange={(value) => handleInputChange('assignedAgent', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} - {agent.district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Enter any special instructions"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Agency File No:</span> {formData.agencyFileNo}</div>
                    <div><span className="font-medium">Name:</span> {formData.name}</div>
                    <div><span className="font-medium">Age:</span> {formData.age}</div>
                    <div><span className="font-medium">DOB:</span> {formData.dateOfBirth || 'N/A'}</div>
                    <div><span className="font-medium">Designation:</span> {formData.designation || 'N/A'}</div>
                    <div><span className="font-medium">Company:</span> {formData.company || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Phone Numbers:</span></div>
                    {phoneNumbers.map(phone => (
                      <div key={phone.id} className="ml-4">
                        <Badge variant="outline" className="mr-2 text-xs">{phone.type}</Badge>
                        {phone.number || 'N/A'}
                      </div>
                    ))}
                    <div><span className="font-medium">Email:</span> {formData.email || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Financial Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Bank:</span> {banks.find(b => b.id === formData.bank)?.name || 'N/A'}</div>
                    <div><span className="font-medium">Product:</span> {formData.product || 'N/A'}</div>
                    <div><span className="font-medium">Loan Amount:</span> {formData.loanAmount || 'N/A'}</div>
                    <div><span className="font-medium">Monthly Income:</span> {formData.monthlyIncome || 'N/A'}</div>
                    <div><span className="font-medium">Annual Income:</span> {formData.annualIncome || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Assignment</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Assigned Agent:</span> {
                      formData.assignedAgent ? 
                      agents.find(a => a.id === formData.assignedAgent)?.name || 'Unknown' : 
                      'Unassigned'
                    }</div>
                    <div><span className="font-medium">Address Type:</span> {formData.addressType}</div>
                  </div>
                </div>
              </div>

              {formData.instructions && (
                <div>
                  <h4 className="font-medium mb-3">Instructions</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{formData.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit}>
                  Create Lead
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLeadFormMultiStep;
