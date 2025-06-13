
import { supabase } from '@/integrations/supabase/client';
import { Lead, Address, AdditionalDetails } from '@/utils/mockData';

// Save a new lead to the database
export const saveLeadToDatabase = async (leadData: Lead) => {
  try {
    console.log('Saving lead to database:', leadData);

    // First, save the primary address
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        type: 'Residence',
        street: leadData.address.street,
        city: leadData.address.city,
        district: leadData.address.district,
        state: leadData.address.state,
        pincode: leadData.address.pincode
      })
      .select()
      .single();

    if (addressError) {
      console.error('Error saving address:', addressError);
      throw addressError;
    }

    // Save the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        id: leadData.id,
        name: leadData.name,
        age: leadData.age,
        job: leadData.job,
        address_id: addressData.id,
        status: leadData.status,
        bank_id: leadData.bank,
        visit_type: leadData.visitType,
        assigned_to: leadData.assignedTo || null,
        verification_date: leadData.verificationDate?.toISOString(),
        instructions: leadData.instructions,
        has_co_applicant: leadData.additionalDetails?.coApplicant ? true : false,
        co_applicant_name: leadData.additionalDetails?.coApplicant?.name || null
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error saving lead:', leadError);
      throw leadError;
    }

    // Save additional details
    if (leadData.additionalDetails) {
      const { error: detailsError } = await supabase
        .from('additional_details')
        .insert({
          lead_id: leadData.id,
          company: leadData.additionalDetails.company,
          designation: leadData.additionalDetails.designation,
          work_experience: leadData.additionalDetails.workExperience,
          property_type: leadData.additionalDetails.propertyType,
          ownership_status: leadData.additionalDetails.ownershipStatus,
          property_age: leadData.additionalDetails.propertyAge,
          monthly_income: leadData.additionalDetails.monthlyIncome,
          annual_income: leadData.additionalDetails.annualIncome,
          other_income: leadData.additionalDetails.otherIncome,
          phone_number: leadData.additionalDetails.phoneNumber,
          email: leadData.additionalDetails.email,
          date_of_birth: leadData.additionalDetails.dateOfBirth,
          agency_file_no: leadData.additionalDetails.agencyFileNo,
          application_barcode: leadData.additionalDetails.applicationBarcode,
          case_id: leadData.additionalDetails.caseId,
          scheme_desc: leadData.additionalDetails.schemeDesc,
          bank_branch: leadData.additionalDetails.bankBranch,
          additional_comments: leadData.additionalDetails.additionalComments,
          lead_type: leadData.additionalDetails.leadType,
          lead_type_id: leadData.additionalDetails.leadTypeId,
          loan_amount: leadData.additionalDetails.loanAmount,
          loan_type: leadData.additionalDetails.loanType,
          vehicle_brand_name: leadData.additionalDetails.vehicleBrandName,
          vehicle_brand_id: leadData.additionalDetails.vehicleBrandId,
          vehicle_model_name: leadData.additionalDetails.vehicleModelName,
          vehicle_model_id: leadData.additionalDetails.vehicleModelId
        });

      if (detailsError) {
        console.error('Error saving additional details:', detailsError);
        throw detailsError;
      }

      // Save co-applicant if exists
      if (leadData.additionalDetails.coApplicant) {
        const { error: coApplicantError } = await supabase
          .from('co_applicants')
          .insert({
            lead_id: leadData.id,
            name: leadData.additionalDetails.coApplicant.name,
            age: leadData.additionalDetails.coApplicant.age || null,
            phone_number: leadData.additionalDetails.coApplicant.phone,
            email: leadData.additionalDetails.coApplicant.email || null,
            relationship: leadData.additionalDetails.coApplicant.relation,
            occupation: leadData.additionalDetails.coApplicant.occupation || null,
            monthly_income: leadData.additionalDetails.coApplicant.monthlyIncome || null
          });

        if (coApplicantError) {
          console.error('Error saving co-applicant:', coApplicantError);
        }
      }

      // Save additional addresses if they exist
      if (leadData.additionalDetails.addresses && leadData.additionalDetails.addresses.length > 0) {
        for (const addr of leadData.additionalDetails.addresses) {
          const { data: additionalAddress, error: addrError } = await supabase
            .from('addresses')
            .insert({
              type: addr.type,
              street: addr.street,
              city: addr.city,
              district: addr.district,
              state: addr.state,
              pincode: addr.pincode
            })
            .select()
            .single();

          if (addrError) {
            console.error('Error saving additional address:', addrError);
            continue;
          }

          // Link address to lead
          const { error: linkError } = await supabase
            .from('lead_addresses')
            .insert({
              lead_id: leadData.id,
              address_id: additionalAddress.id
            });

          if (linkError) {
            console.error('Error linking address to lead:', linkError);
          }
        }
      }

      // Save vehicle details if exists
      if (leadData.additionalDetails.vehicleBrandName || leadData.additionalDetails.vehicleModelName) {
        const { error: vehicleError } = await supabase
          .from('vehicle_details')
          .insert({
            lead_id: leadData.id,
            vehicle_brand_name: leadData.additionalDetails.vehicleBrandName,
            vehicle_brand_id: leadData.additionalDetails.vehicleBrandId,
            vehicle_model_name: leadData.additionalDetails.vehicleModelName,
            vehicle_model_id: leadData.additionalDetails.vehicleModelId,
            vehicle_type: leadData.additionalDetails.loanType,
            vehicle_price: leadData.additionalDetails.loanAmount
          });

        if (vehicleError) {
          console.error('Error saving vehicle details:', vehicleError);
        }
      }
    }

    // Create verification record
    if (leadData.verification) {
      const { error: verificationError } = await supabase
        .from('verifications')
        .insert({
          lead_id: leadData.id,
          status: leadData.verification.status,
          agent_id: leadData.verification.agentId,
          notes: leadData.verification.notes
        });

      if (verificationError) {
        console.error('Error saving verification:', verificationError);
        throw verificationError;
      }
    }

    console.log('Lead saved successfully to database');
    return lead;
  } catch (error) {
    console.error('Error in saveLeadToDatabase:', error);
    throw error;
  }
};

// Get all leads from the database
export const getLeadsFromDatabase = async () => {
  try {
    console.log('Fetching leads from database...');
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey(*),
        banks!leads_bank_id_fkey(*),
        users!leads_assigned_to_fkey(*),
        additional_details(*),
        verifications(*),
        lead_addresses(
          addresses(*)
        )
      `);

    if (error) {
      console.error('Error fetching leads from database:', error);
      return [];
    }

    if (!leads) {
      console.log('No leads found in database');
      return [];
    }

    console.log('Raw leads from database:', leads.length);

    // Transform database leads to match our Lead interface
    const transformedLeads: Lead[] = leads.map((lead: any) => {
      const additionalDetails: AdditionalDetails = lead.additional_details?.[0] ? {
        company: lead.additional_details[0].company || '',
        designation: lead.additional_details[0].designation || '',
        workExperience: lead.additional_details[0].work_experience || '',
        propertyType: lead.additional_details[0].property_type || '',
        ownershipStatus: lead.additional_details[0].ownership_status || '',
        propertyAge: lead.additional_details[0].property_age || '',
        monthlyIncome: lead.additional_details[0].monthly_income || '',
        annualIncome: lead.additional_details[0].annual_income || '',
        otherIncome: lead.additional_details[0].other_income || '',
        phoneNumber: lead.additional_details[0].phone_number,
        email: lead.additional_details[0].email,
        dateOfBirth: lead.additional_details[0].date_of_birth,
        agencyFileNo: lead.additional_details[0].agency_file_no,
        applicationBarcode: lead.additional_details[0].application_barcode,
        caseId: lead.additional_details[0].case_id,
        schemeDesc: lead.additional_details[0].scheme_desc,
        bankBranch: lead.additional_details[0].bank_branch,
        additionalComments: lead.additional_details[0].additional_comments,
        leadType: lead.additional_details[0].lead_type,
        leadTypeId: lead.additional_details[0].lead_type_id,
        loanAmount: lead.additional_details[0].loan_amount,
        loanType: lead.additional_details[0].loan_type,
        vehicleBrandName: lead.additional_details[0].vehicle_brand_name,
        vehicleBrandId: lead.additional_details[0].vehicle_brand_id,
        vehicleModelName: lead.additional_details[0].vehicle_model_name,
        vehicleModelId: lead.additional_details[0].vehicle_model_id,
        addresses: lead.lead_addresses?.map((la: any) => ({
          type: la.addresses.type,
          street: la.addresses.street,
          city: la.addresses.city,
          district: la.addresses.district,
          state: la.addresses.state,
          pincode: la.addresses.pincode
        })) || []
      } : {
        company: '',
        designation: '',
        workExperience: '',
        propertyType: '',
        ownershipStatus: '',
        propertyAge: '',
        monthlyIncome: '',
        annualIncome: '',
        otherIncome: '',
        addresses: []
      };

      return {
        id: lead.id,
        name: lead.name,
        age: lead.age || 0,
        job: lead.job || '',
        address: {
          type: lead.addresses?.type || 'Residence',
          street: lead.addresses?.street || '',
          city: lead.addresses?.city || '',
          district: lead.addresses?.district || '',
          state: lead.addresses?.state || '',
          pincode: lead.addresses?.pincode || ''
        },
        additionalDetails,
        status: lead.status as Lead['status'],
        bank: lead.bank_id || '',
        visitType: lead.visit_type || 'Residence',
        assignedTo: lead.assigned_to || '',
        createdAt: new Date(lead.created_at),
        verificationDate: lead.verification_date ? new Date(lead.verification_date) : undefined,
        documents: [],
        instructions: lead.instructions || '',
        verification: lead.verifications?.[0] ? {
          id: lead.verifications[0].id,
          leadId: lead.id,
          status: lead.verifications[0].status as "Not Started" | "In Progress" | "Completed" | "Rejected",
          agentId: lead.verifications[0].agent_id,
          photos: [],
          documents: [],
          notes: lead.verifications[0].notes || ""
        } : undefined
      };
    });

    console.log('Transformed leads:', transformedLeads.length);
    return transformedLeads;
  } catch (error) {
    console.error('Error in getLeadsFromDatabase:', error);
    return [];
  }
};

// Update lead status in database
export const updateLeadInDatabase = async (leadId: string, updates: Partial<Lead>) => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({
        status: updates.status,
        assigned_to: updates.assignedTo,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead in database:', error);
      throw error;
    }

    console.log('Lead updated successfully in database');
  } catch (error) {
    console.error('Error in updateLeadInDatabase:', error);
    throw error;
  }
};

// Delete lead from database
export const deleteLeadFromDatabase = async (leadId: string) => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead from database:', error);
      throw error;
    }

    console.log('Lead deleted successfully from database');
  } catch (error) {
    console.error('Error in deleteLeadFromDatabase:', error);
    throw error;
  }
};
