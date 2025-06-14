
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/utils/mockData';

// Transform database user to User type
const transformDatabaseUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as 'admin' | 'agent' | 'manager' | 'tvtteam', // Fixed: changed 'tvt' to 'tvtteam'
    district: dbUser.district,
    phone: dbUser.phone,
    city: dbUser.city,
    state: dbUser.state,
    baseLocation: dbUser.base_location,
    branch: dbUser.branch,
    profilePicture: dbUser.profile_picture,
    maxTravelDistance: dbUser.max_travel_distance,
    extraChargePerKm: dbUser.extra_charge_per_km,
    totalVerifications: dbUser.total_verifications,
    completionRate: dbUser.completion_rate,
    status: dbUser.status === 'active' ? 'Active' : 'Inactive', // Fixed: convert to proper enum
    password: dbUser.password,
    documents: []
  };
};

// Transform User type to database format
const transformUserToDatabase = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    district: user.district || null,
    phone: user.phone || null,
    city: user.city || null,
    state: user.state || null,
    base_location: user.baseLocation || null,
    profile_picture: user.profilePicture || null,
    max_travel_distance: user.maxTravelDistance || null,
    extra_charge_per_km: user.extraChargePerKm || null,
    total_verifications: user.totalVerifications || 0,
    completion_rate: user.completionRate || 0,
    status: user.status === 'Active' ? 'active' : 'inactive', // Fixed: convert to database format
    password: user.password || ''
  };
};

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

    return data ? data.map(transformDatabaseUser) : [];
  } catch (error) {
    console.error('Error in getAgentsFromDatabase:', error);
    return [];
  }
};

export const addAgentToDatabase = async (agent: User): Promise<void> => {
  try {
    const dbAgent = transformUserToDatabase(agent);
    const { error } = await supabase
      .from('users')
      .insert([dbAgent]);

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
    const dbAgent = transformUserToDatabase(agent);
    const { error } = await supabase
      .from('users')
      .update(dbAgent)
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
