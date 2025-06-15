
import { transformFormDataToLead } from './form-data-transformer';
import { saveLeadToDatabase } from './lead-operations';

export const createTestLeads = async () => {
  const testLeads = [
    {
      name: 'John Doe',
      age: '35',
      phone: '9876543210',
      email: 'john.doe@example.com',
      dateOfBirth: '1988-05-15',
      fatherName: 'Robert Doe',
      motherName: 'Mary Doe',
      gender: 'Male',
      designation: 'Software Engineer',
      company: 'Tech Corp',
      monthlyIncome: '75000',
      bankName: 'HDFC Bank',
      leadType: 'Home Loan',
      agencyFileNo: 'AGY001',
      applicationBarcode: 'BC001',
      caseId: 'CASE001',
      schemeDesc: 'Home Loan Scheme',
      loanAmount: '2500000',
      addresses: [
        {
          type: 'Residence',
          addressLine1: '123 Main Street',
          city: 'Mumbai',
          district: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        {
          type: 'Office',
          addressLine1: '456 Business Park',
          city: 'Mumbai',
          district: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002'
        },
        {
          type: 'Permanent',
          addressLine1: '789 Permanent Address',
          city: 'Pune',
          district: 'Pune',
          state: 'Maharashtra',
          pincode: '411001'
        }
      ],
      hasCoApplicant: true,
      coApplicantName: 'Jane Doe',
      coApplicantAge: '32',
      coApplicantPhone: '9876543211',
      coApplicantEmail: 'jane.doe@example.com',
      coApplicantRelation: 'Spouse',
      coApplicantOccupation: 'Teacher',
      coApplicantIncome: '50000',
      instructions: 'Test lead 1 with all details'
    },
    {
      name: 'Alice Smith',
      age: '28',
      phone: '9876543212',
      email: 'alice.smith@example.com',
      dateOfBirth: '1995-08-20',
      fatherName: 'David Smith',
      motherName: 'Sarah Smith',
      gender: 'Female',
      designation: 'Marketing Manager',
      company: 'Marketing Solutions',
      monthlyIncome: '65000',
      bankName: 'ICICI Bank',
      leadType: 'Personal Loan',
      agencyFileNo: 'AGY002',
      applicationBarcode: 'BC002',
      caseId: 'CASE002',
      schemeDesc: 'Personal Loan Scheme',
      loanAmount: '800000',
      addresses: [
        {
          type: 'Residence',
          addressLine1: '321 Park Avenue',
          city: 'Delhi',
          district: 'New Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        {
          type: 'Office',
          addressLine1: '654 Corporate Center',
          city: 'Gurgaon',
          district: 'Gurgaon',
          state: 'Haryana',
          pincode: '122001'
        },
        {
          type: 'Temporary',
          addressLine1: '987 Temporary Stay',
          city: 'Noida',
          district: 'Gautam Buddha Nagar',
          state: 'Uttar Pradesh',
          pincode: '201301'
        }
      ],
      hasCoApplicant: false,
      instructions: 'Test lead 2 without co-applicant'
    },
    {
      name: 'Bob Johnson',
      age: '42',
      phone: '9876543213',
      email: 'bob.johnson@example.com',
      dateOfBirth: '1981-12-10',
      fatherName: 'William Johnson',
      motherName: 'Linda Johnson',
      gender: 'Male',
      designation: 'Business Owner',
      company: 'Johnson Enterprises',
      monthlyIncome: '150000',
      bankName: 'SBI',
      leadType: 'Car Loan',
      agencyFileNo: 'AGY003',
      applicationBarcode: 'BC003',
      caseId: 'CASE003',
      schemeDesc: 'Vehicle Loan Scheme',
      loanAmount: '1200000',
      vehicleBrand: 'Toyota',
      vehicleModel: 'Camry',
      addresses: [
        {
          type: 'Residence',
          addressLine1: '555 Elite Colony',
          city: 'Bangalore',
          district: 'Bangalore Urban',
          state: 'Karnataka',
          pincode: '560001'
        },
        {
          type: 'Office',
          addressLine1: '777 Business Hub',
          city: 'Bangalore',
          district: 'Bangalore Urban',
          state: 'Karnataka',
          pincode: '560002'
        },
        {
          type: 'Current',
          addressLine1: '888 Current Address',
          city: 'Mysore',
          district: 'Mysuru',
          state: 'Karnataka',
          pincode: '570001'
        }
      ],
      hasCoApplicant: true,
      coApplicantName: 'Susan Johnson',
      coApplicantAge: '38',
      coApplicantPhone: '9876543214',
      coApplicantEmail: 'susan.johnson@example.com',
      coApplicantRelation: 'Spouse',
      coApplicantOccupation: 'Doctor',
      coApplicantIncome: '120000',
      instructions: 'Test lead 3 with vehicle details'
    },
    {
      name: 'Carol White',
      age: '31',
      phone: '9876543215',
      email: 'carol.white@example.com',
      dateOfBirth: '1992-03-25',
      fatherName: 'James White',
      motherName: 'Patricia White',
      gender: 'Female',
      designation: 'Consultant',
      company: 'Consulting Firm',
      monthlyIncome: '85000',
      bankName: 'Axis Bank',
      leadType: 'Education Loan',
      agencyFileNo: 'AGY004',
      applicationBarcode: 'BC004',
      caseId: 'CASE004',
      schemeDesc: 'Education Loan Scheme',
      loanAmount: '1500000',
      addresses: [
        {
          type: 'Residence',
          addressLine1: '111 University Road',
          city: 'Chennai',
          district: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001'
        },
        {
          type: 'Office',
          addressLine1: '222 IT Park',
          city: 'Chennai',
          district: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600002'
        },
        {
          type: 'Permanent',
          addressLine1: '333 Family Home',
          city: 'Coimbatore',
          district: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641001'
        }
      ],
      hasCoApplicant: true,
      coApplicantName: 'Michael White',
      coApplicantAge: '34',
      coApplicantPhone: '9876543216',
      coApplicantEmail: 'michael.white@example.com',
      coApplicantRelation: 'Spouse',
      coApplicantOccupation: 'Engineer',
      coApplicantIncome: '95000',
      instructions: 'Test lead 4 for education loan'
    },
    {
      name: 'Daniel Brown',
      age: '39',
      phone: '9876543217',
      email: 'daniel.brown@example.com',
      dateOfBirth: '1984-07-18',
      fatherName: 'Charles Brown',
      motherName: 'Helen Brown',
      gender: 'Male',
      designation: 'Sales Manager',
      company: 'Sales Corp',
      monthlyIncome: '95000',
      bankName: 'Kotak Mahindra Bank',
      leadType: 'Business Loan',
      agencyFileNo: 'AGY005',
      applicationBarcode: 'BC005',
      caseId: 'CASE005',
      schemeDesc: 'Business Loan Scheme',
      loanAmount: '3000000',
      addresses: [
        {
          type: 'Residence',
          addressLine1: '444 Residential Complex',
          city: 'Hyderabad',
          district: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001'
        },
        {
          type: 'Office',
          addressLine1: '666 Commercial Street',
          city: 'Hyderabad',
          district: 'Hyderabad',
          state: 'Telangana',
          pincode: '500002'
        },
        {
          type: 'Current',
          addressLine1: '999 Current Location',
          city: 'Secunderabad',
          district: 'Hyderabad',
          state: 'Telangana',
          pincode: '500003'
        }
      ],
      hasCoApplicant: false,
      instructions: 'Test lead 5 for business loan'
    }
  ];

  console.log('Creating test leads...');
  
  for (let i = 0; i < testLeads.length; i++) {
    try {
      const leadData = transformFormDataToLead(testLeads[i]);
      await saveLeadToDatabase(leadData);
      console.log(`Test lead ${i + 1} created successfully: ${testLeads[i].name}`);
    } catch (error) {
      console.error(`Error creating test lead ${i + 1}:`, error);
    }
  }
  
  console.log('Finished creating test leads');
};
