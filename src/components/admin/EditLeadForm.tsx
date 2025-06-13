
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus } from 'lucide-react';

interface EditLeadFormProps {
  lead: Lead;
  agents: User[];
  banks: Bank[];
  onUpdate: (updatedLead: Lead) => void;
  onClose: () => void;
  locationData: any;
}

const EditLeadForm = ({ lead, agents, banks, onUpdate, onClose, locationData }: EditLeadFormProps) => {
  const [activeTab, setActiveTab] = useState("step1");
  const [formData, setFormData] = useState<any>({
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
      ...lead.additionalDetails
    }
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

  const handleUpdate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Lead name is required.",
        variant: "destructive",
      });
      return;
    }

    onUpdate(formData);
    toast({
      title: "Lead updated",
      description: `${formData.name} has been updated successfully.`,
    });
    onClose();
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9 text-xs">
          <TabsTrigger value="step1" className="text-xs">Bank</TabsTrigger>
          <TabsTrigger value="step2" className="text-xs">Applicant</TabsTrigger>
          <TabsTrigger value="step3" className="text-xs">Co-Applicant</TabsTrigger>
          <TabsTrigger value="step4" className="text-xs">Addresses</TabsTrigger>
          <TabsTrigger value="step5" className="text-xs">Professional</TabsTrigger>
          <TabsTrigger value="step6" className="text-xs">Financial</TabsTrigger>
          <TabsTrigger value="step7" className="text-xs">Vehicle</TabsTrigger>
          <TabsTrigger value="step8" className="text-xs">Documents</TabsTrigger>
          <TabsTrigger value="step9" className="text-xs">Instructions</TabsTrigger>
        </TabsList>
        
        {/* Step 1: Bank Details */}
        <TabsContent value="step1" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Name</label>
              <Input
                value={formData.additionalDetails?.bankName || ''}
                onChange={(e) => handleAdditionalDetailsChange('bankName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Product</label>
              <Input
                value={formData.additionalDetails?.bankProduct || ''}
                onChange={(e) => handleAdditionalDetailsChange('bankProduct', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initiated Branch</label>
              <Input
                value={formData.additionalDetails?.initiatedBranch || ''}
                onChange={(e) => handleAdditionalDetailsChange('initiatedBranch', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Build Branch</label>
              <Input
                value={formData.additionalDetails?.buildBranch || ''}
                onChange={(e) => handleAdditionalDetailsChange('buildBranch', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Step 2: Applicant Information */}
        <TabsContent value="step2" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Father's Name</label>
              <Input
                value={formData.additionalDetails?.fatherName || ''}
                onChange={(e) => handleAdditionalDetailsChange('fatherName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mother's Name</label>
              <Input
                value={formData.additionalDetails?.motherName || ''}
                onChange={(e) => handleAdditionalDetailsChange('motherName', e.target.value)}
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
              <label className="text-sm font-medium">Age</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={formData.additionalDetails?.phoneNumber || ''}
                onChange={(e) => handleAdditionalDetailsChange('phoneNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.additionalDetails?.email || ''}
                onChange={(e) => handleAdditionalDetailsChange('email', e.target.value)}
              />
            </div>
          </div>
          {formData.additionalDetails?.maritalStatus === 'Married' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Spouse Name</label>
              <Input
                value={formData.additionalDetails?.spouseName || ''}
                onChange={(e) => handleAdditionalDetailsChange('spouseName', e.target.value)}
              />
            </div>
          )}
        </TabsContent>

        {/* Step 3: Co-Applicant */}
        <TabsContent value="step3" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Co-Applicant Information</h4>
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
          
          {formData.additionalDetails?.coApplicant && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.additionalDetails.coApplicant.name}
                  onChange={(e) => handleCoApplicantChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.additionalDetails.coApplicant.phone}
                  onChange={(e) => handleCoApplicantChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Relation</label>
                <Input
                  value={formData.additionalDetails.coApplicant.relation}
                  onChange={(e) => handleCoApplicantChange('relation', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.additionalDetails.coApplicant.email || ''}
                  onChange={(e) => handleCoApplicantChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <Input
                  type="number"
                  value={formData.additionalDetails.coApplicant.age || ''}
                  onChange={(e) => handleCoApplicantChange('age', e.target.value)}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Step 4: Addresses */}
        <TabsContent value="step4" className="space-y-4 pt-4">
          {/* Primary Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Primary Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street</label>
                  <Input
                    value={formData.address?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={formData.address?.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <Input
                    value={formData.address?.district || ''}
                    onChange={(e) => handleAddressChange('district', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={formData.address?.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pincode</label>
                  <Input
                    value={formData.address?.pincode || ''}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Addresses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Additional Addresses</CardTitle>
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
                      <label className="text-sm font-medium">Type</label>
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
                      <label className="text-sm font-medium">Street</label>
                      <Input
                        value={addr.street}
                        onChange={(e) => handleAddressFieldChange(index, 'street', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input
                        value={addr.city}
                        onChange={(e) => handleAddressFieldChange(index, 'city', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">District</label>
                      <Input
                        value={addr.district}
                        onChange={(e) => handleAddressFieldChange(index, 'district', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input
                        value={addr.state}
                        onChange={(e) => handleAddressFieldChange(index, 'state', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pincode</label>
                      <Input
                        value={addr.pincode}
                        onChange={(e) => handleAddressFieldChange(index, 'pincode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 5: Professional Details */}
        <TabsContent value="step5" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                value={formData.additionalDetails?.company || ''}
                onChange={(e) => handleAdditionalDetailsChange('company', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Designation</label>
              <Input
                value={formData.additionalDetails?.designation || ''}
                onChange={(e) => handleAdditionalDetailsChange('designation', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Employment Type</label>
              <Select
                value={formData.additionalDetails?.employmentType || ''}
                onValueChange={(value) => handleAdditionalDetailsChange('employmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salaried">Salaried</SelectItem>
                  <SelectItem value="Self Employed">Self Employed</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Work Experience</label>
              <Input
                value={formData.additionalDetails?.workExperience || ''}
                onChange={(e) => handleAdditionalDetailsChange('workExperience', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Job Duration</label>
              <Input
                value={formData.additionalDetails?.currentJobDuration || ''}
                onChange={(e) => handleAdditionalDetailsChange('currentJobDuration', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Step 6: Financial Details */}
        <TabsContent value="step6" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Income</label>
              <Input
                type="number"
                value={formData.additionalDetails?.monthlyIncome || ''}
                onChange={(e) => handleAdditionalDetailsChange('monthlyIncome', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Annual Income</label>
              <Input
                type="number"
                value={formData.additionalDetails?.annualIncome || ''}
                onChange={(e) => handleAdditionalDetailsChange('annualIncome', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Other Income</label>
              <Input
                type="number"
                value={formData.additionalDetails?.otherIncome || ''}
                onChange={(e) => handleAdditionalDetailsChange('otherIncome', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loan Amount</label>
              <Input
                type="number"
                value={formData.additionalDetails?.loanAmount || ''}
                onChange={(e) => handleAdditionalDetailsChange('loanAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Type</label>
              <Input
                value={formData.additionalDetails?.propertyType || ''}
                onChange={(e) => handleAdditionalDetailsChange('propertyType', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ownership Status</label>
              <Input
                value={formData.additionalDetails?.ownershipStatus || ''}
                onChange={(e) => handleAdditionalDetailsChange('ownershipStatus', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Step 7: Vehicle Details */}
        <TabsContent value="step7" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Brand</label>
              <Input
                value={formData.additionalDetails?.vehicleBrandName || ''}
                onChange={(e) => handleAdditionalDetailsChange('vehicleBrandName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Model</label>
              <Input
                value={formData.additionalDetails?.vehicleModelName || ''}
                onChange={(e) => handleAdditionalDetailsChange('vehicleModelName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Variant</label>
              <Input
                value={formData.additionalDetails?.vehicleVariant || ''}
                onChange={(e) => handleAdditionalDetailsChange('vehicleVariant', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Type</label>
              <Input
                value={formData.additionalDetails?.vehicleType || ''}
                onChange={(e) => handleAdditionalDetailsChange('vehicleType', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Price</label>
              <Input
                type="number"
                value={formData.additionalDetails?.vehiclePrice || ''}
                onChange={(e) => handleAdditionalDetailsChange('vehiclePrice', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Down Payment</label>
              <Input
                type="number"
                value={formData.additionalDetails?.downPayment || ''}
                onChange={(e) => handleAdditionalDetailsChange('downPayment', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Step 8: Documents */}
        <TabsContent value="step8" className="space-y-4 pt-4">
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Document management functionality will be available in a future update</p>
          </div>
        </TabsContent>

        {/* Step 9: Instructions */}
        <TabsContent value="step9" className="space-y-4 pt-4">
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
              placeholder="Enter any special instructions for this lead..."
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4 pt-4 border-t">
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
