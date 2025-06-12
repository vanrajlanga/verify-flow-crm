import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from 'lucide-react';
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

const AddLeadForm: React.FC<AddLeadFormProps> = ({ agents: propAgents, banks: propBanks, onAddLead, onClose, locationData }) => {
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

  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');

  // Available districts and cities for office address
  const availableOfficeDistricts = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'];
  const availableOfficeCities = ['Mumbai Central', 'Pune City', 'Nashik Road', 'Nagpur Central', 'Aurangabad'];

  // Filter branches based on selected bank
  const availableBranches = bankBranches.filter(branch => 
    formData.bank ? branch.bankName === formData.bank : true
  );

  // Filter agents based on selected branches
  const filteredAgents = agents.filter(agent => 
    formData.initiatedUnderBranch || formData.buildUnderBranch 
      ? agent.branch === formData.initiatedUnderBranch || agent.branch === formData.buildUnderBranch
      : true
  );

  const handleInputChange = (field: keyof FormData, value: string) => {
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

  const getVisitTypes = () => {
    const addressesToVerify = addresses.filter(addr => addr.requiresVerification);
    return addressesToVerify.map(addr => `${addr.type} Address Verification`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const visitTypes = getVisitTypes();
    
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
        company: '',
        designation: '',
        workExperience: '',
        propertyType: '',
        ownershipStatus: '',
        propertyAge: '',
        monthlyIncome: formData.income,
        annualIncome: '',
        otherIncome: '',
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
        loanAmount: formData.loanAmount
      },
      status: 'Pending',
      bank: formData.bank,
      visitType: visitTypes.length > 0 ? 'Both' : 'Residence',
      assignedTo: selectedAgent,
      createdAt: new Date(),
      documents: [],
      instructions: formData.instructions
    };
    
    onAddLead(newLead);
    toast.success('Lead added successfully!');
    onClose();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Lead</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lead Type & Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Type & Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank Selection */}
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

              {/* Lead Type */}
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

              {/* Initiated Under Branch */}
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

              {/* Build Under Branch */}
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

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  value={formData.aadhaar}
                  onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  value={formData.pan}
                  onChange={(e) => handleInputChange('pan', e.target.value)}
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
                <Label htmlFor="spouseName">Spouse's Name</Label>
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

              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  value={formData.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                />
              </div>
            </div>

            {/* Co-Applicant Section */}
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
                          <Label>Aadhaar Number</Label>
                          <Input
                            value={coApplicant.aadhaar}
                            onChange={(e) => updateCoApplicant(coApplicant.id, 'aadhaar', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>PAN Number</Label>
                          <Input
                            value={coApplicant.pan}
                            onChange={(e) => updateCoApplicant(coApplicant.id, 'pan', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Date of Birth</Label>
                          <Input
                            type="date"
                            value={coApplicant.dateOfBirth}
                            onChange={(e) => updateCoApplicant(coApplicant.id, 'dateOfBirth', e.target.value)}
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

                        <div className="space-y-2">
                          <Label>Occupation</Label>
                          <Input
                            value={coApplicant.occupation}
                            onChange={(e) => updateCoApplicant(coApplicant.id, 'occupation', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Monthly Income</Label>
                          <Input
                            type="number"
                            value={coApplicant.income}
                            onChange={(e) => updateCoApplicant(coApplicant.id, 'income', e.target.value)}
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

        {/* Home Addresses */}
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

        {/* Work Address */}
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
                <Input
                  id="workDistrict"
                  value={formData.workDistrict}
                  onChange={(e) => handleInputChange('workDistrict', e.target.value)}
                />
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

        {/* Office Address */}
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

        {/* Visit Types and Agent Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Types & Agent Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Required Visit Types</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {getVisitTypes().length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {getVisitTypes().map((visitType, index) => (
                      <li key={index} className="text-sm">{visitType}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No addresses selected for verification</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selectedAgent">Assign Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.name}>
                      {agent.name} - {agent.branch}
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
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Lead
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLeadForm;
