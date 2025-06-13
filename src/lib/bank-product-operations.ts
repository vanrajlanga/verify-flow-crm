
import { supabase } from '@/integrations/supabase/client';
import { Bank, BankProduct, BankBranch } from '@/types/bank-product';

// Bank operations
export const getBanks = async (): Promise<Bank[]> => {
  try {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching banks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBanks:', error);
    return [];
  }
};

export const createBank = async (bank: Omit<Bank, 'id' | 'created_at'>): Promise<Bank | null> => {
  try {
    const { data, error } = await supabase
      .from('banks')
      .insert({
        id: bank.name.toLowerCase().replace(/\s+/g, '-'),
        name: bank.name,
        total_applications: bank.total_applications || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bank:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createBank:', error);
    return null;
  }
};

export const updateBank = async (id: string, updates: Partial<Bank>): Promise<Bank | null> => {
  try {
    const { data, error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bank:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBank:', error);
    return null;
  }
};

export const deleteBank = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bank:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteBank:', error);
    return false;
  }
};

// Bank Product operations
export const getBankProducts = async (): Promise<BankProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('bank_products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching bank products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBankProducts:', error);
    return [];
  }
};

export const getBankProductsByBankId = async (bankId: string): Promise<BankProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('bank_products')
      .select('*')
      .eq('bank_id', bankId)
      .order('name');

    if (error) {
      console.error('Error fetching bank products by bank:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBankProductsByBankId:', error);
    return [];
  }
};

export const createBankProduct = async (product: Omit<BankProduct, 'id' | 'created_at' | 'updated_at'>): Promise<BankProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('bank_products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('Error creating bank product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createBankProduct:', error);
    return null;
  }
};

export const updateBankProduct = async (id: string, updates: Partial<BankProduct>): Promise<BankProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('bank_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bank product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBankProduct:', error);
    return null;
  }
};

export const deleteBankProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bank_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bank product:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteBankProduct:', error);
    return false;
  }
};

// Bank Branch operations
export const getBankBranches = async (): Promise<BankBranch[]> => {
  try {
    const { data, error } = await supabase
      .from('bank_branches')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching bank branches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBankBranches:', error);
    return [];
  }
};

export const getBankBranchesByBankId = async (bankId: string): Promise<BankBranch[]> => {
  try {
    const { data, error } = await supabase
      .from('bank_branches')
      .select('*')
      .eq('bank_id', bankId)
      .order('name');

    if (error) {
      console.error('Error fetching bank branches by bank:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBankBranchesByBankId:', error);
    return [];
  }
};

export const createBankBranch = async (branch: Omit<BankBranch, 'id' | 'created_at' | 'updated_at'>): Promise<BankBranch | null> => {
  try {
    const { data, error } = await supabase
      .from('bank_branches')
      .insert(branch)
      .select()
      .single();

    if (error) {
      console.error('Error creating bank branch:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createBankBranch:', error);
    return null;
  }
};

export const updateBankBranch = async (id: string, updates: Partial<BankBranch>): Promise<BankBranch | null> => {
  try {
    const { data, error } = await supabase
      .from('bank_branches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bank branch:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBankBranch:', error);
    return null;
  }
};

export const deleteBankBranch = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bank_branches')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bank branch:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteBankBranch:', error);
    return false;
  }
};
