// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  password?: string;
  state?: string;
  district?: string;
  city?: string;
  totalVerifications?: number;
  completionRate?: number;
  phone?: string;
  baseLocation?: string;
  maxTravelDistance?: number;
  extraChargePerKm?: number;
  profilePicture?: string;
  documents?: {
    id: string;
    type: string;
    name: string;
    url: string;
    verified: boolean;
  }[];
  attendance?: {
    date: string;
    checkIn: string;
    checkOut: string | null;
    status: 'present' | 'absent' | 'half-day';
  }[];
  leaveRequests?: {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  additionalAddresses?: {
    id: string;
    type: string;
    street: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }[];
  visitType: string;
  leadType: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  assignedTo: string;
  bank: string;
  verificationDate?: string; // Added for verification scheduling
  additionalDetails?: {
    jobDetails?: {
      employer?: string;
      designation?: string;
      yearsEmployed?: number;
      monthlySalary?: number;
    };
    propertyDetails?: {
      propertyType?: string;
      ownership?: string;
      estimatedValue?: number;
      loanAmount?: number;
    };
    incomeDetails?: {
      annualIncome?: number;
      incomeSource?: string;
      otherIncome?: number;
      otherIncomeSource?: string;
    };
  };
  verification?: {
    id: string;
    agentId: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Rejected';
    startTime?: string;
    completionTime?: string;
    documents?: {
      id: string;
      type: string;
      name: string;
      url: string;
    }[];
    photos?: {
      id: string;
      caption: string;
      url: string;
    }[];
    notes?: string;
    reviewedBy?: string;
    reviewNotes?: string;
  };
}

export interface Document {
  id: string;
  name: string;
  type: 'PAN' | 'Aadhar' | 'Voter ID' | 'Rent Agreement' | 'Job ID' | 'Salary Slip' | 'Business License' | 'Photo' | 'Other';
  uploadedBy: 'bank' | 'agent';
  url: string;
  uploadDate: Date;
}

export interface Verification {
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

export interface Bank {
  id: string;
  name: string;
  totalApplications: number;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: "a1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password",
    role: "admin",
    profilePicture: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
  },
  {
    id: "u1",
    name: "John Agent",
    email: "john@example.com",
    password: "password",
    role: "agent",
    state: "Karnataka",
    district: "Bangalore Urban",
    city: "Bangalore",
    totalVerifications: 24,
    completionRate: 92,
    phone: "9876543210",
    baseLocation: "MG Road, Bangalore",
    maxTravelDistance: 15,
    extraChargePerKm: 10,
    profilePicture: "https://ui-avatars.com/api/?name=John+Agent&background=4F46E5&color=fff",
    documents: [
      {
        id: "doc1",
        type: "panCard",
        name: "PAN Card",
        url: "https://placehold.co/600x400?text=PAN+Card",
        verified: true
      },
      {
        id: "doc2",
        type: "aadharCard",
        name: "Aadhar Card",
        url: "https://placehold.co/600x400?text=Aadhar+Card",
        verified: true
      }
    ],
    attendance: [
      {
        date: "2025-05-20",
        checkIn: "09:15:00",
        checkOut: "18:30:00",
        status: "present"
      },
      {
        date: "2025-05-21",
        checkIn: "09:30:00",
        checkOut: "18:00:00",
        status: "present"
      }
    ],
    leaveRequests: []
  },
  {
    id: "u2",
    name: "Jane Agent",
    email: "jane@example.com",
    password: "password",
    role: "agent",
    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    totalVerifications: 18,
    completionRate: 85,
    phone: "8765432109",
    baseLocation: "Andheri East, Mumbai",
    maxTravelDistance: 20,
    extraChargePerKm: 12,
    profilePicture: "https://ui-avatars.com/api/?name=Jane+Agent&background=16A34A&color=fff",
    documents: [
      {
        id: "doc3",
        type: "panCard",
        name: "PAN Card",
        url: "https://placehold.co/600x400?text=PAN+Card",
        verified: true
      }
    ],
    attendance: [
      {
        date: "2025-05-20",
        checkIn: "09:45:00",
        checkOut: "18:15:00",
        status: "present"
      },
      {
        date: "2025-05-21",
        checkIn: "09:20:00",
        checkOut: null,
        status: "half-day"
      }
    ],
    leaveRequests: [
      {
        id: "leave1",
        startDate: "2025-06-10",
        endDate: "2025-06-12",
        reason: "Family function",
        status: "pending"
      }
    ]
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
    id: "1",
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@example.com",
    address: {
      street: "123 Main Street",
      city: "Bangalore",
      district: "Bangalore Urban",
      state: "Karnataka",
      postalCode: "560001",
      coordinates: {
        lat: 12.9716,
        lng: 77.5946
      }
    },
    visitType: "Residence",
    leadType: "Personal Loan",
    status: "Pending",
    assignedTo: "u1",
    bank: "b1",
    verificationDate: "2025-05-25",
    additionalDetails: {
      jobDetails: {
        employer: "TechCorp",
        designation: "Software Engineer",
        yearsEmployed: 3,
        monthlySalary: 85000
      },
      propertyDetails: {
        propertyType: "Apartment",
        ownership: "Self",
        estimatedValue: 5500000,
        loanAmount: 3500000
      }
    },
    verification: {
      id: "v1",
      agentId: "u1",
      status: "Not Started",
      documents: [],
      photos: []
    }
  },
  {
    id: "2",
    name: "Priya Patel",
    phone: "8765432109",
    email: "priya@example.com",
    address: {
      street: "456 Park Avenue",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      coordinates: {
        lat: 19.0759,
        lng: 72.8777
      }
    },
    visitType: "Home",
    status: "In Progress",
    assignedTo: "u2",
    bank: "b2",
    documents: [
      {
        id: "d3",
        name: "PAN Card",
        type: "PAN",
        uploadedBy: "bank",
        url: "/placeholder.svg",
        uploadDate: new Date('2023-03-18')
      }
    ],
    verification: {
      id: "v2",
      leadId: "2",
      agentId: "u2",
      startTime: new Date('2023-03-20T10:30:00'),
      arrivalTime: new Date('2023-03-20T11:15:00'),
      status: "In Progress",
      photos: [],
      documents: []
    },
    createdAt: new Date('2023-03-17')
  },
  {
    id: "3",
    name: "Amit Kumar",
    phone: "9876543212",
    email: "amit@example.com",
    address: {
      street: "789 Tech Park",
      city: "Bangalore",
      district: "Bangalore",
      state: "Karnataka",
      postalCode: "560001",
      coordinates: {
        lat: 12.9716,
        lng: 77.5946
      }
    },
    visitType: "Office",
    status: "Completed",
    assignedTo: "u1",
    bank: "b3",
    documents: [
      {
        id: "d4",
        name: "PAN Card",
        type: "PAN",
        uploadedBy: "bank",
        url: "/placeholder.svg",
        uploadDate: new Date('2023-03-10')
      },
      {
        id: "d5",
        name: "Business License",
        type: "Business License",
        uploadedBy: "bank",
        url: "/placeholder.svg",
        uploadDate: new Date('2023-03-10')
      }
    ],
    verification: {
      id: "v3",
      leadId: "3",
      agentId: "u1",
      startTime: new Date('2023-03-12T09:00:00'),
      arrivalTime: new Date('2023-03-12T09:45:00'),
      completionTime: new Date('2023-03-12T10:30:00'),
      location: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      status: "Completed",
      notes: "Verified business premises. All documents authentic. Business appears operational with 10 employees present.",
      photos: [
        {
          id: "p1",
          name: "Office Entrance",
          type: "Photo",
          uploadedBy: "agent",
          url: "/placeholder.svg",
          uploadDate: new Date('2023-03-12T09:50:00')
        },
        {
          id: "p2",
          name: "Applicant Photo",
          type: "Photo",
          uploadedBy: "agent",
          url: "/placeholder.svg",
          uploadDate: new Date('2023-03-12T10:00:00')
        }
      ],
      documents: [
        {
          id: "d6",
          name: "Business License Copy",
          type: "Business License",
          uploadedBy: "agent",
          url: "/placeholder.svg",
          uploadDate: new Date('2023-03-12T10:10:00')
        }
      ],
      adminRemarks: "All documents and verification complete. Approved for banking services.",
      reviewedBy: "1",
      reviewedAt: new Date('2023-03-13T14:30:00')
    },
    createdAt: new Date('2023-03-09')
  },
  {
    id: "4",
    name: "Sneha Gupta",
    phone: "9876543213",
    email: "sneha@example.com",
    address: {
      street: "321 Hospital Road",
      city: "New Delhi",
      district: "Delhi",
      state: "Delhi",
      postalCode: "110005",
      coordinates: {
        lat: 28.6139,
        lng: 77.2090
      }
    },
    visitType: "Both",
    status: "Pending",
    assignedTo: "u1",
    bank: "b4",
    documents: [
      {
        id: "d7",
        name: "PAN Card",
        type: "PAN",
        uploadedBy: "bank",
        url: "/placeholder.svg",
        uploadDate: new Date('2023-03-19')
      },
      {
        id: "d8",
        name: "Medical License",
        type: "Job ID",
        uploadedBy: "bank",
        url: "/placeholder.svg",
        uploadDate: new Date('2023-03-19')
      }
    ],
    instructions: "Verify hospital employment and residence. Collect proof of income.",
    createdAt: new Date('2023-03-18')
  },
  {
    id: "5",
    name: "Vikram Singh",
    phone: "9876543214",
    email: "vikram@example.com",
    address: {
      street: "567 Civil Lines",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      postalCode: "400010",
      coordinates: {
        lat: 19.0759,
        lng: 72.8777
      }
    },
    visitType: "Home",
    status: "Pending",
    assignedTo: "u2",
    bank: "b5",
    documents: [
      {
        id: "d9",
        name: "PAN Card",
        type: "PAN",
        uploadedBy: "bank",
        url: "/placeholder.svg",
        uploadDate: new Date('2023-03-20')
      },
      {
        id: "d10",
        name: "Government ID",
        type: "Job ID",
        uploadedBy: "bank",
        url: "/placeholder.svg",
        uploadDate: new Date('2023-03-20')
      }
    ],
    createdAt: new Date('2023-03-19')
  },
  {
    id: "6",
    name: "Meena Reddy",
    phone: "9876543215",
    email: "meena@example.com",
    address: {
      street: "890 Finance Street",
      city: "Bangalore",
      district: "Bangalore",
      state: "Karnataka",
      postalCode: "560010",
      coordinates: {
        lat: 12.9716,
        lng: 77.5946
      }
    },
    visitType: "Office",
    status: "Rejected",
    assignedTo: "u1",
    bank: "b6",
    documents: [
      {
        id: "d11",
        name: "PAN Card",
        type: "PAN",
        uploadedBy: "bank",
        url: "/placeholder.svg",
        uploadDate: new Date('2023-03-05')
      }
    ],
    verification: {
      id: "v4",
      leadId: "6",
      agentId: "u1",
      startTime: new Date('2023-03-07T11:00:00'),
      arrivalTime: new Date('2023-03-07T11:30:00'),
      completionTime: new Date('2023-03-07T12:15:00'),
      location: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      status: "Rejected",
      notes: "Unable to verify employment. Office address does not exist as stated.",
      photos: [
        {
          id: "p3",
          name: "Location Photo",
          type: "Photo",
          uploadedBy: "agent",
          url: "/placeholder.svg",
          uploadDate: new Date('2023-03-07T11:45:00')
        }
      ],
      documents: [],
      adminRemarks: "Application rejected due to false employment information.",
      reviewedBy: "1",
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
