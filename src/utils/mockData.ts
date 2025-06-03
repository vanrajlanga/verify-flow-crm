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

export interface AdditionalDetails {
  company: string;
  designation: string;
  workExperience: string;
  propertyType: string;
  ownershipStatus: string;
  propertyAge: string;
  monthlyIncome: string;
  annualIncome: string;
  otherIncome: string;
  addresses: Address[];
  phoneNumber?: string;
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
}

export interface Document {
  id: string;
  name: string;
  type: 'ID Proof' | 'Address Proof' | 'Income Proof' | 'Other';
  uploadedBy: 'agent' | 'bank';
  url: string;
  uploadDate: Date;
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

// Import Supabase query functions
import { 
  loginUser as supabaseLoginUser,
  getUserById as supabaseGetUserById,
  getBankById as supabaseGetBankById,
  getLeadById as supabaseGetLeadById,
  getLeadsByAgentId as supabaseGetLeadsByAgentId,
  getLeadStats as supabaseGetLeadStats,
  getAgentPerformance as supabaseGetAgentPerformance
} from '@/lib/supabase-queries';

// Export the Supabase functions with the same names as the original mock functions
export const loginUser = supabaseLoginUser;
export const getUserById = supabaseGetUserById;
export const getBankById = supabaseGetBankById;
export const getLeadById = supabaseGetLeadById;
export const getLeadsByAgentId = supabaseGetLeadsByAgentId;
export const getLeadStats = supabaseGetLeadStats;
export const getAgentPerformance = supabaseGetAgentPerformance;

// Keep the mock arrays for backward compatibility during transition
export const mockUsers: User[] = [];
export const mockLeads: Lead[] = [];
export const mockBanks: Bank[] = [];
