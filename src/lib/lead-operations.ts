
import { supabase } from '@/integrations/supabase/client';
import { Lead, Address, User } from '@/utils/mockData';

export const createLead = async (leadData: any) => {
  try {
    console.log('Creating lead:', leadData);

    // Basic lead data to be stored in the 'leads' table
    const lead = {
      id: leadData.id,
      name: leadData.name || '',
      age: leadData.age || 0,
      job: leadData.job || '',
      phone: leadData.phone || '',
      email: leadData.email || '',
      address_type: leadData.address?.type || 'Residence',
      address_street: leadData.address?.street || '',
      address_city: leadData.address?.city || '',
      address_district: leadData.address?.district || '',
      address_state: leadData.address?.state || '',
      address_pincode: leadData.address?.pincode || '',
      status: leadData.status || 'Pending',
      bank: leadData.bank || '',
      visit_type: leadData.visitType || 'Physical',
      assigned_to: leadData.assignedTo || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      instructions: leadData.instructions || '',
      has_co_applicant: leadData.hasCoApplicant || false,
      co_applicant_name: leadData.coApplicantName || null
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    await createLeadDetails(leadData);

    console.log('Lead created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createLead:', error);
    throw error;
  }
};

const createLeadDetails = async (leadData: any) => {
  console.log('Creating lead details for lead:', leadData.id);
  
  const leadDetails = {
    lead_id: leadData.id,
    company: leadData.additionalDetails?.company || '',
    designation: leadData.additionalDetails?.designation || '',
    work_experience: leadData.additionalDetails?.workExperience || '',
    property_type: leadData.additionalDetails?.propertyType || '',
    ownership_status: leadData.additionalDetails?.ownershipStatus || '',
    property_age: leadData.additionalDetails?.propertyAge || '',
    monthly_income: leadData.additionalDetails?.monthlyIncome?.toString() || '',
    annual_income: leadData.additionalDetails?.annualIncome || '',
    other_income: leadData.additionalDetails?.otherIncome || '',
    loan_amount: leadData.additionalDetails?.loanAmount || '',
    date_of_birth: leadData.additionalDetails?.dateOfBirth ? new Date(leadData.additionalDetails.dateOfBirth).toISOString().split('T')[0] : null,
    father_name: leadData.additionalDetails?.fatherName || '',
    mother_name: leadData.additionalDetails?.motherName || '',
    gender: leadData.additionalDetails?.gender || '',
    agency_file_no: leadData.additionalDetails?.agencyFileNo || '',
    application_barcode: leadData.additionalDetails?.applicationBarcode || '',
    case_id: leadData.additionalDetails?.caseId || '',
    scheme_desc: leadData.additionalDetails?.schemeDesc || '',
    bank_product: leadData.additionalDetails?.bankProduct || '',
    bank_branch: leadData.additionalDetails?.bankBranch || '',
    additional_comments: leadData.additionalDetails?.additionalComments || '',
    lead_type: leadData.additionalDetails?.leadType || '',
    loan_type: leadData.additionalDetails?.loanType || '',
    vehicle_brand_name: leadData.additionalDetails?.vehicleBrandName || '',
    vehicle_model_name: leadData.additionalDetails?.vehicleModelName || '',
    phone_number: leadData.phone || '',
    email: leadData.email || '',
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('additional_details')
    .insert([leadDetails]);

  if (error) {
    console.error('Error creating lead details:', error);
    throw error;
  }
};

export const updateLead = async (leadId: string, updates: Partial<Lead>) => {
  try {
    console.log(`Updating lead with ID ${leadId} with updates:`, updates);

    // Prepare updates for the 'leads' table
    const leadUpdates: any = {};
    
    if (updates.name !== undefined) leadUpdates.name = updates.name;
    if (updates.age !== undefined) leadUpdates.age = updates.age;
    if (updates.job !== undefined) leadUpdates.job = updates.job;
    if (updates.phone !== undefined) leadUpdates.phone = updates.phone;
    if (updates.email !== undefined) leadUpdates.email = updates.email;
    if (updates.status !== undefined) leadUpdates.status = updates.status;
    if (updates.bank !== undefined) leadUpdates.bank = updates.bank;
    if (updates.visitType !== undefined) leadUpdates.visit_type = updates.visitType;
    if (updates.assignedTo !== undefined) leadUpdates.assigned_to = updates.assignedTo;
    if (updates.instructions !== undefined) leadUpdates.instructions = updates.instructions;
    
    if (updates.address) {
      if (updates.address.type !== undefined) leadUpdates.address_type = updates.address.type;
      if (updates.address.street !== undefined) leadUpdates.address_street = updates.address.street;
      if (updates.address.city !== undefined) leadUpdates.address_city = updates.address.city;
      if (updates.address.district !== undefined) leadUpdates.address_district = updates.address.district;
      if (updates.address.state !== undefined) leadUpdates.address_state = updates.address.state;
      if (updates.address.pincode !== undefined) leadUpdates.address_pincode = updates.address.pincode;
    }

    const { data, error } = await supabase
      .from('leads')
      .update(leadUpdates)
      .eq('id', leadId);

    if (error) {
      console.error(`Error updating lead with ID ${leadId}:`, error);
      throw error;
    }

    console.log(`Lead with ID ${leadId} updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`Error in updateLead for ID ${leadId}:`, error);
    throw error;
  }
};

export const updateLeadInDatabase = updateLead;

export const deleteLead = async (leadId: string) => {
  try {
    console.log(`Deleting lead with ID: ${leadId}`);

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error(`Error deleting lead with ID ${leadId}:`, error);
      throw error;
    }

    console.log(`Lead with ID ${leadId} deleted successfully`);
  } catch (error) {
    console.error(`Error in deleteLead for ID ${leadId}:`, error);
    throw error;
  }
};

export const deleteLeadFromDatabase = deleteLead;

export const getLeadsFromDatabase = async (): Promise<Lead[]> => {
  try {
    console.log('Fetching leads from database...');
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        additional_details (*)
      `);

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      throw leadsError;
    }

    console.log('Raw leads data from database:', leadsData);

    if (!leadsData || leadsData.length === 0) {
      console.log('No leads found in database');
      return [];
    }

    const transformedLeads: Lead[] = leadsData.map((lead: any) => ({
      id: lead.id,
      name: lead.name,
      age: lead.age || 0,
      job: lead.job || '',
      phone: lead.phone || '',
      email: lead.email || '',
      address: {
        type: (lead.address_type || 'Residence') as Address['type'],
        street: lead.address_street || '',
        city: lead.address_city || '',
        district: lead.address_district || '',
        state: lead.address_state || '',
        pincode: lead.address_pincode || ''
      },
      additionalDetails: {
        company: lead.additional_details?.[0]?.company || '',
        designation: lead.additional_details?.[0]?.designation || '',
        workExperience: lead.additional_details?.[0]?.work_experience || '',
        propertyType: lead.additional_details?.[0]?.property_type || '',
        ownershipStatus: lead.additional_details?.[0]?.ownership_status || '',
        propertyAge: lead.additional_details?.[0]?.property_age || '',
        monthlyIncome: lead.additional_details?.[0]?.monthly_income || '',
        annualIncome: lead.additional_details?.[0]?.annual_income || '',
        otherIncome: lead.additional_details?.[0]?.other_income || '',
        loanAmount: lead.additional_details?.[0]?.loan_amount || '',
        addresses: [],
        phoneNumber: lead.phone || '',
        email: lead.email || '',
        dateOfBirth: lead.additional_details?.[0]?.date_of_birth ? new Date(lead.additional_details[0].date_of_birth) : new Date(),
        fatherName: lead.additional_details?.[0]?.father_name || '',
        motherName: lead.additional_details?.[0]?.mother_name || '',
        gender: lead.additional_details?.[0]?.gender || '',
        agencyFileNo: lead.additional_details?.[0]?.agency_file_no || '',
        applicationBarcode: lead.additional_details?.[0]?.application_barcode || '',
        caseId: lead.additional_details?.[0]?.case_id || '',
        schemeDesc: lead.additional_details?.[0]?.scheme_desc || '',
        bankProduct: lead.additional_details?.[0]?.bank_product || '',
        bankBranch: lead.additional_details?.[0]?.bank_branch || '',
        additionalComments: lead.additional_details?.[0]?.additional_comments || '',
        leadType: lead.additional_details?.[0]?.lead_type || '',
        loanType: lead.additional_details?.[0]?.loan_type || '',
        vehicleBrandName: lead.additional_details?.[0]?.vehicle_brand_name || '',
        vehicleModelName: lead.additional_details?.[0]?.vehicle_model_name || ''
      },
      status: lead.status as Lead['status'],
      bank: lead.bank,
      visitType: (lead.visit_type || 'Physical') as Lead['visitType'],
      assignedTo: lead.assigned_to || '',
      createdAt: new Date(lead.created_at),
      updatedAt: new Date(lead.updated_at || lead.created_at),
      hasCoApplicant: lead.has_co_applicant || false,
      coApplicantName: lead.co_applicant_name,
      documents: [],
      instructions: lead.instructions || ''
    }));

    console.log('Transformed leads:', transformedLeads);
    return transformedLeads;
  } catch (error) {
    console.error('Error in getLeadsFromDatabase:', error);
    throw error;
  }
};

export const getAllLeadsFromDatabase = getLeadsFromDatabase;

export const getLeadById = async (leadId: string): Promise<Lead | null> => {
  try {
    console.log(`Fetching lead with ID: ${leadId} from database...`);

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        additional_details (*)
      `)
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error(`Error fetching lead with ID ${leadId}:`, leadError);
      throw leadError;
    }

    if (!leadData) {
      console.log(`Lead with ID ${leadId} not found in database`);
      return null;
    }

    const transformedLead: Lead = transformLeadFromSupabase(leadData);

    console.log('Transformed lead:', transformedLead);
    return transformedLead;
  } catch (error) {
    console.error(`Error in getLeadById for ID ${leadId}:`, error);
    throw error;
  }
};

export const getLeadByIdFromDatabase = getLeadById;

export const getLeadsByBankFromDatabase = async (bankId: string): Promise<Lead[]> => {
  try {
    console.log(`Fetching leads for bank: ${bankId} from database...`);

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        additional_details (*)
      `)
      .eq('bank_id', bankId);

    if (leadsError) {
      console.error(`Error fetching leads for bank ${bankId}:`, leadsError);
      throw leadsError;
    }

    if (!leadsData || leadsData.length === 0) {
      console.log(`No leads found for bank ${bankId}`);
      return [];
    }

    const transformedLeads: Lead[] = leadsData.map((lead: any) => transformLeadFromSupabase(lead));

    console.log(`Transformed ${transformedLeads.length} leads for bank ${bankId}:`, transformedLeads);
    return transformedLeads;
  } catch (error) {
    console.error(`Error in getLeadsByBankFromDatabase for bank ${bankId}:`, error);
    throw error;
  }
};

export const saveLeadToDatabase = async (leadData: Lead) => {
  return await createLead(leadData);
};

const transformLeadFromSupabase = (lead: any): Lead => {
  return {
    id: lead.id,
    name: lead.name,
    age: lead.age || 0,
    job: lead.job || '',
    phone: lead.phone || '',
    email: lead.email || '',
    address: {
      type: (lead.address_type || 'Residence') as Address['type'],
      street: lead.address_street || '',
      city: lead.address_city || '',
      district: lead.address_district || '',
      state: lead.address_state || '',
      pincode: lead.address_pincode || ''
    },
    additionalDetails: {
      company: lead.additional_details?.[0]?.company || '',
      designation: lead.additional_details?.[0]?.designation || '',
      workExperience: lead.additional_details?.[0]?.work_experience || '',
      propertyType: lead.additional_details?.[0]?.property_type || '',
      ownershipStatus: lead.additional_details?.[0]?.ownership_status || '',
      propertyAge: lead.additional_details?.[0]?.property_age || '',
      monthlyIncome: lead.additional_details?.[0]?.monthly_income || '',
      annualIncome: lead.additional_details?.[0]?.annual_income || '',
      otherIncome: lead.additional_details?.[0]?.other_income || '',
      loanAmount: lead.additional_details?.[0]?.loan_amount || '',
      addresses: [],
      phoneNumber: lead.phone || '',
      email: lead.email || '',
      dateOfBirth: lead.additional_details?.[0]?.date_of_birth ? new Date(lead.additional_details[0].date_of_birth) : new Date(),
      fatherName: lead.additional_details?.[0]?.father_name || '',
      motherName: lead.additional_details?.[0]?.mother_name || '',
      gender: lead.additional_details?.[0]?.gender || '',
      agencyFileNo: lead.additional_details?.[0]?.agency_file_no || '',
      applicationBarcode: lead.additional_details?.[0]?.application_barcode || '',
      caseId: lead.additional_details?.[0]?.case_id || '',
      schemeDesc: lead.additional_details?.[0]?.scheme_desc || '',
      bankProduct: lead.additional_details?.[0]?.bank_product || '',
      bankBranch: lead.additional_details?.[0]?.bank_branch || '',
      additionalComments: lead.additional_details?.[0]?.additional_comments || '',
      leadType: lead.additional_details?.[0]?.lead_type || '',
      loanType: lead.additional_details?.[0]?.loan_type || '',
      vehicleBrandName: lead.additional_details?.[0]?.vehicle_brand_name || '',
      vehicleModelName: lead.additional_details?.[0]?.vehicle_model_name || ''
    },
    status: lead.status as Lead['status'],
    bank: lead.bank,
    visitType: (lead.visit_type || 'Physical') as Lead['visitType'],
    assignedTo: lead.assigned_to || '',
    createdAt: new Date(lead.created_at),
    updatedAt: new Date(lead.updated_at || lead.created_at),
    hasCoApplicant: lead.has_co_applicant || false,
    coApplicantName: lead.co_applicant_name,
    documents: [],
    instructions: lead.instructions || ''
  };
};
