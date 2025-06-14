import { supabase } from '@/integrations/supabase/client';
import { Lead, Address } from '@/utils/mockData';

export const saveLeadToDatabase = async (leadData: Lead): Promise<void> => {
  try {
    console.log('Saving lead to database:', leadData);
    
    // First, save the primary address
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        type: leadData.address.type || 'Residence',
        street: leadData.address.street || '',
        city: leadData.address.city || '',
        district: leadData.address.district || '',
        state: leadData.address.state || '',
        pincode: leadData.address.pincode || ''
      })
      .select('id')
      .single();

    if (addressError) {
      console.error('Error saving address:', addressError);
      throw new Error(`Failed to save address: ${addressError.message}`);
    }

    console.log('Address saved with ID:', addressData.id);

    // Save the main lead - only set assigned_to if it's not empty
    const leadInsertData: any = {
      id: leadData.id,
      name: leadData.name,
      age: leadData.age || 0,
      job: leadData.job || '',
      address_id: addressData.id,
      status: leadData.status,
      bank_id: leadData.bank,
      visit_type: leadData.visitType,
      instructions: leadData.instructions || '',
      has_co_applicant: !!leadData.additionalDetails?.coApplicant
    };

    // Only add assigned_to if it's not empty to avoid foreign key constraint
    if (leadData.assignedTo && leadData.assignedTo.trim() !== '') {
      leadInsertData.assigned_to = leadData.assignedTo;
    }

    const { data: leadInsertResult, error: leadError } = await supabase
      .from('leads')
      .insert(leadInsertData)
      .select()
      .single();

    if (leadError) {
      console.error('Error saving lead:', leadError);
      throw new Error(`Failed to save lead: ${leadError.message}`);
    }

    console.log('Lead saved successfully:', leadInsertResult);

    // Save additional details if present (remove lead_id as it doesn't exist in schema)
    if (leadData.additionalDetails) {
      const { error: additionalError } = await supabase
        .from('additional_details')
        .insert({
          company: leadData.additionalDetails.company || '',
          designation: leadData.additionalDetails.designation || '',
          work_experience: leadData.additionalDetails.workExperience || '',
          property_type: leadData.additionalDetails.propertyType || '',
          ownership_status: leadData.additionalDetails.ownershipStatus || '',
          property_age: leadData.additionalDetails.propertyAge || '',
          monthly_income: leadData.additionalDetails.monthlyIncome || '',
          annual_income: leadData.additionalDetails.annualIncome || '',
          other_income: leadData.additionalDetails.otherIncome || '',
          loan_amount: leadData.additionalDetails.loanAmount || '',
          phone_number: leadData.additionalDetails.phoneNumber || '',
          email: leadData.additionalDetails.email || '',
          date_of_birth: leadData.additionalDetails.dateOfBirth || null,
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
          vehicle_model_name: leadData.additionalDetails.vehicleModelName || ''
        });

      if (additionalError) {
        console.error('Error saving additional details:', additionalError);
        throw new Error(`Failed to save additional details: ${additionalError.message}`);
      }

      console.log('Additional details saved successfully');

      // Save additional addresses if present
      if (leadData.additionalDetails.addresses && leadData.additionalDetails.addresses.length > 0) {
        for (const address of leadData.additionalDetails.addresses) {
          const { data: additionalAddressData, error: additionalAddressError } = await supabase
            .from('addresses')
            .insert({
              type: address.type || 'Residence',
              street: address.street || '',
              city: address.city || '',
              district: address.district || '',
              state: address.state || '',
              pincode: address.pincode || ''
            })
            .select('id')
            .single();

          if (additionalAddressError) {
            console.error('Error saving additional address:', additionalAddressError);
            continue; // Continue with other addresses even if one fails
          }

          // Link the address to the lead
          const { error: linkError } = await supabase
            .from('lead_addresses')
            .insert({
              lead_id: leadData.id,
              address_id: additionalAddressData.id
            });

          if (linkError) {
            console.error('Error linking additional address:', linkError);
          }
        }
      }

      // Save co-applicant if present
      if (leadData.additionalDetails.coApplicant) {
        const { error: coApplicantError } = await supabase
          .from('co_applicants')
          .insert({
            lead_id: leadData.id,
            name: leadData.additionalDetails.coApplicant.name,
            age: leadData.additionalDetails.coApplicant.age || null,
            phone_number: leadData.additionalDetails.coApplicant.phone,
            email: leadData.additionalDetails.coApplicant.email || '',
            relationship: leadData.additionalDetails.coApplicant.relation,
            occupation: leadData.additionalDetails.coApplicant.occupation || '',
            monthly_income: leadData.additionalDetails.coApplicant.monthlyIncome || ''
          });

        if (coApplicantError) {
          console.error('Error saving co-applicant:', coApplicantError);
          throw new Error(`Failed to save co-applicant: ${coApplicantError.message}`);
        }

        console.log('Co-applicant saved successfully');
      }
    }

    console.log('Lead saved to database successfully with ID:', leadData.id);
  } catch (error) {
    console.error('Error in saveLeadToDatabase:', error);
    throw error;
  }
};

export const getAllLeadsFromDatabase = async (): Promise<Lead[]> => {
  try {
    console.log('Fetching all leads from database...');
    
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey (
          id,
          type,
          street,
          city,
          district,
          state,
          pincode
        ),
        additional_details (
          *
        ),
        co_applicants (
          *
        ),
        lead_addresses (
          addresses (
            id,
            type,
            street,
            city,
            district,
            state,
            pincode
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      throw new Error(`Failed to fetch leads: ${leadsError.message}`);
    }

    console.log('Raw leads data from database:', leadsData);

    if (!leadsData || leadsData.length === 0) {
      console.log('No leads found in database');
      return [];
    }

    // Transform database data to Lead format
    const transformedLeads: Lead[] = leadsData.map((dbLead: any) => {
      const additionalDetails = dbLead.additional_details?.[0];
      const coApplicant = dbLead.co_applicants?.[0];
      const additionalAddresses = dbLead.lead_addresses?.map((la: any) => la.addresses) || [];

      return {
        id: dbLead.id,
        name: dbLead.name,
        age: dbLead.age || 0,
        job: dbLead.job || '',
        phone: additionalDetails?.phone_number || '',
        email: additionalDetails?.email || '',
        address: {
          type: dbLead.addresses?.type as Address['type'] || 'Residence',
          street: dbLead.addresses?.street || '',
          city: dbLead.addresses?.city || '',
          district: dbLead.addresses?.district || '',
          state: dbLead.addresses?.state || '',
          pincode: dbLead.addresses?.pincode || ''
        },
        additionalDetails: additionalDetails ? {
          company: additionalDetails.company || '',
          designation: additionalDetails.designation || '',
          workExperience: additionalDetails.work_experience || '',
          propertyType: additionalDetails.property_type || '',
          ownershipStatus: additionalDetails.ownership_status || '',
          propertyAge: additionalDetails.property_age || '',
          monthlyIncome: additionalDetails.monthly_income || '',
          annualIncome: additionalDetails.annual_income || '',
          otherIncome: additionalDetails.other_income || '',
          loanAmount: additionalDetails.loan_amount || '',
          addresses: additionalAddresses.map((addr: any) => ({
            type: addr.type as Address['type'] || 'Residence',
            street: addr.street || '',
            city: addr.city || '',
            district: addr.district || '',
            state: addr.state || '',
            pincode: addr.pincode || ''
          })),
          phoneNumber: additionalDetails.phone_number || '',
          email: additionalDetails.email || '',
          dateOfBirth: additionalDetails.date_of_birth ? new Date(additionalDetails.date_of_birth) : new Date(),
          fatherName: additionalDetails.father_name || '',
          motherName: additionalDetails.mother_name || '',
          gender: additionalDetails.gender || '',
          agencyFileNo: additionalDetails.agency_file_no || '',
          applicationBarcode: additionalDetails.application_barcode || '',
          caseId: additionalDetails.case_id || '',
          schemeDesc: additionalDetails.scheme_desc || '',
          bankBranch: additionalDetails.bank_branch || '',
          bankProduct: additionalDetails.bank_product || '',
          initiatedUnderBranch: additionalDetails.bank_branch || '',
          additionalComments: additionalDetails.additional_comments || '',
          leadType: additionalDetails.lead_type || '',
          loanType: additionalDetails.loan_type || '',
          vehicleBrandName: additionalDetails.vehicle_brand_name || '',
          vehicleModelName: additionalDetails.vehicle_model_name || '',
          coApplicant: coApplicant ? {
            name: coApplicant.name,
            age: coApplicant.age,
            phone: coApplicant.phone_number,
            email: coApplicant.email,
            relation: coApplicant.relationship,
            occupation: coApplicant.occupation,
            monthlyIncome: coApplicant.monthly_income
          } : undefined
        } : undefined,
        status: dbLead.status as 'Pending' | 'In Progress' | 'Completed' | 'Rejected',
        bank: dbLead.bank_id || '',
        visitType: dbLead.visit_type as 'Physical' | 'Virtual',
        assignedTo: dbLead.assigned_to || '',
        createdAt: new Date(dbLead.created_at),
        verificationDate: dbLead.verification_date ? new Date(dbLead.verification_date) : undefined,
        documents: [],
        instructions: dbLead.instructions || ''
      };
    });

    console.log(`Successfully fetched and transformed ${transformedLeads.length} leads`);
    return transformedLeads;
  } catch (error) {
    console.error('Error in getAllLeadsFromDatabase:', error);
    throw error;
  }
};

export const getLeadsByBankFromDatabase = async (bankId: string): Promise<Lead[]> => {
  try {
    console.log('Fetching leads for bank:', bankId);
    
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey (
          id,
          type,
          street,
          city,
          district,
          state,
          pincode
        ),
        additional_details (
          *
        ),
        co_applicants (
          *
        ),
        lead_addresses (
          addresses (
            id,
            type,
            street,
            city,
            district,
            state,
            pincode
          )
        )
      `)
      .eq('bank_id', bankId)
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Error fetching leads by bank:', leadsError);
      throw new Error(`Failed to fetch leads: ${leadsError.message}`);
    }

    console.log(`Raw leads data for bank ${bankId}:`, leadsData);

    if (!leadsData || leadsData.length === 0) {
      console.log(`No leads found for bank: ${bankId}`);
      return [];
    }

    // Transform database data to Lead format (same logic as getAllLeadsFromDatabase)
    const transformedLeads: Lead[] = leadsData.map((dbLead: any) => {
      const additionalDetails = dbLead.additional_details?.[0];
      const coApplicant = dbLead.co_applicants?.[0];
      const additionalAddresses = dbLead.lead_addresses?.map((la: any) => la.addresses) || [];

      return {
        id: dbLead.id,
        name: dbLead.name,
        age: dbLead.age || 0,
        job: dbLead.job || '',
        phone: additionalDetails?.phone_number || '',
        email: additionalDetails?.email || '',
        address: {
          type: dbLead.addresses?.type as Address['type'] || 'Residence',
          street: dbLead.addresses?.street || '',
          city: dbLead.addresses?.city || '',
          district: dbLead.addresses?.district || '',
          state: dbLead.addresses?.state || '',
          pincode: dbLead.addresses?.pincode || ''
        },
        additionalDetails: additionalDetails ? {
          company: additionalDetails.company || '',
          designation: additionalDetails.designation || '',
          workExperience: additionalDetails.work_experience || '',
          propertyType: additionalDetails.property_type || '',
          ownershipStatus: additionalDetails.ownership_status || '',
          propertyAge: additionalDetails.property_age || '',
          monthlyIncome: additionalDetails.monthly_income || '',
          annualIncome: additionalDetails.annual_income || '',
          otherIncome: additionalDetails.other_income || '',
          loanAmount: additionalDetails.loan_amount || '',
          addresses: additionalAddresses.map((addr: any) => ({
            type: addr.type as Address['type'] || 'Residence',
            street: addr.street || '',
            city: addr.city || '',
            district: addr.district || '',
            state: addr.state || '',
            pincode: addr.pincode || ''
          })),
          phoneNumber: additionalDetails.phone_number || '',
          email: additionalDetails.email || '',
          dateOfBirth: additionalDetails.date_of_birth ? new Date(additionalDetails.date_of_birth) : new Date(),
          fatherName: additionalDetails.father_name || '',
          motherName: additionalDetails.mother_name || '',
          gender: additionalDetails.gender || '',
          agencyFileNo: additionalDetails.agency_file_no || '',
          applicationBarcode: additionalDetails.application_barcode || '',
          caseId: additionalDetails.case_id || '',
          schemeDesc: additionalDetails.scheme_desc || '',
          bankBranch: additionalDetails.bank_branch || '',
          bankProduct: additionalDetails.bank_product || '',
          initiatedUnderBranch: additionalDetails.bank_branch || '',
          additionalComments: additionalDetails.additional_comments || '',
          leadType: additionalDetails.lead_type || '',
          loanType: additionalDetails.loan_type || '',
          vehicleBrandName: additionalDetails.vehicle_brand_name || '',
          vehicleModelName: additionalDetails.vehicle_model_name || '',
          coApplicant: coApplicant ? {
            name: coApplicant.name,
            age: coApplicant.age,
            phone: coApplicant.phone_number,
            email: coApplicant.email,
            relation: coApplicant.relationship,
            occupation: coApplicant.occupation,
            monthlyIncome: coApplicant.monthly_income
          } : undefined
        } : undefined,
        status: dbLead.status as 'Pending' | 'In Progress' | 'Completed' | 'Rejected',
        bank: dbLead.bank_id || '',
        visitType: dbLead.visit_type as 'Physical' | 'Virtual',
        assignedTo: dbLead.assigned_to || '',
        createdAt: new Date(dbLead.created_at),
        verificationDate: dbLead.verification_date ? new Date(dbLead.verification_date) : undefined,
        documents: [],
        instructions: dbLead.instructions || ''
      };
    });

    console.log(`Successfully fetched and transformed ${transformedLeads.length} leads for bank ${bankId}`);
    return transformedLeads;
  } catch (error) {
    console.error(`Error in getLeadsByBankFromDatabase for bank ${bankId}:`, error);
    throw error;
  }
};

export const getLeadByIdFromDatabase = async (leadId: string): Promise<Lead | null> => {
  try {
    console.log('Fetching lead by ID:', leadId);
    
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey (
          id,
          type,
          street,
          city,
          district,
          state,
          pincode
        ),
        additional_details (
          *
        ),
        co_applicants (
          *
        ),
        lead_addresses (
          addresses (
            id,
            type,
            street,
            city,
            district,
            state,
            pincode
          )
        )
      `)
      .eq('id', leadId)
      .maybeSingle();

    if (leadError) {
      console.error('Error fetching lead by ID:', leadError);
      throw new Error(`Failed to fetch lead: ${leadError.message}`);
    }

    if (!leadData) {
      console.log('No lead found with ID:', leadId);
      return null;
    }

    console.log('Raw lead data from database:', leadData);

    // Transform database data to Lead format
    const additionalDetails = leadData.additional_details?.[0];
    const coApplicant = leadData.co_applicants?.[0];
    const additionalAddresses = leadData.lead_addresses?.map((la: any) => la.addresses) || [];

    const transformedLead: Lead = {
      id: leadData.id,
      name: leadData.name,
      age: leadData.age || 0,
      job: leadData.job || '',
      phone: additionalDetails?.phone_number || '',
      email: additionalDetails?.email || '',
      address: {
        type: leadData.addresses?.type as Address['type'] || 'Residence',
        street: leadData.addresses?.street || '',
        city: leadData.addresses?.city || '',
        district: leadData.addresses?.district || '',
        state: leadData.addresses?.state || '',
        pincode: leadData.addresses?.pincode || ''
      },
      additionalDetails: additionalDetails ? {
        company: additionalDetails.company || '',
        designation: additionalDetails.designation || '',
        workExperience: additionalDetails.work_experience || '',
        propertyType: additionalDetails.property_type || '',
        ownershipStatus: additionalDetails.ownership_status || '',
        propertyAge: additionalDetails.property_age || '',
        monthlyIncome: additionalDetails.monthly_income || '',
        annualIncome: additionalDetails.annual_income || '',
        otherIncome: additionalDetails.other_income || '',
        loanAmount: additionalDetails.loan_amount || '',
        addresses: additionalAddresses.map((addr: any) => ({
          type: addr.type as Address['type'] || 'Residence',
          street: addr.street || '',
          city: addr.city || '',
          district: addr.district || '',
          state: addr.state || '',
          pincode: addr.pincode || ''
        })),
        phoneNumber: additionalDetails.phone_number || '',
        email: additionalDetails.email || '',
        dateOfBirth: additionalDetails.date_of_birth ? new Date(additionalDetails.date_of_birth) : new Date(),
        fatherName: additionalDetails.father_name || '',
        motherName: additionalDetails.mother_name || '',
        gender: additionalDetails.gender || '',
        agencyFileNo: additionalDetails.agency_file_no || '',
        applicationBarcode: additionalDetails.application_barcode || '',
        caseId: additionalDetails.case_id || '',
        schemeDesc: additionalDetails.scheme_desc || '',
        bankBranch: additionalDetails.bank_branch || '',
        bankProduct: additionalDetails.bank_product || '',
        initiatedUnderBranch: additionalDetails.bank_branch || '',
        additionalComments: additionalDetails.additional_comments || '',
        leadType: additionalDetails.lead_type || '',
        loanType: additionalDetails.loan_type || '',
        vehicleBrandName: additionalDetails.vehicle_brand_name || '',
        vehicleModelName: additionalDetails.vehicle_model_name || '',
        coApplicant: coApplicant ? {
          name: coApplicant.name,
          age: coApplicant.age,
          phone: coApplicant.phone_number,
          email: coApplicant.email,
          relation: coApplicant.relationship,
          occupation: coApplicant.occupation,
          monthlyIncome: coApplicant.monthly_income
        } : undefined
      } : undefined,
      status: leadData.status as 'Pending' | 'In Progress' | 'Completed' | 'Rejected',
      bank: leadData.bank_id || '',
      visitType: leadData.visit_type as 'Physical' | 'Virtual',
      assignedTo: leadData.assigned_to || '',
      createdAt: new Date(leadData.created_at),
      verificationDate: leadData.verification_date ? new Date(leadData.verification_date) : undefined,
      documents: [],
      instructions: leadData.instructions || ''
    };

    console.log('Successfully fetched and transformed lead:', transformedLead);
    return transformedLead;
  } catch (error) {
    console.error('Error in getLeadByIdFromDatabase:', error);
    throw error;
  }
};

export const updateLeadInDatabase = async (leadId: string, updates: Partial<Lead>): Promise<void> => {
  try {
    console.log('Updating lead in database:', leadId, updates);
    
    const { error } = await supabase
      .from('leads')
      .update({
        status: updates.status,
        verification_date: updates.verificationDate?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead:', error);
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    console.log('Lead updated successfully in database');
  } catch (error) {
    console.error('Error in updateLeadInDatabase:', error);
    throw error;
  }
};

// Add the missing export function
export const getLeadsFromDatabase = getAllLeadsFromDatabase;

// Add the missing delete function
export const deleteLeadFromDatabase = async (leadId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead from database:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteLeadFromDatabase:', error);
    throw error;
  }
};
