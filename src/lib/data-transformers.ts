
import { User, Lead, Bank, Address, AdditionalDetails, Verification } from '@/utils/mockData';

export const transformSupabaseUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    name: supabaseUser.name,
    role: supabaseUser.role,
    email: supabaseUser.email,
    phone: supabaseUser.phone || '',
    district: supabaseUser.district || '',
    status: supabaseUser.status,
    state: supabaseUser.state,
    city: supabaseUser.city,
    baseLocation: supabaseUser.base_location,
    maxTravelDistance: supabaseUser.max_travel_distance,
    extraChargePerKm: supabaseUser.extra_charge_per_km,
    profilePicture: supabaseUser.profile_picture,
    totalVerifications: supabaseUser.total_verifications,
    completionRate: supabaseUser.completion_rate,
    password: supabaseUser.password
  };
};

export const transformSupabaseAddress = (supabaseAddress: any): Address => {
  return {
    type: supabaseAddress.type,
    street: supabaseAddress.street,
    city: supabaseAddress.city,
    district: supabaseAddress.district,
    state: supabaseAddress.state,
    pincode: supabaseAddress.pincode
  };
};

export const transformSupabaseAdditionalDetails = (details: any): AdditionalDetails => {
  return {
    company: details.company || '',
    designation: details.designation || '',
    workExperience: details.work_experience || '',
    propertyType: details.property_type || '',
    ownershipStatus: details.ownership_status || '',
    propertyAge: details.property_age || '',
    monthlyIncome: details.monthly_income || '',
    annualIncome: details.annual_income || '',
    otherIncome: details.other_income || '',
    addresses: [], // Will be populated from lead_addresses join
    phoneNumber: details.phone_number,
    email: details.email,
    dateOfBirth: details.date_of_birth,
    agencyFileNo: details.agency_file_no,
    applicationBarcode: details.application_barcode,
    caseId: details.case_id,
    schemeDesc: details.scheme_desc,
    bankBranch: details.bank_branch,
    additionalComments: details.additional_comments,
    leadType: details.lead_type,
    leadTypeId: details.lead_type_id,
    loanAmount: details.loan_amount,
    loanType: details.loan_type,
    vehicleBrandName: details.vehicle_brand_name,
    vehicleBrandId: details.vehicle_brand_id,
    vehicleModelName: details.vehicle_model_name,
    vehicleModelId: details.vehicle_model_id
  };
};

export const transformSupabaseVerification = (verification: any): Verification => {
  return {
    id: verification.id,
    status: verification.status,
    agentId: verification.agent_id,
    photos: [], // Will be populated from verification_photos join
    documents: [], // Will be populated from verification_documents join
    notes: verification.notes,
    startTime: verification.start_time ? new Date(verification.start_time) : undefined,
    endTime: verification.end_time ? new Date(verification.end_time) : undefined,
    arrivalTime: verification.arrival_time ? new Date(verification.arrival_time) : undefined,
    completionTime: verification.completion_time ? new Date(verification.completion_time) : undefined,
    reviewedAt: verification.reviewed_at ? new Date(verification.reviewed_at) : undefined,
    reviewedBy: verification.reviewed_by,
    adminRemarks: verification.admin_remarks,
    location: verification.location_latitude && verification.location_longitude ? {
      latitude: verification.location_latitude,
      longitude: verification.location_longitude,
      address: verification.location_address || ''
    } : undefined
  };
};

export const transformSupabaseLead = (supabaseLead: any): Lead => {
  const address: Address = supabaseLead.addresses ? {
    type: supabaseLead.addresses.type as Address['type'],
    street: supabaseLead.addresses.street,
    city: supabaseLead.addresses.city,
    district: supabaseLead.addresses.district,
    state: supabaseLead.addresses.state,
    pincode: supabaseLead.addresses.pincode
  } : {
    type: 'Residence',
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: ''
  };

  const additionalDetails: AdditionalDetails = supabaseLead.additional_details?.[0] 
    ? {
        ...transformSupabaseAdditionalDetails(supabaseLead.additional_details[0]),
        monthlyIncome: supabaseLead.additional_details[0].monthly_income 
          ? parseFloat(supabaseLead.additional_details[0].monthly_income) 
          : 0
      }
    : {
        company: '',
        designation: '',
        workExperience: '',
        propertyType: '',
        ownershipStatus: '',
        propertyAge: '',
        monthlyIncome: 0,
        annualIncome: '',
        otherIncome: '',
        addresses: []
      };

  // Add multiple addresses if they exist
  if (supabaseLead.lead_addresses) {
    additionalDetails.addresses = supabaseLead.lead_addresses.map((la: any) => 
      transformSupabaseAddress(la.addresses)
    );
  }

  const verification = supabaseLead.verifications?.[0] 
    ? transformSupabaseVerification(supabaseLead.verifications[0])
    : undefined;

  // Get phone and email from phone_numbers table or additional_details
  const phone = supabaseLead.phone_numbers?.[0]?.number || supabaseLead.additional_details?.[0]?.phone_number || '';
  const email = supabaseLead.additional_details?.[0]?.email || '';

  return {
    id: supabaseLead.id,
    name: supabaseLead.name,
    age: supabaseLead.age || 0,
    job: supabaseLead.job || '',
    address,
    phone,
    email,
    additionalDetails,
    status: supabaseLead.status,
    bank: supabaseLead.banks?.name || '',
    visitType: supabaseLead.visit_type,
    assignedTo: supabaseLead.assigned_to,
    createdAt: new Date(supabaseLead.created_at),
    verificationDate: supabaseLead.verification_date ? new Date(supabaseLead.verification_date) : undefined,
    documents: [], // Will be populated from documents join
    instructions: supabaseLead.instructions,
    verification
  };
};

export const transformSupabaseBank = (supabaseBank: any): Bank => {
  return {
    id: supabaseBank.id,
    name: supabaseBank.name
  };
};
