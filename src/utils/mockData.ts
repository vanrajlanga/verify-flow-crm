import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Type Definitions
export interface Address {
  street: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AdditionalDetails {
  jobDetails?: {
    employer?: string;
    designation?: string;
    yearsEmployed?: number;
    monthlySalary?: number;
    workExperience?: string;
    company?: string;
  };
  propertyDetails?: {
    propertyType?: string;
    ownership?: string;
    estimatedValue?: number;
    loanAmount?: number;
    propertyAge?: string;
  };
  incomeDetails?: {
    monthlyIncome?: string;
    annualIncome?: string;
    otherIncome?: string;
  };
  addresses?: {
    type: string;
    street: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
  }[];
}

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadDate?: Date | string;
  uploadedBy?: 'agent' | 'bank' | 'admin';
  verified?: boolean;
}

export interface Photo {
  id: string;
  caption: string;
  url: string;
  name?: string;
  uploadDate?: Date | string;
}

export interface VerificationData {
  id: string;
  agentId: string;
  leadId?: string;
  status: 'In Progress' | 'Completed' | 'Rejected' | 'Not Started' | 'Pending';
  startTime?: string;
  completionTime?: string;
  arrivalTime?: string | Date;
  documents?: Document[];
  photos?: Photo[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string | Date;
  reviewNotes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  adminRemarks?: string;
}

export interface Lead {
  id: string;
  name: string;
  age: number;
  job: string;
  address: Address;
  additionalDetails: AdditionalDetails;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected' | 'Not Started';
  bank: string;
  visitType: 'Office' | 'Residence' | 'Both' | 'Home';
  assignedTo: string;
  verificationDate?: Date | string;
  createdAt: Date | string;
  documents: Document[];
  instructions?: string;
  verification?: VerificationData;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'agent';
  district?: string;
  state?: string;
  city?: string;
  totalVerifications?: number;
  completionRate?: number;
  profilePicture?: string;
  kycDocuments?: Document[];
  baseLocation?: string;
  maxTravelDistance?: number;
  extraChargePerKm?: number;
}

export interface Bank {
  id: string;
  name: string;
  headOffice: string;
  pointOfContact: string;
  email: string;
  phone: string;
  totalApplications?: number;
}

// Mock data and helper functions
export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'admin',
    profilePicture: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 'u2',
    name: 'Alice Smith',
    email: 'alice.smith@example.com',
    password: 'password456',
    role: 'agent',
    district: 'Mumbai',
    state: 'Maharashtra',
    city: 'Mumbai City',
    totalVerifications: 25,
    completionRate: 85,
    profilePicture: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 'u3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    password: 'password789',
    role: 'agent',
    district: 'Pune',
    state: 'Maharashtra',
    city: 'Pune City',
    totalVerifications: 30,
    completionRate: 92,
    profilePicture: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: 'u4',
    name: 'Eva Williams',
    email: 'eva.williams@example.com',
    password: 'passwordabc',
    role: 'agent',
    district: 'Bangalore',
    state: 'Karnataka',
    city: 'Bangalore City',
    totalVerifications: 22,
    completionRate: 78,
    profilePicture: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: 'u5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    password: 'passwordxyz',
    role: 'agent',
    district: 'Mumbai',
    state: 'Maharashtra',
    city: 'Navi Mumbai',
    totalVerifications: 18,
    completionRate: 68,
    profilePicture: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 'u6',
    name: 'Diana Miller',
    email: 'diana.miller@example.com',
    password: 'passworddef',
    role: 'agent',
    district: 'Pune',
    state: 'Maharashtra',
    city: 'Pimpri-Chinchwad',
    totalVerifications: 28,
    completionRate: 88,
    profilePicture: 'https://i.pravatar.cc/150?img=6'
  },
  {
    id: 'u7',
    name: 'George Taylor',
    email: 'george.taylor@example.com',
    password: 'passwordghi',
    role: 'agent',
    district: 'Bangalore',
    state: 'Karnataka',
    city: 'Electronic City',
    totalVerifications: 24,
    completionRate: 75,
    profilePicture: 'https://i.pravatar.cc/150?img=7'
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'l1',
    name: 'Amit Kumar',
    age: 32,
    job: 'Software Engineer',
    address: {
      street: '123 Main St',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001'
    },
    additionalDetails: {
      jobDetails: {
        employer: 'Tech Corp',
        designation: 'Senior Developer',
        workExperience: '5 years'
      },
      propertyDetails: {
        propertyType: 'Apartment',
        ownership: 'Owned',
        propertyAge: '5-10 years'
      },
      incomeDetails: {
        monthlyIncome: '80000',
        annualIncome: '960000',
        otherIncome: '20000'
      },
      addresses: [
        {
          type: "Home",
          street: '123 Main St',
          city: 'Mumbai',
          district: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001'
        }
      ]
    },
    status: 'In Progress',
    bank: 'b1',
    visitType: 'Residence',
    assignedTo: 'u2',
    verificationDate: new Date(),
    createdAt: new Date(),
    documents: [
      {
        id: 'doc1',
        type: 'ID Proof',
        name: 'Aadhar Card',
        url: '/placeholder.svg',
        uploadedBy: 'agent',
        uploadDate: new Date()
      }
    ],
    instructions: 'Verify address and employment details.',
    verification: {
      id: 'v1',
      agentId: 'u2',
      status: 'In Progress',
      startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      completionTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      documents: [
        {
          id: 'doc1',
          type: 'ID Proof',
          name: 'Aadhar Card',
          url: '/placeholder.svg',
          uploadedBy: 'agent',
          uploadDate: new Date()
        }
      ],
      photos: [
        {
          id: 'photo1',
          caption: 'Front view of the house',
          url: '/placeholder.svg'
        }
      ],
      notes: 'Address verified, awaiting employment verification.'
    }
  },
  {
    id: 'l2',
    name: 'Priya Sharma',
    age: 28,
    job: 'Marketing Manager',
    address: {
      street: '456 Park Ave',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001'
    },
    additionalDetails: {
      jobDetails: {
        employer: 'Global Marketing Ltd',
        designation: 'Team Lead',
        workExperience: '3 years'
      },
      propertyDetails: {
        propertyType: 'House',
        ownership: 'Rented',
        propertyAge: '10-20 years'
      },
      incomeDetails: {
        monthlyIncome: '65000',
        annualIncome: '780000',
        otherIncome: '15000'
      },
      addresses: [
        {
          type: "Home",
          street: '456 Park Ave',
          city: 'Pune',
          district: 'Pune',
          state: 'Maharashtra',
          postalCode: '411001'
        }
      ]
    },
    status: 'Completed',
    bank: 'b2',
    visitType: 'Residence',
    assignedTo: 'u3',
    verificationDate: new Date(),
    createdAt: new Date(),
    documents: [
      {
        id: 'doc2',
        type: 'Address Proof',
        name: 'Passport',
        url: '/placeholder.svg',
        uploadedBy: 'agent',
        uploadDate: new Date()
      }
    ],
    instructions: 'Confirm rental agreement and employment details.',
    verification: {
      id: 'v2',
      agentId: 'u3',
      status: 'Completed',
      startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      completionTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      documents: [
        {
          id: 'doc2',
          type: 'Address Proof',
          name: 'Passport',
          url: '/placeholder.svg',
          uploadedBy: 'agent',
          uploadDate: new Date()
        }
      ],
      photos: [
        {
          id: 'photo2',
          caption: 'External view of the property',
          url: '/placeholder.svg'
        }
      ],
      notes: 'Rental agreement and employment details verified.'
    }
  },
  {
    id: 'l3',
    name: 'Rajesh Patel',
    age: 45,
    job: 'Business Owner',
    address: {
      street: '789 Market St',
      city: 'Bangalore',
      district: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001'
    },
    additionalDetails: {
      jobDetails: {
        employer: 'Self-employed',
        designation: 'Owner',
        workExperience: '15 years'
      },
      propertyDetails: {
        propertyType: 'Commercial',
        ownership: 'Owned',
        propertyAge: '20+ years'
      },
      incomeDetails: {
        monthlyIncome: '120000',
        annualIncome: '1440000',
        otherIncome: '50000'
      },
      addresses: [
        {
          type: "Home",
          street: '789 Market St',
          city: 'Bangalore',
          district: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001'
        }
      ]
    },
    status: 'Pending',
    bank: 'b3',
    visitType: 'Office',
    assignedTo: 'u4',
    verificationDate: new Date(),
    createdAt: new Date(),
    documents: [
      {
        id: 'doc3',
        type: 'Business License',
        name: 'Trade License',
        url: '/placeholder.svg',
        uploadedBy: 'agent',
        uploadDate: new Date()
      }
    ],
    instructions: 'Verify business ownership and financial records.',
    verification: {
      id: 'v3',
      agentId: 'u4',
      status: 'Not Started',
      startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      completionTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      documents: [
        {
          id: 'doc3',
          type: 'Business License',
          name: 'Trade License',
          url: '/placeholder.svg',
          uploadedBy: 'agent',
          uploadDate: new Date()
        }
      ],
      photos: [
        {
          id: 'photo3',
          caption: 'Exterior of the business premises',
          url: '/placeholder.svg'
        }
      ],
      notes: 'Awaiting agent visit to verify business details.'
    }
  },
  {
    id: 'l4',
    name: 'Sunita Reddy',
    age: 38,
    job: 'Teacher',
    address: {
      street: '101 Gandhi Rd',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400002'
    },
    additionalDetails: {
      jobDetails: {
        employer: 'Local School',
        designation: 'Senior Teacher',
        workExperience: '10 years'
      },
      propertyDetails: {
        propertyType: 'Apartment',
        ownership: 'Owned',
        propertyAge: '10-20 years'
      },
      incomeDetails: {
        monthlyIncome: '55000',
        annualIncome: '660000',
        otherIncome: '10000'
      },
      addresses: [
        {
          type: "Home",
          street: '101 Gandhi Rd',
          city: 'Mumbai',
          district: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400002'
        }
      ]
    },
    status: 'Rejected',
    bank: 'b1',
    visitType: 'Residence',
    assignedTo: 'u5',
    verificationDate: new Date(),
    createdAt: new Date(),
    documents: [
      {
        id: 'doc4',
        type: 'Employment Proof',
        name: 'School ID',
        url: '/placeholder.svg',
        uploadedBy: 'agent',
        uploadDate: new Date()
      }
    ],
    instructions: 'Verify employment and address details.',
    verification: {
      id: 'v4',
      agentId: 'u5',
      status: 'Rejected',
      startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      completionTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      documents: [
        {
          id: 'doc4',
          type: 'Employment Proof',
          name: 'School ID',
          url: '/placeholder.svg',
          uploadedBy: 'agent',
          uploadDate: new Date()
        }
      ],
      photos: [
        {
          id: 'photo4',
          caption: 'Residence entrance',
          url: '/placeholder.svg'
        }
      ],
      notes: 'Verification failed due to mismatch in address details.'
    }
  },
  {
    id: 'l5',
    name: 'Vikram Singh',
    age: 29,
    job: 'Accountant',
    address: {
      street: '222 Nehru St',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      postalCode: '411002'
    },
    additionalDetails: {
      jobDetails: {
        employer: 'Finance Corp',
        designation: 'Junior Accountant',
        workExperience: '2 years'
      },
      propertyDetails: {
        propertyType: 'Apartment',
        ownership: 'Rented',
        propertyAge: '5-10 years'
      },
      incomeDetails: {
        monthlyIncome: '48000',
        annualIncome: '576000',
        otherIncome: '8000'
      },
      addresses: [
        {
          type: "Home",
          street: '222 Nehru St',
          city: 'Pune',
          district: 'Pune',
          state: 'Maharashtra',
          postalCode: '411002'
        }
      ]
    },
    status: 'Completed',
    bank: 'b2',
    visitType: 'Residence',
    assignedTo: 'u6',
    verificationDate: new Date(),
    createdAt: new Date(),
    documents: [
      {
        id: 'doc5',
        type: 'Salary Slip',
        name: 'Latest Payslip',
        url: '/placeholder.svg',
        uploadedBy: 'agent',
        uploadDate: new Date()
      }
    ],
    instructions: 'Verify employment and income details.',
    verification: {
      id: 'v5',
      agentId: 'u6',
      status: 'Completed',
      startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      completionTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      documents: [
        {
          id: 'doc5',
          type: 'Salary Slip',
          name: 'Latest Payslip',
          url: '/placeholder.svg',
          uploadedBy: 'agent',
          uploadDate: new Date()
        }
      ],
      photos: [
        {
          id: 'photo5',
          caption: 'Apartment balcony view',
          url: '/placeholder.svg'
        }
      ],
      notes: 'Employment and income details verified successfully.'
    }
  },
  {
    id: 'l6',
    name: 'Ananya Iyer',
    age: 31,
    job: 'Doctor',
    address: {
      street: '333 MG Road',
      city: 'Bangalore',
      district: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560003'
    },
    additionalDetails: {
      jobDetails: {
        employer: 'City Hospital',
        designation: 'Senior Resident',
        workExperience: '6 years'
      },
      propertyDetails: {
        propertyType: 'House',
        ownership: 'Owned',
        propertyAge: '5-10 years'
      },
      incomeDetails: {
        monthlyIncome: '90000',
        annualIncome: '1080000',
        otherIncome: '30000'
      },
      addresses: [
        {
          type: "Home",
          street: '333 MG Road',
          city: 'Bangalore',
          district: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560003'
        }
      ]
    },
    status: 'In Progress',
    bank: 'b3',
    visitType: 'Residence',
    assignedTo: 'u7',
    verificationDate: new Date(),
    createdAt: new Date(),
    documents: [
      {
        id: 'doc6',
        type: 'Professional License',
        name: 'Medical License',
        url: '/placeholder.svg',
        uploadedBy: 'agent',
        uploadDate: new Date()
      }
    ],
    instructions: 'Verify professional license and address details.',
    verification: {
      id: 'v6',
      agentId: 'u7',
      status: 'In Progress',
      startTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      completionTime: format(new Date(), 'MMM d, yyyy h:mm a'),
      documents: [
        {
          id: 'doc6',
          type: 'Professional License',
          name: 'Medical License',
          url: '/placeholder.svg',
          uploadedBy: 'agent',
          uploadDate: new Date()
        }
      ],
      photos: [
        {
          id: 'photo6',
          caption: 'Front view of the house',
          url: '/placeholder.svg'
        }
      ],
      notes: 'Address verified, awaiting professional license verification.'
    }
  }
];

export const mockBanks: Bank[] = [
  {
    id: 'b1',
    name: 'State Bank of India',
    headOffice: 'Mumbai',
    pointOfContact: 'Ramesh Kumar',
    email: 'ramesh.kumar@sbi.co.in',
    phone: '9876543210',
    totalApplications: 120
  },
  {
    id: 'b2',
    name: 'HDFC Bank',
    headOffice: 'Mumbai',
    pointOfContact: 'Priya Sharma',
    email: 'priya.sharma@hdfc.com',
    phone: '8765432109',
    totalApplications: 150
  },
  {
    id: 'b3',
    name: 'ICICI Bank',
    headOffice: 'Mumbai',
    pointOfContact: 'Amit Patel',
    email: 'amit.patel@icici.com',
    phone: '7654321098',
    totalApplications: 100
  }
];

export const getLeadById = (leadId: string): Lead | undefined => {
  return mockLeads.find(lead => lead.id === leadId);
};

export const getLeadsByAgentId = (agentId: string): Lead[] => {
  return mockLeads.filter(lead => lead.assignedTo === agentId);
};

export const getLeadStats = () => {
  return {
    total: mockLeads.length,
    pending: mockLeads.filter(l => l.status === 'Pending').length,
    completed: mockLeads.filter(l => l.verification?.status === 'Completed').length,
    inProgress: mockLeads.filter(l => l.verification?.status === 'In Progress').length
  };
};

export const getAgentPerformance = () => {
  return mockUsers
    .filter(user => user.role === 'agent')
    .map(agent => ({
      id: agent.id,
      name: agent.name,
      totalVerifications: agent.totalVerifications || 0,
      completionRate: agent.completionRate || 0,
      district: agent.district
    }));
};

// Helper function for login
export const loginUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  return user || null;
};

export const getBankById = (bankId: string): Bank | undefined => {
  return mockBanks.find(bank => bank.id === bankId);
};

export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};

// Helper to convert Date objects to strings for consistency
export const dateToString = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

// Helper to ensure dates can be compared regardless of type
export const compareDates = (dateA: Date | string, dateB: Date | string): number => {
  const dateObjA = typeof dateA === 'string' ? new Date(dateA) : dateA;
  const dateObjB = typeof dateB === 'string' ? new Date(dateB) : dateB;
  return dateObjA.getTime() - dateObjB.getTime();
};
