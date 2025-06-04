import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { Address, AdditionalDetails, Bank, Document as MockDocument, Lead, User, VerificationData } from '@/utils/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Plus, X, UserPlus } from 'lucide-react';
import { LeadType } from './LeadTypeManager';
import { BankBranch } from './BankBranchManager';
import { VehicleBrand, VehicleModel } from './VehicleManager';
import { Checkbox } from "@/components/ui/checkbox";

interface UploadDocument {
  id: string;
  file: File;
  name: string;
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

interface CoApplicant {
  id: string;
  name: string;
  age: string;
  phoneNumber: string;
  dateOfBirth: string;
  job: string;
  company: string;
  designation: string;
  workExperience: string;
  monthlyIncome: string;
  annualIncome: string;
}

interface HomeAddress {
  id: string;
  type: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  requiresVerification: boolean;
}

interface AddLeadFormProps {
  agents: User[];
  banks: Bank[];
  onAddLead: (lead: Lead) => void;
  onClose: () => void;
  locationData: LocationData;
}

const formSchema = z.object({
  bank: z.string().min(1, { message: "Please select a bank." }),
  leadType: z.string().min(1, { message: "Please select a lead type." }),
  agencyFileNo: z.string().min(1, { message: "Agency File No. is required." }),
  applicationBarcode: z.string().optional(),
  caseId: z.string().optional(),
  schemeDesc: z.string().optional(),
  initiatedUnderBranch: z.string().min(1, { message: "Please select initiated under branch." }),
  buildUnderBranch: z.string().min(1, { message: "Please select build under branch." }),
  additionalComments: z.string().optional(),
  loanAmount: z.string().optional(),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Age must be a positive number.",
  }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required." }),
  job: z.string().min(2, {
    message: "Job must be at least 2 characters.",
  }),
  company: z.string().optional(),
  designation: z.string().optional(),
  workExperience: z.string().optional(),
  propertyType: z.string().optional(),
  ownershipStatus: z.string().optional(),
  propertyAge: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualIncome: z.string().optional(),
  otherIncome: z.string().optional(),
  hasOfficeAddress: z.boolean().default(false),
  officeStreet: z.string().optional(),
  officeCity: z.string().optional(),
  officeDistrict: z.string().optional(),
  officeState: z.string().optional(),
  officePincode: z.string().optional(),
  verificationDate: z.string().optional(),
  assignmentType: z.enum(["auto", "manual"]),
  assignedTo: z.string().optional(),
  instructions: z.string().optional(),
});

const AddLeadForm = ({ agents, banks, onAddLead, onClose, locationData }: AddLeadFormProps) => {
  const [documents, setDocuments] = useState<UploadDocument[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("lead-type");
  
  const [leadTypes, setLeadTypes] = useState<LeadType[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  
  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const [homeAddresses, setHomeAddresses] = useState<HomeAddress[]>([
    {
      id: 'addr-1',
      type: 'Permanent',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      requiresVerification: true
    }
  ]);
  
  useEffect(() => {
    const existingScript = document.getElementById('google-maps-script');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDUTx27s3q3rikbNg1cA-OdJyKb15DZchk&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);
  
  useEffect(() => {
    const storedLeadTypes = localStorage.getItem('leadTypes');
    if (storedLeadTypes) {
      setLeadTypes(JSON.parse(storedLeadTypes));
    }

    const storedBranches = localStorage.getItem('bankBranches');
    if (storedBranches) {
      setBankBranches(JSON.parse(storedBranches));
    }

    const storedBrands = localStorage.getItem('vehicleBrands');
    if (storedBrands) {
      setVehicleBrands(JSON.parse(storedBrands));
    }

    const storedModels = localStorage.getItem('vehicleModels');
    if (storedModels) {
      setVehicleModels(JSON.parse(storedModels));
    }
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank: "",
      leadType: "",
      agencyFileNo: "",
      applicationBarcode: "",
      caseId: "",
      schemeDesc: "",
      initiatedUnderBranch: "",
      buildUnderBranch: "",
      additionalComments: "",
      loanAmount: "",
      vehicleBrand: "",
      vehicleModel: "",
      name: "",
      age: "",
      phoneNumber: "",
      dateOfBirth: "",
      job: "",
      company: "",
      designation: "",
      workExperience: "",
      propertyType: "",
      ownershipStatus: "",
      propertyAge: "",
      monthlyIncome: "",
      annualIncome: "",
      otherIncome: "",
      hasOfficeAddress: false,
      officeStreet: "",
      officeCity: "",
      officeDistrict: "",
      officeState: "",
      officePincode: "",
      verificationDate: "",
      assignmentType: "auto",
      assignedTo: "",
      instructions: ""
    },
  });

  // Watch form values
  const selectedBank = form.watch("bank");
  const selectedLeadType = form.watch("leadType");
  const selectedVehicleBrand = form.watch("vehicleBrand");
  const assignmentType = form.watch("assignmentType");
  const hasOfficeAddress = form.watch("hasOfficeAddress");
  
  const filteredBankBranches = bankBranches.filter(branch => branch.bankId === selectedBank);
  const selectedLeadTypeObj = leadTypes.find(type => type.id === selectedLeadType);
  const isLoanType = selectedLeadTypeObj?.category === 'loan';
  const isVehicleType = selectedLeadTypeObj?.category === 'vehicle';
  const filteredVehicleModels = vehicleModels.filter(model => model.brandId === selectedVehicleBrand);

  const addCoApplicant = () => {
    const newCoApplicant: CoApplicant = {
      id: `co-applicant-${Date.now()}`,
      name: '',
      age: '',
      phoneNumber: '',
      dateOfBirth: '',
      job: '',
      company: '',
      designation: '',
      workExperience: '',
      monthlyIncome: '',
      annualIncome: ''
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

  const addHomeAddress = () => {
    const newAddress: HomeAddress = {
      id: `addr-${Date.now()}`,
      type: homeAddresses.length === 1 ? 'Temporary' : `Address ${homeAddresses.length + 1}`,
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      requiresVerification: false
    };
    setHomeAddresses([...homeAddresses, newAddress]);
  };

  const removeHomeAddress = (id: string) => {
    if (homeAddresses.length > 1) {
      setHomeAddresses(homeAddresses.filter(addr => addr.id !== id));
    }
  };

  const updateHomeAddress = (id: string, field: keyof HomeAddress, value: string | boolean) => {
    setHomeAddresses(homeAddresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const getStateOptions = (addressId: string) => {
    return locationData.states;
  };

  const getDistrictOptions = (addressId: string) => {
    const address = homeAddresses.find(addr => addr.id === addressId);
    const selectedState = locationData.states.find(state => state.name === address?.state);
    return selectedState?.districts || [];
  };

  const getCityOptions = (addressId: string) => {
    const address = homeAddresses.find(addr => addr.id === addressId);
    const selectedState = locationData.states.find(state => state.name === address?.state);
    const selectedDistrict = selectedState?.districts.find(district => district.name === address?.district);
    return selectedDistrict?.cities || [];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addDocument = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!documentName) {
      toast({
        title: "Missing document name",
        description: "Please provide a name for the document",
        variant: "destructive",
      });
      return;
    }

    const newDocument: UploadDocument = {
      id: `doc-${Date.now()}-${documents.length}`,
      file: selectedFile,
      name: documentName
    };

    setDocuments([...documents, newDocument]);
    setDocumentName('');
    setSelectedFile(null);
    
    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const uploadedDocuments: MockDocument[] = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: 'Other' as const,
      uploadedBy: 'bank' as const,
      url: '/placeholder.svg',
      uploadDate: new Date()
    }));

    const addresses = homeAddresses.map(addr => ({
      street: addr.street,
      city: addr.city,
      district: addr.district,
      state: addr.state,
      pincode: addr.pincode
    }));

    if (values.hasOfficeAddress && values.officeStreet) {
      addresses.push({
        street: values.officeStreet || "",
        city: values.officeCity || "",
        district: values.officeDistrict || "",
        state: values.officeState || "",
        pincode: values.officePincode || ""
      });
    }

    const selectedBankName = banks.find(b => b.id === values.bank)?.name || '';
    const initiatedBranchName = bankBranches.find(b => b.id === values.initiatedUnderBranch)?.name || '';
    const buildBranchName = bankBranches.find(b => b.id === values.buildUnderBranch)?.name || '';

    const addressesRequiringVerification = homeAddresses.filter(addr => addr.requiresVerification);
    let visitType: "Office" | "Residence" | "Both" = "Residence";
    
    if (values.hasOfficeAddress && addressesRequiringVerification.length > 0) {
      visitType = "Both";
    } else if (values.hasOfficeAddress) {
      visitType = "Office";
    }

    const additionalDetails: any = {
      company: values.company || "",
      designation: values.designation || "",
      workExperience: values.workExperience || "",
      propertyType: values.propertyType || "",
      ownershipStatus: values.ownershipStatus || "",
      propertyAge: values.propertyAge || "",
      monthlyIncome: values.monthlyIncome || "",
      annualIncome: values.annualIncome || "",
      otherIncome: values.otherIncome || "",
      addresses: addresses,
      phoneNumber: values.phoneNumber,
      email: "",
      dateOfBirth: values.dateOfBirth,
      agencyFileNo: values.agencyFileNo,
      applicationBarcode: values.applicationBarcode || "",
      caseId: values.caseId || "",
      schemeDesc: values.schemeDesc || "",
      bankName: selectedBankName,
      initiatedUnderBranch: initiatedBranchName,
      buildUnderBranch: buildBranchName,
      additionalComments: values.additionalComments || "",
      leadType: selectedLeadTypeObj?.name || "",
      leadTypeId: values.leadType,
      coApplicants: coApplicants,
      homeAddresses: homeAddresses,
      addressesRequiringVerification: addressesRequiringVerification.map(addr => addr.id)
    };

    if (isLoanType && values.loanAmount) {
      additionalDetails.loanAmount = values.loanAmount;
      additionalDetails.loanType = selectedLeadTypeObj?.name;
    }

    if (isVehicleType) {
      if (values.vehicleBrand) {
        const brandName = vehicleBrands.find(b => b.id === values.vehicleBrand)?.name;
        additionalDetails.vehicleBrandName = brandName;
        additionalDetails.vehicleBrandId = values.vehicleBrand;
      }
      if (values.vehicleModel) {
        const modelName = vehicleModels.find(m => m.id === values.vehicleModel)?.name;
        additionalDetails.vehicleModelName = modelName;
        additionalDetails.vehicleModelId = values.vehicleModel;
      }
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: values.name,
      age: parseInt(values.age),
      job: values.job,
      address: homeAddresses[0] ? {
        street: homeAddresses[0].street,
        city: homeAddresses[0].city,
        district: homeAddresses[0].district,
        state: homeAddresses[0].state,
        pincode: homeAddresses[0].pincode
      } : {
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      },
      additionalDetails: additionalDetails,
      status: 'Pending',
      bank: values.bank,
      visitType: visitType,
      assignedTo: values.assignmentType === 'manual' && values.assignedTo ? values.assignedTo : '',
      createdAt: new Date(),
      documents: uploadedDocuments,
      instructions: values.instructions || '',
      verification: {
        status: 'Not Started',
        agentId: values.assignedTo || '',
        leadId: `lead-${Date.now()}`,
        id: `verification-${Date.now()}`,
        photos: [],
        documents: []
      }
    };
    
    if (values.verificationDate) {
      newLead.verificationDate = new Date(values.verificationDate);
    }
    
    if (newLead.assignedTo) {
      newLead.verification = {
        status: 'Not Started',
        agentId: newLead.assignedTo,
        leadId: newLead.id,
        id: `verification-${Date.now()}`,
        photos: [],
        documents: [],
        notes: ''
      };
    }
    
    onAddLead(newLead);
    toast({
      title: "Lead created",
      description: `New lead ${values.name} has been created successfully.`,
    });
    onClose();
  };

  useEffect(() => {
    if (!hasOfficeAddress) {
      form.setValue("officeStreet", "");
      form.setValue("officeCity", "");
      form.setValue("officeDistrict", "");
      form.setValue("officeState", "");
      form.setValue("officePincode", "");
    }
  }, [hasOfficeAddress, form]);

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1 w-full max-w-5xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="lead-type" className="flex-1">Lead Type & Details</TabsTrigger>
              <TabsTrigger value="personal" className="flex-1">Personal Information</TabsTrigger>
              <TabsTrigger value="job" className="flex-1">Job Details</TabsTrigger>
              <TabsTrigger value="property" className="flex-1">Property & Income</TabsTrigger>
              <TabsTrigger value="verification" className="flex-1">Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lead-type" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Type & Basic Information</CardTitle>
                  <CardDescription>Select bank, lead type and provide basic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {banks.map(bank => (
                              <SelectItem key={bank.id} value={bank.id}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lead type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leadTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="initiatedUnderBranch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initiated Under Branch *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!selectedBank}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !selectedBank 
                                    ? "Select a bank first" 
                                    : "Select initiated under branch"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredBankBranches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name} ({branch.code}) - {branch.city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buildUnderBranch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Build Under Branch *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!selectedBank}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !selectedBank 
                                    ? "Select a bank first" 
                                    : "Select build under branch"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredBankBranches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name} ({branch.code}) - {branch.city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="agencyFileNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agency File No. *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter agency file number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="applicationBarcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Barcode</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter application barcode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="caseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter case ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schemeDesc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheme Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter scheme description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {isLoanType && (
                    <FormField
                      control={form.control}
                      name="loanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Amount (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter loan amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {isVehicleType && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="vehicleBrand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Brand</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue('vehicleModel', '');
                              }} 
                              value={field.value || ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vehicle brand" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicleBrands.map((brand) => (
                                  <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vehicleModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Model</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value || ''}
                              disabled={!selectedVehicleBrand}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={
                                    !selectedVehicleBrand 
                                      ? "Select a brand first" 
                                      : "Select vehicle model"
                                  } />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredVehicleModels.map((model) => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="additionalComments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Comments</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter any additional comments" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="personal" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Main Applicant Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter applicant's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Co-Applicants Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Co-Applicants</CardTitle>
                    <CardDescription>Add co-applicant details if any</CardDescription>
                  </div>
                  <Button type="button" onClick={addCoApplicant} variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Co-Applicant
                  </Button>
                </CardHeader>
                <CardContent>
                  {coApplicants.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No co-applicants added</p>
                  ) : (
                    <div className="space-y-6">
                      {coApplicants.map((coApplicant, index) => (
                        <div key={coApplicant.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Co-Applicant {index + 1}</h4>
                            <Button 
                              type="button" 
                              onClick={() => removeCoApplicant(coApplicant.id)}
                              variant="outline" 
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Full Name *</Label>
                              <Input 
                                placeholder="Enter co-applicant's name"
                                value={coApplicant.name}
                                onChange={(e) => updateCoApplicant(coApplicant.id, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Age *</Label>
                              <Input 
                                type="number"
                                value={coApplicant.age}
                                onChange={(e) => updateCoApplicant(coApplicant.id, 'age', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Phone Number *</Label>
                              <Input 
                                placeholder="Enter phone number"
                                value={coApplicant.phoneNumber}
                                onChange={(e) => updateCoApplicant(coApplicant.id, 'phoneNumber', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Date of Birth *</Label>
                              <Input 
                                type="date"
                                value={coApplicant.dateOfBirth}
                                onChange={(e) => updateCoApplicant(coApplicant.id, 'dateOfBirth', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Occupation</Label>
                              <Input 
                                placeholder="Job title"
                                value={coApplicant.job}
                                onChange={(e) => updateCoApplicant(coApplicant.id, 'job', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Company</Label>
                              <Input 
                                placeholder="Company name"
                                value={coApplicant.company}
                                onChange={(e) => updateCoApplicant(coApplicant.id, 'company', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Monthly Income (₹)</Label>
                              <Input 
                                placeholder="Enter monthly income"
                                value={coApplicant.monthlyIncome}
                                onChange={(e) => updateCoApplicant(coApplicant.id, 'monthlyIncome', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Annual Income (₹)</Label>
                              <Input 
                                placeholder="Enter annual income"
                                value={coApplicant.annualIncome}
                                onChange={(e) => updateCoApplicant(coApplicant.id, 'annualIncome', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Home Addresses Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Home Addresses</CardTitle>
                    <CardDescription>Add multiple addresses if needed</CardDescription>
                  </div>
                  <Button type="button" onClick={addHomeAddress} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {homeAddresses.map((address, index) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Address Type (e.g., Permanent, Temporary)"
                              value={address.type}
                              onChange={(e) => updateHomeAddress(address.id, 'type', e.target.value)}
                              className="w-auto"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                checked={address.requiresVerification}
                                onCheckedChange={(checked) => updateHomeAddress(address.id, 'requiresVerification', !!checked)}
                              />
                              <Label className="text-sm">Requires Verification</Label>
                            </div>
                            {homeAddresses.length > 1 && (
                              <Button 
                                type="button" 
                                onClick={() => removeHomeAddress(address.id)}
                                variant="outline" 
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label>Street Address *</Label>
                            <Input 
                              placeholder="Enter street address"
                              value={address.street}
                              onChange={(e) => updateHomeAddress(address.id, 'street', e.target.value)}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>State</Label>
                              <Select 
                                onValueChange={(value) => {
                                  updateHomeAddress(address.id, 'state', value);
                                  updateHomeAddress(address.id, 'district', '');
                                  updateHomeAddress(address.id, 'city', '');
                                }}
                                value={address.state}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getStateOptions(address.id).map((state) => (
                                    <SelectItem key={state.id} value={state.name}>
                                      {state.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>District</Label>
                              <Select 
                                onValueChange={(value) => {
                                  updateHomeAddress(address.id, 'district', value);
                                  updateHomeAddress(address.id, 'city', '');
                                }}
                                value={address.district}
                                disabled={getDistrictOptions(address.id).length === 0}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={
                                    getDistrictOptions(address.id).length === 0 
                                      ? "Select a state first" 
                                      : "Select district"
                                  } />
                                </SelectTrigger>
                                <SelectContent>
                                  {getDistrictOptions(address.id).map((district) => (
                                    <SelectItem key={district.id} value={district.name}>
                                      {district.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>City</Label>
                              <Select 
                                onValueChange={(value) => updateHomeAddress(address.id, 'city', value)}
                                value={address.city}
                                disabled={getCityOptions(address.id).length === 0}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={
                                    getCityOptions(address.id).length === 0 
                                      ? "Select a district first" 
                                      : "Select city"
                                  } />
                                </SelectTrigger>
                                <SelectContent>
                                  {getCityOptions(address.id).map((city) => (
                                    <SelectItem key={city.id} value={city.name}>
                                      {city.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Pincode</Label>
                              <Input 
                                placeholder="Enter pincode"
                                value={address.pincode}
                                onChange={(e) => updateHomeAddress(address.id, 'pincode', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex items-start space-x-2">
                <FormField
                  control={form.control}
                  name="hasOfficeAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Add Office Address</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              {hasOfficeAddress && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Office Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Work Location</span>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="officeStreet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Office Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter office street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="officeState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue('officeDistrict', '');
                                  form.setValue('officeCity', '');
                                }}
                                value={field.value || ''}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {locationData.states.map((state) => (
                                    <SelectItem key={state.id} value={state.name}>
                                      {state.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="officeDistrict"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>District</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue('officeCity', '');
                                }}
                                value={field.value || ''}
                                disabled={availableOfficeDistricts.length === 0}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      availableOfficeDistricts.length === 0 
                                        ? "Select a state first" 
                                        : "Select district"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableOfficeDistricts.map((district) => (
                                    <SelectItem key={district.id} value={district.name}>
                                      {district.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="officeCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                value={field.value || ''}
                                disabled={availableOfficeCities.length === 0}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      availableOfficeCities.length === 0 
                                        ? "Select a district first" 
                                        : "Select city"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableOfficeCities.map((city) => (
                                    <SelectItem key={city.id} value={city.name}>
                                      {city.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="officePincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter pincode" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="job" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="job"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Job title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <FormControl>
                            <Input placeholder="Current designation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="workExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Experience (years)</FormLabel>
                          <FormControl>
                            <Input placeholder="Years of experience" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="property" className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">Individual House</SelectItem>
                              <SelectItem value="villa">Villa</SelectItem>
                              <SelectItem value="plot">Plot</SelectItem>
                              <SelectItem value="commercial">Commercial Property</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ownershipStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ownership Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ownership status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="owned">Self-owned</SelectItem>
                              <SelectItem value="rented">Rented</SelectItem>
                              <SelectItem value="leased">Leased</SelectItem>
                              <SelectItem value="family">Family Property</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="propertyAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Age (years)</FormLabel>
                          <FormControl>
                            <Input placeholder="Property age in years" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Income Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter monthly income" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="annualIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Income (₹)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter annual income" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="otherIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Income Sources (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe other income sources if any"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="verification" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {banks.map(bank => (
                                  <SelectItem key={bank.id} value={bank.id}>
                                    {bank.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="visitType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Visit Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select visit type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Home">Home</SelectItem>
                                <SelectItem value="Office">Office</SelectItem>
                                <SelectItem value="Both">Both (Home & Office)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="verificationDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any special notes or instructions for the agent"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="assignmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assignment Method</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="auto" id="auto" />
                                  <label htmlFor="auto" className="cursor-pointer">Auto-assign based on district</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="manual" id="manual" />
                                  <label htmlFor="manual" className="cursor-pointer">Manually select agent</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {assignmentType === "manual" && (
                        <FormField
                          control={form.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Agent</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || ''}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an agent" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredAgents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                      {agent.name} {agent.district ? `(${agent.district})` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-grow">
                        <Input
                          placeholder="Document name (e.g. ID Proof, Address Proof)"
                          value={documentName}
                          onChange={(e) => setDocumentName(e.target.value)}
                        />
                      </div>
                      <Input
                        id="document-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="max-w-[220px]"
                      />
                      <Button 
                        type="button" 
                        onClick={addDocument}
                        disabled={!selectedFile || !documentName}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                    
                    {documents.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-medium">Uploaded Documents:</h4>
                        <ul className="space-y-2">
                          {documents.map((doc) => (
                            <li key={doc.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{doc.name}</span>
                                <span className="text-xs text-muted-foreground">({doc.file.name})</span>
                              </div>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeDocument(doc.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Lead
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddLeadForm;
