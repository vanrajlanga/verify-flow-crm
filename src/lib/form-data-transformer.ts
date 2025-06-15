import { Lead, Address, User } from '@/utils/mockData';

// Transform form data from AddLeadFormSingleStep to Lead format
export const transformFormDataToLead = (formData: any): Lead => {
  console.log('Transforming form data:', formData);

  // PRIMARY ADDRESS
  const primaryAddress = formData.addresses && formData.addresses.length > 0 ? formData.addresses[0] : null;

  // ADDITIONAL ADDRESSES
  const additionalAddresses = formData.addresses && formData.addresses.length > 1
    ? formData.addresses.slice(1).map((addr: any) => ({
        type: (addr.type === "Office" || addr.type === "Permanent" || addr.type === "Residence")
          ? addr.type : 'Residence',
        street: addr.addressLine1 || addr.street || '',
        city: addr.city || '',
        district: addr.district || '',
        state: addr.state || '',
        pincode: addr.pincode || ''
      }))
    : [];

  // PRIMARY PHONE NUMBER
  const primaryPhone = formData.phoneNumbers?.find((phone: any) => phone.isPrimary)
    || formData.phoneNumbers?.[0];

  // VISIT TYPE MAPPING: Must be 'Physical' | 'Virtual'
  const getVisitType = (formVisitType: string): 'Physical' | 'Virtual' => {
    if (typeof formVisitType === "string") {
      if (formVisitType.toLowerCase().includes('virtual') || formVisitType.toLowerCase().includes('online')) {
        return 'Virtual';
      }
      // Accept "Physical", ignore address types.
    }
    return 'Physical';
  };

  // BANK MAPPING: Must be the actual bank_id as per Supabase!!
  const getBankId = () => {
    // If ID given, use it; else, fall back to name.
    if (formData.bankName && formData.bankName.trim().length > 0) return formData.bankName.trim();
    if (formData.bank && formData.bank.trim().length > 0) return formData.bank.trim();
    return '';
  };

  // LEAD ID: Use form or auto-generate
  const leadId = formData.id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // AGE strict int fallback
  const getAge = () => {
    if (formData.age !== undefined && !isNaN(Number(formData.age))) return parseInt(formData.age, 10);
    return 25;
  };

  // FINAL LEAD OBJECT
  const lead: Lead = {
    id: leadId,
    name: formData.name || '',
    age: getAge(),
    job: formData.designation || formData.occupation || '',
    phone: primaryPhone?.number || formData.phone || '',
    email: formData.email || '',
    address: {
      type: (primaryAddress?.type === "Office" || primaryAddress?.type === "Permanent" || primaryAddress?.type === "Residence")
        ? primaryAddress?.type
        : 'Residence',
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
    bank: getBankId(),
    visitType: getVisitType(formData.visitType),
    assignedTo: '', // Always empty unless mapped to a user
    createdAt: new Date(),
    updatedAt: new Date(),
    hasCoApplicant: !!formData.hasCoApplicant,
    coApplicantName: formData.hasCoApplicant ? formData.coApplicantName : undefined,
    documents: [],
    instructions: formData.instructions || '',
    verificationDate: undefined
  };

  console.log('Transformed lead for Supabase:', lead);
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
