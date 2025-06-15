import { Lead, Address, User } from '@/utils/mockData';

// Transform form data from AddLeadFormSingleStep to Lead format
export const transformFormDataToLead = (formData: any): Lead => {
  console.log('[Transformer] Raw formData:', formData);

  // Primary address
  const primaryAddress = Array.isArray(formData.addresses) && formData.addresses.length > 0
    ? formData.addresses[0]
    : {
        type: 'Residence',
        addressLine1: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      };

  // Additional addresses (skip the first/main one)
  const additionalAddresses = Array.isArray(formData.addresses) && formData.addresses.length > 1
    ? formData.addresses.slice(1).map((addr: any) => ({
      type: (addr.type === "Office" || addr.type === "Permanent" || addr.type === "Residence") ? addr.type : 'Residence',
      street: addr.addressLine1 || addr.street || '',
      city: addr.city || '',
      district: addr.district || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    }))
    : [];

  // Bank ID (must be a string - use id if exists)
  const bankId = typeof formData.bankName === "string" ? formData.bankName : (
    formData.bank?.id ? formData.bank.id : ""
  );

  // Visit Type (must be 'Physical' | 'Virtual')
  const visitTypeVal = typeof formData.visitType === "string"
    ? (/virtual|online/i.test(formData.visitType) ? 'Virtual' : 'Physical')
    : 'Physical';

  // Primary phone (first marked as primary)
  const primaryPhone = Array.isArray(formData.phoneNumbers)
    ? (formData.phoneNumbers.find((p: any) => p.isPrimary && !!p.number) || formData.phoneNumbers[0])
    : { number: formData.phone || "" };

  // Main lead output
  const lead: Lead = {
    id: formData.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: String(formData.name || ''),
    age: formData.age ? Number(formData.age) : 25,
    job: formData.designation || formData.occupation || '',
    phone: primaryPhone?.number || '',
    email: String(formData.email || ''),
    address: {
      type: (primaryAddress.type === "Office" || primaryAddress.type === "Permanent" || primaryAddress.type === "Residence")
        ? primaryAddress.type : 'Residence',
      street: primaryAddress.addressLine1 || primaryAddress.street || '',
      city: primaryAddress.city || '',
      district: primaryAddress.district || '',
      state: primaryAddress.state || '',
      pincode: primaryAddress.pincode || ''
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
      phoneNumber: primaryPhone?.number || '',
      email: String(formData.email || ''),
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      fatherName: String(formData.fatherName || ''),
      motherName: String(formData.motherName || ''),
      gender: String(formData.gender || ''),
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
        age: formData.coApplicantAge ? Number(formData.coApplicantAge) : 0,
        phone: formData.coApplicantPhone || '',
        email: formData.coApplicantEmail || '',
        relation: formData.coApplicantRelation || '',
        occupation: formData.coApplicantOccupation || '',
        monthlyIncome: formData.coApplicantIncome || ''
      } : undefined
    },
    status: 'Pending',
    bank: bankId,
    visitType: visitTypeVal as 'Physical' | 'Virtual',
    assignedTo: '', // stays empty
    createdAt: new Date(),
    updatedAt: new Date(),
    hasCoApplicant: !!formData.hasCoApplicant,
    coApplicantName: formData.hasCoApplicant ? formData.coApplicantName : undefined,
    documents: [],
    instructions: String(formData.instructions || ''),
    verificationDate: undefined
  };

  // Log out every step for deep debugging
  console.log('[Transformer] :: final lead object sending to DB ---');
  Object.entries(lead).forEach(([k, v]) => console.log(k, v));
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
