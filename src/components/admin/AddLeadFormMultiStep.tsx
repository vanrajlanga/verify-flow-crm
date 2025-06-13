import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { banks, bankBranches, leadTypes, agents } from '@/utils/mockData';
import { Address } from '@/utils/mockData';
import { getPropertyTypes } from '@/lib/property-operations';
import { getVehicleBrands, getVehicleTypes, getVehicleModels } from '@/lib/vehicle-operations';

interface FormData {
  // Step 1: Lead Type & Basic Information
  leadType: string;
  bankName: string;
  bankProduct: string;
  initiatedUnderBranch: string;
  buildUnderBranch: string;
  name: string;
  phone: string;
  age: string;
  email: string;
  
  // Step 2: Address Information
  addresses: Array<{
    type: 'Residence' | 'Office' | 'Permanent';
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    requiresVerification: boolean;
  }>;
  
  // Step 3: Professional Details
  company: string;
  designation: string;
  workExperience: string;
  monthlyIncome: string;
  officeAddress: {
    type: 'Office';
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    requiresVerification: boolean;
  };
  
  // Step 4: Property Details
  propertyType: string;
  ownershipStatus: string;
  propertyAge: string;
  
  // Step 5: Vehicle Details (conditional)
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  
  // Step 6: Financial Information
  annualIncome: string;
  otherIncome: string;
  
  // Step 7: Documents
  documents: { [key: string]: File | null };
  
  // Step 8: References
  references: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  
  // Step 9: Final Details & Assignment
  instructions: string;
  addressAssignments: { [addressIndex: number]: string };
}

interface AddLeadFormMultiStepProps {
  onSubmit: (data: any) => void;
}

const AddLeadFormMultiStep: React.FC<AddLeadFormMultiStepProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyTypes, setPropertyTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [vehicleBrands, setVehicleBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [vehicleTypes, setVehicleTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [vehicleModels, setVehicleModels] = useState<Array<{ id: string; name: string }>>([]);
  const [bankProducts, setBankProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [documentPreviews, setDocumentPreviews] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<FormData>({
    // Step 1
    leadType: '',
    bankName: '',
    bankProduct: '',
    initiatedUnderBranch: '',
    buildUnderBranch: '',
    name: '',
    phone: '',
    age: '',
    email: '',
    
    // Step 2
    addresses: [{
      type: 'Residence',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      requiresVerification: false
    }],
    
    // Step 3
    company: '',
    designation: '',
    workExperience: '',
    monthlyIncome: '',
    officeAddress: {
      type: 'Office',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      requiresVerification: false
    },
    
    // Step 4
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    
    // Step 5
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    
    // Step 6
    annualIncome: '',
    otherIncome: '',
    
    // Step 7
    documents: {},
    
    // Step 8
    references: [{ name: '', phone: '', relationship: '' }],
    
    // Step 9
    instructions: '',
    addressAssignments: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      const [propertyTypesData, vehicleBrandsData, vehicleTypesData, vehicleModelsData] = await Promise.all([
        getPropertyTypes(),
        getVehicleBrands(),
        getVehicleTypes(),
        getVehicleModels()
      ]);
      
      setPropertyTypes(propertyTypesData);
      setVehicleBrands(vehicleBrandsData);
      setVehicleTypes(vehicleTypesData);
      setVehicleModels(vehicleModelsData);
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBank) {
      fetchBankProducts(selectedBank);
    }
  }, [selectedBank]);

  const fetchBankProducts = async (bankId: string) => {
    try {
      const { data, error } = await supabase
        .from('bank_products')
        .select('*')
        .eq('bank_id', bankId);

      if (error) {
        console.error('Error fetching bank products:', error);
        return;
      }

      setBankProducts(data || []);
    } catch (error) {
      console.error('Error in fetchBankProducts:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        type: 'Residence',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        requiresVerification: false
      }]
    }));
  };

  const removeAddress = (index: number) => {
    if (formData.addresses.length > 1) {
      setFormData(prev => ({
        ...prev,
        addresses: prev.addresses.filter((_, i) => i !== index)
      }));
    }
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { name: '', phone: '', relationship: '' }]
    }));
  };

  const removeReference = (index: number) => {
    if (formData.references.length > 1) {
      setFormData(prev => ({
        ...prev,
        references: prev.references.filter((_, i) => i !== index)
      }));
    }
  };

  const handleDocumentUpload = async (documentType: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${documentType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lead-documents')
        .upload(filePath, file);

      if (uploadError) {
        toast.error('Error uploading document');
        return;
      }

      const { data } = supabase.storage
        .from('lead-documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));

      setDocumentPreviews(prev => ({
        ...prev,
        [documentType]: data.publicUrl
      }));

      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error uploading document');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.phone || !formData.age || !formData.email) {
          toast.error('Please fill all required fields');
          return false;
        }
        if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
          toast.error('Phone number must be 10 digits');
          return false;
        }
        if (!/^\d+$/.test(formData.age)) {
          toast.error('Age must be a number');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      case 2:
        return formData.addresses.every(addr => 
          addr.street && addr.city && addr.district && addr.state && addr.pincode
        );
      case 3:
        return formData.company && formData.designation && formData.workExperience && formData.monthlyIncome;
      case 4:
        return formData.propertyType && formData.ownershipStatus && formData.propertyAge;
      case 5:
        if (formData.bankProduct?.toLowerCase().includes('auto loan')) {
          return formData.vehicleType && formData.vehicleBrand && formData.vehicleModel;
        }
        return true;
      case 6:
        return formData.annualIncome;
      case 7:
        return true;
      case 8:
        return formData.references.every(ref => ref.name && ref.phone && ref.relationship);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 5 && !formData.bankProduct?.toLowerCase().includes('auto loan')) {
        setCurrentStep(prev => prev + 2); // Skip vehicle details step
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 6 && !formData.bankProduct?.toLowerCase().includes('auto loan')) {
      setCurrentStep(prev => prev - 2); // Skip vehicle details step
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Transform addresses to match the expected Address type
      const transformedAddresses: Address[] = formData.addresses.map(addr => ({
        type: addr.type,
        street: addr.street,
        city: addr.city,
        district: addr.district,
        state: addr.state,
        pincode: addr.pincode
      }));

      const submissionData = {
        ...formData,
        addresses: transformedAddresses,
        age: parseInt(formData.age),
        addressAssignments: formData.addressAssignments
      };
      
      onSubmit(submissionData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Lead Type & Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leadType">Lead Type</Label>
                <Select value={formData.leadType} onValueChange={(value) => handleInputChange('leadType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Select value={formData.bankName} onValueChange={(value) => {
                  handleInputChange('bankName', value);
                  setSelectedBank(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bankProduct">Bank Product</Label>
                <Select value={formData.bankProduct} onValueChange={(value) => handleInputChange('bankProduct', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank product" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankProducts.map(product => (
                      <SelectItem key={product.id} value={product.name}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="initiatedUnderBranch">Initiated Under Branch</Label>
                <Select value={formData.initiatedUnderBranch} onValueChange={(value) => handleInputChange('initiatedUnderBranch', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankBranches.filter(branch => branch.bank === formData.bankName).map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="buildUnderBranch">Build Under Branch</Label>
                <Select value={formData.buildUnderBranch} onValueChange={(value) => handleInputChange('buildUnderBranch', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankBranches.filter(branch => branch.bank === formData.bankName).map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number * (10 digits)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                />
              </div>

              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter age"
                  type="number"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  type="email"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
            
            {formData.addresses.map((address, index) => (
              <Card key={index} className="p-4">
                <CardHeader>
                  <CardTitle className="text-md">Address {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Address Type</Label>
                      <Select value={address.type} onValueChange={(value: 'Residence' | 'Office' | 'Permanent') => handleAddressChange(index, 'type', value)}>
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

                    <div>
                      <Label>Street Address</Label>
                      <Input
                        value={address.street}
                        onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                        placeholder="Enter street address"
                      />
                    </div>

                    <div>
                      <Label>State</Label>
                      <Select value={address.state} onValueChange={(value) => handleAddressChange(index, 'state', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Karnataka">Karnataka</SelectItem>
                          <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>District</Label>
                      <Select value={address.district} onValueChange={(value) => handleAddressChange(index, 'district', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bangalore Urban">Bangalore Urban</SelectItem>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                          <SelectItem value="Chennai">Chennai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>City</Label>
                      <Select value={address.city} onValueChange={(value) => handleAddressChange(index, 'city', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bangalore">Bangalore</SelectItem>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                          <SelectItem value="Chennai">Chennai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Pincode</Label>
                      <Input
                        value={address.pincode}
                        onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`verify-${index}`}
                      checked={address.requiresVerification}
                      onCheckedChange={(checked) => handleAddressChange(index, 'requiresVerification', checked)}
                    />
                    <Label htmlFor={`verify-${index}`}>This address requires verification</Label>
                  </div>

                  {formData.addresses.length > 1 && (
                    <Button variant="destructive" onClick={() => removeAddress(index)}>
                      Remove Address
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button onClick={addAddress} variant="outline">
              Add Another Address
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Professional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
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
            </div>

            <Card className="p-4">
              <CardHeader>
                <CardTitle className="text-md">Office Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Street Address</Label>
                    <Input
                      value={formData.officeAddress.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        officeAddress: { ...prev.officeAddress, street: e.target.value }
                      }))}
                      placeholder="Enter office street address"
                    />
                  </div>

                  <div>
                    <Label>State</Label>
                    <Select value={formData.officeAddress.state} onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      officeAddress: { ...prev.officeAddress, state: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>District</Label>
                    <Select value={formData.officeAddress.district} onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      officeAddress: { ...prev.officeAddress, district: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bangalore Urban">Bangalore Urban</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>City</Label>
                    <Select value={formData.officeAddress.city} onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      officeAddress: { ...prev.officeAddress, city: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Pincode</Label>
                    <Input
                      value={formData.officeAddress.pincode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        officeAddress: { ...prev.officeAddress, pincode: e.target.value }
                      }))}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verify-office"
                    checked={formData.officeAddress.requiresVerification}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      officeAddress: { ...prev.officeAddress, requiresVerification: checked as boolean }
                    }))}
                  />
                  <Label htmlFor="verify-office">This office address requires verification</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Property Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ownershipStatus">Ownership Status</Label>
                <Select value={formData.ownershipStatus} onValueChange={(value) => handleInputChange('ownershipStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owned">Owned</SelectItem>
                    <SelectItem value="Parental">Parental</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
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
          </div>
        );

      case 5:
        if (!formData.bankProduct?.toLowerCase().includes('auto loan')) {
          return null;
        }
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
                <Select value={formData.vehicleBrand} onValueChange={(value) => handleInputChange('vehicleBrand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleBrands.map(brand => (
                      <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehicleModel">Vehicle Model</Label>
                <Select value={formData.vehicleModel} onValueChange={(value) => handleInputChange('vehicleModel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle model" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleModels.map(model => (
                      <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annualIncome">Annual Income</Label>
                <Input
                  id="annualIncome"
                  value={formData.annualIncome}
                  onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                  placeholder="Enter annual income"
                />
              </div>

              <div>
                <Label htmlFor="otherIncome">Other Income</Label>
                <Input
                  id="otherIncome"
                  value={formData.otherIncome}
                  onChange={(e) => handleInputChange('otherIncome', e.target.value)}
                  placeholder="Enter other income sources"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        const documentTypes = [
          'Aadhaar Card',
          'PAN Card',
          'Salary Slip',
          'Bank Statement',
          'Property Documents',
          'Income Tax Returns'
        ];

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Documents</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {documentTypes.map(docType => (
                <Card key={docType} className="p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{docType}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleDocumentUpload(docType, file);
                          }
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="max-w-xs"
                      />
                      {documentPreviews[docType] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(documentPreviews[docType], '_blank')}
                        >
                          Preview
                        </Button>
                      )}
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
            <h3 className="text-lg font-semibold mb-4">References</h3>
            
            {formData.references.map((reference, index) => (
              <Card key={index} className="p-4">
                <CardHeader>
                  <CardTitle className="text-md">Reference {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={reference.name}
                        onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                        placeholder="Enter name"
                      />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={reference.phone}
                        onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label>Relationship</Label>
                      <Select value={reference.relationship} onValueChange={(value) => handleReferenceChange(index, 'relationship', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Parents">Parents</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Friends">Friends</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.references.length > 1 && (
                    <Button variant="destructive" onClick={() => removeReference(index)}>
                      Remove Reference
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button onClick={addReference} variant="outline">
              Add Another Reference
            </Button>
          </div>
        );

      case 9:
        const addressesToVerify = [
          ...formData.addresses.filter(addr => addr.requiresVerification).map((addr, index) => ({
            ...addr,
            index,
            label: `Address ${index + 1} (${addr.type})`
          })),
          ...(formData.officeAddress.requiresVerification ? [{
            ...formData.officeAddress,
            index: 'office',
            label: 'Office Address'
          }] : [])
        ];

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Final Details & Assignment</h3>
            
            <div>
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Enter any special instructions for verification"
                rows={4}
              />
            </div>

            <div>
              <h4 className="text-md font-medium mb-3">Address Verification Assignments</h4>
              {addressesToVerify.length > 0 ? (
                <div className="space-y-3">
                  {addressesToVerify.map((address, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{address.label}</h5>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.city}, {address.district}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        <div className="min-w-[200px]">
                          <Label>Assign Agent</Label>
                          <Select 
                            value={formData.addressAssignments[address.index] || ''} 
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              addressAssignments: {
                                ...prev.addressAssignments,
                                [address.index]: value
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {agents.map(agent => (
                                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No addresses marked for verification</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const totalSteps = 9;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Add New Lead</h2>
          <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button 
          onClick={prevStep} 
          disabled={currentStep === 1}
          variant="outline"
        >
          Previous
        </Button>
        
        {currentStep === totalSteps ? (
          <Button onClick={handleSubmit}>
            Submit Lead
          </Button>
        ) : (
          <Button onClick={nextStep}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddLeadFormMultiStep;
