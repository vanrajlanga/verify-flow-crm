import { Lead, Address, AdditionalDetails } from '@/utils/mockData';

// Define all possible CSV headers for comprehensive export/import
export const CSV_HEADERS = [
  'Lead ID',
  'Name',
  'Age',
  'Job',
  'Status',
  'Bank',
  'Visit Type',
  'Assigned To',
  'Verification Date',
  'Instructions',
  'Has Co-Applicant',
  'Co-Applicant Name',
  'Created At',
  // Address fields
  'Address Type',
  'Street',
  'City',
  'District',
  'State',
  'Pincode',
  // Additional Details
  'Company',
  'Designation',
  'Work Experience',
  'Property Type',
  'Ownership Status',
  'Property Age',
  'Monthly Income',
  'Annual Income',
  'Other Income',
  'Phone Number',
  'Email',
  'Date of Birth',
  'Father Name',
  'Mother Name',
  'Gender',
  'Agency File No',
  'Application Barcode',
  'Case ID',
  'Scheme Description',
  'Bank Branch',
  'Bank Product',
  'Initiated Under Branch',
  'Additional Comments',
  'Lead Type',
  'Lead Type ID',
  'Loan Amount',
  'Loan Type',
  'Vehicle Brand Name',
  'Vehicle Brand ID',
  'Vehicle Model Name',
  'Vehicle Model ID'
];

// Helper function to format value with NA fallback
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '' || value === 'undefined' || value === 'null') {
    return 'NA';
  }
  return String(value);
};

// Export leads to CSV format
export const exportLeadsToCSV = (leads: Lead[]): string => {
  console.log(`Exporting ${leads.length} leads to CSV...`);
  
  const csvRows = [CSV_HEADERS.join(',')];
  
  leads.forEach(lead => {
    const row = [
      formatValue(lead.id),
      `"${formatValue(lead.name)}"`,
      formatValue(lead.age),
      `"${formatValue(lead.job)}"`,
      formatValue(lead.status),
      `"${formatValue(lead.bank)}"`,
      formatValue(lead.visitType),
      `"${formatValue(lead.assignedTo)}"`,
      lead.verificationDate ? lead.verificationDate.toISOString() : 'NA',
      `"${formatValue(lead.instructions)}"`,
      lead.additionalDetails?.coApplicant ? 'true' : 'false',
      `"${formatValue(lead.additionalDetails?.coApplicant?.name)}"`,
      lead.createdAt.toISOString(),
      // Address fields
      `"${formatValue(lead.address?.type)}"`,
      `"${formatValue(lead.address?.street)}"`,
      `"${formatValue(lead.address?.city)}"`,
      `"${formatValue(lead.address?.district)}"`,
      `"${formatValue(lead.address?.state)}"`,
      `"${formatValue(lead.address?.pincode)}"`,
      // Additional Details
      `"${formatValue(lead.additionalDetails?.company)}"`,
      `"${formatValue(lead.additionalDetails?.designation)}"`,
      `"${formatValue(lead.additionalDetails?.workExperience)}"`,
      `"${formatValue(lead.additionalDetails?.propertyType)}"`,
      `"${formatValue(lead.additionalDetails?.ownershipStatus)}"`,
      `"${formatValue(lead.additionalDetails?.propertyAge)}"`,
      `"${formatValue(lead.additionalDetails?.monthlyIncome)}"`,
      `"${formatValue(lead.additionalDetails?.annualIncome)}"`,
      `"${formatValue(lead.additionalDetails?.otherIncome)}"`,
      `"${formatValue(lead.phone)}"`,
      `"${formatValue(lead.email)}"`,
      lead.additionalDetails?.dateOfBirth ? (lead.additionalDetails.dateOfBirth instanceof Date ? lead.additionalDetails.dateOfBirth.toISOString() : formatValue(lead.additionalDetails.dateOfBirth)) : 'NA',
      `"${formatValue(lead.additionalDetails?.fatherName)}"`,
      `"${formatValue(lead.additionalDetails?.motherName)}"`,
      `"${formatValue(lead.additionalDetails?.gender)}"`,
      `"${formatValue(lead.additionalDetails?.agencyFileNo)}"`,
      `"${formatValue(lead.additionalDetails?.applicationBarcode)}"`,
      `"${formatValue(lead.additionalDetails?.caseId)}"`,
      `"${formatValue(lead.additionalDetails?.schemeDesc)}"`,
      `"${formatValue(lead.additionalDetails?.bankBranch)}"`,
      `"${formatValue(lead.additionalDetails?.bankProduct)}"`,
      `"${formatValue(lead.additionalDetails?.initiatedUnderBranch)}"`,
      `"${formatValue(lead.additionalDetails?.additionalComments)}"`,
      `"${formatValue(lead.additionalDetails?.leadType)}"`,
      `"${formatValue(lead.additionalDetails?.leadTypeId)}"`,
      `"${formatValue(lead.additionalDetails?.loanAmount)}"`,
      `"${formatValue(lead.additionalDetails?.loanType)}"`,
      `"${formatValue(lead.additionalDetails?.vehicleBrandName)}"`,
      `"${formatValue(lead.additionalDetails?.vehicleBrandId)}"`,
      `"${formatValue(lead.additionalDetails?.vehicleModelName)}"`,
      `"${formatValue(lead.additionalDetails?.vehicleModelId)}"`,
    ];
    csvRows.push(row.join(','));
  });
  
  console.log(`CSV export completed with ${csvRows.length - 1} data rows`);
  return csvRows.join('\n');
};

// Parse CSV data and convert to Lead objects
export const parseCSVToLeads = (csvContent: string): Partial<Lead>[] => {
  console.log('Parsing CSV content to leads...');
  
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least headers and one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  console.log('CSV Headers detected:', headers);
  
  const leads: Partial<Lead>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    
    try {
      const lead = mapCSVRowToLead(headers, values);
      leads.push(lead);
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error);
      throw new Error(`Error parsing CSV row ${i + 1}: ${error}`);
    }
  }
  
  console.log(`Successfully parsed ${leads.length} leads from CSV`);
  return leads;
};

// Parse a single CSV line handling quoted values
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
};

// Helper function to get value or NA for CSV import - improved mapping
const getValueOrNA = (headerName: string, headers: string[], values: string[]): string => {
  // Exact match first
  let index = headers.findIndex(h => h.toLowerCase() === headerName.toLowerCase());
  
  // If no exact match, try partial match
  if (index === -1) {
    index = headers.findIndex(h => h.toLowerCase().includes(headerName.toLowerCase()));
  }
  
  const value = index !== -1 ? values[index]?.replace(/"/g, '') || '' : '';
  return value === '' || value === 'undefined' || value === 'null' ? 'NA' : value;
};

// Map CSV row to Lead object
const mapCSVRowToLead = (headers: string[], values: string[]): Partial<Lead> => {
  const getValue = (headerName: string): string => {
    return getValueOrNA(headerName, headers, values);
  };
  
  const getBooleanValue = (headerName: string): boolean => {
    const value = getValue(headerName).toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  };
  
  const getDateValue = (headerName: string): Date | undefined => {
    const value = getValue(headerName);
    return value !== 'NA' ? new Date(value) : undefined;
  };
  
  const getNumberValue = (headerName: string): number => {
    const value = getValue(headerName);
    const parsed = parseInt(value);
    return value !== 'NA' && !isNaN(parsed) ? parsed : 0;
  };
  
  // Map address type to correct values
  const mapAddressType = (type: string): Address['type'] => {
    switch (type.toLowerCase()) {
      case 'residence': return 'Residence';
      case 'office': return 'Office';
      case 'permanent': return 'Permanent';
      case 'temporary': return 'Temporary';
      case 'current': return 'Current';
      default: return 'Residence';
    }
  };
  
  // Map visit type to correct values
  const mapVisitType = (type: string): Lead['visitType'] => {
    switch (type.toLowerCase()) {
      case 'physical': return 'Physical';
      case 'virtual': return 'Virtual';
      default: return 'Physical';
    }
  };
  
  const address: Address = {
    type: mapAddressType(getValue('Address Type')),
    street: getValue('Street'),
    city: getValue('City'),
    district: getValue('District'),
    state: getValue('State'),
    pincode: getValue('Pincode')
  };
  
  const additionalDetails: AdditionalDetails = {
    company: getValue('Company'),
    designation: getValue('Designation'),
    workExperience: getValue('Work Experience'),
    propertyType: getValue('Property Type'),
    ownershipStatus: getValue('Ownership Status'),
    propertyAge: getValue('Property Age'),
    monthlyIncome: getValue('Monthly Income'),
    annualIncome: getValue('Annual Income'),
    otherIncome: getValue('Other Income'),
    phoneNumber: getValue('Phone Number'),
    email: getValue('Email'),
    dateOfBirth: getDateValue('Date of Birth'),
    fatherName: getValue('Father Name'),
    motherName: getValue('Mother Name'),
    gender: getValue('Gender'),
    agencyFileNo: getValue('Agency File No'),
    applicationBarcode: getValue('Application Barcode'),
    caseId: getValue('Case ID'),
    schemeDesc: getValue('Scheme Description'),
    bankBranch: getValue('Bank Branch'),
    bankProduct: getValue('Bank Product'),
    initiatedUnderBranch: getValue('Initiated Under Branch'),
    additionalComments: getValue('Additional Comments'),
    leadType: getValue('Lead Type'),
    leadTypeId: getValue('Lead Type ID'),
    loanAmount: getValue('Loan Amount'),
    loanType: getValue('Loan Type'),
    vehicleBrandName: getValue('Vehicle Brand Name'),
    vehicleBrandId: getValue('Vehicle Brand ID'),
    vehicleModelName: getValue('Vehicle Model Name'),
    vehicleModelId: getValue('Vehicle Model ID'),
    addresses: []
  };
  
  // Handle Co-Applicant
  if (getBooleanValue('Has Co-Applicant')) {
    additionalDetails.coApplicant = {
      name: getValue('Co-Applicant Name'),
      age: undefined,
      phone: '',
      email: '',
      relation: '',
      occupation: '',
      monthlyIncome: ''
    };
  }
  
  const lead: Partial<Lead> = {
    id: getValue('Lead ID') || `LEAD-${Date.now()}`,
    name: getValue('Name'),
    age: getNumberValue('Age'),
    job: getValue('Job'),
    phone: getValue('Phone Number'),
    email: getValue('Email'),
    address,
    additionalDetails,
    status: getValue('Status') as Lead['status'] || 'Pending',
    bank: getValue('Bank'),
    visitType: mapVisitType(getValue('Visit Type')),
    assignedTo: getValue('Assigned To'),
    verificationDate: getDateValue('Verification Date'),
    instructions: getValue('Instructions'),
    createdAt: getDateValue('Created At') || new Date(),
    documents: []
  };
  
  return lead;
};

// Generate sample CSV content
export const generateSampleCSV = (): string => {
  console.log('Generating sample CSV...');
  
  const sampleData = [
    [
      'SAMPLE-001',
      'John Doe',
      '30',
      'Software Engineer',
      'Pending',
      'HDFC',
      'Physical',
      'agent-1',
      '2025-06-20T10:00:00Z',
      'Sample home loan verification',
      'false',
      'NA',
      '2025-06-13T08:00:00Z',
      'Residence',
      '123 Sample Street',
      'Mumbai',
      'Mumbai',
      'Maharashtra',
      '400001',
      'Tech Company',
      'Senior Engineer',
      '5 years',
      'Apartment',
      'Owned',
      '2 years',
      '75000',
      '900000',
      '25000',
      '9876543210',
      'john.doe@example.com',
      '1994-01-15',
      'John Father',
      'John Mother',
      'Male',
      'AGF999',
      'BC99999',
      'CASE999',
      'Home Loan Sample',
      'HDFC Main Branch',
      'Home Loan Product',
      'Mumbai Branch',
      'Sample lead for testing',
      'Home Loan',
      'HL999',
      '3000000',
      'Home Loan',
      'NA',
      'NA',
      'NA',
      'NA'
    ]
  ];
  
  const csvRows = [CSV_HEADERS.join(',')];
  sampleData.forEach(row => {
    csvRows.push(row.map(value => `"${value}"`).join(','));
  });
  
  return csvRows.join('\n');
};

export const downloadFile = (content: string, filename: string, contentType: string = 'text/csv') => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const transformLeadsFromCSV = (data: any[]): Lead[] => {
  return data.map((row, index) => {
    // Helper function to safely parse numbers
    const parseNumber = (value: any): number => {
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Helper function to safely parse dates
    const parseDate = (value: any): Date => {
      if (!value) return new Date();
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    // Validate address type
    const validateAddressType = (type: string): 'Residence' | 'Office' | 'Permanent' | 'Temporary' | 'Current' => {
      const validTypes: ('Residence' | 'Office' | 'Permanent' | 'Temporary' | 'Current')[] = 
        ['Residence', 'Office', 'Permanent', 'Temporary', 'Current'];
      return validTypes.includes(type as any) ? type as any : 'Residence';
    };

    // Validate visit type
    const validateVisitType = (type: string): 'Physical' | 'Virtual' => {
      return type === 'Virtual' ? 'Virtual' : 'Physical';
    };

    return {
      id: row.id || `csv-lead-${index}`,
      name: row.name || '',
      age: parseNumber(row.age),
      job: row.job || '',
      phone: row.phone || '',
      email: row.email || '',
      address: {
        type: validateAddressType(row.addressType || 'Residence'),
        street: row.street || '',
        city: row.city || '',
        district: row.district || '',
        state: row.state || '',
        pincode: row.pincode || ''
      },
      additionalDetails: {
        company: row.company || '',
        designation: row.designation || '',
        workExperience: row.workExperience || '',
        propertyType: row.propertyType || '',
        ownershipStatus: row.ownershipStatus || '',
        propertyAge: row.propertyAge || '',
        monthlyIncome: row.monthlyIncome || '',
        annualIncome: row.annualIncome || '',
        otherIncome: row.otherIncome || '',
        loanAmount: row.loanAmount || '',
        addresses: [],
        phoneNumber: row.phone || '',
        email: row.email || '',
        dateOfBirth: parseDate(row.dateOfBirth),
        fatherName: row.fatherName || '',
        motherName: row.motherName || '',
        gender: row.gender || '',
        agencyFileNo: row.agencyFileNo || '',
        applicationBarcode: row.applicationBarcode || '',
        caseId: row.caseId || '',
        schemeDesc: row.schemeDesc || '',
        bankProduct: row.bankProduct || '',
        initiatedUnderBranch: row.initiatedUnderBranch || '',
        bankBranch: row.bankBranch || '',
        additionalComments: row.additionalComments || '',
        leadType: row.leadType || '',
        loanType: row.loanType || '',
        vehicleBrandName: row.vehicleBrandName || '',
        vehicleModelName: row.vehicleModelName || ''
      },
      status: row.status || 'Pending',
      bank: row.bank || '',
      visitType: validateVisitType(row.visitType || 'Physical'),
      assignedTo: row.assignedTo || '',
      createdAt: parseDate(row.createdAt),
      documents: [],
      instructions: row.instructions || ''
    };
  });
};
