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
      address_type: leadData.address.type || 'Residence',
      address_street: leadData.address.street || '',
      address_city: leadData.address.city || '',
      address_district: leadData.address.district || '',
      address_state: leadData.address.state || '',
      address_pincode: leadData.address.pincode || '',
      status: leadData.status || 'Pending',
      bank: leadData.bank || '',
      visit_type: leadData.visitType || 'Physical',
      assigned_to: leadData.assignedTo || '',
      created_at: new Date().toISOString(),
      instructions: leadData.instructions || ''
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([lead]);

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
    id: leadData.id,
    name: leadData.name || '',
    phone: leadData.phone || '',
    email: leadData.email || '',
    company: leadData.additionalDetails?.company || '',
    designation: leadData.additionalDetails?.designation || '',
    work_experience: leadData.additionalDetails?.workExperience || '',
    property_type: leadData.additionalDetails?.propertyType || '',
    ownership_status: leadData.additionalDetails?.ownershipStatus || '',
    property_age: leadData.additionalDetails?.propertyAge || '',
    monthly_income: leadData.additionalDetails?.monthlyIncome || '',
    annual_income: leadData.additionalDetails?.annualIncome || '',
    other_income: leadData.additionalDetails?.otherIncome || '',
    loan_amount: leadData.additionalDetails?.loanAmount || '',
    date_of_birth: leadData.additionalDetails?.dateOfBirth ? new Date(leadData.additionalDetails.dateOfBirth).toISOString() : new Date().toISOString(),
    father_name: leadData.additionalDetails?.fatherName || '',
    mother_name: leadData.additionalDetails?.motherName || '',
    gender: leadData.additionalDetails?.gender || '',
    agency_file_no: leadData.additionalDetails?.agencyFileNo || '',
    application_barcode: leadData.additionalDetails?.applicationBarcode || '',
    case_id: leadData.additionalDetails?.caseId || '',
    scheme_desc: leadData.additionalDetails?.schemeDesc || '',
    bank_product: leadData.additionalDetails?.bankProduct || '',
    initiated_under_branch: leadData.additionalDetails?.initiatedUnderBranch || '',
    bank_branch: leadData.additionalDetails?.bankBranch || '',
    additional_comments: leadData.additionalDetails?.additionalComments || '',
    lead_type: leadData.additionalDetails?.leadType || '',
    loan_type: leadData.additionalDetails?.loanType || '',
    vehicle_brand_name: leadData.additionalDetails?.vehicleBrandName || '',
    vehicle_model_name: leadData.additionalDetails?.vehicleModelName || '',
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('lead_details')
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
    const leadUpdates = {
      name: updates.name,
      age: updates.age,
      job: updates.job,
      phone: updates.phone,
      email: updates.email,
      address_type: updates.address?.type,
      address_street: updates.address?.street,
      address_city: updates.address?.city,
      address_district: updates.address?.district,
      address_state: updates.address?.state,
      address_pincode: updates.address?.pincode,
      status: updates.status,
      bank: updates.bank,
      visit_type: updates.visitType,
      assigned_to: updates.assignedTo,
      instructions: updates.instructions
    };

    // Remove undefined keys from leadUpdates
    Object.keys(leadUpdates).forEach(key => leadUpdates[key] === undefined && delete leadUpdates[key]);

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

export const getLeadsFromDatabase = async (): Promise<Lead[]> => {
  try {
    console.log('Fetching leads from database...');
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        lead_details (*)
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
        type: lead.address_type || 'Residence',
        street: lead.address_street || '',
        city: lead.address_city || '',
        district: lead.address_district || '',
        state: lead.address_state || '',
        pincode: lead.address_pincode || ''
      },
      additionalDetails: {
        company: lead.lead_details?.[0]?.company || '',
        designation: lead.lead_details?.[0]?.designation || '',
        workExperience: lead.lead_details?.[0]?.work_experience || '',
        propertyType: lead.lead_details?.[0]?.property_type || '',
        ownershipStatus: lead.lead_details?.[0]?.ownership_status || '',
        propertyAge: lead.lead_details?.[0]?.property_age || '',
        monthlyIncome: lead.lead_details?.[0]?.monthly_income || '',
        annualIncome: lead.lead_details?.[0]?.annual_income || '',
        otherIncome: lead.lead_details?.[0]?.other_income || '',
        loanAmount: lead.lead_details?.[0]?.loan_amount || '',
        addresses: [],
        phoneNumber: lead.phone || '',
        email: lead.email || '',
        dateOfBirth: lead.lead_details?.[0]?.date_of_birth ? new Date(lead.lead_details[0].date_of_birth) : new Date(),
        fatherName: lead.lead_details?.[0]?.father_name || '',
        motherName: lead.lead_details?.[0]?.mother_name || '',
        gender: lead.lead_details?.[0]?.gender || '',
        agencyFileNo: lead.lead_details?.[0]?.agency_file_no || '',
        applicationBarcode: lead.lead_details?.[0]?.application_barcode || '',
        caseId: lead.lead_details?.[0]?.case_id || '',
        schemeDesc: lead.lead_details?.[0]?.scheme_desc || '',
        bankProduct: lead.lead_details?.[0]?.bank_product || '',
        initiatedUnderBranch: lead.lead_details?.[0]?.initiated_under_branch || '',
        bankBranch: lead.lead_details?.[0]?.bank_branch || '',
        additionalComments: lead.lead_details?.[0]?.additional_comments || '',
        leadType: lead.lead_details?.[0]?.lead_type || '',
        loanType: lead.lead_details?.[0]?.loan_type || '',
        vehicleBrandName: lead.lead_details?.[0]?.vehicle_brand_name || '',
        vehicleModelName: lead.lead_details?.[0]?.vehicle_model_name || ''
      },
      status: lead.status,
      bank: lead.bank,
      visitType: lead.visit_type || 'Physical',
      assignedTo: lead.assigned_to || '',
      createdAt: new Date(lead.created_at),
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

export const getLeadById = async (leadId: string): Promise<Lead | null> => {
  try {
    console.log(`Fetching lead with ID: ${leadId} from database...`);

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        lead_details (*)
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

const transformLeadFromSupabase = (lead: any): Lead => {
  return {
    id: lead.id,
    name: lead.name,
    age: lead.age || 0,
    job: lead.job || '',
    phone: lead.phone || '',
    email: lead.email || '',
    address: {
      type: lead.address_type as 'Residence' | 'Office' | 'Permanent' | 'Temporary' | 'Current' || 'Residence',
      street: lead.address_street || '',
      city: lead.address_city || '',
      district: lead.address_district || '',
      state: lead.address_state || '',
      pincode: lead.address_pincode || ''
    },
    additionalDetails: {
      company: lead.lead_details?.[0]?.company || '',
      designation: lead.lead_details?.[0]?.designation || '',
      workExperience: lead.lead_details?.[0]?.work_experience || '',
      propertyType: lead.lead_details?.[0]?.property_type || '',
      ownershipStatus: lead.lead_details?.[0]?.ownership_status || '',
      propertyAge: lead.lead_details?.[0]?.property_age || '',
      monthlyIncome: lead.lead_details?.[0]?.monthly_income || '',
      annualIncome: lead.lead_details?.[0]?.annual_income || '',
      otherIncome: lead.lead_details?.[0]?.other_income || '',
      loanAmount: lead.lead_details?.[0]?.loan_amount || '',
      addresses: [],
      phoneNumber: lead.phone || '',
      email: lead.email || '',
      dateOfBirth: lead.lead_details?.[0]?.date_of_birth ? new Date(lead.lead_details[0].date_of_birth) : new Date(),
      fatherName: lead.lead_details?.[0]?.father_name || '',
      motherName: lead.lead_details?.[0]?.mother_name || '',
      gender: lead.lead_details?.[0]?.gender || '',
      agencyFileNo: lead.lead_details?.[0]?.agency_file_no || '',
      applicationBarcode: lead.lead_details?.[0]?.application_barcode || '',
      caseId: lead.lead_details?.[0]?.case_id || '',
      schemeDesc: lead.lead_details?.[0]?.scheme_desc || '',
      bankProduct: lead.lead_details?.[0]?.bank_product || '',
      initiatedUnderBranch: lead.lead_details?.[0]?.initiated_under_branch || '',
      bankBranch: lead.lead_details?.[0]?.bank_branch || '',
      additionalComments: lead.lead_details?.[0]?.additional_comments || '',
      leadType: lead.lead_details?.[0]?.lead_type || '',
      loanType: lead.lead_details?.[0]?.loan_type || '',
      vehicleBrandName: lead.lead_details?.[0]?.vehicle_brand_name || '',
      vehicleModelName: lead.lead_details?.[0]?.vehicle_model_name || ''
    },
    status: lead.status,
    bank: lead.bank,
    visitType: lead.visit_type as 'Physical' | 'Virtual' || 'Physical',
    assignedTo: lead.assigned_to || '',
    createdAt: new Date(lead.created_at),
    documents: [],
    instructions: lead.instructions || ''
  };
};
