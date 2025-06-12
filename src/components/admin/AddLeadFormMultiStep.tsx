import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/use-toast';
import { Lead, User, Bank } from '@/utils/mockData';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface FormAddress {
  id: string;
  type: "Residence" | "Office" | "Permanent";
  state: string;
  district: string;
  city: string;
  street: string;
  pincode: string;
  requireVerification: boolean;
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

interface Product {
  id: string;
  name: string;
  description: string;
  banks: string[];
}

interface VehicleBrand {
  id: string;
  name: string;
}

interface VehicleModel {
  id: string;
  name: string;
  brandId: string;
}

interface BankBranch {
  id: string;
  name: string;
  code: string;
  bankId: string;
  state: string;
  district: string;
  city: string;
}

interface AddLeadFormMultiStepProps {
  agents: User[];
  banks: Bank[];
  onAddLead: (lead: any) => void;
  onClose: () => void;
  locationData: LocationData;
  editLead?: any;
}

const STEPS = [
  { id: 1, title: 'Bank & Product Info' },
  { id: 2, title: 'Lead Details' },
  { id: 3, title: 'Personal Information' },
  { id: 4, title: 'Residence Address' },
  { id: 5, title: 'Office Address' },
  { id: 6, title: 'Additional Addresses' },
  { id: 7, title: 'Financial Information' },
  { id: 8, title: 'Verification Options' },
  { id: 9, title: 'Agent Assignment' }
];

const AddLeadFormMultiStep = ({ 
  agents, 
  banks, 
  onAddLead, 
  onClose, 
  locationData,
  editLead 
}: AddLeadFormMultiStepProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);

  const [formData, setFormData] = useState({
    // Bank & Product Info
    bankName: '',
    leadType: '',
    initiatedBranch: '',
    buildBranch: '',
    
    // Lead Details
    agencyFileNo: '',
    applicationBarcode: '',
    caseId: '',
    schemeDescription: '',
    loanAmount: '',
    loanType: '',
    vehicleBrandId: '',
    vehicleBrandName: '',
    vehicleModelId: '',
    vehicleModelName: '',
    
    // Personal Information
    customerName: '',
    age: '',
    dateOfBirth: '',
    phoneNumbers: [''],
    email: '',
    designation: '',
    company: '',
    workExperience: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    
    // Address Information
    homeAddresses: [] as FormAddress[],
    officeAddresses: [] as FormAddress[],
    additionalAddresses: [] as FormAddress[],
    
    // Financial Information
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    
    // Verification & Assignment
    visitType: 'Residence' as 'Residence' | 'Office' | 'Both',
    instructions: '',
    assignedAgent: ''
  });

  useEffect(() => {
    loadData();
    if (editLead) {
      populateFormData(editLead);
    } else {
      generateAgencyFileNo();
    }
  }, [editLead]);

  const loadData = () => {
    // Load products
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Initialize default products
      const defaultProducts: Product[] = [
        { id: 'prod-1', name: 'Auto Loans', description: 'Vehicle financing', banks: ['bank-1', 'bank-2'] },
        { id: 'prod-2', name: 'Commercial Vehicles', description: 'Commercial vehicle loans', banks: ['bank-1', 'bank-3'] },
        { id: 'prod-3', name: 'CVCE', description: 'Commercial Vehicle Customer Enquiry', banks: ['bank-2', 'bank-3'] },
        { id: 'prod-4', name: 'Home Loans', description: 'Housing finance', banks: ['bank-1', 'bank-2', 'bank-3'] },
        { id: 'prod-5', name: 'Personal Loans', description: 'Personal financing', banks: ['bank-1', 'bank-2'] }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('products', JSON.stringify(defaultProducts));
    }

    // Load vehicle brands
    const storedBrands = localStorage.getItem('vehicleBrands');
    if (storedBrands) {
      setVehicleBrands(JSON.parse(storedBrands));
    } else {
      const defaultBrands: VehicleBrand[] = [
        { id: 'brand-1', name: 'Maruti Suzuki' },
        { id: 'brand-2', name: 'Hyundai' },
        { id: 'brand-3', name: 'Tata Motors' },
        { id: 'brand-4', name: 'Mahindra' },
        { id: 'brand-5', name: 'Honda' },
        { id: 'brand-6', name: 'Toyota' },
        { id: 'brand-7', name: 'Ford' },
        { id: 'brand-8', name: 'Volkswagen' }
      ];
      setVehicleBrands(defaultBrands);
      localStorage.setItem('vehicleBrands', JSON.stringify(defaultBrands));
    }

    // Load vehicle models
    const storedModels = localStorage.getItem('vehicleModels');
    if (storedModels) {
      setVehicleModels(JSON.parse(storedModels));
    } else {
      const defaultModels: VehicleModel[] = [
        { id: 'model-1', name: 'Swift', brandId: 'brand-1' },
        { id: 'model-2', name: 'Alto', brandId: 'brand-1' },
        { id: 'model-3', name: 'Baleno', brandId: 'brand-1' },
        { id: 'model-4', name: 'i20', brandId: 'brand-2' },
        { id: 'model-5', name: 'Creta', brandId: 'brand-2' },
        { id: 'model-6', name: 'Venue', brandId: 'brand-2' },
        { id: 'model-7', name: 'Nexon', brandId: 'brand-3' },
        { id: 'model-8', name: 'Tiago', brandId: 'brand-3' },
        { id: 'model-9', name: 'XUV700', brandId: 'brand-4' },
        { id: 'model-10', name: 'Scorpio', brandId: 'brand-4' }
      ];
      setVehicleModels(defaultModels);
      localStorage.setItem('vehicleModels', JSON.stringify(defaultModels));
    }

    // Load bank branches
    const storedBranches = localStorage.getItem('bankBranches');
    if (storedBranches) {
      setBankBranches(JSON.parse(storedBranches));
    } else {
      const defaultBranches: BankBranch[] = [
        { id: 'branch-1', name: 'Bangalore Main Branch', code: 'BLR001', bankId: 'bank-1', state: 'Karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
        { id: 'branch-2', name: 'Koramangala Branch', code: 'BLR002', bankId: 'bank-1', state: 'Karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
        { id: 'branch-3', name: 'Electronic City Branch', code: 'BLR003', bankId: 'bank-1', state: 'Karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
        { id: 'branch-4', name: 'Mumbai Central', code: 'MUM001', bankId: 'bank-2', state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai' },
        { id: 'branch-5', name: 'Andheri Branch', code: 'MUM002', bankId: 'bank-2', state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai' },
        { id: 'branch-6', name: 'Bandra Branch', code: 'MUM003', bankId: 'bank-2', state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai' },
        { id: 'branch-7', name: 'Delhi Main', code: 'DEL001', bankId: 'bank-3', state: 'Delhi', district: 'Central Delhi', city: 'Delhi' },
        { id: 'branch-8', name: 'Connaught Place', code: 'DEL002', bankId: 'bank-3', state: 'Delhi', district: 'Central Delhi', city: 'Delhi' }
      ];
      setBankBranches(defaultBranches);
      localStorage.setItem('bankBranches', JSON.stringify(defaultBranches));
    }
  };

  const generateAgencyFileNo = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const agencyFileNo = `AGF${timestamp}${random}`;
    
    setFormData(prev => ({
      ...prev,
      agencyFileNo
    }));
  };

  const populateFormData = (lead: any) => {
    const homeAddr: FormAddress = {
      id: lead.address?.id || `home-${Date.now()}`,
      type: "Residence",
      state: lead.address?.state || '',
      district: lead.address?.district || '',
      city: lead.address?.city || '',
      street: lead.address?.street || '',
      pincode: lead.address?.pincode || '',
      requireVerification: true
    };

    // Parse phone numbers
    const phoneNumbers = lead.additionalDetails?.phoneNumber 
      ? lead.additionalDetails.phoneNumber.split(',').map((p: string) => p.trim())
      : [''];

    setFormData({
      bankName: lead.bank || '',
      leadType: lead.additionalDetails?.leadType || '',
      initiatedBranch: lead.additionalDetails?.bankBranch || '',
      buildBranch: lead.additionalDetails?.bankBranch || '',
      agencyFileNo: lead.additionalDetails?.agencyFileNo || '',
      applicationBarcode: lead.additionalDetails?.applicationBarcode || '',
      caseId: lead.additionalDetails?.caseId || '',
      schemeDescription: lead.additionalDetails?.schemeDesc || '',
      loanAmount: lead.additionalDetails?.loanAmount || '',
      loanType: lead.additionalDetails?.loanType || '',
      vehicleBrandId: lead.additionalDetails?.vehicleBrandId || '',
      vehicleBrandName: lead.additionalDetails?.vehicleBrandName || '',
      vehicleModelId: lead.additionalDetails?.vehicleModelId || '',
      vehicleModelName: lead.additionalDetails?.vehicleModelName || '',
      customerName: lead.name || '',
      age: lead.age?.toString() || '',
      dateOfBirth: lead.additionalDetails?.dateOfBirth || '',
      phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : [''],
      email: lead.additionalDetails?.email || '',
      designation: lead.additionalDetails?.designation || lead.job || '',
      company: lead.additionalDetails?.company || '',
      workExperience: lead.additionalDetails?.workExperience || '',
      monthlyIncome: lead.additionalDetails?.monthlyIncome || '',
      annualIncome: lead.additionalDetails?.annualIncome || '',
      otherIncome: lead.additionalDetails?.otherIncome || '',
      homeAddresses: [homeAddr],
      officeAddresses: [],
      additionalAddresses: [],
      propertyType: lead.additionalDetails?.propertyType || '',
      ownershipStatus: lead.additionalDetails?.ownershipStatus || '',
      propertyAge: lead.additionalDetails?.propertyAge || '',
      visitType: lead.visitType || 'Residence',
      instructions: lead.instructions || '',
      assignedAgent: lead.assignedTo || ''
    });
  };

  const addAddress = (type: keyof Pick<typeof formData, 'homeAddresses' | 'officeAddresses' | 'additionalAddresses'>) => {
    const addressType = type === 'homeAddresses' ? 'Residence' : 
                       type === 'officeAddresses' ? 'Office' : 'Permanent';
    
    const newAddress: FormAddress = {
      id: `${type}-${Date.now()}`,
      type: addressType,
      state: '',
      district: '',
      city: '',
      street: '',
      pincode: '',
      requireVerification: false
    };

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newAddress]
    }));
  };

  const updateAddress = (
    type: keyof Pick<typeof formData, 'homeAddresses' | 'officeAddresses' | 'additionalAddresses'>,
    index: number,
    field: keyof FormAddress,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const removeAddress = (
    type: keyof Pick<typeof formData, 'homeAddresses' | 'officeAddresses' | 'additionalAddresses'>,
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const getAvailableProducts = () => {
    if (!formData.bankName) return [];
    return products.filter(product => 
      product.banks && product.banks.includes(formData.bankName)
    );
  };

  const getBankBranchesByBank = () => {
    if (!formData.bankName) return [];
    return bankBranches.filter(branch => branch.bankId === formData.bankName);
  };

  const getAvailableVehicleModels = () => {
    if (!formData.vehicleBrandId) return [];
    return vehicleModels.filter(model => model.brandId === formData.vehicleBrandId);
  };

  const shouldShowVehicleFields = () => {
    const vehicleRelatedTypes = ['Auto Loans', 'Commercial Vehicles', 'CVCE'];
    return vehicleRelatedTypes.includes(formData.leadType);
  };

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, '']
    }));
  };

  const updatePhoneNumber = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => 
        i === index ? value : phone
      )
    }));
  };

  const removePhoneNumber = (index: number) => {
    if (formData.phoneNumbers.length > 1) {
      setFormData(prev => ({
        ...prev,
        phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index)
      }));
    }
  };

  const getVerificationAddresses = () => {
    const allAddresses = [
      ...formData.homeAddresses,
      ...formData.officeAddresses,
      ...formData.additionalAddresses
    ];
    return allAddresses.filter(addr => addr.requireVerification);
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.customerName || !formData.bankName || !formData.leadType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const leadData = {
      id: editLead?.id || `lead-${Date.now()}`,
      name: formData.customerName,
      age: parseInt(formData.age) || 0,
      job: formData.designation,
      address: formData.homeAddresses[0] ? {
        street: formData.homeAddresses[0].street,
        city: formData.homeAddresses[0].city,
        district: formData.homeAddresses[0].district,
        state: formData.homeAddresses[0].state,
        pincode: formData.homeAddresses[0].pincode
      } : {},
      additionalDetails: {
        agencyFileNo: formData.agencyFileNo,
        applicationBarcode: formData.applicationBarcode,
        caseId: formData.caseId,
        schemeDesc: formData.schemeDescription,
        phoneNumber: formData.phoneNumbers.filter(p => p.trim()).join(', '),
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        company: formData.company,
        designation: formData.designation,
        workExperience: formData.workExperience,
        propertyType: formData.propertyType,
        ownershipStatus: formData.ownershipStatus,
        propertyAge: formData.propertyAge,
        monthlyIncome: formData.monthlyIncome,
        annualIncome: formData.annualIncome,
        otherIncome: formData.otherIncome,
        leadType: formData.leadType,
        loanAmount: formData.loanAmount,
        loanType: formData.loanType,
        vehicleBrandId: formData.vehicleBrandId,
        vehicleBrandName: formData.vehicleBrandName,
        vehicleModelId: formData.vehicleModelId,
        vehicleModelName: formData.vehicleModelName,
        bankBranch: formData.buildBranch,
        addresses: [
          ...formData.homeAddresses,
          ...formData.officeAddresses,
          ...formData.additionalAddresses
        ]
      },
      status: 'Pending' as const,
      bank: formData.bankName,
      visitType: formData.visitType,
      assignedTo: formData.assignedAgent,
      createdAt: editLead?.createdAt || new Date(),
      documents: editLead?.documents || [],
      instructions: formData.instructions
    };

    onAddLead(leadData);
  };

  const renderStepNavigation = () => (
    <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(step.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentStep === step.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {step.id}. {step.title}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAddressForm = (
    address: FormAddress,
    index: number,
    type: keyof Pick<typeof formData, 'homeAddresses' | 'officeAddresses' | 'additionalAddresses'>
  ) => (
    <Card key={address.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{address.type} Address {index + 1}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeAddress(type, index)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>State *</Label>
            <Select
              value={address.state}
              onValueChange={(value) => updateAddress(type, index, 'state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {locationData.states.map((state) => (
                  <SelectItem key={state.id} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>District *</Label>
            <Select
              value={address.district}
              onValueChange={(value) => updateAddress(type, index, 'district', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {locationData.states
                  .find(s => s.name === address.state)?.districts
                  .map((district) => (
                    <SelectItem key={district.id} value={district.name}>
                      {district.name}
                    </SelectItem>
                  )) || []}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>City *</Label>
            <Select
              value={address.city}
              onValueChange={(value) => updateAddress(type, index, 'city', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {locationData.states
                  .find(s => s.name === address.state)?.districts
                  .find(d => d.name === address.district)?.cities
                  .map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  )) || []}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Pincode *</Label>
            <Input
              value={address.pincode}
              onChange={(e) => updateAddress(type, index, 'pincode', e.target.value)}
              placeholder="Enter pincode"
            />
          </div>
        </div>

        <div>
          <Label>Street Address *</Label>
          <Textarea
            value={address.street}
            onChange={(e) => updateAddress(type, index, 'street', e.target.value)}
            placeholder="Enter complete street address"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`verify-${address.id}`}
            checked={address.requireVerification}
            onCheckedChange={(checked) => 
              updateAddress(type, index, 'requireVerification', !!checked)
            }
          />
          <Label htmlFor={`verify-${address.id}`}>
            Require verification for this address
          </Label>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bank & Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Bank *</Label>
                <Select
                  value={formData.bankName}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    bankName: value,
                    leadType: '', // Reset lead type when bank changes
                    initiatedBranch: '',
                    buildBranch: ''
                  }))}
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

              <div>
                <Label>Lead Type/Product *</Label>
                <Select
                  value={formData.leadType}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    leadType: value,
                    vehicleBrandId: '',
                    vehicleBrandName: '',
                    vehicleModelId: '',
                    vehicleModelName: ''
                  }))}
                  disabled={!formData.bankName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead type/product" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableProducts().map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Initiated Under Branch *</Label>
                  <Select
                    value={formData.initiatedBranch}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, initiatedBranch: value }))}
                    disabled={!formData.bankName}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBankBranchesByBank().map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Build Under Branch *</Label>
                  <Select
                    value={formData.buildBranch}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, buildBranch: value }))}
                    disabled={!formData.bankName}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBankBranchesByBank().map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Agency File No. *</Label>
                  <Input
                    value={formData.agencyFileNo}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label>Application Barcode</Label>
                  <Input
                    value={formData.applicationBarcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationBarcode: e.target.value }))}
                    placeholder="Enter application barcode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Case ID</Label>
                  <Input
                    value={formData.caseId}
                    onChange={(e) => setFormData(prev => ({ ...prev, caseId: e.target.value }))}
                    placeholder="Enter case ID"
                  />
                </div>

                <div>
                  <Label>Loan Amount</Label>
                  <Input
                    value={formData.loanAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
                    placeholder="Enter loan amount"
                    type="number"
                  />
                </div>
              </div>

              <div>
                <Label>Scheme Description</Label>
                <Textarea
                  value={formData.schemeDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, schemeDescription: e.target.value }))}
                  placeholder="Enter scheme description"
                  rows={3}
                />
              </div>

              {shouldShowVehicleFields() && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Vehicle Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Vehicle Brand *</Label>
                      <Select
                        value={formData.vehicleBrandId}
                        onValueChange={(value) => {
                          const brand = vehicleBrands.find(b => b.id === value);
                          setFormData(prev => ({ 
                            ...prev, 
                            vehicleBrandId: value,
                            vehicleBrandName: brand?.name || '',
                            vehicleModelId: '',
                            vehicleModelName: ''
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleBrands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Vehicle Model *</Label>
                      <Select
                        value={formData.vehicleModelId}
                        onValueChange={(value) => {
                          const model = vehicleModels.find(m => m.id === value);
                          setFormData(prev => ({ 
                            ...prev, 
                            vehicleModelId: value,
                            vehicleModelName: model?.name || ''
                          }));
                        }}
                        disabled={!formData.vehicleBrandId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle model" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableVehicleModels().map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <Label>Age</Label>
                  <Input
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter age"
                    type="number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    placeholder="YYYY-MM-DD"
                    type="date"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <Label>Phone Numbers *</Label>
                <div className="space-y-2">
                  {formData.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={phone}
                        onChange={(e) => updatePhoneNumber(index, e.target.value)}
                        placeholder="Enter phone number"
                      />
                      {formData.phoneNumbers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePhoneNumber(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPhoneNumber}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Phone Number
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Designation</Label>
                  <Input
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="Enter designation"
                  />
                </div>

                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div>
                <Label>Work Experience</Label>
                <Input
                  value={formData.workExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, workExperience: e.target.value }))}
                  placeholder="Enter work experience"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Residence Addresses</h2>
              <Button
                variant="outline"
                onClick={() => addAddress('homeAddresses')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Residence Address
              </Button>
            </div>
            
            {formData.homeAddresses.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No residence addresses added yet.</p>
                  <Button onClick={() => addAddress('homeAddresses')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Residence Address
                  </Button>
                </CardContent>
              </Card>
            )}

            {formData.homeAddresses.map((address, index) =>
              renderAddressForm(address, index, 'homeAddresses')
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Office Addresses</h2>
              <Button
                variant="outline"
                onClick={() => addAddress('officeAddresses')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Office Address
              </Button>
            </div>
            
            {formData.officeAddresses.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No office addresses added yet.</p>
                  <Button onClick={() => addAddress('officeAddresses')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Office Address
                  </Button>
                </CardContent>
              </Card>
            )}

            {formData.officeAddresses.map((address, index) =>
              renderAddressForm(address, index, 'officeAddresses')
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Additional Addresses</h2>
              <Button
                variant="outline"
                onClick={() => addAddress('additionalAddresses')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Additional Address
              </Button>
            </div>
            
            {formData.additionalAddresses.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No additional addresses added yet.</p>
                  <Button onClick={() => addAddress('additionalAddresses')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Additional Address
                  </Button>
                </CardContent>
              </Card>
            )}

            {formData.additionalAddresses.map((address, index) =>
              renderAddressForm(address, index, 'additionalAddresses')
            )}
          </div>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Monthly Income</Label>
                  <Input
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                    placeholder="Enter monthly income"
                    type="number"
                  />
                </div>

                <div>
                  <Label>Annual Income</Label>
                  <Input
                    value={formData.annualIncome}
                    onChange={(e) => setFormData(prev => ({ ...prev, annualIncome: e.target.value }))}
                    placeholder="Enter annual income"
                    type="number"
                  />
                </div>

                <div>
                  <Label>Other Income</Label>
                  <Input
                    value={formData.otherIncome}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherIncome: e.target.value }))}
                    placeholder="Enter other income"
                    type="number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ownership Status</Label>
                  <Select
                    value={formData.ownershipStatus}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, ownershipStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owned">Owned</SelectItem>
                      <SelectItem value="Rented">Rented</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Property Age</Label>
                  <Input
                    value={formData.propertyAge}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyAge: e.target.value }))}
                    placeholder="Enter property age"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 8:
        const verificationAddresses = getVerificationAddresses();
        
        return (
          <Card>
            <CardHeader>
              <CardTitle>Verification Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationAddresses.length > 0 ? (
                <div>
                  <Label className="text-base font-medium">Addresses selected for verification:</Label>
                  <div className="mt-3 space-y-3">
                    {verificationAddresses.map((address, index) => (
                      <div key={address.id} className="p-3 border rounded-lg bg-gray-50">
                        <Badge variant="outline" className="mb-2">
                          {address.type} Address {index + 1}
                        </Badge>
                        <p className="text-sm">
                          {address.street}, {address.city}, {address.district}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label>Visit Type</Label>
                    <Select
                      value={formData.visitType}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, visitType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residence">Residence Verification</SelectItem>
                        <SelectItem value="Office">Office Verification</SelectItem>
                        <SelectItem value="Both">Both Residence & Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No addresses selected for verification yet.
                  </p>
                  <p className="text-sm text-gray-600">
                    Go back to address steps and check "Require verification" for addresses you want to verify.
                  </p>
                </div>
              )}

              <div>
                <Label>Special Instructions</Label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Enter any special instructions for verification"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 9:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Agent Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Assign to Agent</Label>
                <Select
                  value={formData.assignedAgent}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignedAgent: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No assignment (assign later)</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} - {agent.district || 'No district'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Review Summary</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Customer:</strong> {formData.customerName}</p>
                  <p><strong>Bank:</strong> {banks.find(b => b.id === formData.bankName)?.name}</p>
                  <p><strong>Product:</strong> {formData.leadType}</p>
                  <p><strong>Phone:</strong> {formData.phoneNumbers.filter(p => p.trim()).join(', ')}</p>
                  {shouldShowVehicleFields() && formData.vehicleBrandName && (
                    <p><strong>Vehicle:</strong> {formData.vehicleBrandName} {formData.vehicleModelName}</p>
                  )}
                  <p><strong>Verification Addresses:</strong> {getVerificationAddresses().length}</p>
                  <p><strong>Assigned Agent:</strong> {
                    formData.assignedAgent 
                      ? agents.find(a => a.id === formData.assignedAgent)?.name || 'Unknown'
                      : 'Not assigned'
                  }</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {editLead ? 'Edit Lead' : 'Add New Lead'}
        </h1>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>

      {renderStepNavigation()}

      <div className="mb-6">
        {renderCurrentStep()}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < STEPS.length ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              {editLead ? 'Update Lead' : 'Create Lead'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeadFormMultiStep;
