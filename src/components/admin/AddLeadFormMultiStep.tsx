
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lead, Address, AdditionalDetails } from '@/utils/mockData';
import { ArrowLeft, ArrowRight, X, Upload, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Bank, BankProduct, BankBranch } from '@/types/bank-product';
import { getBanks, getBankProducts, getBankBranches, getBankProductsByBankId, getBankBranchesByBankId } from '@/lib/bank-product-operations';
import { getPropertyTypes, PropertyType } from '@/lib/property-operations';
import { getVehicleBrands, getVehicleTypes, getVehicleModels, VehicleBrand, VehicleType, VehicleModel } from '@/lib/vehicle-operations';
import { supabase } from '@/integrations/supabase/client';

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

interface FormAddress {
  id: string;
  type: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  requiresVerification: boolean;
}

interface AddLeadFormMultiStepProps {
  agents: User[];
  banks: any[];
  onAddLead: (lead: Lead) => void;
  onClose: () => void;
  locationData: LocationData;
}

const AddLeadFormMultiStep = ({ agents, banks: oldBanks, onAddLead, onClose, locationData }: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankProducts, setBankProducts] = useState<BankProduct[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BankProduct[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<BankBranch[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [addresses, setAddresses] = useState<FormAddress[]>([{
    id: '1',
    type: 'residence',
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    requiresVerification: false
  }]);
  const [documentUploads, setDocumentUploads] = useState<{[key: string]: File | null}>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<{[key: string]: string}>({});

  // Form data state - 9-step structure
  const [formData, setFormData] = useState({
    // Step 1: Lead Type & Basic Info
    leadType: '',
    bankProduct: '',
    name: '',
    age: '',
    phoneNumber: '',
    email: '',
    selectedBank: '',
    initiatedUnderBranch: '',
    buildUnderBranch: '',
    
    // Step 3: Professional Details
    job: '',
    company: '',
    designation: '',
    workExperience: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    officeStreet: '',
    officeCity: '',
    officeDistrict: '',
    officeState: '',
    officePincode: '',
    officeRequiresVerification: false,
    
    // Step 4: Property Details
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    
    // Step 5: Vehicle Details
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePrice: '',
    downPayment: '',
    
    // Step 6: Loan Details
    loanAmount: '',
    loanTenure: '',
    loanPurpose: '',
    existingLoans: '',
    
    // Step 7: Documents
    documentsRequired: [] as string[],
    documentsReceived: [] as string[],
    pendingDocuments: '',
    
    // Step 8: References
    reference1Name: '',
    reference1Phone: '',
    reference1Relation: '',
    reference2Name: '',
    reference2Phone: '',
    reference2Relation: '',
    
    // Step 9: Final Details & Assignment
    hasCoApplicant: false,
    coApplicantName: '',
    coApplicantPhone: '',
    coApplicantRelation: '',
    instructions: '',
    additionalComments: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.selectedBank) {
      loadBankProducts(formData.selectedBank);
      loadBankBranches(formData.selectedBank);
    }
  }, [formData.selectedBank]);

  const loadInitialData = async () => {
    try {
      const [banksData, propertyTypesData, vehicleBrandsData, vehicleTypesData, vehicleModelsData] = await Promise.all([
        getBanks(),
        getPropertyTypes(),
        getVehicleBrands(),
        getVehicleTypes(),
        getVehicleModels()
      ]);
      setBanks(banksData);
      setPropertyTypes(propertyTypesData);
      setVehicleBrands(vehicleBrandsData);
      setVehicleTypes(vehicleTypesData);
      setVehicleModels(vehicleModelsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadBankProducts = async (bankId: string) => {
    try {
      const products = await getBankProductsByBankId(bankId);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error loading bank products:', error);
    }
  };

  const loadBankBranches = async (bankId: string) => {
    try {
      const branches = await getBankBranchesByBankId(bankId);
      setFilteredBranches(branches);
    } catch (error) {
      console.error('Error loading bank branches:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAddress = () => {
    const newAddress: FormAddress = {
      id: Date.now().toString(),
      type: 'residence',
      street: '',
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

  const updateAddress = (id: string, field: string, value: any) => {
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const getFilteredDistricts = (stateId: string) => {
    const state = locationData.states.find(s => s.id === stateId);
    return state ? state.districts : [];
  };

  const getFilteredCities = (stateId: string, districtId: string) => {
    const state = locationData.states.find(s => s.id === stateId);
    const district = state?.districts.find(d => d.id === districtId);
    return district ? district.cities : [];
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
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('lead-documents')
        .getPublicUrl(filePath);

      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: data.publicUrl
      }));

      toast({
        title: "Success",
        description: `${documentType} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${documentType}`,
        variant: "destructive",
      });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast({ title: "Error", description: "Name is required", variant: "destructive" });
          return false;
        }
        if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
          toast({ title: "Error", description: "Phone number must be 10 digits", variant: "destructive" });
          return false;
        }
        if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120)) {
          toast({ title: "Error", description: "Please enter a valid age", variant: "destructive" });
          return false;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Skip vehicle step if not auto loan
      if (currentStep === 4) {
        const selectedProduct = filteredProducts.find(p => p.id === formData.bankProduct);
        if (selectedProduct && !selectedProduct.name.toLowerCase().includes('auto')) {
          setCurrentStep(6); // Skip to loan details
          return;
        }
      }
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const handlePrev = () => {
    // Skip vehicle step backwards if not auto loan
    if (currentStep === 6) {
      const selectedProduct = filteredProducts.find(p => p.id === formData.bankProduct);
      if (selectedProduct && !selectedProduct.name.toLowerCase().includes('auto')) {
        setCurrentStep(4); // Skip back to property details
        return;
      }
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // Create the lead object
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formData.name || 'Unknown',
      age: parseInt(formData.age) || 0,
      job: formData.job || '',
      address: addresses[0] ? {
        street: addresses[0].street,
        city: addresses[0].city,
        district: addresses[0].district,
        state: addresses[0].state,
        pincode: addresses[0].pincode
      } : {
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      },
      additionalDetails: {
        company: formData.company || '',
        designation: formData.designation || '',
        workExperience: formData.workExperience || '',
        propertyType: formData.propertyType || '',
        ownershipStatus: formData.ownershipStatus || '',
        propertyAge: formData.propertyAge || '',
        monthlyIncome: formData.monthlyIncome || '',
        annualIncome: formData.annualIncome || '',
        otherIncome: formData.otherIncome || '',
        phoneNumber: formData.phoneNumber || '',
        email: formData.email || '',
        leadType: formData.leadType || '',
        bankBranch: formData.initiatedUnderBranch || '',
        additionalComments: formData.additionalComments || '',
        addresses: addresses.map(addr => ({
          type: addr.type,
          street: addr.street,
          city: addr.city,
          district: addr.district,
          state: addr.state,
          pincode: addr.pincode
        }))
      },
      status: 'Pending',
      bank: formData.selectedBank || '',
      visitType: 'Residence',
      assignedTo: '',
      createdAt: new Date(),
      verificationDate: undefined,
      documents: [],
      instructions: formData.instructions || ''
    };

    onAddLead(newLead);
  };

  // Document options for step 7
  const documentOptions = [
    'Aadhar Card',
    'PAN Card',
    'Salary Slips',
    'Bank Statements',
    'Property Documents',
    'Income Tax Returns',
    'Form 16',
    'Passport Size Photos',
    'Utility Bills',
    'Employment Certificate'
  ];

  const relationshipOptions = ['Parents', 'Sibling', 'Spouse', 'Friends', 'Others'];
  const ownershipOptions = ['Owned', 'Parental', 'Rental', 'Others'];

  const handleDocumentChange = (document: string, checked: boolean, type: 'required' | 'received') => {
    const field = type === 'required' ? 'documentsRequired' : 'documentsReceived';
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], document]
        : prev[field].filter(doc => doc !== document)
    }));
  };

  // Check if current step should be skipped
  const shouldShowVehicleStep = () => {
    const selectedProduct = filteredProducts.find(p => p.id === formData.bankProduct);
    return selectedProduct && selectedProduct.name.toLowerCase().includes('auto');
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Lead Type & Basic Information</CardTitle>
        <CardDescription>Enter basic lead information and bank details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankName">Bank Name *</Label>
            <Select value={formData.selectedBank} onValueChange={(value) => handleInputChange('selectedBank', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bankProduct">Bank Product</Label>
            <Select 
              value={formData.bankProduct} 
              onValueChange={(value) => handleInputChange('bankProduct', value)}
              disabled={!formData.selectedBank}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="initiatedUnderBranch">Initiated Under Branch</Label>
            <Select 
              value={formData.initiatedUnderBranch} 
              onValueChange={(value) => handleInputChange('initiatedUnderBranch', value)}
              disabled={!formData.selectedBank}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {filteredBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="buildUnderBranch">Build Under Branch</Label>
            <Select 
              value={formData.buildUnderBranch} 
              onValueChange={(value) => handleInputChange('buildUnderBranch', value)}
              disabled={!formData.selectedBank}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {filteredBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter age"
              min="1"
              max="120"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number (10 digits)</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Address Information</CardTitle>
        <CardDescription>Enter customer address details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.map((address, index) => (
          <div key={address.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Address {index + 1}</Label>
              {addresses.length > 1 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removeAddress(address.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Address Type</Label>
                <Select 
                  value={address.type} 
                  onValueChange={(value) => updateAddress(address.id, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residence">Residence</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Street Address</Label>
                <Textarea
                  value={address.street}
                  onChange={(e) => updateAddress(address.id, 'street', e.target.value)}
                  placeholder="Enter street address"
                  rows={2}
                />
              </div>

              <div>
                <Label>State</Label>
                <Select 
                  value={address.state} 
                  onValueChange={(value) => {
                    updateAddress(address.id, 'state', value);
                    updateAddress(address.id, 'district', '');
                    updateAddress(address.id, 'city', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData.states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>District</Label>
                <Select 
                  value={address.district} 
                  onValueChange={(value) => {
                    updateAddress(address.id, 'district', value);
                    updateAddress(address.id, 'city', '');
                  }}
                  disabled={!address.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredDistricts(address.state).map((district) => (
                      <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>City</Label>
                <Select 
                  value={address.city} 
                  onValueChange={(value) => updateAddress(address.id, 'city', value)}
                  disabled={!address.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredCities(address.state, address.district).map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Pincode</Label>
                <Input
                  value={address.pincode}
                  onChange={(e) => updateAddress(address.id, 'pincode', e.target.value)}
                  placeholder="Enter pincode"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`verify-${address.id}`}
                    checked={address.requiresVerification}
                    onCheckedChange={(checked) => updateAddress(address.id, 'requiresVerification', checked)}
                  />
                  <Label htmlFor={`verify-${address.id}`}>This address requires verification</Label>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addAddress} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Another Address
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Professional Details</CardTitle>
        <CardDescription>Enter employment and income information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="job">Job Title</Label>
            <Input
              id="job"
              value={formData.job}
              onChange={(e) => handleInputChange('job', e.target.value)}
              placeholder="Enter job title"
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
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

          <div>
            <Label htmlFor="annualIncome">Annual Income</Label>
            <Input
              id="annualIncome"
              value={formData.annualIncome}
              onChange={(e) => handleInputChange('annualIncome', e.target.value)}
              placeholder="Enter annual income"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="otherIncome">Other Income Sources</Label>
            <Textarea
              id="otherIncome"
              value={formData.otherIncome}
              onChange={(e) => handleInputChange('otherIncome', e.target.value)}
              placeholder="Enter other income sources"
              rows={2}
            />
          </div>
        </div>

        {/* Office Address Section */}
        <div className="mt-6 p-4 border rounded-lg space-y-4">
          <Label className="text-base font-semibold">Office Address</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Office Street Address</Label>
              <Textarea
                value={formData.officeStreet}
                onChange={(e) => handleInputChange('officeStreet', e.target.value)}
                placeholder="Enter office street address"
                rows={2}
              />
            </div>

            <div>
              <Label>Office State</Label>
              <Select 
                value={formData.officeState} 
                onValueChange={(value) => {
                  handleInputChange('officeState', value);
                  handleInputChange('officeDistrict', '');
                  handleInputChange('officeCity', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {locationData.states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Office District</Label>
              <Select 
                value={formData.officeDistrict} 
                onValueChange={(value) => {
                  handleInputChange('officeDistrict', value);
                  handleInputChange('officeCity', '');
                }}
                disabled={!formData.officeState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredDistricts(formData.officeState).map((district) => (
                    <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Office City</Label>
              <Select 
                value={formData.officeCity} 
                onValueChange={(value) => handleInputChange('officeCity', value)}
                disabled={!formData.officeDistrict}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredCities(formData.officeState, formData.officeDistrict).map((city) => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Office Pincode</Label>
              <Input
                value={formData.officePincode}
                onChange={(e) => handleInputChange('officePincode', e.target.value)}
                placeholder="Enter office pincode"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="office-verify"
                  checked={formData.officeRequiresVerification}
                  onCheckedChange={(checked) => handleInputChange('officeRequiresVerification', checked)}
                />
                <Label htmlFor="office-verify">This office address requires verification</Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Property Details</CardTitle>
        <CardDescription>Enter property information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select 
              value={formData.propertyType} 
              onValueChange={(value) => handleInputChange('propertyType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ownershipStatus">Ownership Status</Label>
            <Select 
              value={formData.ownershipStatus} 
              onValueChange={(value) => handleInputChange('ownershipStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ownership status" />
              </SelectTrigger>
              <SelectContent>
                {ownershipOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
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
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Vehicle Details</CardTitle>
        <CardDescription>Enter vehicle information (Auto Loan)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select 
              value={formData.vehicleType} 
              onValueChange={(value) => handleInputChange('vehicleType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
            <Select 
              value={formData.vehicleBrand} 
              onValueChange={(value) => handleInputChange('vehicleBrand', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle brand" />
              </SelectTrigger>
              <SelectContent>
                {vehicleBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vehicleModel">Vehicle Model</Label>
            <Select 
              value={formData.vehicleModel} 
              onValueChange={(value) => handleInputChange('vehicleModel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle model" />
              </SelectTrigger>
              <SelectContent>
                {vehicleModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vehicleYear">Vehicle Year</Label>
            <Input
              id="vehicleYear"
              value={formData.vehicleYear}
              onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
              placeholder="Enter vehicle year"
            />
          </div>

          <div>
            <Label htmlFor="vehiclePrice">Vehicle Price</Label>
            <Input
              id="vehiclePrice"
              value={formData.vehiclePrice}
              onChange={(e) => handleInputChange('vehiclePrice', e.target.value)}
              placeholder="Enter vehicle price"
            />
          </div>

          <div>
            <Label htmlFor="downPayment">Down Payment</Label>
            <Input
              id="downPayment"
              value={formData.downPayment}
              onChange={(e) => handleInputChange('downPayment', e.target.value)}
              placeholder="Enter down payment"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep6 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 6: Loan Details</CardTitle>
        <CardDescription>Enter loan-specific information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              id="loanAmount"
              value={formData.loanAmount}
              onChange={(e) => handleInputChange('loanAmount', e.target.value)}
              placeholder="Enter loan amount"
            />
          </div>

          <div>
            <Label htmlFor="loanTenure">Loan Tenure</Label>
            <Input
              id="loanTenure"
              value={formData.loanTenure}
              onChange={(e) => handleInputChange('loanTenure', e.target.value)}
              placeholder="Enter loan tenure"
            />
          </div>

          <div>
            <Label htmlFor="loanPurpose">Loan Purpose</Label>
            <Input
              id="loanPurpose"
              value={formData.loanPurpose}
              onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
              placeholder="Enter loan purpose"
            />
          </div>

          <div>
            <Label htmlFor="existingLoans">Existing Loans</Label>
            <Textarea
              id="existingLoans"
              value={formData.existingLoans}
              onChange={(e) => handleInputChange('existingLoans', e.target.value)}
              placeholder="Enter details of existing loans"
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep7 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 7: Documents</CardTitle>
        <CardDescription>Select required and received documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-semibold">Documents Required</Label>
            <div className="space-y-2 mt-2">
              {documentOptions.map((doc) => (
                <div key={doc} className="flex items-center space-x-2">
                  <Checkbox
                    id={`required-${doc}`}
                    checked={formData.documentsRequired.includes(doc)}
                    onCheckedChange={(checked) => handleDocumentChange(doc, !!checked, 'required')}
                  />
                  <Label htmlFor={`required-${doc}`} className="text-sm">{doc}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Documents Received</Label>
            <div className="space-y-3 mt-2">
              {documentOptions.map((doc) => (
                <div key={doc} className="flex items-center justify-between space-x-2 p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`received-${doc}`}
                      checked={formData.documentsReceived.includes(doc)}
                      onCheckedChange={(checked) => handleDocumentChange(doc, !!checked, 'received')}
                    />
                    <Label htmlFor={`received-${doc}`} className="text-sm">{doc}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDocumentUploads(prev => ({ ...prev, [doc]: file }));
                        }
                      }}
                      className="hidden"
                      id={`upload-${doc}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const file = documentUploads[doc];
                        if (file) {
                          handleDocumentUpload(doc, file);
                        } else {
                          document.getElementById(`upload-${doc}`)?.click();
                        }
                      }}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {documentUploads[doc] ? 'Upload' : 'Choose'}
                    </Button>
                    {uploadedDocuments[doc] && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(uploadedDocuments[doc], '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="pendingDocuments">Pending Documents / Notes</Label>
          <Textarea
            id="pendingDocuments"
            value={formData.pendingDocuments}
            onChange={(e) => handleInputChange('pendingDocuments', e.target.value)}
            placeholder="Enter details about pending documents or additional notes"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep8 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 8: References</CardTitle>
        <CardDescription>Enter reference contact information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Reference 1</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label htmlFor="reference1Name">Name</Label>
                <Input
                  id="reference1Name"
                  value={formData.reference1Name}
                  onChange={(e) => handleInputChange('reference1Name', e.target.value)}
                  placeholder="Enter reference name"
                />
              </div>
              <div>
                <Label htmlFor="reference1Phone">Phone</Label>
                <Input
                  id="reference1Phone"
                  value={formData.reference1Phone}
                  onChange={(e) => handleInputChange('reference1Phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="reference1Relation">Relationship</Label>
                <Select 
                  value={formData.reference1Relation} 
                  onValueChange={(value) => handleInputChange('reference1Relation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Reference 2</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label htmlFor="reference2Name">Name</Label>
                <Input
                  id="reference2Name"
                  value={formData.reference2Name}
                  onChange={(e) => handleInputChange('reference2Name', e.target.value)}
                  placeholder="Enter reference name"
                />
              </div>
              <div>
                <Label htmlFor="reference2Phone">Phone</Label>
                <Input
                  id="reference2Phone"
                  value={formData.reference2Phone}
                  onChange={(e) => handleInputChange('reference2Phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="reference2Relation">Relationship</Label>
                <Select 
                  value={formData.reference2Relation} 
                  onValueChange={(value) => handleInputChange('reference2Relation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep9 = () => {
    const addressesToVerify = [
      ...addresses.filter(addr => addr.requiresVerification),
      ...(formData.officeRequiresVerification && formData.officeStreet ? [{
        id: 'office',
        type: 'office',
        street: formData.officeStreet,
        city: formData.officeCity,
        district: formData.officeDistrict,
        state: formData.officeState,
        pincode: formData.officePincode,
        requiresVerification: true
      }] : [])
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 9: Final Details & Assignment</CardTitle>
          <CardDescription>Co-applicant details and verification assignment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCoApplicant"
                checked={formData.hasCoApplicant}
                onCheckedChange={(checked) => handleInputChange('hasCoApplicant', checked)}
              />
              <Label htmlFor="hasCoApplicant">Has Co-Applicant</Label>
            </div>

            {formData.hasCoApplicant && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="coApplicantName">Co-Applicant Name</Label>
                  <Input
                    id="coApplicantName"
                    value={formData.coApplicantName}
                    onChange={(e) => handleInputChange('coApplicantName', e.target.value)}
                    placeholder="Enter co-applicant name"
                  />
                </div>
                <div>
                  <Label htmlFor="coApplicantPhone">Co-Applicant Phone</Label>
                  <Input
                    id="coApplicantPhone"
                    value={formData.coApplicantPhone}
                    onChange={(e) => handleInputChange('coApplicantPhone', e.target.value)}
                    placeholder="Enter co-applicant phone"
                  />
                </div>
                <div>
                  <Label htmlFor="coApplicantRelation">Relationship</Label>
                  <Select 
                    value={formData.coApplicantRelation} 
                    onValueChange={(value) => handleInputChange('coApplicantRelation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Addresses to Verify */}
            {addressesToVerify.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Addresses for Verification</Label>
                {addressesToVerify.map((address, index) => (
                  <div key={address.id} className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Label className="font-medium">
                          {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address {index + 1}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.street}, {address.city}, {address.district}, {address.state} - {address.pincode}
                        </p>
                      </div>
                      <div className="min-w-[200px]">
                        <Label>Assign Agent</Label>
                        <Select>
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Enter any special instructions for the agent"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="additionalComments">Additional Comments</Label>
              <Textarea
                id="additionalComments"
                value={formData.additionalComments}
                onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                placeholder="Enter any additional comments"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return shouldShowVehicleStep() ? renderStep5() : renderStep6();
      case 6:
        return shouldShowVehicleStep() ? renderStep6() : renderStep7();
      case 7:
        return shouldShowVehicleStep() ? renderStep7() : renderStep8();
      case 8:
        return shouldShowVehicleStep() ? renderStep8() : renderStep9();
      case 9:
        return renderStep9();
      default:
        return renderStep1();
    }
  };

  const getStepNumber = () => {
    if (!shouldShowVehicleStep() && currentStep > 4) {
      return currentStep - 1;
    }
    return currentStep;
  };

  const getTotalSteps = () => {
    return shouldShowVehicleStep() ? 9 : 8;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Lead</h1>
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8 overflow-x-auto">
        {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs ${
              step === getStepNumber()
                ? 'border-blue-500 bg-blue-500 text-white'
                : step < getStepNumber()
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 bg-white text-gray-400'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {renderStepContent()}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="space-x-2">
          {currentStep < getTotalSteps() ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Create Lead
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeadFormMultiStep;
