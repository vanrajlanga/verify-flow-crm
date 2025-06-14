export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'manager' | 'tvtteam'; // Fix: Change 'tvt' to 'tvtteam'
  phone?: string;
  address?: string;
  joiningDate?: string;
  status?: 'Active' | 'Inactive';
  profilePicture?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  district: string;
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

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@kycverification.com',
    role: 'admin',
    phone: '+91 9876543210',
    address: 'Mumbai, Maharashtra',
    joiningDate: '2023-01-15',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    email: 'rajesh@kycverification.com',
    role: 'agent',
    phone: '+91 9876543211',
    address: 'Delhi, India',
    joiningDate: '2023-02-20',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Manager User',
    email: 'manager@kycverification.com',
    role: 'manager',
    phone: '+91 9876543212',
    address: 'Bangalore, Karnataka',
    joiningDate: '2023-01-10',
    status: 'Active'
  },
  {
    id: '4',
    name: 'Mike TVT',
    email: 'mike.tvt@example.com',
    role: 'tvtteam', // Fix: Change from 'tvt' to 'tvtteam'
    phone: '+91 9876543213',
    address: 'Chennai, Tamil Nadu',
    joiningDate: '2023-03-01',
    status: 'Active'
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
      bankBranch: 'Manhattan Branch'
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
      bankBranch: 'Hollywood Branch'
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
      bankBranch: 'Lincoln Park Branch'
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
      bankBranch: 'Uptown Branch'
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
      bankBranch: 'Wall Street Branch'
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
