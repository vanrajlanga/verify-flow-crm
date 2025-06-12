
import { useState, useEffect } from 'react';
import { User, Bank, Product, BankBranch, VehicleBrand, VehicleModel } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';

interface AddLeadFormMultiStepProps {
  agents: User[];
  banks: Bank[];
  onAddLead: (lead: any) => void;
  onClose: () => void;
  locationData: any;
  editLead: any;
}

const AddLeadFormMultiStep = ({ agents, banks, onAddLead, onClose, locationData, editLead }: AddLeadFormMultiStepProps) => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [formData, setFormData] = useState<any>({
    // Step 1: Basic Information
    name: '',
    age: '',
    job: '',
    phone: '',
    
    // Step 2: Primary Address
    address: {
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    },
    
    // Step 3: Additional Address
    additionalAddresses: [{
      type: 'Office',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    }],
    
    // Step 4: Employment Details
    company: '',
    designation: '',
    workExperience: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    
    // Step 5: Property Information
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    
    // Step 6: Contact & Personal Details
    email: '',
    dateOfBirth: '',
    
    // Step 7: Bank & Product Information
    bank: '',
    leadType: '',
    leadTypeId: '',
    bankBranch: '',
    
    // Step 8: Vehicle Information (if applicable)
    vehicleBrandId: '',
    vehicleBrandName: '',
    vehicleModelId: '',
    vehicleModelName: '',
    
    // Step 9: Financial Details
    loanAmount: '',
    loanType: '',
    agencyFileNo: '',
    applicationBarcode: '',
    caseId: '',
    schemeDesc: '',
    
    // Step 10: Assignment & Review
    assignedTo: '',
    additionalComments: ''
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    console.log('Component mounting, initializing data...');
    loadAllData();
    
    // Pre-populate form if editing
    if (editLead) {
      console.log('Pre-populating form with edit data:', editLead);
      setFormData({
        ...editLead,
        additionalAddresses: editLead.additionalDetails?.addresses || [{
          type: 'Office',
          street: '',
          city: '',
          district: '',
          state: '',
          pincode: ''
        }],
        company: editLead.additionalDetails?.company || '',
        designation: editLead.additionalDetails?.designation || '',
        workExperience: editLead.additionalDetails?.workExperience || '',
        monthlyIncome: editLead.additionalDetails?.monthlyIncome || '',
        annualIncome: editLead.additionalDetails?.annualIncome || '',
        otherIncome: editLead.additionalDetails?.otherIncome || '',
        propertyType: editLead.additionalDetails?.propertyType || '',
        ownershipStatus: editLead.additionalDetails?.ownershipStatus || '',
        propertyAge: editLead.additionalDetails?.propertyAge || '',
        email: editLead.additionalDetails?.email || '',
        dateOfBirth: editLead.additionalDetails?.dateOfBirth || '',
        leadType: editLead.additionalDetails?.leadType || '',
        leadTypeId: editLead.additionalDetails?.leadTypeId || '',
        bankBranch: editLead.additionalDetails?.bankBranch || '',
        vehicleBrandId: editLead.additionalDetails?.vehicleBrandId || '',
        vehicleBrandName: editLead.additionalDetails?.vehicleBrandName || '',
        vehicleModelId: editLead.additionalDetails?.vehicleModelId || '',
        vehicleModelName: editLead.additionalDetails?.vehicleModelName || '',
        loanAmount: editLead.additionalDetails?.loanAmount || '',
        loanType: editLead.additionalDetails?.loanType || '',
        agencyFileNo: editLead.additionalDetails?.agencyFileNo || '',
        applicationBarcode: editLead.additionalDetails?.applicationBarcode || '',
        caseId: editLead.additionalDetails?.caseId || '',
        schemeDesc: editLead.additionalDetails?.schemeDesc || '',
        additionalComments: editLead.additionalDetails?.additionalComments || ''
      });
    }
  }, [editLead]);

  const loadAllData = async () => {
    console.log('Loading all data...');
    
    // Load products from localStorage with database fallback
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      console.log('Products loaded from storage:', parsedProducts);
      setProducts(parsedProducts);
    } else {
      const defaultProducts = [
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
    const storedVehicleBrands = localStorage.getItem('vehicleBrands');
    if (storedVehicleBrands) {
      const parsedBrands = JSON.parse(storedVehicleBrands);
      setVehicleBrands(parsedBrands);
    } else {
      const defaultBrands = [
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
    const storedVehicleModels = localStorage.getItem('vehicleModels');
    if (storedVehicleModels) {
      const parsedModels = JSON.parse(storedVehicleModels);
      setVehicleModels(parsedModels);
    } else {
      const defaultModels = [
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
    const storedBankBranches = localStorage.getItem('bankBranches');
    if (storedBankBranches) {
      const parsedBranches = JSON.parse(storedBranches);
      setBankBranches(parsedBranches);
    } else {
      const defaultBranches = [
        { id: 'branch-1', name: 'Bangalore Main Branch', code: 'BLR001', bankId: 'bank-1', bankName: 'State Bank of India', city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban' },
        { id: 'branch-2', name: 'Koramangala Branch', code: 'BLR002', bankId: 'bank-1', bankName: 'State Bank of India', city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban' },
        { id: 'branch-3', name: 'Electronic City Branch', code: 'BLR003', bankId: 'bank-1', bankName: 'State Bank of India', city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban' },
        { id: 'branch-4', name: 'Mumbai Central', code: 'MUM001', bankId: 'bank-2', bankName: 'HDFC Bank', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
        { id: 'branch-5', name: 'Andheri Branch', code: 'MUM002', bankId: 'bank-2', bankName: 'HDFC Bank', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
        { id: 'branch-6', name: 'Bandra Branch', code: 'MUM003', bankId: 'bank-2', bankName: 'HDFC Bank', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
        { id: 'branch-7', name: 'Delhi Main', code: 'DEL001', bankId: 'bank-3', bankName: 'ICICI Bank', city: 'Delhi', state: 'Delhi', district: 'Central Delhi' },
        { id: 'branch-8', name: 'Connaught Place', code: 'DEL002', bankId: 'bank-3', bankName: 'ICICI Bank', city: 'Delhi', state: 'Delhi', district: 'Central Delhi' }
      ];
      setBankBranches(defaultBranches);
      localStorage.setItem('bankBranches', JSON.stringify(defaultBranches));
    }
  };

  // Validation functions for each step
  const validateStep1 = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0) newErrors.age = 'Valid age is required';
    if (!formData.job.trim()) newErrors.job = 'Job is required';
    if (formData.phone && formData.phone.length > 10) newErrors.phone = 'Phone number cannot exceed 10 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: any = {};
    if (!formData.address.street.trim()) newErrors.street = 'Street is required';
    if (!formData.address.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.state.trim()) newErrors.state = 'State is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    // Additional address is optional, so no validation needed
    return true;
  };

  const validateStep4 = () => {
    const newErrors: any = {};
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = () => {
    // Property information is optional for some lead types
    return true;
  };

  const validateStep6 = () => {
    const newErrors: any = {};
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep7 = () => {
    const newErrors: any = {};
    if (!formData.bank) newErrors.bank = 'Bank selection is required';
    if (!formData.leadTypeId) newErrors.leadType = 'Lead type/product is required';
    if (!formData.bankBranch) newErrors.bankBranch = 'Branch selection is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep8 = () => {
    const newErrors: any = {};
    if (shouldShowVehicleFields()) {
      if (!formData.vehicleBrandId) newErrors.vehicleBrand = 'Vehicle brand is required';
      if (!formData.vehicleModelId) newErrors.vehicleModel = 'Vehicle model is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep9 = () => {
    // Financial details are mostly optional
    return true;
  };

  const validateStep10 = () => {
    const newErrors: any = {};
    if (!formData.assignedTo) newErrors.assignedTo = 'Agent assignment is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if vehicle fields should be shown
  const shouldShowVehicleFields = () => {
    const vehicleRelatedProducts = ['Auto Loans', 'Commercial Vehicles', 'CVCE'];
    return vehicleRelatedProducts.includes(formData.leadType);
  };

  // Handlers
  const handleChange = (field: string, value: string) => {
    if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [field]: numericValue }));
      return;
    }
    if (field === 'age') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [field]: numericValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleAdditionalAddressChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalAddresses: prev.additionalAddresses.map((addr: any, i: number) =>
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const addAdditionalAddress = () => {
    setFormData(prev => ({
      ...prev,
      additionalAddresses: [...prev.additionalAddresses, {
        type: 'Other',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      }]
    }));
  };

  const removeAdditionalAddress = (index: number) => {
    if (formData.additionalAddresses.length > 1) {
      setFormData(prev => ({
        ...prev,
        additionalAddresses: prev.additionalAddresses.filter((_: any, i: number) => i !== index)
      }));
    }
  };

  // Bank selection handler
  const handleBankSelect = (bankId: string) => {
    setFormData(prev => ({
      ...prev,
      bank: bankId,
      leadTypeId: '',
      leadType: '',
      bankBranch: '',
      vehicleBrandId: '',
      vehicleBrandName: '',
      vehicleModelId: '',
      vehicleModelName: ''
    }));
  };

  // Product selection handler
  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      leadType: selectedProduct?.name || '',
      leadTypeId: productId,
      vehicleBrandId: '',
      vehicleBrandName: '',
      vehicleModelId: '',
      vehicleModelName: ''
    }));
  };

  // Vehicle brand selection handler
  const handleVehicleBrandSelect = (brandId: string) => {
    const selectedBrand = vehicleBrands.find(b => b.id === brandId);
    setFormData(prev => ({
      ...prev,
      vehicleBrandId: brandId,
      vehicleBrandName: selectedBrand?.name || '',
      vehicleModelId: '',
      vehicleModelName: ''
    }));
  };

  // Vehicle model selection handler
  const handleVehicleModelSelect = (modelId: string) => {
    const selectedModel = vehicleModels.find(m => m.id === modelId);
    setFormData(prev => ({
      ...prev,
      vehicleModelId: modelId,
      vehicleModelName: selectedModel?.name || ''
    }));
  };

  // Navigation
  const nextStep = () => {
    let isValid = true;
    switch (step) {
      case 1: isValid = validateStep1(); break;
      case 2: isValid = validateStep2(); break;
      case 3: isValid = validateStep3(); break;
      case 4: isValid = validateStep4(); break;
      case 5: isValid = validateStep5(); break;
      case 6: isValid = validateStep6(); break;
      case 7: isValid = validateStep7(); break;
      case 8: isValid = validateStep8(); break;
      case 9: isValid = validateStep9(); break;
      case 10: isValid = validateStep10(); break;
    }
    if (isValid) setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => (prev > 1 ? prev - 1 : prev));
  };

  // Submit handler
  const handleSubmit = () => {
    if (!validateStep10()) return;
    
    const leadData = {
      id: editLead ? editLead.id : `lead-${Date.now()}`,
      name: formData.name,
      age: Number(formData.age),
      job: formData.job,
      phone: formData.phone,
      address: formData.address,
      status: editLead ? editLead.status : 'Pending',
      bank: formData.bank,
      assignedTo: formData.assignedTo,
      visitType: 'Residence',
      createdAt: editLead ? editLead.createdAt : new Date(),
      documents: editLead ? editLead.documents : [],
      additionalDetails: {
        company: formData.company,
        designation: formData.designation,
        workExperience: formData.workExperience,
        propertyType: formData.propertyType,
        ownershipStatus: formData.ownershipStatus,
        propertyAge: formData.propertyAge,
        monthlyIncome: formData.monthlyIncome,
        annualIncome: formData.annualIncome,
        otherIncome: formData.otherIncome,
        phoneNumber: formData.phone,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        agencyFileNo: formData.agencyFileNo,
        applicationBarcode: formData.applicationBarcode,
        caseId: formData.caseId,
        schemeDesc: formData.schemeDesc,
        bankBranch: formData.bankBranch,
        additionalComments: formData.additionalComments,
        leadType: formData.leadType,
        leadTypeId: formData.leadTypeId,
        loanAmount: formData.loanAmount,
        loanType: formData.loanType,
        vehicleBrandName: formData.vehicleBrandName,
        vehicleBrandId: formData.vehicleBrandId,
        vehicleModelName: formData.vehicleModelName,
        vehicleModelId: formData.vehicleModelId,
        addresses: formData.additionalAddresses
      }
    };
    
    console.log('Submitting lead data:', leadData);
    onAddLead(leadData);
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age <span className="text-red-500">*</span></label>
              <Input
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="Enter age (numbers only)"
              />
              {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job/Occupation <span className="text-red-500">*</span></label>
              <Input
                value={formData.job}
                onChange={(e) => handleChange('job', e.target.value)}
                placeholder="Enter job/occupation"
              />
              {errors.job && <p className="text-red-500 text-sm">{errors.job}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number (Max 10 digits)</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
                maxLength={10}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Primary Address</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Street <span className="text-red-500">*</span></label>
              <Input
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Enter street address"
              />
              {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
              <Input
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="Enter city"
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">District</label>
              <Input
                value={formData.address.district}
                onChange={(e) => handleAddressChange('district', e.target.value)}
                placeholder="Enter district"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State <span className="text-red-500">*</span></label>
              <Input
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="Enter state"
              />
              {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pincode</label>
              <Input
                value={formData.address.pincode}
                onChange={(e) => handleAddressChange('pincode', e.target.value)}
                placeholder="Enter pincode"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Additional Addresses</h3>
            {formData.additionalAddresses.map((addr: any, index: number) => (
              <div key={index} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Address {index + 1}</h4>
                  {formData.additionalAddresses.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeAdditionalAddress(index)}>
                      Remove
                    </Button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <Select value={addr.type} onValueChange={(value) => handleAdditionalAddressChange(index, 'type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={addr.street}
                  onChange={(e) => handleAdditionalAddressChange(index, 'street', e.target.value)}
                  placeholder="Street"
                />
                <Input
                  value={addr.city}
                  onChange={(e) => handleAdditionalAddressChange(index, 'city', e.target.value)}
                  placeholder="City"
                />
                <Input
                  value={addr.district}
                  onChange={(e) => handleAdditionalAddressChange(index, 'district', e.target.value)}
                  placeholder="District"
                />
                <Input
                  value={addr.state}
                  onChange={(e) => handleAdditionalAddressChange(index, 'state', e.target.value)}
                  placeholder="State"
                />
                <Input
                  value={addr.pincode}
                  onChange={(e) => handleAdditionalAddressChange(index, 'pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addAdditionalAddress}>
              Add Another Address
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company <span className="text-red-500">*</span></label>
              <Input
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Enter company name"
              />
              {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
              <Input
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                placeholder="Enter designation"
              />
              {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Work Experience</label>
              <Input
                value={formData.workExperience}
                onChange={(e) => handleChange('workExperience', e.target.value)}
                placeholder="Enter work experience (e.g., 5 years)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
              <Input
                value={formData.monthlyIncome}
                onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                placeholder="Enter monthly income"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Annual Income</label>
              <Input
                value={formData.annualIncome}
                onChange={(e) => handleChange('annualIncome', e.target.value)}
                placeholder="Enter annual income"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Income</label>
              <Input
                value={formData.otherIncome}
                onChange={(e) => handleChange('otherIncome', e.target.value)}
                placeholder="Enter other income sources"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Property Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              <Select value={formData.propertyType} onValueChange={(value) => handleChange('propertyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Independent House">Independent House</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ownership Status</label>
              <Select value={formData.ownershipStatus} onValueChange={(value) => handleChange('ownershipStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ownership status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <SelectItem value="Owned">Owned</SelectItem>
                  <SelectItem value="Rented">Rented</SelectItem>
                  <SelectItem value="Family Property">Family Property</SelectItem>
                  <SelectItem value="Company Provided">Company Provided</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Age</label>
              <Input
                value={formData.propertyAge}
                onChange={(e) => handleChange('propertyAge', e.target.value)}
                placeholder="Enter property age (e.g., 5 years)"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Contact & Personal Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Bank & Product Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank <span className="text-red-500">*</span></label>
              <Select value={formData.bank} onValueChange={handleBankSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bank && <p className="text-red-500 text-sm">{errors.bank}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lead Type/Product <span className="text-red-500">*</span></label>
              <Select 
                value={formData.leadTypeId} 
                onValueChange={handleProductSelect}
                disabled={!formData.bank}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.bank ? "Select Product" : "Select Bank first"} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {products
                    .filter(product => product.banks && product.banks.includes(formData.bank))
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.leadType && <p className="text-red-500 text-sm">{errors.leadType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch <span className="text-red-500">*</span></label>
              <Select 
                value={formData.bankBranch} 
                onValueChange={(value) => handleChange('bankBranch', value)}
                disabled={!formData.bank}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.bank ? "Select Branch" : "Select Bank first"} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {bankBranches
                    .filter(branch => branch.bankId === formData.bank)
                    .map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.bankBranch && <p className="text-red-500 text-sm">{errors.bankBranch}</p>}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
            {shouldShowVehicleFields() ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Brand <span className="text-red-500">*</span></label>
                  <Select value={formData.vehicleBrandId} onValueChange={handleVehicleBrandSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle Brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      {vehicleBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicleBrand && <p className="text-red-500 text-sm">{errors.vehicleBrand}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Model <span className="text-red-500">*</span></label>
                  <Select 
                    value={formData.vehicleModelId} 
                    onValueChange={handleVehicleModelSelect}
                    disabled={!formData.vehicleBrandId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.vehicleBrandId ? "Select Vehicle Model" : "Select Brand first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      {vehicleModels
                        .filter(model => model.brandId === formData.vehicleBrandId)
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicleModel && <p className="text-red-500 text-sm">{errors.vehicleModel}</p>}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Vehicle information is not required for this product type.</p>
                <p className="text-sm">Click Next to continue.</p>
              </div>
            )}
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
              <Input
                value={formData.loanAmount}
                onChange={(e) => handleChange('loanAmount', e.target.value)}
                placeholder="Enter loan amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Loan Type</label>
              <Input
                value={formData.loanType}
                onChange={(e) => handleChange('loanType', e.target.value)}
                placeholder="Enter loan type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Agency File No</label>
              <Input
                value={formData.agencyFileNo}
                onChange={(e) => handleChange('agencyFileNo', e.target.value)}
                placeholder="Enter agency file number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Application Barcode</label>
              <Input
                value={formData.applicationBarcode}
                onChange={(e) => handleChange('applicationBarcode', e.target.value)}
                placeholder="Enter application barcode"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Case ID</label>
              <Input
                value={formData.caseId}
                onChange={(e) => handleChange('caseId', e.target.value)}
                placeholder="Enter case ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Scheme Description</label>
              <Textarea
                value={formData.schemeDesc}
                onChange={(e) => handleChange('schemeDesc', e.target.value)}
                placeholder="Enter scheme description"
                rows={3}
              />
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Assignment & Review</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign to Agent <span className="text-red-500">*</span></label>
              <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && <p className="text-red-500 text-sm">{errors.assignedTo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Comments</label>
              <Textarea
                value={formData.additionalComments}
                onChange={(e) => handleChange('additionalComments', e.target.value)}
                placeholder="Enter any additional comments or instructions"
                rows={4}
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <h4 className="font-medium mb-3">Lead Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Age:</strong> {formData.age}</p>
                <p><strong>Job:</strong> {formData.job}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Company:</strong> {formData.company}</p>
                <p><strong>Designation:</strong> {formData.designation}</p>
                <p><strong>Bank:</strong> {banks.find(b => b.id === formData.bank)?.name}</p>
                <p><strong>Product:</strong> {formData.leadType}</p>
                {shouldShowVehicleFields() && (
                  <>
                    <p><strong>Vehicle Brand:</strong> {formData.vehicleBrandName}</p>
                    <p><strong>Vehicle Model:</strong> {formData.vehicleModelName}</p>
                  </>
                )}
                <p><strong>Assigned Agent:</strong> {agents.find(a => a.id === formData.assignedTo)?.name}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
      
      {/* Step indicator */}
      <div className="flex mb-8 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stepNum) => (
          <div key={stepNum} className={`flex-1 min-w-0 ${stepNum < 10 ? 'border-r' : ''}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs ${
              step >= stepNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNum}
            </div>
            <div className="text-center text-xs mt-1 px-1">
              {stepNum === 1 && 'Basic'}
              {stepNum === 2 && 'Address'}
              {stepNum === 3 && 'Additional'}
              {stepNum === 4 && 'Employment'}
              {stepNum === 5 && 'Property'}
              {stepNum === 6 && 'Contact'}
              {stepNum === 7 && 'Bank'}
              {stepNum === 8 && 'Vehicle'}
              {stepNum === 9 && 'Financial'}
              {stepNum === 10 && 'Review'}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (step === 10) handleSubmit(); else nextStep(); }}>
        {renderStepContent()}
        
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
          ) : (
            <div />
          )}
          {step < 10 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit">
              {editLead ? 'Update Lead' : 'Add Lead'}
            </Button>
          )}
        </div>
        
        <div className="mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLeadFormMultiStep;
