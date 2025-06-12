export interface User {
  id: string;
  name: string;
  role: 'admin' | 'agent';
  email: string;
  phone: string;
  district: string;
  status: 'Active' | 'Inactive';
  state?: string;
  city?: string;
  baseLocation?: string;
  maxTravelDistance?: number;
  extraChargePerKm?: number;
  profilePicture?: string;
  documents?: UserDocument[];
  totalVerifications?: number;
  completionRate?: number;
  password?: string;
}

export interface UserDocument {
  id: string;
  type: string;
  filename: string;
  url: string;
  uploadDate: string;
}

export interface Address {
  type?: 'Residence' | 'Office' | 'Permanent';
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  type: 'mobile' | 'landline' | 'work';
  isPrimary: boolean;
}

export interface CoApplicant {
  name: string;
  phone: string;
  relation: string;
  email?: string;
  occupation?: string;
  monthlyIncome?: string;
}

export interface VehicleDetails {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  type: string;
  year?: number;
  price: string;
  downPayment: string;
}

export interface AdditionalDetails {
  company: string;
  designation: string;
  workExperience: string;
  employmentType?: string;
  currentJobDuration?: string;
  propertyType: string;
  ownershipStatus: string;
  propertyAge: string;
  monthlyIncome: string;
  annualIncome: string;
  otherIncome: string;
  addresses: Address[];
  phoneNumber?: string;
  phoneNumbers?: PhoneNumber[];
  secondaryPhones?: string[];
  email?: string;
  dateOfBirth?: string;
  agencyFileNo?: string;
  applicationBarcode?: string;
  caseId?: string;
  schemeDesc?: string;
  bankBranch?: string;
  additionalComments?: string;
  leadType?: string;
  leadTypeId?: string;
  loanAmount?: string;
  loanType?: string;
  vehicleBrandName?: string;
  vehicleBrandId?: string;
  vehicleModelName?: string;
  vehicleModelId?: string;
  vehicleVariant?: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  maritalStatus?: string;
  spouseName?: string;
  coApplicant?: CoApplicant;
  vehicleDetails?: VehicleDetails;
}

export interface Document {
  id: string;
  name: string;
  type: 'ID Proof' | 'Address Proof' | 'Income Proof' | 'Other';
  uploadedBy: 'agent' | 'bank' | 'admin';
  url: string;
  uploadDate: Date;
  size?: number;
}

export interface VerificationPhoto {
  id: string;
  name: string;
  url: string;
  uploadDate: Date;
}

export interface VerificationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: Date;
}

export interface VerificationData {
  id: string;
  leadId: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Rejected';
  agentId: string;
  photos: VerificationPhoto[];
  documents: VerificationDocument[];
  notes?: string;
  startTime?: Date;
  endTime?: Date;
  arrivalTime?: Date;
  completionTime?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminRemarks?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Lead {
  id: string;
  name: string;
  age: number;
  job: string;
  address: Address;
  additionalDetails: AdditionalDetails;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  bank: string;
  visitType: 'Office' | 'Residence' | 'Both';
  assignedTo: string;
  createdAt: Date;
  verificationDate?: Date;
  documents: Document[];
  instructions?: string;
  verification?: VerificationData;
}

export interface Bank {
  id: string;
  name: string;
  totalApplications: number;
}

export interface BankBranch {
  id: string;
  name: string;
  bank: string;
  location: string;
}

export interface LeadType {
  id: string;
  name: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  branch: string;
  district: string;
  city: string;
}

export interface VehicleBrand {
  id: string;
  name: string;
}

export interface VehicleModel {
  id: string;
  name: string;
  brandId: string;
}

// Mock data for fallback/testing
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'System Administrator',
    role: 'admin',
    email: 'admin@kycverification.com',
    phone: '+91 98765 43210',
    district: '',
    status: 'Active',
    password: 'password'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    role: 'agent',
    email: 'rajesh@kycverification.com',
    phone: '+91 98765 43211',
    district: 'Bangalore Urban',
    status: 'Active',
    state: 'Karnataka',
    city: 'Bangalore',
    baseLocation: 'HSR Layout, Bangalore',
    maxTravelDistance: 25,
    extraChargePerKm: 10,
    totalVerifications: 45,
    completionRate: 92,
    password: 'password'
  },
  {
    id: '3',
    name: 'Priya Sharma',
    role: 'agent',
    email: 'priya@kycverification.com',
    phone: '+91 98765 43212',
    district: 'Mumbai',
    status: 'Active',
    state: 'Maharashtra',
    city: 'Mumbai',
    baseLocation: 'Andheri West, Mumbai',
    maxTravelDistance: 20,
    extraChargePerKm: 12,
    totalVerifications: 38,
    completionRate: 87,
    password: 'password'
  },
  {
    id: '4',
    name: 'Amit Patel',
    role: 'agent',
    email: 'amit@kycverification.com',
    phone: '+91 98765 43213',
    district: 'Bangalore Urban',
    status: 'Active',
    state: 'Karnataka',
    city: 'Bangalore',
    baseLocation: 'Koramangala, Bangalore',
    maxTravelDistance: 30,
    extraChargePerKm: 8,
    totalVerifications: 52,
    completionRate: 95,
    password: 'password'
  }
];

export const mockLeads: Lead[] = [];

export const mockBanks: Bank[] = [
  { id: '1', name: 'State Bank of India', totalApplications: 156 },
  { id: '2', name: 'HDFC Bank', totalApplications: 134 },
  { id: '3', name: 'ICICI Bank', totalApplications: 98 },
  { id: '4', name: 'Axis Bank', totalApplications: 87 },
  { id: '5', name: 'Punjab National Bank', totalApplications: 76 }
];

// Export banks with the name that AddLeadForm expects
export const banks = mockBanks;

// Export bank branches
export const bankBranches: BankBranch[] = [
  { id: 'branch-1', name: 'SBI Mumbai Central', bank: 'State Bank of India', location: 'Mumbai Central' },
  { id: 'branch-2', name: 'SBI Andheri', bank: 'State Bank of India', location: 'Andheri' },
  { id: 'branch-3', name: 'HDFC Bandra', bank: 'HDFC Bank', location: 'Bandra' },
  { id: 'branch-4', name: 'HDFC Powai', bank: 'HDFC Bank', location: 'Powai' },
  { id: 'branch-5', name: 'ICICI Kurla', bank: 'ICICI Bank', location: 'Kurla' },
  { id: 'branch-6', name: 'Axis Bank Worli', bank: 'Axis Bank', location: 'Worli' },
  { id: 'branch-7', name: 'PNB Dadar', bank: 'Punjab National Bank', location: 'Dadar' }
];

// Export lead types
export const leadTypes: LeadType[] = [
  { id: 'lead-1', name: 'Home Loan', description: 'Residential property loan verification' },
  { id: 'lead-2', name: 'Personal Loan', description: 'Personal loan verification' },
  { id: 'lead-3', name: 'Auto Loan', description: 'Vehicle loan verification' },
  { id: 'lead-4', name: 'Business Loan', description: 'Business loan verification' },
  { id: 'lead-5', name: 'Credit Card', description: 'Credit card application verification' }
];

// Export agents
export const agents: Agent[] = [
  { id: 'agent-1', name: 'Rajesh Kumar', branch: 'SBI Mumbai Central', district: 'Mumbai', city: 'Mumbai' },
  { id: 'agent-2', name: 'Priya Sharma', branch: 'HDFC Bandra', district: 'Mumbai', city: 'Mumbai' },
  { id: 'agent-3', name: 'Amit Patel', branch: 'ICICI Kurla', district: 'Mumbai', city: 'Mumbai' },
  { id: 'agent-4', name: 'Neha Singh', branch: 'Axis Bank Worli', district: 'Mumbai', city: 'Mumbai' }
];
