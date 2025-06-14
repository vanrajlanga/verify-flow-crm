import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'manager' | 'tvt';
  password: string;
  phone?: string;
  district?: string;
  state?: string;
  city?: string;
  branch?: string;
  baseLocation?: string;
  profilePicture?: string;
  totalVerifications?: number;
  completionRate?: number;
  maxTravelDistance?: number;
  extraChargePerKm?: number;
  status?: 'active' | 'inactive';
  managedBankId?: string; // New field for manager role
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
  fatherName?: string;
  motherName?: string;
  gender?: string;
  agencyFileNo?: string;
  applicationBarcode?: string;
  caseId?: string;
  schemeDesc?: string;
  bankBranch?: string;
  bankProduct?: string;
  initiatedUnderBranch?: string;
  additionalComments?: string;
  leadType?: string;
  leadTypeId?: string;
  loanAmount?: string;
  loanType?: string;
  vehicleBrandName?: string;
  vehicleBrandId?: string;
  vehicleModelName?: string;
  vehicleModelId?: string;
  addresses: Address[];
  coApplicant?: {
    name: string;
    age?: number;
    phone: string;
    email: string;
    relation: string;
    occupation: string;
    monthlyIncome: string;
  };
}

export interface Verification {
  id: string;
  leadId: string;
  status: "Not Started" | "In Progress" | "Completed" | "Rejected";
  agentId: string;
  photos: { id: string; name: string; url: string; uploadDate: Date; }[];
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
  type: string;
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
  visitType: 'Residence' | 'Office' | 'Both';
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
  icon?: LucideIcon;
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
export const users: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    password: 'admin123',
    status: 'active'
  },
  {
    id: 'agent-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'agent',
    password: 'agent123',
    phone: '+91 9876543210',
    district: 'Mumbai',
    state: 'Maharashtra',
    city: 'Mumbai',
    branch: 'Mumbai Central',
    baseLocation: 'Mumbai Central',
    totalVerifications: 145,
    completionRate: 92,
    maxTravelDistance: 50,
    extraChargePerKm: 15,
    status: 'active'
  },
  {
    id: 'manager-1',
    name: 'Chintan Shah',
    email: 'chintan@example.com',
    role: 'manager',
    password: 'manager123',
    phone: '+91 9876543211',
    district: 'Mumbai',
    state: 'Maharashtra',
    city: 'Mumbai',
    status: 'active',
    managedBankId: 'axis' // Manager for Axis Bank
  },
  {
    id: 'manager-2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'manager',
    password: 'manager123',
    phone: '+91 9876543212',
    district: 'Bangalore',
    state: 'Karnataka',
    city: 'Bangalore',
    status: 'active',
    managedBankId: 'hdfc' // Manager for HDFC Bank
  },
  {
    id: 'tvt-1',
    name: 'TVT User',
    email: 'tvt@example.com',
    role: 'tvt',
    password: 'tvt123',
    status: 'active'
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'John Doe',
    age: 35,
    job: 'Software Engineer',
    address: {
      type: 'Residence',
      street: '123 Main Street',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    status: 'Pending',
    bank: 'HDFC Bank',
    visitType: 'Residence',
    assignedTo: 'Mike TVT',
    createdAt: new Date(),
    documents: [],
    instructions: 'Verify residence address and employment details',
    verification: {
      id: 'verification-1',
      leadId: 'lead-1',
      status: 'Not Started',
      agentId: 'tvt-1',
      photos: [],
      documents: [],
      notes: ''
    }
  },
  {
    id: 'lead-2',
    name: 'Jane Smith',
    age: 28,
    job: 'Marketing Manager',
    address: {
      type: 'Residence',
      street: '456 Oak Avenue',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002'
    },
    status: 'Pending',
    bank: 'ICICI Bank',
    visitType: 'Both',
    assignedTo: 'Mike TVT',
    createdAt: new Date(),
    documents: [],
    instructions: 'Verify both residence and office address',
    verification: {
      id: 'verification-2',
      leadId: 'lead-2',
      status: 'Not Started',
      agentId: 'tvt-1',
      photos: [],
      documents: [],
      notes: ''
    }
  },
  {
    id: 'lead-3',
    name: 'Rajesh Patel',
    age: 42,
    job: 'Business Owner',
    address: {
      type: 'Residence',
      street: '789 Park Road',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400003'
    },
    status: 'Pending',
    bank: 'SBI Bank',
    visitType: 'Office',
    assignedTo: 'Mike TVT',
    createdAt: new Date(),
    documents: [],
    instructions: 'Verify business address and income documents',
    verification: {
      id: 'verification-3',
      leadId: 'lead-3',
      status: 'Not Started',
      agentId: 'tvt-1',
      photos: [],
      documents: [],
      notes: ''
    }
  },
  {
    id: 'lead-4',
    name: 'Priya Sharma',
    age: 31,
    job: 'Teacher',
    address: {
      type: 'Residence',
      street: '321 School Lane',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400004'
    },
    status: 'Completed',
    bank: 'Axis Bank',
    visitType: 'Residence',
    assignedTo: 'Mike TVT',
    createdAt: new Date(),
    documents: [],
    instructions: 'Standard residence verification',
    verification: {
      id: 'verification-4',
      leadId: 'lead-4',
      status: 'Completed',
      agentId: 'tvt-1',
      photos: [],
      documents: [],
      notes: 'Verification completed successfully'
    }
  },
  {
    id: 'lead-5',
    name: 'Amit Kumar',
    age: 29,
    job: 'Software Developer',
    address: {
      type: 'Residence',
      street: '567 Tech Park',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400005'
    },
    status: 'Pending',
    bank: 'Kotak Bank',
    visitType: 'Residence',
    assignedTo: 'Mike TVT',
    createdAt: new Date(),
    documents: [],
    instructions: 'Verify residence and employment',
    verification: {
      id: 'verification-5',
      leadId: 'lead-5',
      status: 'Not Started',
      agentId: 'tvt-1',
      photos: [],
      documents: [],
      notes: ''
    }
  }
];

export const mockBanks: Bank[] = [];
export const banks: Bank[] = [
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra Bank' }
];
export const bankBranches: any[] = [
  { id: '1', name: 'Mumbai Central', bank: 'HDFC Bank' },
  { id: '2', name: 'Delhi Main', bank: 'ICICI Bank' },
  { id: '3', name: 'Bangalore Tech', bank: 'State Bank of India' },
  { id: '4', name: 'Chennai South', bank: 'Axis Bank' },
  { id: '5', name: 'Pune West', bank: 'Kotak Mahindra Bank' }
];
export const leadTypes: any[] = [
  { id: '1', name: 'Home Loan' },
  { id: '2', name: 'Personal Loan' },
  { id: '3', name: 'Vehicle Loan' },
  { id: '4', name: 'Business Loan' }
];
export const agents: User[] = [
  { 
    id: 'agent1', 
    name: 'John Agent', 
    email: 'john@example.com', 
    role: 'agent', 
    branch: 'Mumbai Central',
    password: 'password123',
    status: 'active'
  },
  { 
    id: 'tvt1', 
    name: 'Sarah TVT', 
    email: 'sarah@example.com', 
    role: 'tvtteam', 
    branch: 'Delhi Main',
    password: 'password123',
    status: 'active'
  },
  { 
    id: 'tvt-1', 
    name: 'Mike TVT', 
    email: 'mike.tvt@example.com', 
    role: 'tvtteam', 
    branch: 'Mumbai Central',
    password: 'password',
    status: 'active'
  }
];
