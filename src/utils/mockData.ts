// Types
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'agent' | 'admin';
  state?: string;
  district?: string;
  city?: string;
  totalVerifications?: number;
  completionRate?: number;
  baseLocation?: string;
  maxTravelDistance?: number;
  extraChargePerKm?: number;
  profilePicture?: string;
  documents?: {
    id: string;
    type: string;
    filename: string;
    url: string;
    uploadDate: string;
  }[];
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
  documents?: string[];
  instructions?: string;
  verification: VerificationData;
}

export interface Address {
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface AdditionalDetails {
  company?: string;
  designation?: string;
  workExperience?: string;
  propertyType?: string;
  ownershipStatus?: string;
  propertyAge?: string;
  monthlyIncome?: string;
  annualIncome?: string;
  otherIncome?: string;
  addresses?: Array<{
    type: string;
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  }>;
}

export interface VerificationData {
  id: string;
  leadId: string;
  agentId: string;
  startTime?: Date;
  arrivalTime?: Date;
  completionTime?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos: Document[];
  documents: Document[];
  notes?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Rejected';
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'PAN' | 'Aadhar' | 'Voter ID' | 'Rent Agreement' | 'Job ID' | 'Salary Slip' | 'Business License' | 'Photo' | 'Other';
  uploadedBy: 'bank' | 'agent';
  url: string;
  uploadDate: Date;
}

export interface Bank {
  id: string;
  name: string;
  totalApplications: number;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@bankkyc.com',
    role: 'admin',
    phone: '+91 9876543210',
    totalVerifications: 0,
    completionRate: 0
  },
  {
    id: '2',
    name: 'Agent Delhi',
    email: 'agent.delhi@bankkyc.com',
    role: 'agent',
    district: 'Delhi',
    phone: '+91 9876543211',
    baseLocation: 'Central Delhi, New Delhi',
    maxTravelDistance: 15,
    extraChargePerKm: 10,
    totalVerifications: 45,
    completionRate: 92
  },
  {
    id: '3',
    name: 'Agent Mumbai',
    email: 'agent.mumbai@bankkyc.com',
    role: 'agent',
    district: 'Mumbai',
    phone: '+91 9876543212',
    baseLocation: 'Andheri, Mumbai',
    maxTravelDistance: 20,
    extraChargePerKm: 8,
    totalVerifications: 38,
    completionRate: 89
  },
  {
    id: '4',
    name: 'Agent Bangalore',
    email: 'agent.bangalore@bankkyc.com',
    role: 'agent',
    district: 'Bangalore',
    phone: '+91 9876543213',
    baseLocation: 'Koramangala, Bangalore',
    maxTravelDistance: 12,
    extraChargePerKm: 12,
    totalVerifications: 52,
    completionRate: 95
  }
];

export const mockBanks: Bank[] = [
  { id: '1', name: 'HDFC Bank', totalApplications: 120 },
  { id: '2', name: 'ICICI Bank', totalApplications: 95 },
  { id: '3', name: 'State Bank of India', totalApplications: 150 },
  { id: '4', name: 'Axis Bank', totalApplications: 85 },
  { id: '5', name: 'Bank of Baroda', totalApplications: 65 },
  { id: '6', name: 'Punjab National Bank', totalApplications: 70 },
  { id: '7', name: 'Kotak Mahindra Bank', totalApplications: 55 },
  { id: '8', name: 'IndusInd Bank', totalApplications: 45 },
  { id: '9', name: 'Yes Bank', totalApplications: 40 },
  { id: '10', name: 'Canara Bank', totalApplications: 60 }
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    age: 32,
    job: 'Software Engineer',
    address: {
      street: '123 Main Street',
      city: 'New Delhi',
      district: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    visitType: 'Both',
    status: 'Pending',
    assignedTo: '2',
    bank: '1',
    documents: [
      {
        id: 'd1',
        name: 'PAN Card',
        type: 'PAN',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-15')
      },
      {
        id: 'd2',
        name: 'Aadhar Card',
        type: 'Aadhar',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-15')
      }
    ],
    instructions: 'Verify both home and office addresses. Confirm employment details with HR.',
    createdAt: new Date('2023-03-14')
  },
  {
    id: '2',
    name: 'Priya Patel',
    age: 28,
    job: 'Marketing Manager',
    address: {
      street: '456 Park Avenue',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    visitType: 'Home',
    status: 'In Progress',
    assignedTo: '3',
    bank: '2',
    documents: [
      {
        id: 'd3',
        name: 'PAN Card',
        type: 'PAN',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-18')
      }
    ],
    verification: {
      id: 'v1',
      leadId: '2',
      agentId: '3',
      startTime: new Date('2023-03-20T10:30:00'),
      arrivalTime: new Date('2023-03-20T11:15:00'),
      status: 'In Progress',
      photos: [],
      documents: []
    },
    createdAt: new Date('2023-03-17')
  },
  {
    id: '3',
    name: 'Amit Kumar',
    age: 35,
    job: 'Business Owner',
    address: {
      street: '789 Tech Park',
      city: 'Bangalore',
      district: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    visitType: 'Office',
    status: 'Completed',
    assignedTo: '4',
    bank: '3',
    documents: [
      {
        id: 'd4',
        name: 'PAN Card',
        type: 'PAN',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-10')
      },
      {
        id: 'd5',
        name: 'Business License',
        type: 'Business License',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-10')
      }
    ],
    verification: {
      id: 'v2',
      leadId: '3',
      agentId: '4',
      startTime: new Date('2023-03-12T09:00:00'),
      arrivalTime: new Date('2023-03-12T09:45:00'),
      completionTime: new Date('2023-03-12T10:30:00'),
      location: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      status: 'Completed',
      notes: 'Verified business premises. All documents authentic. Business appears operational with 10 employees present.',
      photos: [
        {
          id: 'p1',
          name: 'Office Entrance',
          type: 'Photo',
          uploadedBy: 'agent',
          url: '/placeholder.svg',
          uploadDate: new Date('2023-03-12T09:50:00')
        },
        {
          id: 'p2',
          name: 'Applicant Photo',
          type: 'Photo',
          uploadedBy: 'agent',
          url: '/placeholder.svg',
          uploadDate: new Date('2023-03-12T10:00:00')
        }
      ],
      documents: [
        {
          id: 'd6',
          name: 'Business License Copy',
          type: 'Business License',
          uploadedBy: 'agent',
          url: '/placeholder.svg',
          uploadDate: new Date('2023-03-12T10:10:00')
        }
      ],
      adminRemarks: 'All documents and verification complete. Approved for banking services.',
      reviewedBy: '1',
      reviewedAt: new Date('2023-03-13T14:30:00')
    },
    createdAt: new Date('2023-03-09')
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    age: 29,
    job: 'Doctor',
    address: {
      street: '321 Hospital Road',
      city: 'New Delhi',
      district: 'Delhi',
      state: 'Delhi',
      pincode: '110005'
    },
    visitType: 'Both',
    status: 'Pending',
    assignedTo: '2',
    bank: '4',
    documents: [
      {
        id: 'd7',
        name: 'PAN Card',
        type: 'PAN',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-19')
      },
      {
        id: 'd8',
        name: 'Medical License',
        type: 'Job ID',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-19')
      }
    ],
    instructions: 'Verify hospital employment and residence. Collect proof of income.',
    createdAt: new Date('2023-03-18')
  },
  {
    id: '5',
    name: 'Vikram Singh',
    age: 45,
    job: 'Government Officer',
    address: {
      street: '567 Civil Lines',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400010'
    },
    visitType: 'Home',
    status: 'Pending',
    assignedTo: '3',
    bank: '5',
    documents: [
      {
        id: 'd9',
        name: 'PAN Card',
        type: 'PAN',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-20')
      },
      {
        id: 'd10',
        name: 'Government ID',
        type: 'Job ID',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-20')
      }
    ],
    createdAt: new Date('2023-03-19')
  },
  {
    id: '6',
    name: 'Meena Reddy',
    age: 33,
    job: 'Accountant',
    address: {
      street: '890 Finance Street',
      city: 'Bangalore',
      district: 'Bangalore',
      state: 'Karnataka',
      pincode: '560010'
    },
    visitType: 'Office',
    status: 'Rejected',
    assignedTo: '4',
    bank: '6',
    documents: [
      {
        id: 'd11',
        name: 'PAN Card',
        type: 'PAN',
        uploadedBy: 'bank',
        url: '/placeholder.svg',
        uploadDate: new Date('2023-03-05')
      }
    ],
    verification: {
      id: 'v3',
      leadId: '6',
      agentId: '4',
      startTime: new Date('2023-03-07T11:00:00'),
      arrivalTime: new Date('2023-03-07T11:30:00'),
      completionTime: new Date('2023-03-07T12:15:00'),
      location: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      status: 'Rejected',
      notes: 'Unable to verify employment. Office address does not exist as stated.',
      photos: [
        {
          id: 'p3',
          name: 'Location Photo',
          type: 'Photo',
          uploadedBy: 'agent',
          url: '/placeholder.svg',
          uploadDate: new Date('2023-03-07T11:45:00')
        }
      ],
      documents: [],
      adminRemarks: 'Application rejected due to false employment information.',
      reviewedBy: '1',
      reviewedAt: new Date('2023-03-08T10:00:00')
    },
    createdAt: new Date('2023-03-04')
  }
];

// Authentication helper functions
export const loginUser = (email: string, password: string): User | null => {
  // In a real app, this would validate against a backend
  // For demo, we'll accept any email that matches our mock users and any password
  const user = mockUsers.find(u => u.email === email);
  return user || null;
};

export const getLeadsByAgentId = (agentId: string): Lead[] => {
  return mockLeads.filter(lead => lead.assignedTo === agentId);
};

export const getLeadById = (leadId: string): Lead | undefined => {
  return mockLeads.find(lead => lead.id === leadId);
};

export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};

export const getBankById = (bankId: string): Bank | undefined => {
  return mockBanks.find(bank => bank.id === bankId);
};

export const updateLeadStatus = (leadId: string, status: Lead['status']): void => {
  const lead = mockLeads.find(lead => lead.id === leadId);
  if (lead) {
    lead.status = status;
  }
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
    .map(agent => ({
      id: agent.id,
      name: agent.name,
      district: agent.district,
      totalVerifications: agent.totalVerifications,
      completionRate: agent.completionRate
    }));
};
