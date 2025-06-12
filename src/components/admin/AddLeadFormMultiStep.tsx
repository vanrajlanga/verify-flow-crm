import { useState, useEffect } from 'react';
import { User, Bank, Product, BankBranch, VehicleBrand, VehicleModel } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    name: '',
    age: '',
    job: '',
    address: {
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    },
    bank: '',
    additionalDetails: {
      leadType: '',
      leadTypeId: '',
      bankBranch: '',
      vehicleBrandId: '',
      vehicleBrandName: '',
      vehicleModelId: '',
      vehicleModelName: ''
    }
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    console.log('Component mounting, initializing data...');
    loadAllData();
  }, []);

  const loadAllData = async () => {
    console.log('Loading all data...');
    
    // Load products
    console.log('Initializing products...');
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      console.log('Products initialized:', parsedProducts);
      setProducts(parsedProducts);
    } else {
      const defaultProducts = [
        { id: 'prod-1', name: 'Auto Loans', description: 'Vehicle financing', banks: ['1', '2'] },
        { id: 'prod-2', name: 'Commercial Vehicles', description: 'Commercial vehicle loans', banks: ['1', '3'] },
        { id: 'prod-3', name: 'CVCE', description: 'Commercial Vehicle Customer Enquiry', banks: ['2', '3'] },
        { id: 'prod-4', name: 'Home Loans', description: 'Housing finance', banks: ['1', '2', '3'] },
        { id: 'prod-5', name: 'Personal Loans', description: 'Personal financing', banks: ['1', '2'] }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('products', JSON.stringify(defaultProducts));
      console.log('Products initialized:', defaultProducts);
    }

    // Load vehicle brands
    console.log('Initializing vehicle brands...');
    const storedVehicleBrands = localStorage.getItem('vehicleBrands');
    if (storedVehicleBrands) {
      const parsedBrands = JSON.parse(storedVehicleBrands);
      console.log('Vehicle brands initialized:', parsedBrands);
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
      console.log('Vehicle brands initialized:', defaultBrands);
    }

    // Load vehicle models
    console.log('Initializing vehicle models...');
    const storedVehicleModels = localStorage.getItem('vehicleModels');
    if (storedVehicleModels) {
      const parsedModels = JSON.parse(storedVehicleModels);
      console.log('Vehicle models initialized:', parsedModels);
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
      console.log('Vehicle models initialized:', defaultModels);
    }

    // Load bank branches
    console.log('Initializing bank branches...');
    const storedBankBranches = localStorage.getItem('bankBranches');
    if (storedBankBranches) {
      const parsedBranches = JSON.parse(storedBankBranches);
      console.log('Bank branches initialized:', parsedBranches);
      setBankBranches(parsedBranches);
    } else {
      const defaultBranches = [
        { id: 'branch-1', name: 'Bangalore Main Branch', code: 'BLR001', bankId: '1', state: 'Karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
        { id: 'branch-2', name: 'Koramangala Branch', code: 'BLR002', bankId: '1', state: 'Karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
        { id: 'branch-3', name: 'Electronic City Branch', code: 'BLR003', bankId: '1', state: 'Karnataka', district: 'Bangalore Urban', city: 'Bangalore' },
        { id: 'branch-4', name: 'Mumbai Central', code: 'MUM001', bankId: '2', state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai' },
        { id: 'branch-5', name: 'Andheri Branch', code: 'MUM002', bankId: '2', state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai' },
        { id: 'branch-6', name: 'Bandra Branch', code: 'MUM003', bankId: '2', state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai' },
        { id: 'branch-7', name: 'Delhi Main', code: 'DEL001', bankId: '3', state: 'Delhi', district: 'Central Delhi', city: 'Delhi' },
        { id: 'branch-8', name: 'Connaught Place', code: 'DEL002', bankId: '3', state: 'Delhi', district: 'Central Delhi', city: 'Delhi' }
      ];
      setBankBranches(defaultBranches);
      localStorage.setItem('bankBranches', JSON.stringify(defaultBranches));
      console.log('Bank branches initialized:', defaultBranches);
    }
  };

  // Validation functions (simplified for brevity)
  const validateStep1 = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0) newErrors.age = 'Valid age is required';
    if (!formData.job.trim()) newErrors.job = 'Job is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: any = {};
    if (!formData.bank) newErrors.bank = 'Bank selection is required';
    if (!formData.additionalDetails.leadTypeId) newErrors.leadType = 'Lead type/product is required';
    if (!formData.additionalDetails.bankBranch) newErrors.bankBranch = 'Branch selection is required';
    if (shouldShowVehicleFields()) {
      if (!formData.additionalDetails.vehicleBrandId) newErrors.vehicleBrand = 'Vehicle brand is required';
      if (!formData.additionalDetails.vehicleModelId) newErrors.vehicleModel = 'Vehicle model is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced vehicle fields visibility function
  const shouldShowVehicleFields = () => {
    const vehicleRelatedProducts = ['Auto Loans', 'Commercial Vehicles', 'CVCE'];
    const shouldShow = vehicleRelatedProducts.includes(formData.additionalDetails.leadType);
    console.log('Should show vehicle fields:', shouldShow, 'for lead type:', formData.additionalDetails.leadType);
    return shouldShow;
  };

  // Bank selection handler
  const handleBankSelect = (bankId: string) => {
    console.log('Bank selected:', bankId);
    setFormData(prev => ({
      ...prev,
      bank: bankId,
      additionalDetails: {
        ...prev.additionalDetails,
        leadTypeId: '', // Reset lead type when bank changes
        leadType: '',
        bankBranch: '',   // Reset branch when bank changes
        vehicleBrandId: '',
        vehicleBrandName: '',
        vehicleModelId: '',
        vehicleModelName: ''
      }
    }));
  };

  // Product selection handler
  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    console.log('Product selected:', productId, selectedProduct);
    
    setFormData(prev => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        leadType: selectedProduct?.name || '',
        leadTypeId: productId,
        // Reset vehicle fields when product changes
        vehicleBrandId: '',
        vehicleBrandName: '',
        vehicleModelId: '',
        vehicleModelName: ''
      }
    }));
  };

  // Vehicle brand selection handler
  const handleVehicleBrandSelect = (brandId: string) => {
    const selectedBrand = vehicleBrands.find(b => b.id === brandId);
    console.log('Vehicle brand selected:', brandId, selectedBrand);
    
    setFormData(prev => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        vehicleBrandId: brandId,
        vehicleBrandName: selectedBrand?.name || '',
        vehicleModelId: '', // Reset model when brand changes
        vehicleModelName: ''
      }
    }));
  };

  // Vehicle model selection handler
  const handleVehicleModelSelect = (modelId: string) => {
    const selectedModel = vehicleModels.find(m => m.id === modelId);
    console.log('Vehicle model selected:', modelId, selectedModel);
    
    setFormData(prev => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        vehicleModelId: modelId,
        vehicleModelName: selectedModel?.name || ''
      }
    }));
  };

  // Handlers for address fields
  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  // Handlers for other form fields
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Navigation handlers
  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => (prev > 1 ? prev - 1 : prev));
  };

  // Submit handler
  const handleSubmit = () => {
    if (!validateStep1() || !validateStep2()) return;
    onAddLead(formData);
  };

  // Render functions for each step
  const renderBasicInfoStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter name"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Age <span className="text-red-500">*</span></label>
        <Input
          type="number"
          value={formData.age}
          onChange={(e) => handleChange('age', e.target.value)}
          placeholder="Enter age"
        />
        {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Job <span className="text-red-500">*</span></label>
        <Input
          value={formData.job}
          onChange={(e) => handleChange('job', e.target.value)}
          placeholder="Enter job"
        />
        {errors.job && <p className="text-red-500 text-sm">{errors.job}</p>}
      </div>
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-2">Address</h4>
        <Input
          value={formData.address.street}
          onChange={(e) => handleAddressChange('street', e.target.value)}
          placeholder="Street"
          className="mb-2"
        />
        <Input
          value={formData.address.city}
          onChange={(e) => handleAddressChange('city', e.target.value)}
          placeholder="City"
          className="mb-2"
        />
        <Input
          value={formData.address.district}
          onChange={(e) => handleAddressChange('district', e.target.value)}
          placeholder="District"
          className="mb-2"
        />
        <Input
          value={formData.address.state}
          onChange={(e) => handleAddressChange('state', e.target.value)}
          placeholder="State"
          className="mb-2"
        />
        <Input
          value={formData.address.pincode}
          onChange={(e) => handleAddressChange('pincode', e.target.value)}
          placeholder="Pincode"
          className="mb-2"
        />
      </div>
    </div>
  );

  const renderBankProductStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Bank & Product Information</h3>
      </div>

      {/* Bank Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Bank <span className="text-red-500">*</span>
        </label>
        <Select value={formData.bank} onValueChange={handleBankSelect}>
          <SelectTrigger className="w-full">
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

      {/* Product Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Lead Type/Product <span className="text-red-500">*</span>
        </label>
        <Select 
          value={formData.additionalDetails.leadTypeId} 
          onValueChange={handleProductSelect}
          disabled={!formData.bank}
        >
          <SelectTrigger className="w-full">
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

      {/* Initiated Under Branch */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Initiated Under Branch <span className="text-red-500">*</span>
        </label>
        <Select 
          value={formData.additionalDetails.bankBranch} 
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            additionalDetails: { ...prev.additionalDetails, bankBranch: value }
          }))}
          disabled={!formData.bank}
        >
          <SelectTrigger className="w-full">
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

      {/* Build Under Branch */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Build Under Branch <span className="text-red-500">*</span>
        </label>
        <Select 
          value={formData.additionalDetails.bankBranch} 
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            additionalDetails: { ...prev.additionalDetails, bankBranch: value }
          }))}
          disabled={!formData.bank}
        >
          <SelectTrigger className="w-full">
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
      </div>

      {/* Vehicle Information - Show only for vehicle-related products */}
      {shouldShowVehicleFields() && (
        <div className="space-y-4 border-t pt-4">
          <h4 className="text-md font-semibold text-gray-800">Vehicle Information</h4>
          
          {/* Vehicle Brand */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Vehicle Brand <span className="text-red-500">*</span>
            </label>
            <Select 
              value={formData.additionalDetails.vehicleBrandId} 
              onValueChange={handleVehicleBrandSelect}
            >
              <SelectTrigger className="w-full">
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

          {/* Vehicle Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Vehicle Model <span className="text-red-500">*</span>
            </label>
            <Select 
              value={formData.additionalDetails.vehicleModelId} 
              onValueChange={handleVehicleModelSelect}
              disabled={!formData.additionalDetails.vehicleBrandId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={formData.additionalDetails.vehicleBrandId ? "Select Vehicle Model" : "Select Brand first"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {vehicleModels
                  .filter(model => model.brandId === formData.additionalDetails.vehicleBrandId)
                  .map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.vehicleModel && <p className="text-red-500 text-sm">{errors.vehicleModel}</p>}
          </div>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderBankProductStep();
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(formData, null, 2)}</pre>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">{editLead ? 'Edit Lead' : 'Add New Lead'}</h2>
      <form onSubmit={(e) => { e.preventDefault(); if (step === 3) handleSubmit(); else nextStep(); }}>
        {renderStepContent()}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
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
