
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
  totalVerifications?: number;
  completionRate?: number;
  password: string;
  documents?: Document[];
  branch?: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  type: 'mobile' | 'landline' | 'work';
  isPrimary: boolean;
}

export interface Address {
  id: string;
  type: 'Residence' | 'Office' | 'Permanent';
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
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

export interface VehicleBrand {
  id: string;
  name: string;
}

export interface VehicleModel {
  id: string;
  name: string;
  brandId: string;
  type: string;
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
  url: string;
  type: string;
  uploadDate: Date;
}

export interface VerificationData {
  id: string;
  leadId: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Rejected';
  agentId: string;
  startTime?: Date;
  arrivalTime?: Date;
  completionTime?: Date;
  endTime?: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photos?: VerificationPhoto[];
  documents?: VerificationDocument[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminRemarks?: string;
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
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  agencyFileNo: string;
  applicationBarcode: string;
  caseId: string;
  schemeDesc: string;
  bankBranch: string;
  additionalComments: string;
  leadType: string;
  leadTypeId: string;
  loanAmount: string;
  loanType: string;
  vehicleBrandName: string;
  vehicleBrandId: string;
  vehicleModelName: string;
  vehicleModelId: string;
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  coApplicant?: CoApplicant;
  vehicleDetails?: VehicleDetails;
}

export interface Document {
  id: string;
  title: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
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
  visitType: 'Residence' | 'Office' | 'Both';
  assignedTo: string;
  createdAt: Date;
  verificationDate?: Date;
  documents: Document[];
  instructions: string;
  verification?: VerificationData;
}

export interface Bank {
  id: string;
  name: string;
  totalApplications: number;
  branches: BankBranch[];
}

export interface BankBranch {
  id: string;
  name: string;
  code: string;
  bankId: string;
  bank?: string;
  address: string;
  city: string;
  state: string;
}

export interface LeadType {
  id: string;
  name: string;
  category: string;
  description: string;
}

// Vehicle data
export const vehicleBrands: VehicleBrand[] = [
  { id: 'maruti', name: 'Maruti Suzuki' },
  { id: 'hyundai', name: 'Hyundai' },
  { id: 'tata', name: 'Tata Motors' },
  { id: 'mahindra', name: 'Mahindra' },
  { id: 'honda', name: 'Honda' },
  { id: 'toyota', name: 'Toyota' },
  { id: 'ford', name: 'Ford' },
  { id: 'kia', name: 'Kia' }
];

export const vehicleModels: VehicleModel[] = [
  // Maruti Suzuki models
  { id: 'swift', name: 'Swift', brandId: 'maruti', type: 'Hatchback' },
  { id: 'baleno', name: 'Baleno', brandId: 'maruti', type: 'Hatchback' },
  { id: 'dzire', name: 'Dzire', brandId: 'maruti', type: 'Sedan' },
  { id: 'vitara-brezza', name: 'Vitara Brezza', brandId: 'maruti', type: 'SUV' },
  
  // Hyundai models
  { id: 'i20', name: 'i20', brandId: 'hyundai', type: 'Hatchback' },
  { id: 'verna', name: 'Verna', brandId: 'hyundai', type: 'Sedan' },
  { id: 'creta', name: 'Creta', brandId: 'hyundai', type: 'SUV' },
  { id: 'venue', name: 'Venue', brandId: 'hyundai', type: 'SUV' },
  
  // Tata models
  { id: 'tiago', name: 'Tiago', brandId: 'tata', type: 'Hatchback' },
  { id: 'tigor', name: 'Tigor', brandId: 'tata', type: 'Sedan' },
  { id: 'nexon', name: 'Nexon', brandId: 'tata', type: 'SUV' },
  { id: 'harrier', name: 'Harrier', brandId: 'tata', type: 'SUV' },
  
  // Honda models
  { id: 'city', name: 'City', brandId: 'honda', type: 'Sedan' },
  { id: 'amaze', name: 'Amaze', brandId: 'honda', type: 'Sedan' },
  { id: 'wr-v', name: 'WR-V', brandId: 'honda', type: 'SUV' }
];

// Mock data arrays
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    role: 'admin',
    email: 'admin@example.com',
    phone: '+91 9876543210',
    district: 'Bangalore Urban',
    status: 'Active',
    state: 'Karnataka',
    city: 'Bangalore',
    password: 'admin123',
    branch: 'Main Branch'
  },
  {
    id: 'agent-1',
    name: 'John Doe',
    role: 'agent',
    email: 'john.doe@example.com',
    phone: '+91 9876543211',
    district: 'Bangalore Urban',
    status: 'Active',
    state: 'Karnataka',
    city: 'Bangalore',
    baseLocation: 'Koramangala',
    maxTravelDistance: 25,
    extraChargePerKm: 10,
    totalVerifications: 145,
    completionRate: 95,
    password: 'agent123',
    branch: 'MG Road Branch'
  },
  {
    id: 'agent-2',
    name: 'Jane Smith',
    role: 'agent',
    email: 'jane.smith@example.com',
    phone: '+91 9876543212',
    district: 'Mumbai',
    status: 'Active',
    state: 'Maharashtra',
    city: 'Mumbai',
    baseLocation: 'Andheri',
    maxTravelDistance: 30,
    extraChargePerKm: 12,
    totalVerifications: 98,
    completionRate: 87,
    password: 'agent123',
    branch: 'Andheri Branch'
  },
  {
    id: 'agent-3',
    name: 'Mike Johnson',
    role: 'agent',
    email: 'mike.johnson@example.com',
    phone: '+91 9876543213',
    district: 'Bangalore Urban',
    status: 'Inactive',
    state: 'Karnataka',
    city: 'Bangalore',
    baseLocation: 'Whitefield',
    maxTravelDistance: 20,
    extraChargePerKm: 8,
    totalVerifications: 67,
    completionRate: 78,
    password: 'agent123',
    branch: 'Whitefield Branch'
  }
];

export const mockBanks: Bank[] = [
  { id: 'hdfc', name: 'HDFC Bank', totalApplications: 45 },
  { id: 'icici', name: 'ICICI Bank', totalApplications: 32 },
  { id: 'sbi', name: 'State Bank of India', totalApplications: 28 },
  { id: 'axis', name: 'Axis Bank', totalApplications: 19 },
  { id: 'kotak', name: 'Kotak Mahindra Bank', totalApplications: 15 }
];

export const banks = mockBanks;

export const bankBranches: BankBranch[] = [
  { id: 'hdfc-mg-road', name: 'MG Road Branch', code: 'HDFC001', bankId: 'hdfc', bank: 'HDFC Bank', address: 'MG Road', city: 'Bangalore', state: 'Karnataka' },
  { id: 'hdfc-koramangala', name: 'Koramangala Branch', code: 'HDFC002', bankId: 'hdfc', bank: 'HDFC Bank', address: 'Koramangala', city: 'Bangalore', state: 'Karnataka' },
  { id: 'icici-brigade', name: 'Brigade Road Branch', code: 'ICICI001', bankId: 'icici', bank: 'ICICI Bank', address: 'Brigade Road', city: 'Bangalore', state: 'Karnataka' },
  { id: 'sbi-commercial', name: 'Commercial Street Branch', code: 'SBI001', bankId: 'sbi', bank: 'State Bank of India', address: 'Commercial Street', city: 'Bangalore', state: 'Karnataka' }
];

export const leadTypes: LeadType[] = [
  { id: 'home-loan', name: 'Home Loan', category: 'Secured', description: 'Home loan for residential property' },
  { id: 'personal-loan', name: 'Personal Loan', category: 'Unsecured', description: 'Personal loan for various purposes' },
  { id: 'vehicle-loan', name: 'Vehicle Loan', category: 'Secured', description: 'Loan for purchasing vehicles' },
  { id: 'business-loan', name: 'Business Loan', category: 'Secured/Unsecured', description: 'Loan for business purposes' },
  { id: 'education-loan', name: 'Education Loan', category: 'Secured', description: 'Loan for educational expenses' }
];

export const agents = mockUsers.filter(user => user.role === 'agent');

export const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Rajesh Kumar',
    age: 35,
    job: 'Software Engineer',
    address: {
      id: 'addr-1',
      type: 'Residence',
      street: '123 MG Road',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560001'
    },
    additionalDetails: {
      company: 'Tech Corp',
      designation: 'Senior Developer',
      workExperience: '8',
      propertyType: 'Apartment',
      ownershipStatus: 'Rented',
      propertyAge: '5',
      monthlyIncome: '₹80,000',
      annualIncome: '₹9,60,000',
      otherIncome: '₹20,000',
      phoneNumber: '+91 9876543214',
      email: 'rajesh@example.com',
      dateOfBirth: '1989-05-15',
      gender: 'Male',
      maritalStatus: 'Married',
      fatherName: 'Ram Kumar',
      motherName: 'Sita Kumar',
      spouseName: 'Priya Kumar',
      agencyFileNo: 'AGY001',
      applicationBarcode: 'BC123456',
      caseId: 'CASE001',
      schemeDesc: 'Home Loan Premium',
      bankBranch: 'MG Road Branch',
      additionalComments: 'Good credit history',
      leadType: 'Home Loan',
      leadTypeId: 'hl-001',
      loanAmount: '₹50,00,000',
      loanType: 'New',
      vehicleBrandName: '',
      vehicleBrandId: '',
      vehicleModelName: '',
      vehicleModelId: '',
      addresses: [{
        id: 'addr-1',
        type: 'Residence',
        street: '123 MG Road',
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        pincode: '560001'
      }],
      phoneNumbers: [{
        id: 'ph-1',
        number: '+91 9876543214',
        type: 'mobile',
        isPrimary: true
      }]
    },
    status: 'Pending',
    bank: 'hdfc',
    visitType: 'Residence',
    assignedTo: 'agent-1',
    createdAt: new Date('2024-01-15'),
    verificationDate: new Date('2024-01-20'),
    documents: [],
    instructions: 'Please verify income documents'
  },
  {
    id: 'lead-2',
    name: 'Priya Sharma',
    age: 28,
    job: 'Marketing Manager',
    address: {
      id: 'addr-2',
      type: 'Residence',
      street: '456 Brigade Road',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560025'
    },
    additionalDetails: {
      company: 'Marketing Solutions',
      designation: 'Manager',
      workExperience: '5',
      propertyType: 'Independent House',
      ownershipStatus: 'Self Owned',
      propertyAge: '10',
      monthlyIncome: '₹60,000',
      annualIncome: '₹7,20,000',
      otherIncome: '₹10,000',
      phoneNumber: '+91 9876543215',
      email: 'priya@example.com',
      dateOfBirth: '1996-08-22',
      gender: 'Female',
      maritalStatus: 'Single',
      fatherName: 'Vinod Sharma',
      motherName: 'Sunita Sharma',
      spouseName: '',
      agencyFileNo: 'AGY002',
      applicationBarcode: 'BC123457',
      caseId: 'CASE002',
      schemeDesc: 'Personal Loan Quick',
      bankBranch: 'Brigade Road Branch',
      additionalComments: 'First time applicant',
      leadType: 'Personal Loan',
      leadTypeId: 'pl-001',
      loanAmount: '₹5,00,000',
      loanType: 'New',
      vehicleBrandName: '',
      vehicleBrandId: '',
      vehicleModelName: '',
      vehicleModelId: '',
      addresses: [{
        id: 'addr-2',
        type: 'Residence',
        street: '456 Brigade Road',
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        pincode: '560025'
      }],
      phoneNumbers: [{
        id: 'ph-2',
        number: '+91 9876543215',
        type: 'mobile',
        isPrimary: true
      }]
    },
    status: 'In Progress',
    bank: 'icici',
    visitType: 'Office',
    assignedTo: 'agent-2',
    createdAt: new Date('2024-01-16'),
    verificationDate: new Date('2024-01-22'),
    documents: [],
    instructions: 'Verify employment status'
  },
  {
    id: 'lead-3',
    name: 'Amit Patel',
    age: 42,
    job: 'Business Owner',
    address: {
      id: 'addr-3',
      type: 'Residence',
      street: '789 Commercial Street',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560001'
    },
    additionalDetails: {
      company: 'Patel Enterprises',
      designation: 'Owner',
      workExperience: '15',
      propertyType: 'Commercial',
      ownershipStatus: 'Self Owned',
      propertyAge: '8',
      monthlyIncome: '₹1,50,000',
      annualIncome: '₹18,00,000',
      otherIncome: '₹50,000',
      phoneNumber: '+91 9876543216',
      email: 'amit@example.com',
      dateOfBirth: '1982-03-10',
      gender: 'Male',
      maritalStatus: 'Married',
      fatherName: 'Bharat Patel',
      motherName: 'Kiran Patel',
      spouseName: 'Meera Patel',
      agencyFileNo: 'AGY003',
      applicationBarcode: 'BC123458',
      caseId: 'CASE003',
      schemeDesc: 'Business Loan Premium',
      bankBranch: 'Commercial Street Branch',
      additionalComments: 'Existing customer',
      leadType: 'Business Loan',
      leadTypeId: 'bl-001',
      loanAmount: '₹25,00,000',
      loanType: 'Top-up',
      vehicleBrandName: '',
      vehicleBrandId: '',
      vehicleModelName: '',
      vehicleModelId: '',
      addresses: [{
        id: 'addr-3',
        type: 'Residence',
        street: '789 Commercial Street',
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        pincode: '560001'
      }],
      phoneNumbers: [{
        id: 'ph-3',
        number: '+91 9876543216',
        type: 'mobile',
        isPrimary: true
      }]
    },
    status: 'Completed',
    bank: 'sbi',
    visitType: 'Residence',
    assignedTo: 'agent-1',
    createdAt: new Date('2024-01-10'),
    verificationDate: new Date('2024-01-18'),
    documents: [],
    instructions: 'Verify business documents and turnover'
  },
  {
    id: 'lead-4',
    name: 'Sneha Reddy',
    age: 31,
    job: 'Teacher',
    address: {
      id: 'addr-4',
      type: 'Residence',
      street: '321 Residency Road',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560025'
    },
    additionalDetails: {
      company: 'Delhi Public School',
      designation: 'Senior Teacher',
      workExperience: '7',
      propertyType: 'Apartment',
      ownershipStatus: 'Family Owned',
      propertyAge: '3',
      monthlyIncome: '₹45,000',
      annualIncome: '₹5,40,000',
      otherIncome: '₹5,000',
      phoneNumber: '+91 9876543217',
      email: 'sneha@example.com',
      dateOfBirth: '1993-11-18',
      gender: 'Female',
      maritalStatus: 'Married',
      fatherName: 'Ravi Reddy',
      motherName: 'Lakshmi Reddy',
      spouseName: 'Kiran Reddy',
      agencyFileNo: 'AGY004',
      applicationBarcode: 'BC123459',
      caseId: 'CASE004',
      schemeDesc: 'Education Loan Standard',
      bankBranch: 'Residency Road Branch',
      additionalComments: 'Stable employment',
      leadType: 'Education Loan',
      leadTypeId: 'el-001',
      loanAmount: '₹8,00,000',
      loanType: 'New',
      vehicleBrandName: '',
      vehicleBrandId: '',
      vehicleModelName: '',
      vehicleModelId: '',
      addresses: [{
        id: 'addr-4',
        type: 'Residence',
        street: '321 Residency Road',
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        pincode: '560025'
      }],
      phoneNumbers: [{
        id: 'ph-4',
        number: '+91 9876543217',
        type: 'mobile',
        isPrimary: true
      }]
    },
    status: 'Rejected',
    bank: 'axis',
    visitType: 'Residence',
    assignedTo: 'agent-3',
    createdAt: new Date('2024-01-12'),
    verificationDate: new Date('2024-01-19'),
    documents: [],
    instructions: 'Verify salary slips and employment letter'
  }
];
