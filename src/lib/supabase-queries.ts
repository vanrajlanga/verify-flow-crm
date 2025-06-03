
import { supabase } from '@/integrations/supabase/client';
import { 
  transformSupabaseUser, 
  transformSupabaseLead, 
  transformSupabaseBank 
} from './data-transformers';

// User queries
export const loginUser = async (email: string, password: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error) {
    console.error('Login error:', error);
    return null;
  }

  return transformSupabaseUser(user);
};

export const getUserById = async (id: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Get user error:', error);
    return null;
  }

  return transformSupabaseUser(user);
};

// Bank queries
export const getBanks = async () => {
  const { data: banks, error } = await supabase
    .from('banks')
    .select('*');

  if (error) {
    console.error('Get banks error:', error);
    return [];
  }

  return banks.map(transformSupabaseBank);
};

export const getBankById = async (id: string) => {
  const { data: bank, error } = await supabase
    .from('banks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Get bank error:', error);
    return null;
  }

  return transformSupabaseBank(bank);
};

// Lead queries with joins
export const getLeads = async () => {
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
    console.error('Get leads error:', error);
    return [];
  }

  return leads.map(transformSupabaseLead);
};

export const getLeadById = async (id: string) => {
  const { data: lead, error } = await supabase
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
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Get lead error:', error);
    return null;
  }

  return transformSupabaseLead(lead);
};

export const getLeadsByAgentId = async (agentId: string) => {
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
    `)
    .eq('assigned_to', agentId);

  if (error) {
    console.error('Get leads by agent error:', error);
    return [];
  }

  return leads.map(transformSupabaseLead);
};

// Statistics queries
export const getLeadStats = async () => {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('status');

  if (error) {
    console.error('Get lead stats error:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 };
  }

  const total = leads.length;
  const pending = leads.filter(lead => lead.status === 'Pending').length;
  const inProgress = leads.filter(lead => lead.status === 'In Progress').length;
  const completed = leads.filter(lead => lead.status === 'Completed').length;
  const rejected = leads.filter(lead => lead.status === 'Rejected').length;

  return { total, pending, inProgress, completed, rejected };
};

export const getAgentPerformance = async () => {
  const { data: agents, error: agentsError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'agent');

  if (agentsError) {
    console.error('Get agents error:', agentsError);
    return [];
  }

  const performance = await Promise.all(
    agents.map(async (agent) => {
      const { data: agentLeads, error: leadsError } = await supabase
        .from('leads')
        .select('status')
        .eq('assigned_to', agent.id);

      if (leadsError) {
        console.error('Get agent leads error:', leadsError);
        return {
          id: agent.id,
          name: agent.name,
          district: agent.district,
          totalVerifications: 0,
          completionRate: 0
        };
      }

      const completedLeads = agentLeads.filter(lead => lead.status === 'Completed');
      const completionRate = agentLeads.length > 0 ? Math.round((completedLeads.length / agentLeads.length) * 100) : 0;

      return {
        id: agent.id,
        name: agent.name,
        district: agent.district,
        totalVerifications: agentLeads.length,
        completionRate
      };
    })
  );

  return performance;
};
