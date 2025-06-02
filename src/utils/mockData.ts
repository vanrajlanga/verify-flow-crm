
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'agent';
  email: string;
  phone: string;
  district: string;
  status: 'Active' | 'Inactive';
}

export interface Address {
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

export interface VerificationData {
  id: string;
  leadId: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Rejected';
  agentId: string;
  photos: string[];
  documents: Document[];
  notes?: string;
  startTime?: Date;
  endTime?: Date;
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

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'System Administrator',
    role: 'admin',
    email: 'admin@kycverification.com',
    phone: '+91 98765 43210',
    district: '',
    status: 'Active'
  },
  {
    id: 'agent-1',
    name: 'Rajesh Kumar',
    role: 'agent',
    email: 'rajesh@kycverification.com',
    phone: '+91 98765 43211',
    district: 'Bangalore Urban',
    status: 'Active'
  },
  {
    id: 'agent-2',
    name: 'Priya Sharma',
    role: 'agent',
    email: 'priya@kycverification.com',
    phone: '+91 98765 43212',
    district: 'Mumbai',
    status: 'Active'
  },
  {
    id: 'agent-3',
    name: 'Amit Patel',
    role: 'agent',
    email: 'amit@kycverification.com',
    phone: '+91 98765 43213',
    district: 'Bangalore Urban',
    status: 'Active'
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    name: 'John Doe',
    age: 35,
    job: 'Software Engineer',
    address: {
      street: '123 Tech Park',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560001'
    },
    additionalDetails: {
      company: 'Tech Solutions Pvt Ltd',
      designation: 'Senior Software Engineer',
      workExperience: '8',
      propertyType: 'apartment',
      ownershipStatus: 'owned',
      propertyAge: '5',
      monthlyIncome: '80000',
      annualIncome: '960000',
      otherIncome: '',
      addresses: [
        {
          street: '123 Tech Park',
          city: 'Bangalore',
          district: 'Bangalore Urban',
          state: 'Karnataka',
          pincode: '560001'
        }
      ],
      phoneNumber: '+91 98765 43214',
      email: 'john.doe@email.com',
      dateOfBirth: '1989-05-15',
      agencyFileNo: 'AGY001',
      applicationBarcode: 'APP001',
      caseId: 'CASE001',
      schemeDesc: 'Home Loan Scheme',
      bankBranch: 'branch-1',
      additionalComments: 'Priority customer',
      leadType: 'HOME LOAN',
      leadTypeId: 'home-loan',
      loanAmount: '5000000',
      loanType: 'HOME LOAN'
    },
    status: 'Pending',
    bank: 'bank-1',
    visitType: 'Residence',
    assignedTo: 'agent-1',
    createdAt: new Date('2024-01-15'),
    verificationDate: new Date('2024-01-20'),
    documents: [],
    instructions: 'Please verify employment and property ownership',
    verification: {
      id: 'verification-001',
      leadId: 'lead-001',
      status: 'Not Started',
      agentId: 'agent-1',
      photos: [],
      documents: [],
      notes: ''
    }
  },
  {
    id: 'lead-002',
    name: 'Sarah Wilson',
    age: 28,
    job: 'Marketing Manager',
    address: {
      street: '456 Business District',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    additionalDetails: {
      company: 'Marketing Pro',
      designation: 'Marketing Manager',
      workExperience: '5',
      propertyType: 'apartment',
      ownershipStatus: 'rented',
      propertyAge: '3',
      monthlyIncome: '60000',
      annualIncome: '720000',
      otherIncome: '',
      addresses: [
        {
          street: '456 Business District',
          city: 'Mumbai',
          district: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        }
      ],
      phoneNumber: '+91 98765 43215',
      email: 'sarah.wilson@email.com',
      dateOfBirth: '1996-03-22',
      agencyFileNo: 'AGY002',
      applicationBarcode: 'APP002',
      caseId: 'CASE002',
      schemeDesc: 'Auto Loan Scheme',
      bankBranch: 'branch-2',
      additionalComments: 'First time customer',
      leadType: 'AUTO LOANS',
      leadTypeId: 'auto-loans',
      vehicleBrandName: 'Maruti Suzuki',
      vehicleBrandId: 'brand-1',
      vehicleModelName: 'Swift',
      vehicleModelId: 'model-1'
    },
    status: 'In Progress',
    bank: 'bank-2',
    visitType: 'Both',
    assignedTo: 'agent-2',
    createdAt: new Date('2024-01-16'),
    verificationDate: new Date('2024-01-21'),
    documents: [],
    instructions: 'Verify income and vehicle details',
    verification: {
      id: 'verification-002',
      leadId: 'lead-002',
      status: 'In Progress',
      agentId: 'agent-2',
      photos: [],
      documents: [],
      notes: 'Initial verification started'
    }
  }
];

export const mockBanks: Bank[] = [
  { id: 'bank-1', name: 'State Bank of India', totalApplications: 156 },
  { id: 'bank-2', name: 'HDFC Bank', totalApplications: 134 },
  { id: 'bank-3', name: 'ICICI Bank', totalApplications: 98 },
  { id: 'bank-4', name: 'Axis Bank', totalApplications: 87 },
  { id: 'bank-5', name: 'Punjab National Bank', totalApplications: 76 }
];

export const getLeadsByAgentId = (agentId: string): Lead[] => {
  return mockLeads.filter(lead => lead.assignedTo === agentId);
};

export const getLeadStats = () => {
  const total = mockLeads.length;
  const pending = mockLeads.filter(lead => lead.status === 'Pending').length;
  const inProgress = mockLeads.filter(lead => lead.status === 'In Progress').length;
  const completed = mockLeads.filter(lead => lead.status === 'Completed').length;
  const rejected = mockLeads.filter(lead => lead.status === 'Rejected').length;

  return { total, pending, inProgress, completed, rejected };
};

export const getAgentPerformance = () => {
  return mockUsers
    .filter(user => user.role === 'agent')
    .map(agent => {
      const agentLeads = mockLeads.filter(lead => lead.assignedTo === agent.id);
      const completedLeads = agentLeads.filter(lead => lead.status === 'Completed');
      const completionRate = agentLeads.length > 0 ? Math.round((completedLeads.length / agentLeads.length) * 100) : 0;

      return {
        id: agent.id,
        name: agent.name,
        district: agent.district,
        totalVerifications: agentLeads.length,
        completionRate
      };
    });
};
