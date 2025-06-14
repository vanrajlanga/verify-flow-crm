
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { getPropertyTypes } from '@/lib/property-operations';
import { getVehicleBrands, getVehicleTypes, getVehicleModels } from '@/lib/vehicle-operations';
import { getBanks, getBankProducts, getBankBranches } from '@/lib/bank-product-operations';
import { Bank, BankProduct, BankBranch } from '@/types/bank-product';

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
  type: 'Residence' | 'Office' | 'Permanent';
  addressLine1: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

interface CoApplicantAddress {
  type: 'Residence' | 'Office' | 'Permanent';
  addressLine1: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

interface FormData {
  // Bank Selection & Applicant Information
  bankName: string;
  bankProduct: string;
  initiatedUnderBranch: string;
  
  // Applicant Information
  name: string;
  phoneNumber: string;
  addresses: Address[];
  
  // Co-Applicant Information
  hasCoApplicant: boolean;
  coApplicantName: string;
  coApplicantPhone: string;
  coApplicantAddresses: CoApplicantAddress[];
  
  // Professional Details
  company: string;
  designation: string;
  workExperience: string;
  monthlyIncome: string;
  officeAddress: {
    addressLine1: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  
  // Property Details
  propertyType: string;
  ownershipStatus: string;
  propertyAge: string;
  
  // Vehicle Details
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  
  // Financial Information
  annualIncome: string;
  otherIncome: string;
  
  // Documents
  documents: { [key: string]: File | null };
  
  // Final Details
  instructions: string;
}

interface AddLeadFormSingleStepProps {
  onSubmit: (data: FormData) => void;
  locationData: LocationData;
}

const AddLeadFormSingleStep: React.FC<AddLeadFormSingleStepProps> = ({ onSubmit, locationData }) => {
  const [propertyTypes, setPropertyTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [vehicleBrands, setVehicleBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [vehicleTypes, setVehicleTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [vehicleModels, setVehicleModels] = useState<Array<{ id: string; name: string }>>([]);
  
  // Bank & Product Module data
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankProducts, setBankProducts] = useState<BankProduct[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    bankName: '',
    bankProduct: '',
    initiatedUnderBranch: '',
    name: '',
    phoneNumber: '',
    addresses: [{
      type: 'Residence',
      addressLine1: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    }],
    hasCoApplicant: false,
    coApplicantName: '',
    coApplicantPhone: '',
    coApplicantAddresses: [{
      type: 'Residence',
      addressLine1: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    }],
    company: '',
    designation: '',
    workExperience: '',
    monthlyIncome: '',
    officeAddress: {
      addressLine1: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    },
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    annualIncome: '',
    otherIncome: '',
    documents: {},
    instructions: ''
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          propertyTypesData, 
          vehicleBrandsData, 
          vehicleTypesData, 
          vehicleModelsData,
          banksData,
          bankProductsData,
          bankBranchesData
        ] = await Promise.all([
          getPropertyTypes(),
          getVehicleBrands(),
          getVehicleTypes(),
          getVehicleModels(),
          getBanks(),
          getBankProducts(),
          getBankBranches()
        ]);
        
        setPropertyTypes(propertyTypesData);
        setVehicleBrands(vehicleBrandsData);
        setVehicleTypes(vehicleTypesData);
        setVehicleModels(vehicleModelsData);
        setBanks(banksData);
        setBankProducts(bankProductsData);
        setBankBranches(bankBranchesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading form data",
          description: "Failed to load required data. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Filter bank products based on selected bank
  const getFilteredBankProducts = () => {
    if (!selectedBank) return [];
    return bankProducts.filter(product => product.bank_id === selectedBank);
  };

  // Filter bank branches based on selected bank
  const getFilteredBankBranches = () => {
    if (!selectedBank) return [];
    return bankBranches.filter(branch => branch.bank_id === selectedBank);
  };

  // Helper function to get districts based on selected state
  const getDistrictsForState = (stateId: string) => {
    const state = locationData.states.find(s => s.id === stateId || s.name === stateId);
    return state ? state.districts : [];
  };

  // Helper function to get cities based on selected district
  const getCitiesForDistrict = (stateId: string, districtId: string) => {
    const state = locationData.states.find(s => s.id === stateId || s.name === stateId);
    if (!state) return [];
    const district = state.districts.find(d => d.id === districtId || d.name === districtId);
    return district ? district.cities : [];
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

  const handleCoApplicantAddressChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      coApplicantAddresses: prev.coApplicantAddresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const handleOfficeAddressChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      officeAddress: {
        ...prev.officeAddress,
        [field]: value
      }
    }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        type: 'Residence',
        addressLine1: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
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

  const addCoApplicantAddress = () => {
    setFormData(prev => ({
      ...prev,
      coApplicantAddresses: [...prev.coApplicantAddresses, {
        type: 'Residence',
        addressLine1: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      }]
    }));
  };

  const removeCoApplicantAddress = (index: number) => {
    if (formData.coApplicantAddresses.length > 1) {
      setFormData(prev => ({
        ...prev,
        coApplicantAddresses: prev.coApplicantAddresses.filter((_, i) => i !== index)
      }));
    }
  };

  const handleDocumentUpload = (documentType: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.bankName || !formData.bankProduct || !formData.initiatedUnderBranch) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required bank details.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.name || !formData.phoneNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in applicant name and phone number.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.phoneNumber.length !== 10 || !/^\d+$/.test(formData.phoneNumber)) {
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive"
      });
      return false;
    }

    // Validate addresses
    const invalidAddress = formData.addresses.find(addr => 
      !addr.addressLine1 || !addr.city || !addr.district || !addr.state || !addr.pincode
    );
    if (invalidAddress) {
      toast({
        title: "Validation Error",
        description: "Please fill in all address fields.",
        variant: "destructive"
      });
      return false;
    }

    // Validate co-applicant if enabled
    if (formData.hasCoApplicant) {
      if (!formData.coApplicantName || !formData.coApplicantPhone) {
        toast({
          title: "Validation Error",
          description: "Please fill in co-applicant details.",
          variant: "destructive"
        });
        return false;
      }

      if (formData.coApplicantPhone.length !== 10 || !/^\d+$/.test(formData.coApplicantPhone)) {
        toast({
          title: "Validation Error",
          description: "Co-applicant phone number must be exactly 10 digits.",
          variant: "destructive"
        });
        return false;
      }

      const invalidCoApplicantAddress = formData.coApplicantAddresses.find(addr => 
        !addr.addressLine1 || !addr.city || !addr.district || !addr.state || !addr.pincode
      );
      if (invalidCoApplicantAddress) {
        toast({
          title: "Validation Error",
          description: "Please fill in all co-applicant address fields.",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading form data...</div>;
  }

  const isVehicleRelated = formData.bankProduct?.toLowerCase().includes('auto') || 
                          formData.bankProduct?.toLowerCase().includes('vehicle') ||
                          formData.bankProduct?.toLowerCase().includes('car');

  const documentTypes = [
    'Aadhaar Card',
    'PAN Card',
    'Salary Slip',
    'Bank Statement',
    'Property Documents',
    'Income Tax Returns'
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Add New Lead</h2>
        <p className="text-muted-foreground mt-2">Fill in all the required information to create a new lead</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bank Selection & Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Selection & Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Select value={formData.bankName} onValueChange={(value) => {
                  handleInputChange('bankName', value);
                  setSelectedBank(value);
                  handleInputChange('bankProduct', '');
                  handleInputChange('initiatedUnderBranch', '');
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
                <Label htmlFor="bankProduct">Bank Product *</Label>
                <Select 
                  value={formData.bankProduct} 
                  onValueChange={(value) => handleInputChange('bankProduct', value)}
                  disabled={!selectedBank}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank product" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredBankProducts().map(product => (
                      <SelectItem key={product.id} value={product.name}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="initiatedUnderBranch">Initiated Under Branch *</Label>
                <Select 
                  value={formData.initiatedUnderBranch} 
                  onValueChange={(value) => handleInputChange('initiatedUnderBranch', value)}
                  disabled={!selectedBank}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredBankBranches().map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number * (10 digits)</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.addresses.map((address, index) => (
              <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Address {index + 1}</h4>
                  {formData.addresses.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAddress(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="md:col-span-2">
                    <Label>Street Address</Label>
                    <Input
                      value={address.addressLine1}
                      onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div>
                    <Label>State</Label>
                    <Select value={address.state} onValueChange={(value) => {
                      handleAddressChange(index, 'state', value);
                      handleAddressChange(index, 'district', '');
                      handleAddressChange(index, 'city', '');
                    }}>
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

                  <div>
                    <Label>District</Label>
                    <Select 
                      value={address.district} 
                      onValueChange={(value) => {
                        handleAddressChange(index, 'district', value);
                        handleAddressChange(index, 'city', '');
                      }}
                      disabled={!address.state}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDistrictsForState(address.state).map(district => (
                          <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>City</Label>
                    <Select 
                      value={address.city} 
                      onValueChange={(value) => handleAddressChange(index, 'city', value)}
                      disabled={!address.district}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCitiesForDistrict(address.state, address.district).map(city => (
                          <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                        ))}
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
              </Card>
            ))}

            <Button type="button" variant="outline" onClick={addAddress} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Address
            </Button>
          </CardContent>
        </Card>

        {/* Co-Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Co-Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCoApplicant"
                checked={formData.hasCoApplicant}
                onCheckedChange={(checked) => handleInputChange('hasCoApplicant', Boolean(checked))}
              />
              <Label htmlFor="hasCoApplicant">Add Co-Applicant</Label>
            </div>

            {formData.hasCoApplicant && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coApplicantName">Full Name *</Label>
                    <Input
                      id="coApplicantName"
                      value={formData.coApplicantName}
                      onChange={(e) => handleInputChange('coApplicantName', e.target.value)}
                      placeholder="Enter co-applicant full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="coApplicantPhone">Phone Number * (10 digits)</Label>
                    <Input
                      id="coApplicantPhone"
                      value={formData.coApplicantPhone}
                      onChange={(e) => handleInputChange('coApplicantPhone', e.target.value)}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Co-Applicant Address Information</h4>
                  
                  {formData.coApplicantAddresses.map((address, index) => (
                    <Card key={index} className="p-4 border-l-4 border-l-green-500">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-medium">Co-Applicant Address {index + 1}</h5>
                        {formData.coApplicantAddresses.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCoApplicantAddress(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Address Type</Label>
                          <Select value={address.type} onValueChange={(value: 'Residence' | 'Office' | 'Permanent') => handleCoApplicantAddressChange(index, 'type', value)}>
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

                        <div className="md:col-span-2">
                          <Label>Street Address</Label>
                          <Input
                            value={address.addressLine1}
                            onChange={(e) => handleCoApplicantAddressChange(index, 'addressLine1', e.target.value)}
                            placeholder="Enter street address"
                          />
                        </div>

                        <div>
                          <Label>State</Label>
                          <Select value={address.state} onValueChange={(value) => {
                            handleCoApplicantAddressChange(index, 'state', value);
                            handleCoApplicantAddressChange(index, 'district', '');
                            handleCoApplicantAddressChange(index, 'city', '');
                          }}>
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

                        <div>
                          <Label>District</Label>
                          <Select 
                            value={address.district} 
                            onValueChange={(value) => {
                              handleCoApplicantAddressChange(index, 'district', value);
                              handleCoApplicantAddressChange(index, 'city', '');
                            }}
                            disabled={!address.state}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                            <SelectContent>
                              {getDistrictsForState(address.state).map(district => (
                                <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>City</Label>
                          <Select 
                            value={address.city} 
                            onValueChange={(value) => handleCoApplicantAddressChange(index, 'city', value)}
                            disabled={!address.district}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCitiesForDistrict(address.state, address.district).map(city => (
                                <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Pincode</Label>
                          <Input
                            value={address.pincode}
                            onChange={(e) => handleCoApplicantAddressChange(index, 'pincode', e.target.value)}
                            placeholder="Enter pincode"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button type="button" variant="outline" onClick={addCoApplicantAddress} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Co-Applicant Address
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="space-y-4">
              <h4 className="font-semibold">Office Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <Label>Street Address</Label>
                  <Input
                    value={formData.officeAddress.addressLine1}
                    onChange={(e) => handleOfficeAddressChange('addressLine1', e.target.value)}
                    placeholder="Enter office street address"
                  />
                </div>

                <div>
                  <Label>State</Label>
                  <Select value={formData.officeAddress.state} onValueChange={(value) => {
                    handleOfficeAddressChange('state', value);
                    handleOfficeAddressChange('district', '');
                    handleOfficeAddressChange('city', '');
                  }}>
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

                <div>
                  <Label>District</Label>
                  <Select 
                    value={formData.officeAddress.district} 
                    onValueChange={(value) => {
                      handleOfficeAddressChange('district', value);
                      handleOfficeAddressChange('city', '');
                    }}
                    disabled={!formData.officeAddress.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDistrictsForState(formData.officeAddress.state).map(district => (
                        <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>City</Label>
                  <Select 
                    value={formData.officeAddress.city} 
                    onValueChange={(value) => handleOfficeAddressChange('city', value)}
                    disabled={!formData.officeAddress.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCitiesForDistrict(formData.officeAddress.state, formData.officeAddress.district).map(city => (
                        <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={formData.officeAddress.pincode}
                    onChange={(e) => handleOfficeAddressChange('pincode', e.target.value)}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </CardContent>
        </Card>

        {/* Vehicle Details (conditional) */}
        {isVehicleRelated && (
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </CardContent>
          </Card>
        )}

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map(docType => (
                <div key={docType} className="space-y-2">
                  <Label className="text-sm font-medium">{docType}</Label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleDocumentUpload(docType, file);
                      }
                    }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Final Details & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Final Details & Assignment</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            Create Lead
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLeadFormSingleStep;
