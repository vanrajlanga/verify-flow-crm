
import { Lead, Address, User } from '@/utils/mockData';

// Transform form data from AddLeadFormSingleStep to Lead format
export const transformFormDataToLead = (formData: any): Lead => {
  console.log('Transforming form data:', formData);

  // Get primary address (first address in the array)
  const primaryAddress = formData.addresses && formData.addresses.length > 0 
    ? formData.addresses[0] 
    : null;

  // Transform additional addresses (excluding the first one)
  const additionalAddresses = formData.addresses && formData.addresses.length > 1
    ? formData.addresses.slice(1).map((addr: any) => ({
        type: addr.type as 'Residence' | 'Office' | 'Permanent' | 'Temporary' | 'Current',
        street: addr.addressLine1 || '',
        city: addr.city || '',
        district: addr.district || '',
        state: addr.state || '',
        pincode: addr.pincode || ''
      }))
    : [];

  // Get primary phone number or first available phone number
  const primaryPhone = formData.phoneNumbers?.find((phone: any) => phone.isPrimary) 
    || formData.phoneNumbers?.[0];

  // Create the lead object
  const lead: Lead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: formData.name || '',
    age: 0, // Default age since it's not in the form
    job: '', // Default job since it's not in the form
    phone: primaryPhone?.number || '',
    email: formData.email || '',
    address: {
      type: 'Residence',
      street: primaryAddress?.addressLine1 || '',
      city: primaryAddress?.city || '',
      district: primaryAddress?.district || '',
      state: primaryAddress?.state || '',
      pincode: primaryAddress?.pincode || ''
    },
    additionalDetails: {
      company: formData.company || '',
      designation: formData.designation || '',
      workExperience: formData.workExperience || '',
      propertyType: formData.propertyType || '',
      ownershipStatus: formData.ownershipStatus || '',
      propertyAge: formData.propertyAge || '',
      monthlyIncome: formData.monthlyIncome || '',
      annualIncome: formData.annualIncome || '',
      otherIncome: formData.otherIncome || '',
      loanAmount: formData.loanAmount || '',
      addresses: additionalAddresses,
      phoneNumber: primaryPhone?.number || '',
      email: formData.email || '',
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date(),
      fatherName: formData.fatherName || '',
      motherName: formData.motherName || '',
      gender: formData.gender || '',
      agencyFileNo: formData.agencyFileNo || '',
      applicationBarcode: formData.applicationBarcode || '',
      caseId: formData.caseId || '',
      schemeDesc: formData.schemeDesc || '',
      bankProduct: formData.bankProduct || '',
      initiatedUnderBranch: formData.initiatedUnderBranch || '',
      bankBranch: formData.initiatedUnderBranch || '',
      additionalComments: formData.additionalComments || '',
      leadType: formData.leadType || '',
      loanType: '',
      vehicleBrandName: formData.vehicleBrand || '',
      vehicleModelName: formData.vehicleModel || '',
      coApplicant: formData.hasCoApplicant ? {
        name: formData.coApplicantName || '',
        age: 0,
        phone: formData.coApplicantPhone || '',
        email: '',
        relation: 'Spouse',
        occupation: '',
        monthlyIncome: ''
      } : undefined
    },
    status: 'Pending',
    bank: formData.bankName || '',
    visitType: formData.visitType || 'Physical',
    assignedTo: '', // Leave empty - will be assigned later by admin
    createdAt: new Date(),
    updatedAt: new Date(),
    hasCoApplicant: formData.hasCoApplicant || false,
    coApplicantName: formData.hasCoApplicant ? formData.coApplicantName : undefined,
    documents: [],
    instructions: formData.instructions || ''
  };

  console.log('Transformed lead:', lead);
  return lead;
};

// Existing function (keep as is)
export const transformToMultiStepFormData = (formData: any) => {
  return {
    personalInfo: {
      name: formData.name || '',
      phoneNumber: formData.phoneNumber || '',
      email: formData.email || '',
      dateOfBirth: formData.dateOfBirth || '',
      fatherName: formData.fatherName || '',
      motherName: formData.motherName || '',
      gender: formData.gender || ''
    },
    bankInfo: {
      bank: formData.bank || '',
      bankProduct: formData.bankProduct || '',
      leadType: formData.leadType || '',
      agencyFileNo: formData.agencyFileNo || '',
      applicationBarcode: formData.applicationBarcode || '',
      caseId: formData.caseId || '',
      schemeDesc: formData.schemeDesc || '',
      initiatedUnderBranch: formData.initiatedUnderBranch || '',
      additionalComments: formData.additionalComments || '',
      loanAmount: formData.loanAmount || ''
    },
    addresses: formData.addresses || [],
    instructions: formData.instructions || ''
  };
};
