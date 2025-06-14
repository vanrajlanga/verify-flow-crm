
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
  'Agency File No',
  'Application Barcode',
  'Case ID',
  'Scheme Description',
  'Bank Branch',
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
      `"${formatValue(lead.additionalDetails?.phoneNumber)}"`,
      `"${formatValue(lead.additionalDetails?.email)}"`,
      `"${formatValue(lead.additionalDetails?.dateOfBirth)}"`,
      `"${formatValue(lead.additionalDetails?.agencyFileNo)}"`,
      `"${formatValue(lead.additionalDetails?.applicationBarcode)}"`,
      `"${formatValue(lead.additionalDetails?.caseId)}"`,
      `"${formatValue(lead.additionalDetails?.schemeDesc)}"`,
      `"${formatValue(lead.additionalDetails?.bankBranch)}"`,
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

// Helper function to get value or NA for CSV import
const getValueOrNA = (headerName: string, headers: string[], values: string[]): string => {
  const index = headers.findIndex(h => h.toLowerCase().includes(headerName.toLowerCase()));
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
  
  const address: Address = {
    type: getValue('Address Type') as 'Residence' | 'Office' | 'Both' || 'Residence',
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
    dateOfBirth: getValue('Date of Birth'),
    agencyFileNo: getValue('Agency File No'),
    applicationBarcode: getValue('Application Barcode'),
    caseId: getValue('Case ID'),
    schemeDesc: getValue('Scheme Description'),
    bankBranch: getValue('Bank Branch'),
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
  
  const ageValue = getValue('Age');
  const lead: Partial<Lead> = {
    id: getValue('Lead ID') || `LEAD-${Date.now()}`,
    name: getValue('Name'),
    age: ageValue !== 'NA' ? parseInt(ageValue) || 0 : 0,
    job: getValue('Job'),
    address,
    additionalDetails,
    status: getValue('Status') as Lead['status'] || 'Pending',
    bank: getValue('Bank'),
    visitType: getValue('Visit Type') as Lead['visitType'] || 'Residence',
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
      'Residence',
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
      'AGF999',
      'BC99999',
      'CASE999',
      'Home Loan Sample',
      'HDFC Main Branch',
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

// Download file utility
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
