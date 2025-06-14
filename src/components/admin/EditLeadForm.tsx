import { useState, useEffect } from 'react';
import { Lead, User, Bank } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus } from 'lucide-react';
import AddressAgentAssignment from './AddressAgentAssignment';

interface EditLeadFormProps {
  lead: Lead;
  agents: User[];
  banks: Bank[];
  onUpdate: (updatedLead: Lead) => void;
  onClose: () => void;
  locationData: any;
}

const EditLeadForm = ({ lead, agents, banks, onUpdate, onClose, locationData }: EditLeadFormProps) => {
  const [formData, setFormData] = useState<any>({
    ...lead,
    additionalDetails: {
      // Bank Details
      bankName: '',
      bankProduct: '',
      initiatedBranch: '',
      buildBranch: '',
      
      // Personal Details
      fatherName: '',
      motherName: '',
      gender: '',
      dateOfBirth: '',
      maritalStatus: '',
      spouseName: '',
      phoneNumber: '',
      email: '',
      
      // Co-Applicant
      coApplicant: null,
      
      // Addresses
      addresses: [],
      coApplicantAddresses: [],
      
      // Professional
      company: '',
      designation: '',
      employmentType: '',
      workExperience: '',
      currentJobDuration: '',
      
      // Financial
      monthlyIncome: '',
      annualIncome: '',
      otherIncome: '',
      loanAmount: '',
      
      // Property
      propertyType: '',
      ownershipStatus: '',
      propertyAge: '',
      
      // Vehicle
      vehicleType: '',
      vehicleBrandName: '',
      vehicleModelName: '',
      vehicleVariant: '',
      vehiclePrice: '',
      downPayment: '',
      
      // References
      references: [],
      
      ...lead.additionalDetails
    }
  });

  // Address assignments state
  const [addressAssignments, setAddressAssignments] = useState({
    primaryAddress: { ...lead.address, assignedAgent: '', owner: 'applicant' as const },
    additionalAddresses: (lead.additionalDetails?.addresses || []).map((addr: any) => ({ ...addr, assignedAgent: '', owner: 'applicant' as const })),
    coApplicantAddresses: (lead.additionalDetails?.coApplicantAddresses || []).map((addr: any) => ({ ...addr, assignedAgent: '', owner: 'co-applicant' as const })),
    tvtAgent: ''
  });

  useEffect(() => {
    setFormData({
      ...lead,
      additionalDetails: {
        bankName: '',
        bankProduct: '',
        initiatedBranch: '',
        buildBranch: '',
        fatherName: '',
        motherName: '',
        gender: '',
        dateOfBirth: '',
        maritalStatus: '',
        spouseName: '',
        coApplicant: null,
        addresses: [],
        coApplicantAddresses: [],
        company: '',
        designation: '',
        employmentType: '',
        workExperience: '',
        currentJobDuration: '',
        monthlyIncome: '',
        annualIncome: '',
        otherIncome: '',
        loanAmount: '',
        propertyType: '',
        ownershipStatus: '',
        vehicleBrandName: '',
        vehicleModelName: '',
        vehicleVariant: '',
        vehicleType: '',
        vehiclePrice: '',
        downPayment: '',
        leadType: '',
        phoneNumber: '',
        email: '',
        references: [],
        ...lead.additionalDetails
      }
    });
  }, [lead]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleAdditionalDetailsChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        [field]: value
      }
    }));
  };

  const handleCoApplicantChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        coApplicant: {
          ...prev.additionalDetails.coApplicant,
          [field]: value
        }
      }
    }));
  };

  const addAddress = () => {
    const newAddress = {
      type: 'Office',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    };
    
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        addresses: [...(prev.additionalDetails.addresses || []), newAddress]
      }
    }));
  };

  const removeAddress = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        addresses: prev.additionalDetails.addresses.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const handleAddressFieldChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        addresses: prev.additionalDetails.addresses.map((addr: any, i: number) => 
          i === index ? { ...addr, [field]: value } : addr
        )
      }
    }));
  };

  const addCoApplicantAddress = () => {
    const newAddress = {
      type: 'Residence',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    };
    
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        coApplicantAddresses: [...(prev.additionalDetails.coApplicantAddresses || []), newAddress]
      }
    }));
  };

  const removeCoApplicantAddress = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        coApplicantAddresses: prev.additionalDetails.coApplicantAddresses.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const handleCoApplicantAddressChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        coApplicantAddresses: prev.additionalDetails.coApplicantAddresses.map((addr: any, i: number) => 
          i === index ? { ...addr, [field]: value } : addr
        )
      }
    }));
  };

  const addReference = () => {
    const newReference = {
      name: '',
      phone: '',
      relationship: ''
    };
    
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        references: [...(prev.additionalDetails.references || []), newReference]
      }
    }));
  };

  const removeReference = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        references: prev.additionalDetails.references.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        references: prev.additionalDetails.references.map((ref: any, i: number) => 
          i === index ? { ...ref, [field]: value } : ref
        )
      }
    }));
  };

  const handleAddressAssignmentChange = (assignments: any) => {
    setAddressAssignments(assignments);
  };

  const handleUpdate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Lead name is required.",
        variant: "destructive",
      });
      return;
    }

    // Include address assignments in the updated lead data
    const updatedLead = {
      ...formData,
      addressAssignments: addressAssignments
    };

    onUpdate(updatedLead);
    toast({
      title: "Lead updated",
      description: `${formData.name} has been updated successfully.`,
    });
    onClose();
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
      <div className="space-y-6">
        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Name *</label>
                <Select
                  value={formData.additionalDetails?.bankName || formData.bank || ''}
                  onValueChange={(value) => handleAdditionalDetailsChange('bankName', value)}
                >
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
                <label className="text-sm font-medium">Bank Product *</label>
                <Input
                  value={formData.additionalDetails?.bankProduct || ''}
                  onChange={(e) => handleAdditionalDetailsChange('bankProduct', e.target.value)}
                  placeholder="e.g., Home Loan, Personal Loan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initiated Under Branch *</label>
                <Input
                  value={formData.additionalDetails?.initiatedBranch || ''}
                  onChange={(e) => handleAdditionalDetailsChange('initiatedBranch', e.target.value)}
                  placeholder="Branch name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Build Under Branch *</label>
                <Input
                  value={formData.additionalDetails?.buildBranch || formData.additionalDetails?.bankBranch || ''}
                  onChange={(e) => handleAdditionalDetailsChange('buildBranch', e.target.value)}
                  placeholder="Branch name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number * (10 digits)</label>
                <Input
                  value={formData.additionalDetails?.phoneNumber || ''}
                  onChange={(e) => handleAdditionalDetailsChange('phoneNumber', e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Age *</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  placeholder="Enter age"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.additionalDetails?.email || ''}
                  onChange={(e) => handleAdditionalDetailsChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Father's Name</label>
                <Input
                  value={formData.additionalDetails?.fatherName || ''}
                  onChange={(e) => handleAdditionalDetailsChange('fatherName', e.target.value)}
                  placeholder="Enter father's name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mother's Name</label>
                <Input
                  value={formData.additionalDetails?.motherName || ''}
                  onChange={(e) => handleAdditionalDetailsChange('motherName', e.target.value)}
                  placeholder="Enter mother's name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select 
                  value={formData.additionalDetails?.gender || ''}
                  onValueChange={(value) => handleAdditionalDetailsChange('gender', value)}
                >
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
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.additionalDetails?.dateOfBirth || ''}
                  onChange={(e) => handleAdditionalDetailsChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marital Status</label>
                <Select 
                  value={formData.additionalDetails?.maritalStatus || ''}
                  onValueChange={(value) => handleAdditionalDetailsChange('maritalStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.additionalDetails?.maritalStatus === 'Married' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Spouse Name</label>
                  <Input
                    value={formData.additionalDetails?.spouseName || ''}
                    onChange={(e) => handleAdditionalDetailsChange('spouseName', e.target.value)}
                    placeholder="Enter spouse name"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Primary Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Primary Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Address Type</label>
                <Select
                  value={formData.address?.type || 'Residence'}
                  onValueChange={(value) => handleAddressChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residence">Residence</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Property">Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input
                  value={formData.address?.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  value={formData.address?.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <Input
                  value={formData.address?.district || ''}
                  onChange={(e) => handleAddressChange('district', e.target.value)}
                  placeholder="Enter district"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={formData.address?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pincode</label>
                <Input
                  value={formData.address?.pincode || ''}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Addresses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Additional Addresses</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addAddress}>
                <Plus className="h-4 w-4 mr-1" />
                Add Address
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.additionalDetails?.addresses?.map((addr: any, index: number) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium">Address {index + 1}</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAddress(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address Type</label>
                    <Select
                      value={addr.type}
                      onValueChange={(value) => handleAddressFieldChange(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Residence">Residence</SelectItem>
                        <SelectItem value="Property">Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input
                      value={addr.street}
                      onChange={(e) => handleAddressFieldChange(index, 'street', e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Input
                      value={addr.state}
                      onChange={(e) => handleAddressFieldChange(index, 'state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">District</label>
                    <Input
                      value={addr.district}
                      onChange={(e) => handleAddressFieldChange(index, 'district', e.target.value)}
                      placeholder="Enter district"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={addr.city}
                      onChange={(e) => handleAddressFieldChange(index, 'city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pincode</label>
                    <Input
                      value={addr.pincode}
                      onChange={(e) => handleAddressFieldChange(index, 'pincode', e.target.value)}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!formData.additionalDetails?.addresses || formData.additionalDetails.addresses.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No additional addresses added yet. Click "Add Address" to add addresses.</p>
            )}
          </CardContent>
        </Card>

        {/* Co-Applicant */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Co-Applicant Information</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (formData.additionalDetails?.coApplicant) {
                    handleAdditionalDetailsChange('coApplicant', null);
                  } else {
                    handleAdditionalDetailsChange('coApplicant', {
                      name: '',
                      phone: '',
                      relation: '',
                      email: '',
                      age: ''
                    });
                  }
                }}
              >
                {formData.additionalDetails?.coApplicant ? 'Remove Co-Applicant' : 'Add Co-Applicant'}
              </Button>
            </div>
          </CardHeader>
          {formData.additionalDetails?.coApplicant && (
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    value={formData.additionalDetails.coApplicant.name}
                    onChange={(e) => handleCoApplicantChange('name', e.target.value)}
                    placeholder="Enter co-applicant name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number * (10 digits)</label>
                  <Input
                    value={formData.additionalDetails.coApplicant.phone}
                    onChange={(e) => handleCoApplicantChange('phone', e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age *</label>
                  <Input
                    type="number"
                    value={formData.additionalDetails.coApplicant.age || ''}
                    onChange={(e) => handleCoApplicantChange('age', e.target.value)}
                    placeholder="Enter age"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formData.additionalDetails.coApplicant.email || ''}
                    onChange={(e) => handleCoApplicantChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Relationship</label>
                  <Select
                    value={formData.additionalDetails.coApplicant.relation}
                    onValueChange={(value) => handleCoApplicantChange('relation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Business Partner">Business Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Co-Applicant Addresses */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Co-Applicant Addresses</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addCoApplicantAddress}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Address
                  </Button>
                </div>
                {formData.additionalDetails?.coApplicantAddresses?.map((addr: any, index: number) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Co-Applicant Address {index + 1}</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCoApplicantAddress(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Address Type</label>
                        <Select
                          value={addr.type}
                          onValueChange={(value) => handleCoApplicantAddressChange(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Residence">Residence</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Permanent">Permanent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Street Address</label>
                        <Input
                          value={addr.street}
                          onChange={(e) => handleCoApplicantAddressChange(index, 'street', e.target.value)}
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">State</label>
                        <Input
                          value={addr.state}
                          onChange={(e) => handleCoApplicantAddressChange(index, 'state', e.target.value)}
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">District</label>
                        <Input
                          value={addr.district}
                          onChange={(e) => handleCoApplicantAddressChange(index, 'district', e.target.value)}
                          placeholder="Enter district"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City</label>
                        <Input
                          value={addr.city}
                          onChange={(e) => handleCoApplicantAddressChange(index, 'city', e.target.value)}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pincode</label>
                        <Input
                          value={addr.pincode}
                          onChange={(e) => handleCoApplicantAddressChange(index, 'pincode', e.target.value)}
                          placeholder="Enter pincode"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!formData.additionalDetails?.coApplicantAddresses || formData.additionalDetails.coApplicantAddresses.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">No co-applicant addresses added yet.</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={formData.additionalDetails?.company || ''}
                  onChange={(e) => handleAdditionalDetailsChange('company', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Designation</label>
                <Input
                  value={formData.additionalDetails?.designation || ''}
                  onChange={(e) => handleAdditionalDetailsChange('designation', e.target.value)}
                  placeholder="Enter designation"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Experience</label>
                <Input
                  value={formData.additionalDetails?.workExperience || ''}
                  onChange={(e) => handleAdditionalDetailsChange('workExperience', e.target.value)}
                  placeholder="e.g., 5 years"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Income</label>
                <Input
                  type="number"
                  value={formData.additionalDetails?.monthlyIncome || ''}
                  onChange={(e) => handleAdditionalDetailsChange('monthlyIncome', e.target.value)}
                  placeholder="Enter monthly income"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Annual Income</label>
                <Input
                  type="number"
                  value={formData.additionalDetails?.annualIncome || ''}
                  onChange={(e) => handleAdditionalDetailsChange('annualIncome', e.target.value)}
                  placeholder="Enter annual income"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Other Income</label>
                <Input
                  type="number"
                  value={formData.additionalDetails?.otherIncome || ''}
                  onChange={(e) => handleAdditionalDetailsChange('otherIncome', e.target.value)}
                  placeholder="Enter other income sources"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Loan Amount</label>
                <Input
                  type="number"
                  value={formData.additionalDetails?.loanAmount || ''}
                  onChange={(e) => handleAdditionalDetailsChange('loanAmount', e.target.value)}
                  placeholder="Enter requested loan amount"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type</label>
                <Select
                  value={formData.additionalDetails?.propertyType || ''}
                  onValueChange={(value) => handleAdditionalDetailsChange('propertyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Independent House">Independent House</SelectItem>
                    <SelectItem value="Plot">Plot</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ownership Status</label>
                <Select
                  value={formData.additionalDetails?.ownershipStatus || ''}
                  onValueChange={(value) => handleAdditionalDetailsChange('ownershipStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owned">Owned</SelectItem>
                    <SelectItem value="Rented">Rented</SelectItem>
                    <SelectItem value="Family Owned">Family Owned</SelectItem>
                    <SelectItem value="Company Provided">Company Provided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Property Age</label>
                <Input
                  value={formData.additionalDetails?.propertyAge || ''}
                  onChange={(e) => handleAdditionalDetailsChange('propertyAge', e.target.value)}
                  placeholder="e.g., 5 years"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type</label>
                <Select
                  value={formData.additionalDetails?.vehicleType || formData.additionalDetails?.loanType || ''}
                  onValueChange={(value) => handleAdditionalDetailsChange('vehicleType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Bike">Bike</SelectItem>
                    <SelectItem value="Commercial Vehicle">Commercial Vehicle</SelectItem>
                    <SelectItem value="Two Wheeler">Two Wheeler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Brand</label>
                <Input
                  value={formData.additionalDetails?.vehicleBrandName || ''}
                  onChange={(e) => handleAdditionalDetailsChange('vehicleBrandName', e.target.value)}
                  placeholder="e.g., Maruti, Honda, Toyota"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Model</label>
                <Input
                  value={formData.additionalDetails?.vehicleModelName || ''}
                  onChange={(e) => handleAdditionalDetailsChange('vehicleModelName', e.target.value)}
                  placeholder="e.g., Swift, City, Innova"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Price</label>
                <Input
                  type="number"
                  value={formData.additionalDetails?.vehiclePrice || ''}
                  onChange={(e) => handleAdditionalDetailsChange('vehiclePrice', e.target.value)}
                  placeholder="Enter vehicle price"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Down Payment</label>
                <Input
                  type="number"
                  value={formData.additionalDetails?.downPayment || ''}
                  onChange={(e) => handleAdditionalDetailsChange('downPayment', e.target.value)}
                  placeholder="Enter down payment"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* References */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">References</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addReference}>
                <Plus className="h-4 w-4 mr-1" />
                Add Reference
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.additionalDetails?.references?.map((ref: any, index: number) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium">Reference {index + 1}</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeReference(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={ref.name}
                      onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                      placeholder="Enter reference name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={ref.phone}
                      onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Relationship</label>
                    <Input
                      value={ref.relationship}
                      onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                      placeholder="e.g., Friend, Colleague"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!formData.additionalDetails?.references || formData.additionalDetails.references.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No references added yet. Click "Add Reference" to add references.</p>
            )}
          </CardContent>
        </Card>

        {/* Address-Based Agent Assignment - NEW */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address-Based Agent Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressAgentAssignment
              primaryAddress={formData.address || { type: 'Residence', street: '', city: '', state: '', district: '', pincode: '' }}
              additionalAddresses={formData.additionalDetails?.addresses || []}
              coApplicantAddresses={formData.additionalDetails?.coApplicantAddresses || []}
              agents={agents}
              tvtAgent={addressAssignments.tvtAgent}
              onAssignmentChange={handleAddressAssignmentChange}
            />
          </CardContent>
        </Card>

        {/* General Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General Instructions & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visit Type</label>
                <Select 
                  value={formData.visitType}
                  onValueChange={(value) => handleInputChange('visitType', value)}
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Special Instructions</label>
              <Textarea
                value={formData.instructions || ''}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={4}
                placeholder="Enter any special instructions for this lead verification..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Documents Required</label>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">The following documents are required for verification:</p>
                <ul className="text-sm space-y-1">
                  <li>• Aadhaar Card</li>
                  <li>• PAN Card</li>
                  <li>• Salary Slip</li>
                  <li>• Bank Statement</li>
                  <li>• Property Documents (if applicable)</li>
                  <li>• Income Tax Returns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleUpdate}>
          Update Lead
        </Button>
      </div>
    </div>
  );
};

export default EditLeadForm;
