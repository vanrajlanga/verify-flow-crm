
import { supabase } from '@/integrations/supabase/client';

export interface PropertyType {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Get all property types
export const getPropertyTypes = async (): Promise<PropertyType[]> => {
  try {
    const { data, error } = await supabase
      .from('property_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching property types:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPropertyTypes:', error);
    return [];
  }
};

// Add property type
export const addPropertyType = async (name: string): Promise<PropertyType | null> => {
  try {
    const { data, error } = await supabase
      .from('property_types')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error adding property type:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addPropertyType:', error);
    return null;
  }
};

// Update property type
export const updatePropertyType = async (id: string, name: string): Promise<PropertyType | null> => {
  try {
    const { data, error } = await supabase
      .from('property_types')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property type:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePropertyType:', error);
    return null;
  }
};

// Delete property type
export const deletePropertyType = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('property_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property type:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePropertyType:', error);
    return false;
  }
};
