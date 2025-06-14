
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'manager' | 'tvtteam';
  phone?: string;
  address?: string;
  joiningDate?: string;
  status?: 'Active' | 'Inactive';
  profilePicture?: string;
  state?: string;
  district?: string;
  city?: string;
  baseLocation?: string;
  maxTravelDistance?: number;
  extraChargePerKm?: number;
  password?: string;
  branch?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  district: string;
  type?: 'Residence' | 'Office' | 'Permanent' | 'Temporary' | 'Current';
}

export interface Lead {
  id: string;
  name: string;
  age: number;
  job: string;
  address: Address;
  phone: string;
  email: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  assignedTo: string;
  createdAt: Date;
  visitType: 'Physical' | 'Virtual';
  bank?: string;
  instructions?: string;
  documents?: any[];
  additionalDetails?: {
    fatherName?: string;
    motherName?: string;
    dateOfBirth?: Date;
    gender?: string;
    company?: string;
    designation?: string;
    workExperience?: string;
    monthlyIncome?: number;
    phoneNumber?: string;
    email?: string;
    bankProduct?: string;
    initiatedUnderBranch?: string;
    bankBranch?: string;
    annualIncome?: string;
    otherIncome?: string;
    loanAmount?: string;
    loanType?: string;
    vehicleBrandName?: string;
    vehicleModelName?: string;
    agencyFileNo?: string;
    applicationBarcode?: string;
    caseId?: string;
    schemeDesc?: string;
    additionalComments?: string;
    leadType?: string;
    propertyType?: string;
    ownershipStatus?: string;
    propertyAge?: string;
    addresses?: {
      type: 'Residence' | 'Office' | 'Permanent';
      street: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
    }[];
    coApplicantAddresses?: {
      type: 'Residence' | 'Office' | 'Permanent';
      street: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
    }[];
  };
  carDetails?: {
    make: string;
    model: string;
    year: number;
  };
  incomeDetails?: {
    salary: number;
    otherIncome: number;
  };
}

export interface Bank {
  id: string;
  name: string;
  totalApplications?: number;
}

export interface BankBranch {
  id: string;
  bank: string;
  name: string;
  location: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface LeadType {
  id: string;
  name: string;
}

export const banks: Bank[] = [
  { id: '1', name: 'State Bank of India', totalApplications: 150 },
  { id: '2', name: 'HDFC Bank', totalApplications: 120 },
  { id: '3', name: 'ICICI Bank', totalApplications: 100 },
  { id: '4', name: 'Axis Bank', totalApplications: 80 },
  { id: '5', name: 'Kotak Mahindra Bank', totalApplications: 60 },
  { id: '6', name: 'Punjab National Bank', totalApplications: 90 },
  { id: '7', name: 'Bank of Baroda', totalApplications: 70 },
  { id: '8', name: 'Canara Bank', totalApplications: 85 },
  { id: '9', name: 'Union Bank of India', totalApplications: 65 },
  { id: '10', name: 'Indian Bank', totalApplications: 55 }
];

export const bankBranches: BankBranch[] = [
  { id: '1', bank: 'State Bank of India', name: 'Mumbai Main Branch', location: 'Mumbai' },
  { id: '2', bank: 'State Bank of India', name: 'Delhi Branch', location: 'Delhi' },
  { id: '3', bank: 'HDFC Bank', name: 'Bangalore Branch', location: 'Bangalore' },
  { id: '4', bank: 'HDFC Bank', name: 'Chennai Branch', location: 'Chennai' },
  { id: '5', bank: 'ICICI Bank', name: 'Pune Branch', location: 'Pune' },
  { id: '6', bank: 'ICICI Bank', name: 'Hyderabad Branch', location: 'Hyderabad' },
  { id: '7', bank: 'Axis Bank', name: 'Kolkata Branch', location: 'Kolkata' },
  { id: '8', bank: 'Axis Bank', name: 'Ahmedabad Branch', location: 'Ahmedabad' }
];

export const leadTypes: LeadType[] = [
  { id: '1', name: 'Home Loan' },
  { id: '2', name: 'Personal Loan' },
  { id: '3', name: 'Car Loan' },
  { id: '4', name: 'Business Loan' },
  { id: '5', name: 'Education Loan' },
  { id: '6', name: 'Credit Card' },
  { id: '7', name: 'Gold Loan' },
  { id: '8', name: 'Loan Against Property' }
];

export const agents: User[] = [
  {
    id: '2',
    name: 'Rajesh Kumar',
    email: 'rajesh@kycverification.com',
    role: 'agent',
    phone: '+91 9876543211',
    address: 'Delhi, India',
    joiningDate: '2023-02-20',
    status: 'Active',
    state: 'Delhi',
    district: 'Central Delhi',
    city: 'New Delhi',
    branch: 'Delhi Branch',
    baseLocation: 'Connaught Place, New Delhi',
    maxTravelDistance: 15,
    extraChargePerKm: 5
  },
  {
    id: '5',
    name: 'Priya Sharma',
    email: 'priya@kycverification.com',
    role: 'agent',
    phone: '+91 9876543214',
    address: 'Mumbai, Maharashtra',
    joiningDate: '2023-03-15',
    status: 'Active',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    branch: 'Mumbai Main Branch',
    baseLocation: 'Andheri East, Mumbai',
    maxTravelDistance: 20,
    extraChargePerKm: 6
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@kycverification.com',
    role: 'admin',
    phone: '+91 9876543210',
    address: 'Mumbai, Maharashtra',
    joiningDate: '2023-01-15',
    status: 'Active',
    password: 'password'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    email: 'rajesh@kycverification.com',
    role: 'agent',
    phone: '+91 9876543211',
    address: 'Delhi, India',
    joiningDate: '2023-02-20',
    status: 'Active',
    state: 'Delhi',
    district: 'Central Delhi',
    city: 'New Delhi',
    baseLocation: 'Connaught Place, New Delhi',
    maxTravelDistance: 15,
    extraChargePerKm: 5,
    password: 'password'
  },
  {
    id: '3',
    name: 'Manager User',
    email: 'manager@kycverification.com',
    role: 'manager',
    phone: '+91 9876543212',
    address: 'Bangalore, Karnataka',
    joiningDate: '2023-01-10',
    status: 'Active',
    password: 'password'
  },
  {
    id: '4',
    name: 'Mike TVT',
    email: 'mike.tvt@example.com',
    role: 'tvtteam',
    phone: '+91 9876543213',
    address: 'Chennai, Tamil Nadu',
    joiningDate: '2023-03-01',
    status: 'Active',
    password: 'password'
  }
];

export const mockLeads: Lead[] = [
  {
    id: '101',
    name: 'John Doe',
    age: 35,
    job: 'Software Engineer',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      district: 'Manhattan'
    },
    phone: '+12125551234',
    email: 'john.doe@example.com',
    status: 'Pending',
    assignedTo: 'Mike TVT',
    createdAt: new Date('2024-01-20'),
    visitType: 'Physical',
    bank: 'Citibank',
    instructions: 'Verify employment details and address.',
    additionalDetails: {
      fatherName: 'Robert Doe',
      motherName: 'Jane Doe',
      dateOfBirth: new Date('1989-05-15'),
      gender: 'Male',
      company: 'Tech Solutions Inc.',
      designation: 'Senior Developer',
      workExperience: '8 years',
      monthlyIncome: 9000,
      phoneNumber: '+13478889900',
      email: 'john.doe@techsolutions.com',
      bankProduct: 'Personal Loan',
      initiatedUnderBranch: 'Midtown Branch',
      bankBranch: 'Manhattan Branch',
      annualIncome: '108000',
      loanAmount: '50000',
      loanType: 'Personal Loan',
      vehicleBrandName: 'Toyota',
      vehicleModelName: 'Camry'
    },
    carDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2020
    },
    incomeDetails: {
      salary: 90000,
      otherIncome: 10000
    }
  },
  {
    id: '102',
    name: 'Alice Smith',
    age: 28,
    job: 'Marketing Manager',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      pincode: '90001',
      district: 'Downtown'
    },
    phone: '+13105555678',
    email: 'alice.smith@example.com',
    status: 'In Progress',
    assignedTo: 'Rajesh Kumar',
    createdAt: new Date('2024-01-22'),
    visitType: 'Virtual',
    bank: 'Bank of America',
    instructions: 'Check credit score and previous loan history.',
    additionalDetails: {
      fatherName: 'Michael Smith',
      motherName: 'Linda Smith',
      dateOfBirth: new Date('1996-02-28'),
      gender: 'Female',
      company: 'Global Marketing Ltd.',
      designation: 'Team Lead',
      workExperience: '5 years',
      monthlyIncome: 7500,
      phoneNumber: '+12137778899',
      email: 'alice.smith@globalmarketing.com',
      bankProduct: 'Credit Card',
      initiatedUnderBranch: 'LA Main Branch',
      bankBranch: 'Hollywood Branch',
      annualIncome: '90000',
      loanAmount: '25000',
      loanType: 'Credit Card',
      vehicleBrandName: 'Honda',
      vehicleModelName: 'Civic'
    },
    carDetails: {
      make: 'Honda',
      model: 'Civic',
      year: 2018
    },
    incomeDetails: {
      salary: 75000,
      otherIncome: 5000
    }
  },
  {
    id: '103',
    name: 'Bob Johnson',
    age: 42,
    job: 'Teacher',
    address: {
      street: '789 Pine Ln',
      city: 'Chicago',
      state: 'IL',
      pincode: '60601',
      district: 'Loop'
    },
    phone: '+13125559012',
    email: 'bob.johnson@example.com',
    status: 'Completed',
    assignedTo: 'Admin User',
    createdAt: new Date('2024-01-25'),
    visitType: 'Physical',
    bank: 'Chase Bank',
    instructions: 'Confirm employment and salary details.',
    additionalDetails: {
      fatherName: 'William Johnson',
      motherName: 'Mary Johnson',
      dateOfBirth: new Date('1982-09-10'),
      gender: 'Male',
      company: 'Chicago Public Schools',
      designation: 'Senior Teacher',
      workExperience: '15 years',
      monthlyIncome: 6000,
      phoneNumber: '+17734445566',
      email: 'bob.johnson@cps.edu',
      bankProduct: 'Home Loan',
      initiatedUnderBranch: 'Chicago Downtown',
      bankBranch: 'Lincoln Park Branch',
      annualIncome: '72000',
      loanAmount: '200000',
      loanType: 'Home Loan',
      vehicleBrandName: 'Ford',
      vehicleModelName: 'Explorer'
    },
    carDetails: {
      make: 'Ford',
      model: 'Explorer',
      year: 2015
    },
    incomeDetails: {
      salary: 60000,
      otherIncome: 2000
    }
  },
  {
    id: '104',
    name: 'Emily White',
    age: 31,
    job: 'Accountant',
    address: {
      street: '101 Elm St',
      city: 'Houston',
      state: 'TX',
      pincode: '77001',
      district: 'Downtown'
    },
    phone: '+17135553456',
    email: 'emily.white@example.com',
    status: 'Rejected',
    assignedTo: 'Manager User',
    createdAt: new Date('2024-01-28'),
    visitType: 'Virtual',
    bank: 'Wells Fargo',
    instructions: 'Verify financial statements and tax returns.',
    additionalDetails: {
      fatherName: 'David White',
      motherName: 'Susan White',
      dateOfBirth: new Date('1993-07-04'),
      gender: 'Female',
      company: 'Accounting Solutions Inc.',
      designation: 'Senior Accountant',
      workExperience: '7 years',
      monthlyIncome: 8000,
      phoneNumber: '+18329990011',
      email: 'emily.white@accountingsolutions.com',
      bankProduct: 'Business Loan',
      initiatedUnderBranch: 'Houston Galleria',
      bankBranch: 'Uptown Branch',
      annualIncome: '96000',
      loanAmount: '75000',
      loanType: 'Business Loan',
      vehicleBrandName: 'Nissan',
      vehicleModelName: 'Altima'
    },
    carDetails: {
      make: 'Nissan',
      model: 'Altima',
      year: 2019
    },
    incomeDetails: {
      salary: 80000,
      otherIncome: 8000
    }
  },
  {
    id: '105',
    name: 'Mike TVT Lead',
    age: 25,
    job: 'TVT Member',
    address: {
      street: 'Park Avenue',
      city: 'New York',
      state: 'NY',
      pincode: '10002',
      district: 'Manhattan'
    },
    phone: '+12125557890',
    email: 'mike.tvt.lead@example.com',
    status: 'Pending',
    assignedTo: 'Mike TVT',
    createdAt: new Date('2024-02-01'),
    visitType: 'Physical',
    bank: 'Citibank',
    instructions: 'Verify address and contact details.',
    additionalDetails: {
      fatherName: 'Tom TVT',
      motherName: 'Alice TVT',
      dateOfBirth: new Date('1999-03-10'),
      gender: 'Male',
      company: 'TVT Solutions',
      designation: 'Junior TVT',
      workExperience: '2 years',
      monthlyIncome: 4000,
      phoneNumber: '+16461112233',
      email: 'mike.tvt.lead@tvtsolutions.com',
      bankProduct: 'Student Loan',
      initiatedUnderBranch: 'Downtown Branch',
      bankBranch: 'Wall Street Branch',
      annualIncome: '48000',
      loanAmount: '15000',
      loanType: 'Student Loan',
      vehicleBrandName: 'BMW',
      vehicleModelName: 'X5'
    },
    carDetails: {
      make: 'BMW',
      model: 'X5',
      year: 2022
    },
    incomeDetails: {
      salary: 40000,
      otherIncome: 1000
    }
  },
];
