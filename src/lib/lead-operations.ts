import { supabase } from '@/integrations/supabase/client';
import { Lead, User } from '@/utils/mockData';

// Save a new lead to the database
export const saveLeadToDatabase = async (leadData: Lead) => {
  console.log('Saving lead to database:', leadData);

  try {
    // Insert lead into leads table
    const { data: leadResult, error: leadError } = await supabase
      .from('leads')
      .insert({
        id: leadData.id,
        name: leadData.name,
        age: leadData.age,
        job: leadData.job,
        status: leadData.status,
        bank_id: leadData.bank,
        assigned_to: leadData.assignedTo,
        visit_type: leadData.visitType,
        instructions: leadData.instructions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      throw leadError;
    }

    console.log('Lead inserted successfully:', leadResult);

    // Insert additional details
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
          loan_amount: leadData.additionalDetails.loanAmount,
          phone_number: leadData.additionalDetails.phoneNumber,
          email: leadData.additionalDetails.email,
          date_of_birth: leadData.additionalDetails.dateOfBirth ? new Date(leadData.additionalDetails.dateOfBirth).toISOString().split('T')[0] : null,
          father_name: leadData.additionalDetails.fatherName,
          mother_name: leadData.additionalDetails.motherName,
          gender: leadData.additionalDetails.gender,
          agency_file_no: leadData.additionalDetails.agencyFileNo,
          application_barcode: leadData.additionalDetails.applicationBarcode,
          case_id: leadData.additionalDetails.caseId,
          scheme_desc: leadData.additionalDetails.schemeDesc,
          bank_product: leadData.additionalDetails.bankProduct,
          bank_branch: leadData.additionalDetails.bankBranch,
          additional_comments: leadData.additionalDetails.additionalComments,
          lead_type: leadData.additionalDetails.leadType,
          loan_type: leadData.additionalDetails.loanType,
          vehicle_brand_name: leadData.additionalDetails.vehicleBrandName,
          vehicle_model_name: leadData.additionalDetails.vehicleModelName,
          created_at: new Date().toISOString()
        });

      if (detailsError) {
        console.error('Error inserting additional details:', detailsError);
        throw detailsError;
      }

      console.log('Additional details inserted successfully');
    }

    // Insert primary address
    if (leadData.address) {
      const { data: addressResult, error: addressError } = await supabase
        .from('addresses')
        .insert({
          type: leadData.address.type,
          street: leadData.address.street,
          city: leadData.address.city,
          district: leadData.address.district,
          state: leadData.address.state,
          pincode: leadData.address.pincode,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (addressError) {
        console.error('Error inserting primary address:', addressError);
        throw addressError;
      }

      console.log('Primary address inserted successfully:', addressResult);

      // Link address to lead
      const { error: linkError } = await supabase
        .from('lead_addresses')
        .insert({
          lead_id: leadData.id,
          address_id: addressResult.id,
          created_at: new Date().toISOString()
        });

      if (linkError) {
        console.error('Error linking address to lead:', linkError);
        throw linkError;
      }

      // Update lead with address_id
      const { error: updateError } = await supabase
        .from('leads')
        .update({ address_id: addressResult.id })
        .eq('id', leadData.id);

      if (updateError) {
        console.error('Error updating lead with address_id:', updateError);
        throw updateError;
      }
    }

    // Insert additional addresses
    if (leadData.additionalDetails?.addresses && leadData.additionalDetails.addresses.length > 0) {
      for (const addr of leadData.additionalDetails.addresses) {
        const { data: additionalAddressResult, error: additionalAddressError } = await supabase
          .from('addresses')
          .insert({
            type: addr.type,
            street: addr.street,
            city: addr.city,
            district: addr.district,
            state: addr.state,
            pincode: addr.pincode,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (additionalAddressError) {
          console.error('Error inserting additional address:', additionalAddressError);
          throw additionalAddressError;
        }

        // Link additional address to lead
        const { error: linkError } = await supabase
          .from('lead_addresses')
          .insert({
            lead_id: leadData.id,
            address_id: additionalAddressResult.id,
            created_at: new Date().toISOString()
          });

        if (linkError) {
          console.error('Error linking additional address to lead:', linkError);
          throw linkError;
        }
      }

      console.log('Additional addresses inserted successfully');
    }

    console.log('Lead saved to database successfully');
    return leadResult;

  } catch (error) {
    console.error('Error in saveLeadToDatabase:', error);
    throw error;
  }
};

// Get all leads from the database - FIXED to remove foreign key joins
export const getAllLeadsFromDatabase = async (): Promise<Lead[]> => {
  try {
    console.log('Fetching all leads from database');

    const { data: leadsData, error } = await supabase
      .from('leads')
      .select(`
        *,
        additional_details (*),
        addresses (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    if (!leadsData || leadsData.length === 0) {
      console.log('No leads found in database');
      return [];
    }

    // Transform database data to Lead format
    const leads: Lead[] = await Promise.all(
      leadsData.map(async (leadData) => {
        // Fetch addresses for each lead
        const { data: leadAddresses } = await supabase
          .from('lead_addresses')
          .select(`
            address_id,
            addresses (*)
          `)
          .eq('lead_id', leadData.id);

        const lead: Lead = {
          id: leadData.id,
          name: leadData.name,
          age: leadData.age || 0,
          job: leadData.job || '',
          address: {
            type: 'Residence',
            street: '',
            city: '',
            district: '',
            state: '',
            pincode: ''
          },
          additionalDetails: leadData.additional_details ? {
            company: leadData.additional_details.company || '',
            designation: leadData.additional_details.designation || '',
            workExperience: leadData.additional_details.work_experience || '',
            propertyType: leadData.additional_details.property_type || '',
            ownershipStatus: leadData.additional_details.ownership_status || '',
            propertyAge: leadData.additional_details.property_age || '',
            monthlyIncome: leadData.additional_details.monthly_income || '',
            annualIncome: leadData.additional_details.annual_income || '',
            otherIncome: leadData.additional_details.other_income || '',
            loanAmount: leadData.additional_details.loan_amount || '',
            addresses: [],
            phoneNumber: leadData.additional_details.phone_number || '',
            email: leadData.additional_details.email || '',
            dateOfBirth: leadData.additional_details.date_of_birth || '',
            fatherName: leadData.additional_details.father_name || '',
            motherName: leadData.additional_details.mother_name || '',
            gender: leadData.additional_details.gender || '',
            agencyFileNo: leadData.additional_details.agency_file_no || '',
            applicationBarcode: leadData.additional_details.application_barcode || '',
            caseId: leadData.additional_details.case_id || '',
            schemeDesc: leadData.additional_details.scheme_desc || '',
            bankProduct: leadData.additional_details.bank_product || '',
            initiatedUnderBranch: leadData.additional_details.bank_branch || '',
            bankBranch: leadData.additional_details.bank_branch || '',
            additionalComments: leadData.additional_details.additional_comments || '',
            leadType: leadData.additional_details.lead_type || '',
            loanType: leadData.additional_details.loan_type || '',
            vehicleBrandName: leadData.additional_details.vehicle_brand_name || '',
            vehicleModelName: leadData.additional_details.vehicle_model_name || ''
          } : undefined,
          status: leadData.status,
          bank: leadData.bank_id || '',
          visitType: leadData.visit_type as 'Residence' | 'Office' | 'Both',
          assignedTo: leadData.assigned_to || '',
          createdAt: new Date(leadData.created_at),
          verificationDate: leadData.verification_date ? new Date(leadData.verification_date) : undefined,
          documents: [],
          instructions: leadData.instructions || ''
        };

        // Set addresses
        if (leadAddresses && leadAddresses.length > 0) {
          const primaryAddressData = leadAddresses[0];
          if (primaryAddressData.addresses) {
            lead.address = {
              type: primaryAddressData.addresses.type as 'Residence' | 'Office' | 'Permanent',
              street: primaryAddressData.addresses.street || '',
              city: primaryAddressData.addresses.city || '',
              district: primaryAddressData.addresses.district || '',
              state: primaryAddressData.addresses.state || '',
              pincode: primaryAddressData.addresses.pincode || ''
            };
          }

          if (leadAddresses.length > 1 && lead.additionalDetails) {
            lead.additionalDetails.addresses = leadAddresses.slice(1).map((addr: any) => ({
              type: addr.addresses.type as 'Residence' | 'Office' | 'Permanent',
              street: addr.addresses.street || '',
              city: addr.addresses.city || '',
              district: addr.addresses.district || '',
              state: addr.addresses.state || '',
              pincode: addr.addresses.pincode || ''
            }));
          }
        }

        return lead;
      })
    );

    console.log(`Fetched ${leads.length} leads from database`);
    return leads;

  } catch (error) {
    console.error('Error in getAllLeadsFromDatabase:', error);
    throw error;
  }
};

// Get leads filtered by bank for managers
export const getLeadsByBankFromDatabase = async (bankId: string): Promise<Lead[]> => {
  try {
    console.log('Fetching leads by bank from database:', bankId);

    const { data: leadsData, error } = await supabase
      .from('leads')
      .select(`
        *,
        additional_details (*),
        addresses (*)
      `)
      .eq('bank_id', bankId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads by bank:', error);
      throw error;
    }

    if (!leadsData || leadsData.length === 0) {
      console.log('No leads found for bank:', bankId);
      return [];
    }

    // Transform database data to Lead format (same logic as getAllLeadsFromDatabase)
    const leads: Lead[] = await Promise.all(
      leadsData.map(async (leadData) => {
        const { data: leadAddresses } = await supabase
          .from('lead_addresses')
          .select(`
            address_id,
            addresses (*)
          `)
          .eq('lead_id', leadData.id);

        const lead: Lead = {
          id: leadData.id,
          name: leadData.name,
          age: leadData.age || 0,
          job: leadData.job || '',
          address: {
            type: 'Residence',
            street: '',
            city: '',
            district: '',
            state: '',
            pincode: ''
          },
          additionalDetails: leadData.additional_details ? {
            company: leadData.additional_details.company || '',
            designation: leadData.additional_details.designation || '',
            workExperience: leadData.additional_details.work_experience || '',
            propertyType: leadData.additional_details.property_type || '',
            ownershipStatus: leadData.additional_details.ownership_status || '',
            propertyAge: leadData.additional_details.property_age || '',
            monthlyIncome: leadData.additional_details.monthly_income || '',
            annualIncome: leadData.additional_details.annual_income || '',
            otherIncome: leadData.additional_details.other_income || '',
            loanAmount: leadData.additional_details.loan_amount || '',
            addresses: [],
            phoneNumber: leadData.additional_details.phone_number || '',
            email: leadData.additional_details.email || '',
            dateOfBirth: leadData.additional_details.date_of_birth || '',
            fatherName: leadData.additional_details.father_name || '',
            motherName: leadData.additional_details.mother_name || '',
            gender: leadData.additional_details.gender || '',
            agencyFileNo: leadData.additional_details.agency_file_no || '',
            applicationBarcode: leadData.additional_details.application_barcode || '',
            caseId: leadData.additional_details.case_id || '',
            schemeDesc: leadData.additional_details.scheme_desc || '',
            bankProduct: leadData.additional_details.bank_product || '',
            initiatedUnderBranch: leadData.additional_details.bank_branch || '',
            bankBranch: leadData.additional_details.bank_branch || '',
            additionalComments: leadData.additional_details.additional_comments || '',
            leadType: leadData.additional_details.lead_type || '',
            loanType: leadData.additional_details.loan_type || '',
            vehicleBrandName: leadData.additional_details.vehicle_brand_name || '',
            vehicleModelName: leadData.additional_details.vehicle_model_name || ''
          } : undefined,
          status: leadData.status,
          bank: leadData.bank_id || '',
          visitType: leadData.visit_type as 'Residence' | 'Office' | 'Both',
          assignedTo: leadData.assigned_to || '',
          createdAt: new Date(leadData.created_at),
          verificationDate: leadData.verification_date ? new Date(leadData.verification_date) : undefined,
          documents: [],
          instructions: leadData.instructions || ''
        };

        // Set addresses
        if (leadAddresses && leadAddresses.length > 0) {
          const primaryAddressData = leadAddresses[0];
          if (primaryAddressData.addresses) {
            lead.address = {
              type: primaryAddressData.addresses.type as 'Residence' | 'Office' | 'Permanent',
              street: primaryAddressData.addresses.street || '',
              city: primaryAddressData.addresses.city || '',
              district: primaryAddressData.addresses.district || '',
              state: primaryAddressData.addresses.state || '',
              pincode: primaryAddressData.addresses.pincode || ''
            };
          }

          if (leadAddresses.length > 1 && lead.additionalDetails) {
            lead.additionalDetails.addresses = leadAddresses.slice(1).map((addr: any) => ({
              type: addr.addresses.type as 'Residence' | 'Office' | 'Permanent',
              street: addr.addresses.street || '',
              city: addr.addresses.city || '',
              district: addr.addresses.district || '',
              state: addr.addresses.state || '',
              pincode: addr.addresses.pincode || ''
            }));
          }
        }

        return lead;
      })
    );

    console.log(`Fetched ${leads.length} leads for bank ${bankId} from database`);
    return leads;

  } catch (error) {
    console.error('Error in getLeadsByBankFromDatabase:', error);
    throw error;
  }
};

// Get single lead by ID
export const getLeadByIdFromDatabase = async (leadId: string): Promise<Lead | null> => {
  try {
    console.log('Fetching lead by ID from database:', leadId);

    // Fetch lead with all related data
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        additional_details (*),
        addresses (*)
      `)
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead:', leadError);
      throw leadError;
    }

    if (!leadData) {
      console.log('No lead found with ID:', leadId);
      return null;
    }

    // Fetch all addresses for this lead
    const { data: leadAddresses, error: addressError } = await supabase
      .from('lead_addresses')
      .select(`
        address_id,
        addresses (*)
      `)
      .eq('lead_id', leadId);

    if (addressError) {
      console.error('Error fetching lead addresses:', addressError);
      throw addressError;
    }

    // Transform database data to Lead format
    const lead: Lead = {
      id: leadData.id,
      name: leadData.name,
      age: leadData.age || 0,
      job: leadData.job || '',
      address: {
        type: 'Residence',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      },
      additionalDetails: leadData.additional_details ? {
        company: leadData.additional_details.company || '',
        designation: leadData.additional_details.designation || '',
        workExperience: leadData.additional_details.work_experience || '',
        propertyType: leadData.additional_details.property_type || '',
        ownershipStatus: leadData.additional_details.ownership_status || '',
        propertyAge: leadData.additional_details.property_age || '',
        monthlyIncome: leadData.additional_details.monthly_income || '',
        annualIncome: leadData.additional_details.annual_income || '',
        otherIncome: leadData.additional_details.other_income || '',
        loanAmount: leadData.additional_details.loan_amount || '',
        addresses: [],
        phoneNumber: leadData.additional_details.phone_number || '',
        email: leadData.additional_details.email || '',
        dateOfBirth: leadData.additional_details.date_of_birth || '',
        fatherName: leadData.additional_details.father_name || '',
        motherName: leadData.additional_details.mother_name || '',
        gender: leadData.additional_details.gender || '',
        agencyFileNo: leadData.additional_details.agency_file_no || '',
        applicationBarcode: leadData.additional_details.application_barcode || '',
        caseId: leadData.additional_details.case_id || '',
        schemeDesc: leadData.additional_details.scheme_desc || '',
        bankProduct: leadData.additional_details.bank_product || '',
        initiatedUnderBranch: leadData.additional_details.bank_branch || '',
        bankBranch: leadData.additional_details.bank_branch || '',
        additionalComments: leadData.additional_details.additional_comments || '',
        leadType: leadData.additional_details.lead_type || '',
        loanType: leadData.additional_details.loan_type || '',
        vehicleBrandName: leadData.additional_details.vehicle_brand_name || '',
        vehicleModelName: leadData.additional_details.vehicle_model_name || ''
      } : undefined,
      status: leadData.status,
      bank: leadData.bank_id || '',
      visitType: leadData.visit_type as 'Residence' | 'Office' | 'Both',
      assignedTo: leadData.assigned_to || '',
      createdAt: new Date(leadData.created_at),
      verificationDate: leadData.verification_date ? new Date(leadData.verification_date) : undefined,
      documents: [],
      instructions: leadData.instructions || ''
    };

    // Set primary address and additional addresses
    if (leadAddresses && leadAddresses.length > 0) {
      const primaryAddressData = leadAddresses[0];
      if (primaryAddressData.addresses) {
        lead.address = {
          type: primaryAddressData.addresses.type as 'Residence' | 'Office' | 'Permanent',
          street: primaryAddressData.addresses.street || '',
          city: primaryAddressData.addresses.city || '',
          district: primaryAddressData.addresses.district || '',
          state: primaryAddressData.addresses.state || '',
          pincode: primaryAddressData.addresses.pincode || ''
        };
      }

      // Additional addresses (excluding the first one)
      if (leadAddresses.length > 1 && lead.additionalDetails) {
        lead.additionalDetails.addresses = leadAddresses.slice(1).map((addr: any) => ({
          type: addr.addresses.type as 'Residence' | 'Office' | 'Permanent',
          street: addr.addresses.street || '',
          city: addr.addresses.city || '',
          district: addr.addresses.district || '',
          state: addr.addresses.state || '',
          pincode: addr.addresses.pincode || ''
        }));
      }
    }

    console.log('Lead fetched successfully:', lead);
    return lead;

  } catch (error) {
    console.error('Error in getLeadByIdFromDatabase:', error);
    throw error;
  }
};

// Update lead status in database
export const updateLeadInDatabase = async (leadId: string, updates: Partial<Lead>) => {
  try {
    console.log('Updating lead in database:', leadId, updates);
    
    // Prepare the main lead update data
    const leadUpdateData: any = {};
    
    if (updates.name !== undefined) leadUpdateData.name = updates.name;
    if (updates.age !== undefined) leadUpdateData.age = updates.age;
    if (updates.job !== undefined) leadUpdateData.job = updates.job;
    if (updates.status !== undefined) leadUpdateData.status = updates.status;
    if (updates.visitType !== undefined) leadUpdateData.visit_type = updates.visitType;
    if (updates.assignedTo !== undefined) leadUpdateData.assigned_to = updates.assignedTo;
    if (updates.instructions !== undefined) leadUpdateData.instructions = updates.instructions;
    if (updates.bank !== undefined) {
      // Map bank name to bank ID
      const getBankId = (bankName: string): string => {
        const bankMapping: { [key: string]: string } = {
          'HDFC': 'hdfc',
          'ICICI': 'icici', 
          'AXIS': 'axis',
          'SBI': 'sbi',
          'Kotak Mahindra Bank': 'kotak',
          'Punjab National Bank': 'pnb',
          'Bank of Baroda': 'bob',
          'Canara Bank': 'canara',
          'Union Bank of India': 'union',
          'Indian Bank': 'indian'
        };
        return bankMapping[bankName] || bankName.toLowerCase().replace(/\s+/g, '_');
      };
      leadUpdateData.bank_id = getBankId(updates.bank);
    }
    
    leadUpdateData.updated_at = new Date().toISOString();

    // Update the main lead record
    const { error: leadError } = await supabase
      .from('leads')
      .update(leadUpdateData)
      .eq('id', leadId);

    if (leadError) {
      console.error('Error updating lead:', leadError);
      throw leadError;
    }

    // Update address if provided
    if (updates.address) {
      // First get the address_id for this lead
      const { data: leadData, error: leadFetchError } = await supabase
        .from('leads')
        .select('address_id')
        .eq('id', leadId)
        .single();

      if (leadFetchError) {
        console.error('Error fetching lead address_id:', leadFetchError);
      } else if (leadData?.address_id) {
        const { error: addressError } = await supabase
          .from('addresses')
          .update({
            type: updates.address.type || 'Residence',
            street: updates.address.street || '',
            city: updates.address.city || '',
            district: updates.address.district || '',
            state: updates.address.state || '',
            pincode: updates.address.pincode || ''
          })
          .eq('id', leadData.address_id);

        if (addressError) {
          console.error('Error updating address:', addressError);
          // Don't throw here, just log the error
        }
      }
    }

    // Update additional details if provided
    if (updates.additionalDetails) {
      const additionalDetailsData = {
        company: updates.additionalDetails.company || null,
        designation: updates.additionalDetails.designation || null,
        phone_number: updates.additionalDetails.phoneNumber || null,
        email: updates.additionalDetails.email || null,
        monthly_income: updates.additionalDetails.monthlyIncome || null,
        annual_income: updates.additionalDetails.annualIncome || null,
        loan_amount: updates.additionalDetails.loanAmount || null,
        loan_type: updates.additionalDetails.loanType || null,
        vehicle_brand_name: updates.additionalDetails.vehicleBrandName || null,
        vehicle_model_name: updates.additionalDetails.vehicleModelName || null
      };

      // Check if additional details record exists
      const { data: existingDetails } = await supabase
        .from('additional_details')
        .select('id')
        .eq('lead_id', leadId)
        .single();

      if (existingDetails) {
        // Update existing record
        const { error: detailsError } = await supabase
          .from('additional_details')
          .update(additionalDetailsData)
          .eq('lead_id', leadId);

        if (detailsError) {
          console.error('Error updating additional details:', detailsError);
        }
      } else {
        // Create new record
        const { error: detailsError } = await supabase
          .from('additional_details')
          .insert({
            lead_id: leadId,
            ...additionalDetailsData
          });

        if (detailsError) {
          console.error('Error creating additional details:', detailsError);
        }
      }
    }

    console.log('Lead updated successfully in database');
  } catch (error) {
    console.error('Error in updateLeadInDatabase:', error);
    throw error;
  }
};

// Delete lead from database
export const deleteLeadFromDatabase = async (leadId: string): Promise<void> => {
  try {
    console.log(`Deleting lead ${leadId} from database...`);
    
    // Delete from leads table (cascade should handle related records)
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead from database:', error);
      throw new Error(`Failed to delete lead: ${error.message}`);
    }

    console.log(`Successfully deleted lead ${leadId} from database`);
  } catch (error) {
    console.error('Error in deleteLeadFromDatabase:', error);
    throw error;
  }
};
