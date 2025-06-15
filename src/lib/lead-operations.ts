import { supabase } from '@/integrations/supabase/client';
import { Lead, Address, User } from '@/utils/mockData';

export const createLead = async (leadData: any) => {
  try {
    console.log('Creating lead:', leadData);

    // First insert into leads table with minimal required fields
    const leadInsert = {
      id: leadData.id,
      name: leadData.name || '',
      age: leadData.age || 0,
      job: leadData.job || '',
      status: leadData.status || 'Pending',
      visit_type: leadData.visitType || 'Physical',
      assigned_to: null, // Set to null initially to avoid foreign key constraint
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      instructions: leadData.instructions || '',
      has_co_applicant: leadData.hasCoApplicant || false,
      co_applicant_name: leadData.coApplicantName || null,
      bank_id: leadData.bank || '' // Use bank name as ID for now
    };

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([leadInsert])
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      throw leadError;
    }

    // Insert phone number
    if (leadData.phone) {
      const { error: phoneError } = await supabase
        .from('phone_numbers')
        .insert([{
          lead_id: leadData.id,
          number: leadData.phone,
          type: 'mobile',
          is_primary: true
        }]);

      if (phoneError) {
        console.error('Error inserting phone number:', phoneError);
      }
    }

    // Insert primary address
    if (leadData.address) {
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .insert([{
          type: leadData.address.type || 'Residence',
          street: leadData.address.street || '',
          city: leadData.address.city || '',
          district: leadData.district || '',
          state: leadData.state || '',
          pincode: leadData.pincode || ''
        }])
        .select()
        .single();

      if (addressError) {
        console.error('Error inserting address:', addressError);
      } else if (addressData) {
        // Link address to lead
        await supabase
          .from('lead_addresses')
          .insert([{
            lead_id: leadData.id,
            address_id: addressData.id
          }]);

        // Update lead with address_id
        await supabase
          .from('leads')
          .update({ address_id: addressData.id })
          .eq('id', leadData.id);
      }
    }

    // Insert additional details
    if (leadData.additionalDetails) {
      const additionalDetailsInsert = {
        lead_id: leadData.id,
        company: leadData.additionalDetails.company || '',
        designation: leadData.additionalDetails.designation || '',
        work_experience: leadData.additionalDetails.workExperience || '',
        property_type: leadData.additionalDetails.propertyType || '',
        ownership_status: leadData.additionalDetails.ownershipStatus || '',
        property_age: leadData.additionalDetails.propertyAge || '',
        monthly_income: leadData.additionalDetails.monthlyIncome?.toString() || '0',
        annual_income: leadData.additionalDetails.annualIncome || '',
        other_income: leadData.additionalDetails.otherIncome || '',
        loan_amount: leadData.additionalDetails.loanAmount || '',
        date_of_birth: leadData.additionalDetails.dateOfBirth ? 
          new Date(leadData.additionalDetails.dateOfBirth).toISOString().split('T')[0] : null,
        father_name: leadData.additionalDetails.fatherName || '',
        mother_name: leadData.additionalDetails.motherName || '',
        gender: leadData.additionalDetails.gender || '',
        agency_file_no: leadData.additionalDetails.agencyFileNo || '',
        application_barcode: leadData.additionalDetails.applicationBarcode || '',
        case_id: leadData.additionalDetails.caseId || '',
        scheme_desc: leadData.additionalDetails.schemeDesc || '',
        bank_product: leadData.additionalDetails.bankProduct || '',
        bank_branch: leadData.additionalDetails.bankBranch || '',
        additional_comments: leadData.additionalDetails.additionalComments || '',
        lead_type: leadData.additionalDetails.leadType || '',
        loan_type: leadData.additionalDetails.loanType || '',
        vehicle_brand_name: leadData.additionalDetails.vehicleBrandName || '',
        vehicle_model_name: leadData.additionalDetails.vehicleModelName || '',
        phone_number: leadData.phone || '',
        email: leadData.email || '',
        created_at: new Date().toISOString()
      };

      const { error: detailsError } = await supabase
        .from('additional_details')
        .insert([additionalDetailsInsert]);

      if (detailsError) {
        console.error('Error creating additional details:', detailsError);
      }
    }

    // Insert co-applicant if exists
    if (leadData.hasCoApplicant && leadData.additionalDetails?.coApplicant) {
      const coApplicantInsert = {
        lead_id: leadData.id,
        name: leadData.additionalDetails.coApplicant.name || '',
        age: leadData.additionalDetails.coApplicant.age || 0,
        phone_number: leadData.additionalDetails.coApplicant.phone || '',
        email: leadData.additionalDetails.coApplicant.email || '',
        relationship: leadData.additionalDetails.coApplicant.relation || 'Spouse',
        occupation: leadData.additionalDetails.coApplicant.occupation || '',
        monthly_income: leadData.additionalDetails.coApplicant.monthlyIncome || ''
      };

      const { error: coApplicantError } = await supabase
        .from('co_applicants')
        .insert([coApplicantInsert]);

      if (coApplicantError) {
        console.error('Error creating co-applicant:', coApplicantError);
      }
    }

    // Insert additional addresses
    if (leadData.additionalDetails?.addresses && leadData.additionalDetails.addresses.length > 0) {
      for (const addr of leadData.additionalDetails.addresses) {
        const { data: additionalAddress, error: additionalAddressError } = await supabase
          .from('addresses')
          .insert([{
            type: addr.type || 'Residence',
            street: addr.street || '',
            city: addr.city || '',
            district: addr.district || '',
            state: addr.state || '',
            pincode: addr.pincode || ''
          }])
          .select()
          .single();

        if (!additionalAddressError && additionalAddress) {
          await supabase
            .from('lead_addresses')
            .insert([{
              lead_id: leadData.id,
              address_id: additionalAddress.id
            }]);
        }
      }
    }

    console.log('Lead created successfully:', lead);
    return lead;
  } catch (error) {
    console.error('Error in createLead:', error);
    throw error;
  }
};

// Function to create test leads
export const createTestLeads = async () => {
  console.log('Creating test leads...');
  
  const testLeads = [
    {
      id: `test-lead-1-${Date.now()}`,
      name: 'John Doe',
      age: 30,
      job: 'Software Engineer',
      phone: '9876543210',
      email: 'john.doe@example.com',
      address: {
        type: 'Residence',
        street: '123 Main Street',
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        pincode: '560001'
      },
      additionalDetails: {
        company: 'Tech Corp',
        designation: 'Senior Developer',
        workExperience: '5 years',
        propertyType: 'Apartment',
        ownershipStatus: 'Owned',
        propertyAge: '5 years',
        monthlyIncome: 75000,
        annualIncome: '900000',
        otherIncome: '50000',
        loanAmount: '2500000',
        addresses: [
          {
            type: 'Office',
            street: '456 Tech Park',
            city: 'Bangalore',
            district: 'Bangalore Urban',
            state: 'Karnataka',
            pincode: '560002'
          },
          {
            type: 'Permanent',
            street: '789 Home Avenue',
            city: 'Mysore',
            district: 'Mysore',
            state: 'Karnataka',
            pincode: '570001'
          }
        ],
        phoneNumber: '9876543210',
        email: 'john.doe@example.com',
        dateOfBirth: new Date('1993-05-15'),
        fatherName: 'Robert Doe',
        motherName: 'Mary Doe',
        gender: 'Male',
        agencyFileNo: 'AGC001',
        applicationBarcode: 'BC123456789',
        caseId: 'CASE001',
        schemeDesc: 'Home Loan Scheme',
        bankProduct: 'Home Loan',
        bankBranch: 'Bangalore Main',
        additionalComments: 'First time home buyer',
        leadType: 'Home Loan',
        loanType: 'Personal',
        vehicleBrandName: '',
        vehicleModelName: '',
        coApplicant: {
          name: 'Jane Doe',
          age: 28,
          phone: '9876543211',
          email: 'jane.doe@example.com',
          relation: 'Spouse',
          occupation: 'Teacher',
          monthlyIncome: '45000'
        }
      },
      status: 'Pending',
      bank: 'HDFC Bank',
      visitType: 'Physical',
      assignedTo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasCoApplicant: true,
      coApplicantName: 'Jane Doe',
      documents: [],
      instructions: 'Please verify all addresses'
    },
    // Add 4 more similar test leads...
    {
      id: `test-lead-2-${Date.now()}`,
      name: 'Priya Sharma',
      age: 35,
      job: 'Business Owner',
      phone: '9876543220',
      email: 'priya.sharma@example.com',
      address: {
        type: 'Residence',
        street: '456 Business Lane',
        city: 'Mumbai',
        district: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      additionalDetails: {
        company: 'Sharma Enterprises',
        designation: 'CEO',
        workExperience: '10 years',
        propertyType: 'House',
        ownershipStatus: 'Owned',
        propertyAge: '10 years',
        monthlyIncome: 150000,
        annualIncome: '1800000',
        otherIncome: '200000',
        loanAmount: '5000000',
        addresses: [
          {
            type: 'Office',
            street: '789 Commerce Street',
            city: 'Mumbai',
            district: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400002'
          }
        ],
        phoneNumber: '9876543220',
        email: 'priya.sharma@example.com',
        dateOfBirth: new Date('1988-08-20'),
        fatherName: 'Raj Sharma',
        motherName: 'Sunita Sharma',
        gender: 'Female',
        agencyFileNo: 'AGC002',
        applicationBarcode: 'BC223456789',
        caseId: 'CASE002',
        schemeDesc: 'Business Loan Scheme',
        bankProduct: 'Business Loan',
        bankBranch: 'Mumbai Central',
        additionalComments: 'Expanding business',
        leadType: 'Business Loan',
        loanType: 'Business',
        vehicleBrandName: '',
        vehicleModelName: ''
      },
      status: 'Pending',
      bank: 'SBI',
      visitType: 'Physical',
      assignedTo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasCoApplicant: false,
      documents: [],
      instructions: 'Business verification required'
    }
  ];

  for (const lead of testLeads) {
    try {
      await createLead(lead);
      console.log(`Test lead created: ${lead.name}`);
    } catch (error) {
      console.error(`Error creating test lead ${lead.name}:`, error);
    }
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
        additional_details (*),
        phone_numbers (*),
        addresses (*),
        lead_addresses (
          addresses (*)
        ),
        co_applicants (*)
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
      phone: lead.phone_numbers?.[0]?.number || '',
      email: lead.additional_details?.[0]?.email || '',
      address: {
        type: (lead.addresses?.type || 'Residence') as Address['type'],
        street: lead.addresses?.street || '',
        city: lead.addresses?.city || '',
        district: lead.addresses?.district || '',
        state: lead.addresses?.state || '',
        pincode: lead.addresses?.pincode || ''
      },
      additionalDetails: {
        company: lead.additional_details?.[0]?.company || '',
        designation: lead.additional_details?.[0]?.designation || '',
        workExperience: lead.additional_details?.[0]?.work_experience || '',
        propertyType: lead.additional_details?.[0]?.property_type || '',
        ownershipStatus: lead.additional_details?.[0]?.ownership_status || '',
        propertyAge: lead.additional_details?.[0]?.property_age || '',
        monthlyIncome: parseInt(lead.additional_details?.[0]?.monthly_income) || 0,
        annualIncome: lead.additional_details?.[0]?.annual_income || '',
        otherIncome: lead.additional_details?.[0]?.other_income || '',
        loanAmount: lead.additional_details?.[0]?.loan_amount || '',
        addresses: lead.lead_addresses?.map((la: any) => ({
          type: la.addresses?.type || 'Residence',
          street: la.addresses?.street || '',
          city: la.addresses?.city || '',
          district: la.addresses?.district || '',
          state: la.addresses?.state || '',
          pincode: la.addresses?.pincode || ''
        })) || [],
        phoneNumber: lead.phone_numbers?.[0]?.number || '',
        email: lead.additional_details?.[0]?.email || '',
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
        vehicleModelName: lead.additional_details?.[0]?.vehicle_model_name || '',
        coApplicant: lead.co_applicants?.[0] ? {
          name: lead.co_applicants[0].name || '',
          age: lead.co_applicants[0].age || 0,
          phone: lead.co_applicants[0].phone_number || '',
          email: lead.co_applicants[0].email || '',
          relation: lead.co_applicants[0].relationship || 'Spouse',
          occupation: lead.co_applicants[0].occupation || '',
          monthlyIncome: lead.co_applicants[0].monthly_income || ''
        } : undefined
      },
      status: lead.status as Lead['status'],
      bank: lead.bank_id || '',
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
        additional_details (*),
        phone_numbers (*),
        addresses (*),
        lead_addresses (
          addresses (*)
        ),
        co_applicants (*)
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
        additional_details (*),
        phone_numbers (*),
        addresses (*),
        lead_addresses (
          addresses (*)
        ),
        co_applicants (*)
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
    phone: lead.phone_numbers?.[0]?.number || '',
    email: lead.additional_details?.[0]?.email || '',
    address: {
      type: (lead.addresses?.type || 'Residence') as Address['type'],
      street: lead.addresses?.street || '',
      city: lead.addresses?.city || '',
      district: lead.addresses?.district || '',
      state: lead.addresses?.state || '',
      pincode: lead.addresses?.pincode || ''
    },
    additionalDetails: {
      company: lead.additional_details?.[0]?.company || '',
      designation: lead.additional_details?.[0]?.designation || '',
      workExperience: lead.additional_details?.[0]?.work_experience || '',
      propertyType: lead.additional_details?.[0]?.property_type || '',
      ownershipStatus: lead.additional_details?.[0]?.ownership_status || '',
      propertyAge: lead.additional_details?.[0]?.property_age || '',
      monthlyIncome: parseInt(lead.additional_details?.[0]?.monthly_income) || 0,
      annualIncome: lead.additional_details?.[0]?.annual_income || '',
      otherIncome: lead.additional_details?.[0]?.other_income || '',
      loanAmount: lead.additional_details?.[0]?.loan_amount || '',
      addresses: lead.lead_addresses?.map((la: any) => ({
        type: la.addresses?.type || 'Residence',
        street: la.addresses?.street || '',
        city: la.addresses?.city || '',
        district: la.addresses?.district || '',
        state: la.addresses?.state || '',
        pincode: la.addresses?.pincode || ''
      })) || [],
      phoneNumber: lead.phone_numbers?.[0]?.number || '',
      email: lead.additional_details?.[0]?.email || '',
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
      vehicleModelName: lead.additional_details?.[0]?.vehicle_model_name || '',
      coApplicant: lead.co_applicants?.[0] ? {
        name: lead.co_applicants[0].name || '',
        age: lead.co_applicants[0].age || 0,
        phone: lead.co_applicants[0].phone_number || '',
        email: lead.co_applicants[0].email || '',
        relation: lead.co_applicants[0].relationship || 'Spouse',
        occupation: lead.co_applicants[0].occupation || '',
        monthlyIncome: lead.co_applicants[0].monthly_income || ''
      } : undefined
    },
    status: lead.status as Lead['status'],
    bank: lead.bank_id || '',
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
