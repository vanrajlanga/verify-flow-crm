
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

interface Address {
  id: string;
  type: 'Permanent' | 'Temporary';
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  requiresVerification: boolean;
}

interface FormData {
  // Bank Information
  bank: string;
  bankProduct: string;
  leadType: string;
  agencyFileNo: string;
  applicationBarcode: string;
  caseId: string;
  schemeDesc: string;
  initiatedUnderBranch: string;
  additionalComments: string;
  loanAmount: string;
  
  // Applicant Information
  name: string;
  phoneNumber: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  
  // Instructions
  instructions: string;
}

interface AddLeadFormSingleStepProps {
  onSubmit: (formData: any) => void;
  locationData: LocationData;
}

const AddLeadFormSingleStep: React.FC<AddLeadFormSingleStepProps> = ({ onSubmit, locationData }) => {
  const [formData, setFormData] = useState<FormData>({
    bank: '',
    bankProduct: '',
    leadType: '',
    agencyFileNo: '',
    applicationBarcode: '',
    caseId: '',
    schemeDesc: '',
    initiatedUnderBranch: '',
    additionalComments: '',
    loanAmount: '',
    name: '',
    phoneNumber: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    instructions: ''
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

  // Mock data - in real app, this would come from props or API
  const banks = [
    { id: 'axis', name: 'Axis Bank' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'icici', name: 'ICICI Bank' }
  ];

  const bankProducts = [
    { id: 'home-loan', name: 'Home Loan' },
    { id: 'car-loan', name: 'Car Loan' },
    { id: 'personal-loan', name: 'Personal Loan' },
    { id: 'business-loan', name: 'Business Loan' }
  ];

  const leadTypes = [
    { id: 'fresh', name: 'Fresh Lead' },
    { id: 'existing', name: 'Existing Customer' },
    { id: 'referral', name: 'Referral' }
  ];

  const branches = [
    { id: 'mumbai-central', name: 'Mumbai Central', bank: 'axis' },
    { id: 'pune-camp', name: 'Pune Camp', bank: 'axis' },
    { id: 'bangalore-mg', name: 'Bangalore MG Road', bank: 'hdfc' },
    { id: 'delhi-cp', name: 'Delhi CP', bank: 'hdfc' }
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      type: 'Temporary',
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

  const getAvailableBranches = () => {
    return branches.filter(branch => branch.bank === formData.bank);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phoneNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name and Phone Number).",
        variant: "destructive"
      });
      return;
    }

    // Transform data for submission
    const submissionData = {
      ...formData,
      addresses: addresses,
      visitType: addresses.some(addr => addr.requiresVerification) ? 'Both' : 'Residence'
    };

    onSubmit(submissionData);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Lead</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bank Selection & Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Selection & Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank">Bank Name *</Label>
                <Select value={formData.bank} onValueChange={(value) => handleInputChange('bank', value)}>
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
                <Label htmlFor="bankProduct">Bank Product</Label>
                <Select value={formData.bankProduct} onValueChange={(value) => handleInputChange('bankProduct', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankProducts.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
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
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableBranches().map((branch) => (
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

              <div className="space-y-2">
                <Label htmlFor="applicationBarcode">Application Barcode</Label>
                <Input
                  id="applicationBarcode"
                  value={formData.applicationBarcode}
                  onChange={(e) => handleInputChange('applicationBarcode', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caseId">Case ID</Label>
                <Input
                  id="caseId"
                  value={formData.caseId}
                  onChange={(e) => handleInputChange('caseId', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schemeDesc">Scheme Description</Label>
              <Textarea
                id="schemeDesc"
                value={formData.schemeDesc}
                onChange={(e) => handleInputChange('schemeDesc', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalComments">Additional Comments</Label>
              <Textarea
                id="additionalComments"
                value={formData.additionalComments}
                onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
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
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
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
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Addresses</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Address Type</Label>
                    <Select
                      value={address.type}
                      onValueChange={(value) => updateAddress(address.id, 'type', value as 'Permanent' | 'Temporary')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Address Line 1</Label>
                    <Input
                      value={address.addressLine1}
                      onChange={(e) => updateAddress(address.id, 'addressLine1', e.target.value)}
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

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions for Agent</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={3}
                placeholder="Any special instructions for the agent..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="submit">
            Add Lead
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLeadFormSingleStep;
