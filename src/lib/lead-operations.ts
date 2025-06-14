import { supabase } from '@/integrations/supabase/client';
import { Lead, Address, AdditionalDetails } from '@/utils/mockData';

// Save a new lead to the database
export const saveLeadToDatabase = async (leadData: Lead) => {
  try {
    console.log('Saving lead to database:', leadData);

    // Validate required data
    if (!leadData.address) {
      throw new Error('Address is required');
    }

    if (!leadData.name || leadData.name.trim() === '') {
      throw new Error('Lead name is required');
    }

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
      .select()
      .single();

    if (addressError) {
      console.error('Error saving address:', addressError);
      throw new Error(`Failed to save address: ${addressError.message}`);
    }

    console.log('Address saved successfully:', addressData);

    // Map bank name to bank ID - handle both old and new format
    const getBankId = (bankName: string): string => {
      const bankMapping: { [key: string]: string } = {
        'HDFC': 'hdfc',
        'ICICI': 'icici', 
        'AXIS': 'axis-bank',
        'Axis Bank': 'axis-bank',
        'SBI': 'sbi',
        'Kotak Mahindra Bank': 'kotak',
        'Punjab National Bank': 'pnb',
        'Bank of Baroda': 'bob',
        'Canara Bank': 'canara',
        'Union Bank of India': 'union',
        'Indian Bank': 'indian',
        'axis': 'axis-bank', // Handle lowercase
        'hdfc': 'hdfc',
        'icici': 'icici',
        'sbi': 'sbi'
      };
      
      // Return mapped bank ID or use the bank name as-is if not found
      return bankMapping[bankName] || bankName.toLowerCase().replace(/\s+/g, '_');
    };

    // Save the lead with proper null handling
    const leadInsertData = {
      id: leadData.id,
      name: leadData.name || '',
      age: leadData.age || null,
      job: leadData.job || '',
      address_id: addressData.id,
      status: leadData.status || 'Pending',
      bank_id: getBankId(leadData.bank || ''),
      visit_type: leadData.visitType || 'Residence',
      assigned_to: leadData.assignedTo || null,
      verification_date: leadData.verificationDate?.toISOString() || null,
      instructions: leadData.instructions || null,
      has_co_applicant: leadData.additionalDetails?.coApplicant ? true : false,
      co_applicant_name: leadData.additionalDetails?.coApplicant?.name || null
    };

    console.log('Inserting lead data:', leadInsertData);

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadInsertData)
      .select()
      .single();

    if (leadError) {
      console.error('Error saving lead:', leadError);
      throw new Error(`Failed to save lead: ${leadError.message}`);
    }

    console.log('Lead saved successfully:', lead);

    // Save additional details if they exist
    if (leadData.additionalDetails) {
      const additionalDetailsData = {
        lead_id: leadData.id,
        company: leadData.additionalDetails.company || null,
        designation: leadData.additionalDetails.designation || null,
        work_experience: leadData.additionalDetails.workExperience || null,
        property_type: leadData.additionalDetails.propertyType || null,
        ownership_status: leadData.additionalDetails.ownershipStatus || null,
        property_age: leadData.additionalDetails.propertyAge || null,
        monthly_income: leadData.additionalDetails.monthlyIncome || null,
        annual_income: leadData.additionalDetails.annualIncome || null,
        other_income: leadData.additionalDetails.otherIncome || null,
        phone_number: leadData.additionalDetails.phoneNumber || null,
        email: leadData.additionalDetails.email || null,
        date_of_birth: leadData.additionalDetails.dateOfBirth || null,
        father_name: leadData.additionalDetails.fatherName || null,
        mother_name: leadData.additionalDetails.motherName || null,
        gender: leadData.additionalDetails.gender || null,
        agency_file_no: leadData.additionalDetails.agencyFileNo || null,
        application_barcode: leadData.additionalDetails.applicationBarcode || null,
        case_id: leadData.additionalDetails.caseId || null,
        scheme_desc: leadData.additionalDetails.schemeDesc || null,
        bank_branch: leadData.additionalDetails.initiatedUnderBranch || null,
        bank_product: leadData.additionalDetails.bankProduct || null,
        additional_comments: leadData.additionalDetails.additionalComments || null,
        lead_type: leadData.additionalDetails.leadType || null,
        lead_type_id: leadData.additionalDetails.leadTypeId || null,
        loan_amount: leadData.additionalDetails.loanAmount || null,
        loan_type: leadData.additionalDetails.loanType || null,
        vehicle_brand_name: leadData.additionalDetails.vehicleBrandName || null,
        vehicle_brand_id: leadData.additionalDetails.vehicleBrandId || null,
        vehicle_model_name: leadData.additionalDetails.vehicleModelName || null,
        vehicle_model_id: leadData.additionalDetails.vehicleModelId || null
      };

      console.log('Inserting additional details:', additionalDetailsData);

      const { error: detailsError } = await supabase
        .from('additional_details')
        .insert(additionalDetailsData);

      if (detailsError) {
        console.error('Error saving additional details:', detailsError);
        // Don't throw here, just log the error as additional details are optional
      } else {
        console.log('Additional details saved successfully');
      }

      // Save co-applicant if exists
      if (leadData.additionalDetails.coApplicant) {
        const coApplicantData = {
          lead_id: leadData.id,
          name: leadData.additionalDetails.coApplicant.name || '',
          age: leadData.additionalDetails.coApplicant.age ? Number(leadData.additionalDetails.coApplicant.age) : null,
          phone_number: leadData.additionalDetails.coApplicant.phone || null,
          email: leadData.additionalDetails.coApplicant.email || null,
          relationship: leadData.additionalDetails.coApplicant.relation || null,
          occupation: leadData.additionalDetails.coApplicant.occupation || null,
          monthly_income: leadData.additionalDetails.coApplicant.monthlyIncome || null
        };

        console.log('Inserting co-applicant:', coApplicantData);

        const { error: coApplicantError } = await supabase
          .from('co_applicants')
          .insert(coApplicantData);

        if (coApplicantError) {
          console.error('Error saving co-applicant:', coApplicantError);
          // Don't throw here, just log the error as co-applicant is optional
        } else {
          console.log('Co-applicant saved successfully');
        }
      }

      // Save additional addresses if they exist
      if (leadData.additionalDetails.addresses && leadData.additionalDetails.addresses.length > 0) {
        for (const addr of leadData.additionalDetails.addresses) {
          const { data: additionalAddress, error: addrError } = await supabase
            .from('addresses')
            .insert({
              type: addr.type || 'Residence',
              street: addr.street || '',
              city: addr.city || '',
              district: addr.district || '',
              state: addr.state || '',
              pincode: addr.pincode || ''
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
        const vehicleData = {
          lead_id: leadData.id,
          vehicle_brand_name: leadData.additionalDetails.vehicleBrandName || null,
          vehicle_brand_id: leadData.additionalDetails.vehicleBrandId || null,
          vehicle_model_name: leadData.additionalDetails.vehicleModelName || null,
          vehicle_model_id: leadData.additionalDetails.vehicleModelId || null,
          vehicle_type: leadData.additionalDetails.loanType || null,
          vehicle_price: leadData.additionalDetails.loanAmount || null
        };

        console.log('Inserting vehicle details:', vehicleData);

        const { error: vehicleError } = await supabase
          .from('vehicle_details')
          .insert(vehicleData);

        if (vehicleError) {
          console.error('Error saving vehicle details:', vehicleError);
          // Don't throw here, just log the error as vehicle details are optional
        } else {
          console.log('Vehicle details saved successfully');
        }
      }
    }

    // Create verification record if verification data exists
    if (leadData.verification) {
      const verificationData = {
        lead_id: leadData.id,
        status: leadData.verification.status || 'Not Started',
        agent_id: leadData.verification.agentId || null,
        notes: leadData.verification.notes || null
      };

      console.log('Inserting verification:', verificationData);

      const { error: verificationError } = await supabase
        .from('verifications')
        .insert(verificationData);

      if (verificationError) {
        console.error('Error saving verification:', verificationError);
        // Don't throw here, just log the error as verification is optional initially
      } else {
        console.log('Verification saved successfully');
      }
    }

    console.log('Lead saved successfully to database');
    return lead;
  } catch (error) {
    console.error('Error in saveLeadToDatabase:', error);
    throw error;
  }
};

// Get all leads from the database - FIXED to remove foreign key joins
export const getLeadsFromDatabase = async (forceRefresh = false) => {
  try {
    console.log('Fetching leads from database - force refresh:', forceRefresh);
    
    // FIXED: Remove the banks join since we removed the foreign key
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey(*),
        users!leads_assigned_to_fkey(*),
        additional_details(*),
        verifications(*),
        co_applicants(*),
        lead_addresses(
          addresses(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads from database:', error);
      throw error;
    }

    if (!leads) {
      console.log('No leads found in database');
      return [];
    }

    console.log(`Raw leads from database: ${leads.length} leads found`);

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
        fatherName: lead.additional_details[0].father_name,
        motherName: lead.additional_details[0].mother_name,
        gender: lead.additional_details[0].gender,
        agencyFileNo: lead.additional_details[0].agency_file_no,
        applicationBarcode: lead.additional_details[0].application_barcode,
        caseId: lead.additional_details[0].case_id,
        schemeDesc: lead.additional_details[0].scheme_desc,
        bankBranch: lead.additional_details[0].bank_branch,
        bankProduct: lead.additional_details[0].bank_product,
        initiatedUnderBranch: lead.additional_details[0].bank_branch,
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
        })) || [],
        coApplicant: lead.co_applicants?.[0] ? {
          name: lead.co_applicants[0].name || '',
          age: lead.co_applicants[0].age || undefined,
          phone: lead.co_applicants[0].phone_number || '',
          email: lead.co_applicants[0].email || '',
          relation: lead.co_applicants[0].relationship || '',
          occupation: lead.co_applicants[0].occupation || '',
          monthlyIncome: lead.co_applicants[0].monthly_income || ''
        } : undefined
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

      // Safely cast visitType with fallback
      const getValidVisitType = (visitType: string | null): Lead['visitType'] => {
        if (visitType === 'Office' || visitType === 'Both') {
          return visitType;
        }
        return 'Residence'; // Default fallback
      };

      // Get bank name from bank_id using mapping
      const getBankName = (bankId: string): string => {
        const bankMapping: { [key: string]: string } = {
          'hdfc': 'HDFC',
          'icici': 'ICICI',
          'axis': 'AXIS',
          'axis-bank': 'Axis Bank',
          'sbi': 'SBI',
          'kotak': 'Kotak Mahindra Bank',
          'pnb': 'Punjab National Bank',
          'bob': 'Bank of Baroda',
          'canara': 'Canara Bank',
          'union': 'Union Bank of India',
          'indian': 'Indian Bank'
        };
        
        return bankMapping[bankId] || bankId.toUpperCase();
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
        bank: getBankName(lead.bank_id || ''),
        visitType: getValidVisitType(lead.visit_type),
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

    console.log(`Transformed leads: ${transformedLeads.length} leads processed`);
    return transformedLeads;
  } catch (error) {
    console.error('Error in getLeadsFromDatabase:', error);
    throw error;
  }

  // Helper functions for transformation
  function getValidVisitType(visitType: string | null): Lead['visitType'] {
    if (visitType === 'Office' || visitType === 'Both') {
      return visitType;
    }
    return 'Residence';
  }

  function getBankName(bankId: string): string {
    const bankMapping: { [key: string]: string } = {
      'hdfc': 'HDFC',
      'icici': 'ICICI',
      'axis': 'AXIS',
      'axis-bank': 'Axis Bank',
      'sbi': 'SBI',
      'kotak': 'Kotak Mahindra Bank',
      'pnb': 'Punjab National Bank',
      'bob': 'Bank of Baroda',
      'canara': 'Canara Bank',
      'union': 'Union Bank of India',
      'indian': 'Indian Bank'
    };
    
    return bankMapping[bankId] || bankId.toUpperCase();
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

// Get single lead by ID
export const getLeadByIdFromDatabase = async (leadId: string) => {
  try {
    console.log('Fetching lead by ID from database:', leadId);
    
    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey(*),
        users!leads_assigned_to_fkey(*),
        additional_details(*),
        verifications(*),
        lead_addresses(
          addresses(*)
        )
      `)
      .eq('id', leadId)
      .single();

    if (error) {
      console.error('Error fetching lead by ID:', error);
      throw error;
    }

    if (!lead) {
      console.log('No lead found with ID:', leadId);
      return null;
    }

    // Transform single lead data (same transformation logic as above)
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
      fatherName: lead.additional_details[0].father_name,
      motherName: lead.additional_details[0].mother_name,
      gender: lead.additional_details[0].gender,
      agencyFileNo: lead.additional_details[0].agency_file_no,
      applicationBarcode: lead.additional_details[0].application_barcode,
      caseId: lead.additional_details[0].case_id,
      schemeDesc: lead.additional_details[0].scheme_desc,
      bankBranch: lead.additional_details[0].bank_branch,
      bankProduct: lead.additional_details[0].bank_product,
      initiatedUnderBranch: lead.additional_details[0].bank_branch,
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

    // Safely cast visitType with fallback
    const getValidVisitType = (visitType: string | null): Lead['visitType'] => {
      if (visitType === 'Office' || visitType === 'Both') {
        return visitType;
      }
      return 'Residence'; // Default fallback
    };

    // Get bank name from bank_id using mapping
    const getBankName = (bankId: string): string => {
      const bankMapping: { [key: string]: string } = {
        'hdfc': 'HDFC',
        'icici': 'ICICI',
        'axis': 'AXIS',
        'sbi': 'SBI',
        'kotak': 'Kotak Mahindra Bank',
        'pnb': 'Punjab National Bank',
        'bob': 'Bank of Baroda',
        'canara': 'Canara Bank',
        'union': 'Union Bank of India',
        'indian': 'Indian Bank'
      };
      
      return bankMapping[bankId] || bankId.toUpperCase();
    };

    const transformedLead: Lead = {
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
      bank: getBankName(lead.bank_id || ''),
      visitType: getValidVisitType(lead.visit_type),
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

    console.log('Lead fetched and transformed successfully:', transformedLead.id);
    return transformedLead;
  } catch (error) {
    console.error('Error in getLeadByIdFromDatabase:', error);
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
