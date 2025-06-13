
import { supabase } from '@/integrations/supabase/client';
import { saveLeadToDatabase } from '@/lib/lead-operations';
import { Lead } from '@/utils/mockData';

export const migrateLocalLeadsToDatabase = async () => {
  try {
    console.log('Starting migration of local leads to database...');
    
    // Get leads from localStorage
    const storedLeads = localStorage.getItem('mockLeads');
    if (!storedLeads) {
      console.log('No local leads found to migrate');
      return { success: true, migratedCount: 0 };
    }

    let localLeads: Lead[] = [];
    try {
      localLeads = JSON.parse(storedLeads);
    } catch (parseError) {
      console.error('Error parsing local leads:', parseError);
      return { success: false, error: 'Failed to parse local leads' };
    }

    if (localLeads.length === 0) {
      console.log('No leads in localStorage to migrate');
      return { success: true, migratedCount: 0 };
    }

    console.log(`Found ${localLeads.length} leads in localStorage to migrate`);

    // Check which leads already exist in database
    const { data: existingLeads, error: fetchError } = await supabase
      .from('leads')
      .select('id');

    if (fetchError) {
      console.error('Error fetching existing leads:', fetchError);
      throw fetchError;
    }

    const existingLeadIds = new Set(existingLeads?.map(lead => lead.id) || []);
    const leadsToMigrate = localLeads.filter(lead => !existingLeadIds.has(lead.id));

    console.log(`${leadsToMigrate.length} leads need to be migrated to database`);

    let migratedCount = 0;
    let failedCount = 0;

    // Migrate each lead to database
    for (const lead of leadsToMigrate) {
      try {
        console.log(`Migrating lead ${lead.id} (${lead.name}) to database...`);
        await saveLeadToDatabase(lead);
        migratedCount++;
        console.log(`Successfully migrated lead ${lead.id}`);
      } catch (error) {
        console.error(`Failed to migrate lead ${lead.id}:`, error);
        failedCount++;
      }
    }

    console.log(`Migration completed: ${migratedCount} successful, ${failedCount} failed`);

    // If all leads were successfully migrated, clear localStorage
    if (failedCount === 0 && migratedCount > 0) {
      localStorage.removeItem('mockLeads');
      console.log('Cleared localStorage after successful migration');
    }

    return { 
      success: true, 
      migratedCount, 
      failedCount,
      totalLocal: localLeads.length 
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};

export const ensureLeadInDatabase = async (lead: Lead) => {
  try {
    console.log(`Ensuring lead ${lead.id} is saved in database...`);
    
    // Check if lead already exists
    const { data: existingLead, error: fetchError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', lead.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking if lead exists:', fetchError);
      throw fetchError;
    }

    if (existingLead) {
      console.log(`Lead ${lead.id} already exists in database`);
      return { success: true, action: 'already_exists' };
    }

    // Lead doesn't exist, save it
    await saveLeadToDatabase(lead);
    console.log(`Successfully saved lead ${lead.id} to database`);
    return { success: true, action: 'saved' };
  } catch (error) {
    console.error(`Failed to ensure lead ${lead.id} is in database:`, error);
    throw error;
  }
};
