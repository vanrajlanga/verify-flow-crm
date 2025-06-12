
import { supabase } from '@/integrations/supabase/client';
import { 
  transformSupabaseUser, 
  transformSupabaseLead, 
  transformSupabaseBank 
} from './data-transformers';

// Fallback to mock data when database is not available
import { mockUsers, mockBanks } from '@/utils/mockData';

// User queries
export const loginUser = async (email: string, password: string) => {
  try {
    console.log('Attempting login for:', email);
    
    // First try to query the database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) {
      console.log('Database query error:', error);
      
      // If table doesn't exist or other error, fall back to mock data
      console.log('Falling back to mock data');
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      if (mockUser) {
        console.log('Found user in mock data:', mockUser.name);
        return mockUser;
      }
      
      // Also check localStorage for additional users
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          const localUser = users.find((u: any) => u.email === email && u.password === password);
          if (localUser) {
            console.log('Found user in localStorage:', localUser.name);
            return localUser;
          }
        } catch (parseError) {
          console.error('Error parsing stored users:', parseError);
        }
      }
      
      console.log('No user found with provided credentials');
      return null;
    }

    if (user) {
      console.log('Found user in database:', user.name);
      return transformSupabaseUser(user);
    }

    return null;
  } catch (error) {
    console.error('Login error:', error);
    
    // Fall back to mock data
    console.log('Falling back to mock data due to error');
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);
    if (mockUser) {
      console.log('Found user in mock data:', mockUser.name);
      return mockUser;
    }
    
    // Also check localStorage
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const localUser = users.find((u: any) => u.email === email && u.password === password);
        if (localUser) {
          console.log('Found user in localStorage:', localUser.name);
          return localUser;
        }
      } catch (parseError) {
        console.error('Error parsing stored users:', parseError);
      }
    }
    
    return null;
  }
};

// Enhanced save user function that ensures database persistence
export const saveUser = async (userData: any) => {
  try {
    console.log('Saving user to database:', userData);
    
    // Ensure user has required fields and proper ID
    const userToSave = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      phone: userData.phone,
      district: userData.district,
      state: userData.state,
      city: userData.city,
      base_location: userData.baseLocation,
      max_travel_distance: userData.maxTravelDistance,
      extra_charge_per_km: userData.extraChargePerKm,
      status: userData.status || 'active',
      profile_picture: userData.profilePicture,
      completion_rate: userData.completionRate || 0,
      total_verifications: userData.totalVerifications || 0
    };
    
    // Try to save to database first
    const { data, error } = await supabase
      .from('users')
      .insert(userToSave)
      .select()
      .single();

    if (error) {
      console.error('Error saving user to database:', error);
      throw error;
    } else {
      console.log('User saved to database successfully:', data);
      
      // Also save to localStorage as fallback for immediate access
      const storedUsers = localStorage.getItem('mockUsers');
      let users = [];
      
      if (storedUsers) {
        users = JSON.parse(storedUsers);
      }
      
      // Check if user already exists
      const existingUserIndex = users.findIndex((u: any) => u.email === userData.email);
      if (existingUserIndex !== -1) {
        // Update existing user
        users[existingUserIndex] = userToSave;
      } else {
        // Add new user
        users.push(userToSave);
      }
      
      localStorage.setItem('mockUsers', JSON.stringify(users));
      console.log('User also saved to localStorage for immediate access');
      
      return data;
    }
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
};

// Get all users from database with fallback
export const getAllUsers = async () => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error && error.code !== '42P01') {
      console.error('Get users error:', error);
      return mockUsers;
    }

    if (users && users.length > 0) {
      return users.map(transformSupabaseUser);
    }

    // Fallback to localStorage and mock data
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const localUsers = JSON.parse(storedUsers);
        return [...mockUsers, ...localUsers];
      } catch (parseError) {
        console.error('Error parsing stored users:', parseError);
      }
    }

    return mockUsers;
  } catch (error) {
    console.error('Get all users error:', error);
    return mockUsers;
  }
};

export const getUserById = async (id: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== '42P01') {
      console.error('Get user error:', error);
      return null;
    }

    if (user) {
      return transformSupabaseUser(user);
    }

    // Fall back to mock data
    const mockUser = mockUsers.find(u => u.id === id);
    if (mockUser) {
      return mockUser;
    }

    // Check localStorage
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const localUser = users.find((u: any) => u.id === id);
        if (localUser) {
          return localUser;
        }
      } catch (parseError) {
        console.error('Error parsing stored users:', parseError);
      }
    }

    return null;
  } catch (error) {
    console.error('Get user error:', error);
    
    // Fall back to mock data
    const mockUser = mockUsers.find(u => u.id === id);
    if (mockUser) {
      return mockUser;
    }

    // Check localStorage
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const localUser = users.find((u: any) => u.id === id);
        if (localUser) {
          return localUser;
        }
      } catch (parseError) {
        console.error('Error parsing stored users:', parseError);
      }
    }

    return null;
  }
};

// Bank queries
export const getBanks = async () => {
  try {
    const { data: banks, error } = await supabase
      .from('banks')
      .select('*');

    if (error && error.code !== '42P01') {
      console.error('Get banks error:', error);
      return mockBanks;
    }

    if (banks) {
      return banks.map(transformSupabaseBank);
    }

    return mockBanks;
  } catch (error) {
    console.error('Get banks error:', error);
    return mockBanks;
  }
};

export const getBankById = async (id: string) => {
  try {
    const { data: bank, error } = await supabase
      .from('banks')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== '42P01') {
      console.error('Get bank error:', error);
      return null;
    }

    if (bank) {
      return transformSupabaseBank(bank);
    }

    // Fall back to mock data
    const mockBank = mockBanks.find(b => b.id === id);
    return mockBank || null;
  } catch (error) {
    console.error('Get bank error:', error);
    const mockBank = mockBanks.find(b => b.id === id);
    return mockBank || null;
  }
};

// Lead queries with joins - now using the new lead operations
export const getLeads = async () => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey(*),
        banks!leads_bank_id_fkey(*),
        users!leads_assigned_to_fkey(*),
        additional_details(*),
        verifications(*),
        co_applicants(*),
        vehicle_details(*),
        phone_numbers(*),
        lead_addresses(
          addresses(*)
        )
      `);

    if (error && error.code !== '42P01') {
      console.error('Get leads error:', error);
      return [];
    }

    if (leads) {
      return leads.map(transformSupabaseLead);
    }

    return [];
  } catch (error) {
    console.error('Get leads error:', error);
    return [];
  }
};

export const getLeadById = async (id: string) => {
  try {
    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey(*),
        banks!leads_bank_id_fkey(*),
        users!leads_assigned_to_fkey(*),
        additional_details(*),
        verifications(*),
        co_applicants(*),
        vehicle_details(*),
        phone_numbers(*),
        lead_addresses(
          addresses(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== '42P01') {
      console.error('Get lead error:', error);
      return null;
    }

    if (lead) {
      return transformSupabaseLead(lead);
    }

    return null;
  } catch (error) {
    console.error('Get lead error:', error);
    return null;
  }
};

export const getLeadsByAgentId = async (agentId: string) => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        addresses!leads_address_id_fkey(*),
        banks!leads_bank_id_fkey(*),
        users!leads_assigned_to_fkey(*),
        additional_details(*),
        verifications(*),
        co_applicants(*),
        vehicle_details(*),
        phone_numbers(*),
        lead_addresses(
          addresses(*)
        )
      `)
      .eq('assigned_to', agentId);

    if (error && error.code !== '42P01') {
      console.error('Get leads by agent error:', error);
      return [];
    }

    if (leads) {
      return leads.map(transformSupabaseLead);
    }

    return [];
  } catch (error) {
    console.error('Get leads by agent error:', error);
    return [];
  }
};

// Statistics queries
export const getLeadStats = async () => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status');

    if (error && error.code !== '42P01') {
      console.error('Get lead stats error:', error);
      return { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 };
    }

    if (!leads) {
      return { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 };
    }

    const total = leads.length;
    const pending = leads.filter((lead: any) => lead.status === 'Pending').length;
    const inProgress = leads.filter((lead: any) => lead.status === 'In Progress').length;
    const completed = leads.filter((lead: any) => lead.status === 'Completed').length;
    const rejected = leads.filter((lead: any) => lead.status === 'Rejected').length;

    return { total, pending, inProgress, completed, rejected };
  } catch (error) {
    console.error('Get lead stats error:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 };
  }
};

export const getAgentPerformance = async () => {
  try {
    const { data: agents, error: agentsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent');

    if (agentsError && agentsError.code !== '42P01') {
      console.error('Get agents error:', agentsError);
      return [];
    }

    if (!agents) {
      // Fall back to mock data
      const mockAgents = mockUsers.filter(user => user.role === 'agent');
      return mockAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        district: agent.district || '',
        totalVerifications: agent.totalVerifications || 0,
        completionRate: agent.completionRate || 0
      }));
    }

    const performance = await Promise.all(
      agents.map(async (agent: any) => {
        try {
          const { data: agentLeads, error: leadsError } = await supabase
            .from('leads')
            .select('status')
            .eq('assigned_to', agent.id);

          if (leadsError && leadsError.code !== '42P01') {
            console.error('Get agent leads error:', leadsError);
            return {
              id: agent.id,
              name: agent.name,
              district: agent.district || '',
              totalVerifications: 0,
              completionRate: 0
            };
          }

          const leads = agentLeads || [];
          const completedLeads = leads.filter((lead: any) => lead.status === 'Completed');
          const completionRate = leads.length > 0 ? Math.round((completedLeads.length / leads.length) * 100) : 0;

          return {
            id: agent.id,
            name: agent.name,
            district: agent.district || '',
            totalVerifications: leads.length,
            completionRate
          };
        } catch (error) {
          console.error('Error processing agent:', error);
          return {
            id: agent.id,
            name: agent.name,
            district: agent.district || '',
            totalVerifications: 0,
            completionRate: 0
          };
        }
      })
    );

    return performance;
  } catch (error) {
    console.error('Get agent performance error:', error);
    // Fall back to mock data
    const mockAgents = mockUsers.filter(user => user.role === 'agent');
    return mockAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      district: agent.district || '',
      totalVerifications: agent.totalVerifications || 0,
      completionRate: agent.completionRate || 0
    }));
  }
};
