
import { Lead, AdditionalDetails, Address, User, Bank } from '@/utils/mockData';

export const transformLeadFromDatabase = (dbLead: any): Lead => {
  // Transform address with required properties
  const address: Address = {
    id: dbLead.addresses?.id || 'addr-1',
    type: dbLead.addresses?.type || 'Residence',
    street: dbLead.addresses?.street || '',
    city: dbLead.addresses?.city || '',
    district: dbLead.addresses?.district || '',
    state: dbLead.addresses?.state || '',
    pincode: dbLead.addresses?.pincode || ''
  };

  // Transform additional details with all required properties
  const additionalDetails: AdditionalDetails = {
    company: dbLead.additional_details?.[0]?.company || '',
    designation: dbLead.additional_details?.[0]?.designation || '',
    workExperience: dbLead.additional_details?.[0]?.work_experience || '',
    propertyType: dbLead.additional_details?.[0]?.property_type || '',
    ownershipStatus: dbLead.additional_details?.[0]?.ownership_status || '',
    propertyAge: dbLead.additional_details?.[0]?.property_age || '',
    monthlyIncome: dbLead.additional_details?.[0]?.monthly_income || '',
    annualIncome: dbLead.additional_details?.[0]?.annual_income || '',
    otherIncome: dbLead.additional_details?.[0]?.other_income || '',
    addresses: [],
    phoneNumbers: [],
    phoneNumber: dbLead.additional_details?.[0]?.phone_number || '',
    email: dbLead.additional_details?.[0]?.email || '',
    dateOfBirth: dbLead.additional_details?.[0]?.date_of_birth || '',
    gender: 'Male',
    maritalStatus: 'Single',
    fatherName: '',
    motherName: '',
    spouseName: '',
    agencyFileNo: dbLead.additional_details?.[0]?.agency_file_no || '',
    applicationBarcode: dbLead.additional_details?.[0]?.application_barcode || '',
    caseId: dbLead.additional_details?.[0]?.case_id || '',
    schemeDesc: dbLead.additional_details?.[0]?.scheme_desc || '',
    bankBranch: dbLead.additional_details?.[0]?.bank_branch || '',
    additionalComments: dbLead.additional_details?.[0]?.additional_comments || '',
    leadType: dbLead.additional_details?.[0]?.lead_type || '',
    leadTypeId: dbLead.additional_details?.[0]?.lead_type_id || '',
    loanAmount: dbLead.additional_details?.[0]?.loan_amount || '',
    loanType: dbLead.additional_details?.[0]?.loan_type || '',
    vehicleBrandName: dbLead.additional_details?.[0]?.vehicle_brand_name || '',
    vehicleBrandId: dbLead.additional_details?.[0]?.vehicle_brand_id || '',
    vehicleModelName: dbLead.additional_details?.[0]?.vehicle_model_name || '',
    vehicleModelId: dbLead.additional_details?.[0]?.vehicle_model_id || ''
  };

  return {
    id: dbLead.id,
    name: dbLead.name,
    age: dbLead.age || 0,
    job: dbLead.job || '',
    address: address,
    additionalDetails: additionalDetails,
    status: dbLead.status as Lead['status'],
    bank: dbLead.bank_id || '',
    visitType: dbLead.visit_type || 'Residence',
    assignedTo: dbLead.assigned_to || '',
    createdAt: new Date(dbLead.created_at),
    verificationDate: dbLead.verification_date ? new Date(dbLead.verification_date) : undefined,
    documents: [],
    instructions: dbLead.instructions || '',
    verification: dbLead.verifications?.[0] ? {
      id: dbLead.verifications[0].id,
      leadId: dbLead.id,
      status: dbLead.verifications[0].status as "Not Started" | "In Progress" | "Completed" | "Rejected",
      agentId: dbLead.verifications[0].agent_id,
      photos: [],
      documents: [],
      notes: dbLead.verifications[0].notes || ""
    } : undefined
  };
};

export const transformLeadToDatabase = (lead: Lead) => {
  return {
    id: lead.id,
    name: lead.name,
    age: lead.age,
    job: lead.job,
    status: lead.status,
    bank_id: lead.bank,
    visit_type: lead.visitType,
    assigned_to: lead.assignedTo,
    verification_date: lead.verificationDate?.toISOString(),
    instructions: lead.instructions,
    created_at: lead.createdAt.toISOString()
  };
};

export const transformLeadForLocalStorage = (lead: any): Lead => {
  const address: Address = lead.address || {
    id: 'addr-1',
    type: 'Residence',
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: ''
  };

  const additionalDetails: AdditionalDetails = lead.additionalDetails || {
    company: '',
    designation: '',
    workExperience: '',
    propertyType: '',
    ownershipStatus: '',
    propertyAge: '',
    monthlyIncome: '',
    annualIncome: '',
    otherIncome: '',
    addresses: [],
    phoneNumbers: [],
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: 'Male',
    maritalStatus: 'Single',
    fatherName: '',
    motherName: '',
    spouseName: '',
    agencyFileNo: '',
    applicationBarcode: '',
    caseId: '',
    schemeDesc: '',
    bankBranch: '',
    additionalComments: '',
    leadType: '',
    leadTypeId: '',
    loanAmount: '',
    loanType: '',
    vehicleBrandName: '',
    vehicleBrandId: '',
    vehicleModelName: '',
    vehicleModelId: ''
  };

  return {
    id: lead.id,
    name: lead.name,
    age: lead.age || 0,
    job: lead.job || '',
    address: address,
    additionalDetails: additionalDetails,
    status: lead.status || 'Pending',
    bank: lead.bank || '',
    visitType: lead.visitType || 'Residence',
    assignedTo: lead.assignedTo || '',
    createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
    verificationDate: lead.verificationDate ? new Date(lead.verificationDate) : undefined,
    documents: lead.documents || [],
    instructions: lead.instructions || '',
    verification: lead.verification
  };
};

export const transformSupabaseUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    password: dbUser.password,
    role: dbUser.role,
    phone: dbUser.phone || '',
    district: dbUser.district || '',
    status: dbUser.status || 'Active',
    state: dbUser.state,
    city: dbUser.city,
    baseLocation: dbUser.base_location,
    maxTravelDistance: dbUser.max_travel_distance,
    extraChargePerKm: dbUser.extra_charge_per_km,
    profilePicture: dbUser.profile_picture,
    totalVerifications: dbUser.total_verifications || 0,
    completionRate: dbUser.completion_rate || 0,
    documents: [],
    branch: ''
  };
};

export const transformSupabaseLead = (dbLead: any): Lead => {
  return transformLeadFromDatabase(dbLead);
};

export const transformSupabaseBank = (dbBank: any): Bank => {
  return {
    id: dbBank.id,
    name: dbBank.name,
    totalApplications: dbBank.total_applications || 0,
    branches: []
  };
};
