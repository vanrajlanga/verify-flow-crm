
import { IconType } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'tvtteam';
  district?: string;
  phone?: string;
  city?: string;
  state?: string;
  baseLocation?: string;
  profilePicture?: string;
  maxTravelDistance?: number;
  extraChargePerKm?: number;
  totalVerifications?: number;
  completionRate?: number;
  status?: 'active' | 'inactive';
  password?: string;
  documents?: Document[];
}

export interface Address {
  type: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface CoApplicant {
  name: string;
  age?: number;
  phone: string;
  email?: string;
  relation: string;
  occupation?: string;
  monthlyIncome?: string;
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
  coApplicant?: CoApplicant;
  addresses?: Address[];
}

export interface Verification {
  id: string;
  leadId: string;
  status: "Not Started" | "In Progress" | "Completed" | "Rejected";
  agentId: string;
  photos: (string | { id: string; name: string; url: string; uploadDate: Date; })[];
  documents: { id: string; name: string; url: string; uploadDate: Date; }[];
  notes: string;
  startTime?: Date;
  endTime?: Date;
  completionTime?: Date;
  arrivalTime?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminRemarks?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Document {
  id: string;
  name: string;
  url: string;
  uploadDate: Date;
  type?: string;
}

export interface Bank {
  id: string;
  name: string;
  code?: string;
  logo?: string;
  products?: string[];
  totalApplications?: number;
}

export interface Lead {
  id: string;
  name: string;
  age: number;
  job: string;
  address: Address;
  additionalDetails?: AdditionalDetails;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  bank: string;
  visitType: 'Residence' | 'Office';
  assignedTo: string;
  createdAt: Date;
  verificationDate?: Date;
  documents: Document[];
  instructions: string;
  verification?: Verification;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: IconType;
  disabled?: boolean;
  external?: boolean;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export type MainNavItem = NavItemWithOptionalChildren

export type SidebarNavItem = NavItemWithChildren

// Mock data exports for backward compatibility
export const mockUsers: User[] = [];
export const mockLeads: Lead[] = [];
export const mockBanks: Bank[] = [];
export const banks: Bank[] = [];
export const bankBranches: any[] = [];
export const leadTypes: any[] = [];
export const agents: User[] = [];
