
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

  // Map visit type to database-compatible value
  const getVisitType = (formVisitType: string): 'Residence' | 'Office' | 'Business' => {
    // From the network logs, I can see existing valid values are "Residence", "Office", etc.
    // Default to "Residence" for Physical visits
    if (formVisitType === 'Physical' || !formVisitType) {
      return 'Residence';
    }
    if (formVisitType === 'Office' || formVisitType === 'Business') {
      return formVisitType as 'Residence' | 'Office' | 'Business';
    }
    return 'Residence'; // Safe default
  };

  // Create the lead object
  const lead: Lead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: formData.name || '',
    age: parseInt(formData.age) || 25,
    job: formData.designation || formData.occupation || '',
    phone: primaryPhone?.number || formData.phone || '',
    email: formData.email || '',
    address: {
      type: (primaryAddress?.type as Address['type']) || 'Residence',
      street: primaryAddress?.addressLine1 || primaryAddress?.street || '',
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
      monthlyIncome: parseInt(formData.monthlyIncome) || 0,
      annualIncome: formData.annualIncome || '',
      otherIncome: formData.otherIncome || '',
      loanAmount: formData.loanAmount || '',
      addresses: additionalAddresses,
      phoneNumber: primaryPhone?.number || formData.phone || '',
      email: formData.email || '',
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date(),
      fatherName: formData.fatherName || '',
      motherName: formData.motherName || '',
      gender: formData.gender || '',
      agencyFileNo: formData.agencyFileNo || '',
      applicationBarcode: formData.applicationBarcode || '',
      caseId: formData.caseId || '',
      schemeDesc: formData.schemeDesc || formData.schemeDescription || '',
      bankProduct: formData.bankProduct || '',
      initiatedUnderBranch: formData.initiatedUnderBranch || '',
      bankBranch: formData.bankBranch || formData.initiatedUnderBranch || '',
      additionalComments: formData.additionalComments || '',
      leadType: formData.leadType || '',
      loanType: formData.loanType || '',
      vehicleBrandName: formData.vehicleBrand || formData.vehicleBrandName || '',
      vehicleModelName: formData.vehicleModel || formData.vehicleModelName || '',
      coApplicant: formData.hasCoApplicant ? {
        name: formData.coApplicantName || '',
        age: parseInt(formData.coApplicantAge) || 0,
        phone: formData.coApplicantPhone || '',
        email: formData.coApplicantEmail || '',
        relation: formData.coApplicantRelation || 'Spouse',
        occupation: formData.coApplicantOccupation || '',
        monthlyIncome: formData.coApplicantIncome || ''
      } : undefined
    },
    status: 'Pending',
    bank: formData.bankName || formData.bank || '',
    visitType: getVisitType(formData.visitType), // Fix: Use proper mapping
    assignedTo: formData.assignedTo || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    hasCoApplicant: formData.hasCoApplicant || false,
    coApplicantName: formData.hasCoApplicant ? formData.coApplicantName : undefined,
    documents: [],
    instructions: formData.instructions || '',
    verificationDate: undefined
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
