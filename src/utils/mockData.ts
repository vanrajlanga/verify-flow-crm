export interface Lead {
  id: string;
  name: string;
  age: number;
  job: string;
  address: Address;
  additionalDetails?: AdditionalDetails;
  status: "Pending" | "In Progress" | "Completed" | "Rejected";
  bank: string;
  visitType: "Office" | "Residence" | "Both";
  assignedTo?: string;
  createdAt: Date;
  verificationDate?: Date;
  documents?: any[];
  instructions?: string;
  verification?: Verification;
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
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  coApplicant?: {
    name: string;
    phone: string;
    relation: string;
  };
  vehicleBrandName?: string;
  vehicleModelName?: string;
  vehicleVariant?: string;
  addresses?: Address[];
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
  vehicleBrandId?: string;
  vehicleModelId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "agent" | "tvt";
  status: "Active" | "Inactive";
  district: string;
  totalVerifications: number;
  completionRate: number;
  profilePicture?: string;
  phone?: string;
  baseLocation?: string;
  city?: string;
  state?: string;
  maxTravelDistance?: number;
  extraChargePerKm?: number;
}

export interface Bank {
  id: string;
  name: string;
  totalApplications: number;
}

export interface Verification {
  id: string;
  leadId: string;
  status: "Not Started" | "In Progress" | "Completed" | "Rejected";
  agentId?: string;
  startTime?: Date;
  arrivalTime?: Date;
  completionTime?: Date;
  photos?: any[];
  documents?: any[];
  notes?: string;
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@demo.com',
    password: '123456',
    role: 'admin',
    status: 'Active',
    district: 'Central District',
    totalVerifications: 0,
    completionRate: 0
  },
  {
    id: 'agent-1',
    name: 'John Agent',
    email: 'agent@demo.com',
    password: '123456',
    role: 'agent',
    status: 'Active',
    district: 'North District',
    totalVerifications: 15,
    completionRate: 85
  },
  {
    id: 'agent-2',
    name: 'Sarah Verifier',
    email: 'agent2@demo.com',
    password: '123456',
    role: 'agent',
    status: 'Active',
    district: 'South District',
    totalVerifications: 12,
    completionRate: 90
  },
  {
    id: 'tvt-user-1',
    name: 'Atul TVT',
    email: 'atul@demo.com',
    password: '123456',
    role: 'tvt',
    status: 'Active',
    district: 'TVT Department',
    totalVerifications: 0,
    completionRate: 0
  },
  {
    id: 'tvt-user-2',
    name: 'Ajay TVT',
    email: 'ajay@demo.com',
    password: '123456',
    role: 'tvt',
    status: 'Active',
    district: 'TVT Department',
    totalVerifications: 0,
    completionRate: 0
  },
  {
    id: 'tvt-user-3',
    name: 'Shivam TVT',
    email: 'shivam@demo.com',
    password: '123456',
    role: 'tvt',
    status: 'Active',
    district: 'TVT Department',
    totalVerifications: 0,
    completionRate: 0
  },
  {
    id: 'tvt-user-4',
    name: 'Raj TVT',
    email: 'raj@demo.com',
    password: '123456',
    role: 'tvt',
    status: 'Active',
    district: 'TVT Department',
    totalVerifications: 0,
    completionRate: 0
  }
];

export const mockBanks: Bank[] = [
  { id: 'bank-1', name: 'HDFC Bank', totalApplications: 120 },
  { id: 'bank-2', name: 'ICICI Bank', totalApplications: 95 },
  { id: 'bank-3', name: 'State Bank of India', totalApplications: 150 },
];

export const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Alice Smith',
    age: 32,
    job: 'Software Engineer',
    address: {
      street: '123 Highland Rd',
      city: 'Kolkata',
      district: 'North 24 Parganas',
      state: 'West Bengal',
      pincode: '700001',
    },
    additionalDetails: {
      company: 'Tech Solutions Inc.',
      designation: 'Senior Developer',
      workExperience: '7 years',
      propertyType: 'apartment',
      ownershipStatus: 'owned',
      propertyAge: '5 years',
      monthlyIncome: '75000',
      annualIncome: '900000',
      otherIncome: '10000',
      phoneNumber: '9876543210',
      email: 'alice.smith@example.com',
      dateOfBirth: '1991-05-15',
      gender: 'Female',
      maritalStatus: 'Married',
      fatherName: 'John Smith',
      motherName: 'Jane Smith',
      spouseName: 'Bob Smith',
      coApplicant: {
        name: 'Bob Smith',
        phone: '9876543211',
        relation: 'Husband',
      },
      vehicleBrandName: 'Honda',
      vehicleModelName: 'City',
      vehicleVariant: 'ZX',
      addresses: [
        {
          type: 'Office',
          street: '456 Business Park',
          city: 'Kolkata',
          district: 'South Kolkata',
          state: 'West Bengal',
          pincode: '700015',
        },
      ],
      agencyFileNo: 'AG12345',
      applicationBarcode: 'BC98765',
      caseId: 'CS54321',
      schemeDesc: 'Home Loan Scheme',
      bankBranch: 'Kolkata Main Branch',
      additionalComments: 'Customer is very responsive.',
      leadType: 'Home Loan',
      leadTypeId: 'HL001',
      loanAmount: '5000000',
      loanType: 'Home Loan',
      vehicleBrandId: 'VB001',
      vehicleModelId: 'VM001',
    },
    status: 'Pending',
    bank: 'bank-1',
    visitType: 'Residence',
    assignedTo: 'agent-1',
    createdAt: new Date('2024-01-20T10:00:00'),
    verificationDate: new Date('2024-02-01T14:00:00'),
    documents: [
      {
        id: 'doc-1',
        name: 'ID Proof',
        type: 'ID Proof',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date('2024-01-20T10:00:00'),
        size: 256
      },
      {
        id: 'doc-2',
        name: 'Address Proof',
        type: 'Address Proof',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date('2024-01-20T10:00:00'),
        size: 512
      },
    ],
    instructions: 'Verify all documents and property details.',
    verification: {
      id: 'verification-1',
      leadId: 'lead-1',
      status: 'Not Started',
      agentId: 'agent-1',
      photos: [],
      documents: [],
      notes: '',
    },
  },
  {
    id: 'lead-2',
    name: 'Bob Johnson',
    age: 45,
    job: 'Business Analyst',
    address: {
      street: '456 Park Ave',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      pincode: '400001',
    },
    additionalDetails: {
      company: 'Global Corp',
      designation: 'Senior Analyst',
      workExperience: '12 years',
      propertyType: 'house',
      ownershipStatus: 'rented',
      propertyAge: '10 years',
      monthlyIncome: '120000',
      annualIncome: '1440000',
      otherIncome: '20000',
      phoneNumber: '8765432109',
      email: 'bob.johnson@example.com',
      dateOfBirth: '1978-08-22',
      gender: 'Male',
      maritalStatus: 'Married',
      fatherName: 'George Johnson',
      motherName: 'Martha Johnson',
      spouseName: 'Linda Johnson',
      coApplicant: {
        name: 'Linda Johnson',
        phone: '8765432110',
        relation: 'Wife',
      },
      vehicleBrandName: 'Maruti Suzuki',
      vehicleModelName: 'Swift',
      vehicleVariant: 'VXI',
      addresses: [
        {
          type: 'Office',
          street: '789 Corporate Plaza',
          city: 'Mumbai',
          district: 'South Mumbai',
          state: 'Maharashtra',
          pincode: '400020',
        },
      ],
      agencyFileNo: 'AG67890',
      applicationBarcode: 'BC01234',
      caseId: 'CS67890',
      schemeDesc: 'Personal Loan Scheme',
      bankBranch: 'Mumbai Fort Branch',
      additionalComments: 'Requires follow-up.',
      leadType: 'Personal Loan',
      leadTypeId: 'PL001',
      loanAmount: '200000',
      loanType: 'Personal Loan',
      vehicleBrandId: 'VB002',
      vehicleModelId: 'VM002',
    },
    status: 'In Progress',
    bank: 'bank-2',
    visitType: 'Office',
    assignedTo: 'agent-2',
    createdAt: new Date('2024-01-15T14:30:00'),
    verificationDate: new Date('2024-01-25T11:00:00'),
    documents: [
      {
        id: 'doc-3',
        name: 'PAN Card',
        type: 'ID Proof',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date('2024-01-15T14:30:00'),
        size: 300
      },
      {
        id: 'doc-4',
        name: 'Salary Slips',
        type: 'Income Proof',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date('2024-01-15T14:30:00'),
        size: 600
      },
    ],
    instructions: 'Verify income and employment details.',
    verification: {
      id: 'verification-2',
      leadId: 'lead-2',
      status: 'In Progress',
      agentId: 'agent-2',
      photos: [],
      documents: [],
      notes: 'Contacted customer, scheduled visit.',
    },
  },
  {
    id: 'lead-3',
    name: 'Catherine Davis',
    age: 28,
    job: 'Teacher',
    address: {
      street: '789 Pine St',
      city: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600002',
    },
    additionalDetails: {
      company: 'Sunrise School',
      designation: 'Primary Teacher',
      workExperience: '5 years',
      propertyType: 'villa',
      ownershipStatus: 'family_owned',
      propertyAge: '20 years',
      monthlyIncome: '45000',
      annualIncome: '540000',
      otherIncome: '5000',
      phoneNumber: '7654321098',
      email: 'catherine.davis@example.com',
      dateOfBirth: '1995-11-10',
      gender: 'Female',
      maritalStatus: 'Single',
      fatherName: 'Samuel Davis',
      motherName: 'Elizabeth Davis',
      vehicleBrandName: 'Hyundai',
      vehicleModelName: 'i20',
      vehicleVariant: 'Asta',
      addresses: [
        {
          type: 'Office',
          street: '101 School Rd',
          city: 'Chennai',
          district: 'Central Chennai',
          state: 'Tamil Nadu',
          pincode: '600010',
        },
      ],
      agencyFileNo: 'AG23456',
      applicationBarcode: 'BC56789',
      caseId: 'CS23456',
      schemeDesc: 'Education Loan Scheme',
      bankBranch: 'Chennai Anna Salai Branch',
      additionalComments: 'Requires guarantor.',
      leadType: 'Education Loan',
      leadTypeId: 'EL001',
      loanAmount: '100000',
      loanType: 'Education Loan',
      vehicleBrandId: 'VB003',
      vehicleModelId: 'VM003',
    },
    status: 'Completed',
    bank: 'bank-3',
    visitType: 'Residence',
    assignedTo: 'agent-1',
    createdAt: new Date('2024-01-10T09:15:00'),
    verificationDate: new Date('2024-01-20T16:30:00'),
    documents: [
      {
        id: 'doc-5',
        name: 'Aadhar Card',
        type: 'ID Proof',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date('2024-01-10T09:15:00'),
        size: 280
      },
      {
        id: 'doc-6',
        name: 'School ID',
        type: 'Other',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date('2024-01-10T09:15:00'),
        size: 400
      },
    ],
    instructions: 'Verify education and guarantor details.',
    verification: {
      id: 'verification-3',
      leadId: 'lead-3',
      status: 'Completed',
      agentId: 'agent-1',
      photos: [],
      documents: [],
      notes: 'Verification completed successfully.',
    },
  },
  {
    id: 'lead-4',
    name: 'David Wilson',
    age: 50,
    job: 'Accountant',
    address: {
      street: '101 Oak St',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560001',
    },
    additionalDetails: {
      company: 'Finance Ltd',
      designation: 'Senior Accountant',
      workExperience: '15 years',
      propertyType: 'apartment',
      ownershipStatus: 'owned',
      propertyAge: '8 years',
      monthlyIncome: '90000',
      annualIncome: '1080000',
      otherIncome: '15000',
      phoneNumber: '6543210987',
      email: 'david.wilson@example.com',
      dateOfBirth: '1973-03-28',
      gender: 'Male',
      maritalStatus: 'Married',
      fatherName: 'Robert Wilson',
      motherName: 'Susan Wilson',
      spouseName: 'Karen Wilson',
      coApplicant: {
        name: 'Karen Wilson',
        phone: '6543210988',
        relation: 'Wife',
      },
      vehicleBrandName: 'Toyota',
      vehicleModelName: 'Innova',
      vehicleVariant: 'Crysta',
      addresses: [
        {
          type: 'Office',
          street: '222 Brigade Rd',
          city: 'Bangalore',
          district: 'Central Bangalore',
          state: 'Karnataka',
          pincode: '560025',
        },
      ],
      agencyFileNo: 'AG98765',
      applicationBarcode: 'BC23456',
      caseId: 'CS98765',
      schemeDesc: 'Vehicle Loan Scheme',
      bankBranch: 'Bangalore MG Road Branch',
      additionalComments: 'Requires income verification.',
      leadType: 'Vehicle Loan',
      leadTypeId: 'VL001',
      loanAmount: '800000',
      loanType: 'Vehicle Loan',
      vehicleBrandId: 'VB004',
      vehicleModelId: 'VM004',
    },
    status: 'Rejected',
    bank: 'bank-1',
    visitType: 'Office',
    assignedTo: 'agent-2',
    createdAt: new Date('2024-01-05T16:45:00'),
    verificationDate: new Date('2024-01-15T10:00:00'),
    documents: [
      {
        id: 'doc-7',
        name: 'Bank Statement',
        type: 'Income Proof',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date('2024-01-05T16:45:00'),
        size: 500
      },
      {
        id: 'doc-8',
        name: 'ITR',
        type: 'Income Proof',
        url: '/placeholder.svg',
        uploadedBy: 'bank',
        uploadDate: new Date('2024-01-05T16:45:00'),
        size: 700
      },
    ],
    instructions: 'Verify income and financial stability.',
    verification: {
      id: 'verification-4',
      leadId: 'lead-4',
      status: 'Rejected',
      agentId: 'agent-2',
      photos: [],
      documents: [],
      notes: 'Income verification failed.',
    },
  },
];
