
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/utils/mockData';

export const getAgentsFromDatabase = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent');

    if (error) {
      console.error('Error fetching agents from database:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAgentsFromDatabase:', error);
    return [];
  }
};

export const addAgentToDatabase = async (agent: User): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .insert([agent]);

    if (error) {
      console.error('Error adding agent to database:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in addAgentToDatabase:', error);
    throw error;
  }
};

export const updateAgentInDatabase = async (agent: User): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(agent)
      .eq('id', agent.id);

    if (error) {
      console.error('Error updating agent in database:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateAgentInDatabase:', error);
    throw error;
  }
};

export const deleteAgentFromDatabase = async (agentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', agentId);

    if (error) {
      console.error('Error deleting agent from database:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteAgentFromDatabase:', error);
    throw error;
  }
};
