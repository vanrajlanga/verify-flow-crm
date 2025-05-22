
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'bank';
  district: string;
  profilePicture?: string;
  status?: 'Active' | 'Inactive' | 'On Leave';
  verificationCount?: number;
  completedCount?: number;
  phone?: string; // Added missing field
  baseLocation?: string; // Added missing field
  maxTravelDistance?: number; // Added missing field
  extraChargePerKm?: number; // Added missing field
  kycDocuments?: Document[]; // Added for KYC documents
}

export interface Lead {
  id: string;
  name: string;
  age: number;
  job: string;
  visitType: 'Office' | 'Residence';
  address: {
    street: string;
    city: string;
    district: string;
    state: string;
    postalCode: string; // Renamed from pincode to postalCode
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  bank: string;
  assignedTo: string;
  status: 'In Progress' | 'Completed' | 'Rejected' | 'Not Started';
  documents: Document[];
  verification?: VerificationData;
  instructions?: string;
  additionalDetails?: { // Added missing field
    jobDetails?: {
      employer?: string;
      designation?: string;
      yearsEmployed?: number;
      monthlySalary?: number;
      company?: string; // Added missing field
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
    };
  };
  scheduledDate?: string; // For verification scheduling
}

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadDate?: Date | string;
}

export interface Bank {
  id: string;
  name: string;
  headOffice: string;
  pointOfContact: string;
  email: string;
  phone: string;
  logo?: string;
}

export interface VerificationData {
  id: string;
  agentId: string;
  status: 'In Progress' | 'Completed' | 'Rejected' | 'Not Started';
  startTime?: Date | string;
  arrivalTime?: Date | string; // Added missing field
  completionTime?: Date | string;
  location?: { // Added missing field
    latitude: number;
    longitude: number;
  };
  documents?: Document[];
  photos?: Document[]; // Changed to use Document interface (needs name, url, uploadDate)
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date | string; // Added missing field
  reviewNotes?: string;
  adminRemarks?: string; // Added missing field
  leadId?: string; // Added missing field
}

// Mock data for users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    district: "All",
    profilePicture: "https://i.pravatar.cc/150?img=1",
    phone: "+91-9876543210",
    baseLocation: "Bangalore"
  },
  {
    id: "2",
    name: "Agent One",
    email: "agent1@example.com",
    password: "agent123",
    role: "agent",
    district: "Bangalore Urban",
    profilePicture: "https://i.pravatar.cc/150?img=2",
    status: "Active",
    verificationCount: 42,
    completedCount: 38,
    phone: "+91-9876543211",
    baseLocation: "Bangalore",
    maxTravelDistance: 15,
    extraChargePerKm: 5,
    kycDocuments: []
  },
  {
    id: "3",
    name: "Agent Two",
    email: "agent2@example.com",
    password: "agent123",
    role: "agent",
    district: "Mumbai",
    profilePicture: "https://i.pravatar.cc/150?img=3",
    status: "Active",
    verificationCount: 28,
    completedCount: 26,
    phone: "+91-9876543212",
    baseLocation: "Mumbai",
    maxTravelDistance: 10,
    extraChargePerKm: 7,
    kycDocuments: []
  },
  {
    id: "4",
    name: "Bank Admin",
    email: "bank@example.com",
    password: "bank123",
    role: "bank",
    district: "All",
    profilePicture: "https://i.pravatar.cc/150?img=4",
    phone: "+91-9876543213"
  }
];

// Mock data for banks
export const mockBanks: Bank[] = [
  {
    id: "1",
    name: "HDFC Bank",
    headOffice: "Mumbai",
    pointOfContact: "Rajesh Kumar",
    email: "contact@hdfc.com",
    phone: "+91-9876543220",
    logo: "/placeholder.svg"
  },
  {
    id: "2",
    name: "ICICI Bank",
    headOffice: "Mumbai",
    pointOfContact: "Priya Sharma",
    email: "contact@icici.com",
    phone: "+91-9876543221",
    logo: "/placeholder.svg"
  },
  {
    id: "3",
    name: "SBI Bank",
    headOffice: "Delhi",
    pointOfContact: "Amit Singh",
    email: "contact@sbi.com",
    phone: "+91-9876543222",
    logo: "/placeholder.svg"
  }
];

// Function to generate a verification ID
const generateVerificationId = () => `ver-${Math.floor(Math.random() * 10000)}`;

// Mock data for leads
export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Rajiv Mehta",
    age: 35,
    job: "Software Engineer",
    visitType: "Residence",
    address: {
      street: "123 Main St, Koramangala",
      city: "Bangalore",
      district: "Bangalore Urban",
      state: "Karnataka",
      postalCode: "560034",
      coordinates: {
        lat: 12.9352,
        lng: 77.6245
      }
    },
    bank: "1", // References HDFC Bank
    assignedTo: "2", // References Agent One
    status: "In Progress",
    documents: [
      {
        id: "doc1",
        type: "PAN Card",
        name: "PAN Card",
        url: "/placeholder.svg",
        uploadDate: new Date("2023-04-15")
      }
    ],
    verification: {
      id: generateVerificationId(),
      agentId: "2",
      status: "In Progress",
      startTime: new Date("2023-04-18T10:30:00"),
      photos: [],
      documents: [],
      notes: "",
      arrivalTime: null
    },
    instructions: "Verify residence and collect employment proof. The apartment is on the 4th floor, building has no elevator."
  },
  {
    id: "2",
    name: "Priya Sharma",
    age: 42,
    job: "Business Owner",
    visitType: "Office",
    address: {
      street: "456 Business Park, Whitefield",
      city: "Bangalore",
      district: "Bangalore Urban",
      state: "Karnataka",
      postalCode: "560066",
      coordinates: {
        lat: 12.9698,
        lng: 77.7499
      }
    },
    bank: "2", // References ICICI Bank
    assignedTo: "2", // References Agent One
    status: "Not Started",
    documents: [
      {
        id: "doc2",
        type: "Business Registration",
        name: "Business Registration Certificate",
        url: "/placeholder.svg",
        uploadDate: new Date("2023-04-14")
      }
    ],
    verification: {
      id: generateVerificationId(),
      agentId: "2",
      status: "Not Started",
      documents: [],
      photos: []
    },
    instructions: "Verify business premises and operations. Confirm employee count and business activity."
  },
  {
    id: "3",
    name: "Ankit Patel",
    age: 28,
    job: "Teacher",
    visitType: "Residence",
    address: {
      street: "789 Apartment Complex, Andheri",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      postalCode: "400053",
      coordinates: {
        lat: 19.1136,
        lng: 72.8697
      }
    },
    bank: "3", // References SBI Bank
    assignedTo: "3", // References Agent Two
    status: "Completed",
    documents: [
      {
        id: "doc3",
        type: "Salary Slip",
        name: "Salary Slip March 2023",
        url: "/placeholder.svg",
        uploadDate: new Date("2023-04-10")
      }
    ],
    verification: {
      id: generateVerificationId(),
      agentId: "3",
      status: "Completed",
      startTime: new Date("2023-04-12T11:00:00"),
      completionTime: new Date("2023-04-12T11:35:00"),
      arrivalTime: new Date("2023-04-12T11:10:00"),
      photos: [
        {
          id: "photo1",
          type: "Photo",
          name: "Building Entrance",
          url: "/placeholder.svg",
          uploadDate: new Date("2023-04-12")
        },
        {
          id: "photo2",
          type: "Photo",
          name: "Apartment Door",
          url: "/placeholder.svg",
          uploadDate: new Date("2023-04-12")
        }
      ],
      documents: [
        {
          id: "vdoc1",
          type: "ID Proof",
          name: "Aadhar Card",
          url: "/placeholder.svg",
          uploadDate: new Date("2023-04-12")
        }
      ],
      notes: "Verified residence. Apartment exists and applicant was present. Collected ID proof and salary documentation.",
      reviewedBy: "1",
      reviewedAt: new Date("2023-04-13T09:15:00"),
      reviewNotes: "All documentation in order. Address verified successfully.",
      adminRemarks: "Approved. Documentation is complete.",
      location: {
        latitude: 19.1136,
        longitude: 72.8697
      }
    }
  },
  {
    id: "4",
    name: "Sanjay Mishra",
    age: 52,
    job: "Government Employee",
    visitType: "Office",
    address: {
      street: "101 Government Complex, Indiranagar",
      city: "Bangalore",
      district: "Bangalore Urban",
      state: "Karnataka",
      postalCode: "560038",
      coordinates: {
        lat: 12.9784,
        lng: 77.6408
      }
    },
    bank: "1", // References HDFC Bank
    assignedTo: "2", // References Agent One
    status: "Rejected",
    documents: [
      {
        id: "doc4",
        type: "Employment Certificate",
        name: "Government Service Certificate",
        url: "/placeholder.svg",
        uploadDate: new Date("2023-04-08")
      }
    ],
    verification: {
      id: generateVerificationId(),
      agentId: "2",
      status: "Rejected",
      startTime: new Date("2023-04-10T14:30:00"),
      completionTime: new Date("2023-04-10T15:15:00"),
      arrivalTime: new Date("2023-04-10T14:40:00"),
      photos: [
        {
          id: "photo3",
          type: "Photo",
          name: "Office Building",
          url: "/placeholder.svg",
          uploadDate: new Date("2023-04-10")
        }
      ],
      documents: [],
      notes: "Office exists but applicant was not present at the time of visit. Unable to verify personal identity.",
      reviewedBy: "1",
      reviewedAt: new Date("2023-04-11T10:20:00"),
      reviewNotes: "Verification rejected due to applicant's absence.",
      adminRemarks: "Rejected. Applicant not available for verification.",
      location: {
        latitude: 12.9784,
        longitude: 77.6408
      }
    }
  }
];

// Utility functions
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getBankById = (id: string): Bank | undefined => {
  return mockBanks.find(bank => bank.id === id);
};

export const getLeadById = (id: string): Lead | undefined => {
  return mockLeads.find(lead => lead.id === id);
};
