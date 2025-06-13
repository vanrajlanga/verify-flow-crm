
import { supabase } from '@/integrations/supabase/client';

export interface VehicleBrand {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleType {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleModel {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Vehicle Brands
export const getVehicleBrands = async (): Promise<VehicleBrand[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching vehicle brands:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVehicleBrands:', error);
    return [];
  }
};

export const addVehicleBrand = async (name: string): Promise<VehicleBrand | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error adding vehicle brand:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addVehicleBrand:', error);
    return null;
  }
};

export const updateVehicleBrand = async (id: string, name: string): Promise<VehicleBrand | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle brand:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateVehicleBrand:', error);
    return null;
  }
};

export const deleteVehicleBrand = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vehicle_brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle brand:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteVehicleBrand:', error);
    return false;
  }
};

// Vehicle Types
export const getVehicleTypes = async (): Promise<VehicleType[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching vehicle types:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVehicleTypes:', error);
    return [];
  }
};

export const addVehicleType = async (name: string): Promise<VehicleType | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_types')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error adding vehicle type:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addVehicleType:', error);
    return null;
  }
};

export const updateVehicleType = async (id: string, name: string): Promise<VehicleType | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_types')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle type:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateVehicleType:', error);
    return null;
  }
};

export const deleteVehicleType = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vehicle_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle type:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteVehicleType:', error);
    return false;
  }
};

// Vehicle Models
export const getVehicleModels = async (): Promise<VehicleModel[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching vehicle models:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVehicleModels:', error);
    return [];
  }
};

export const addVehicleModel = async (name: string): Promise<VehicleModel | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_models')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error adding vehicle model:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addVehicleModel:', error);
    return null;
  }
};

export const updateVehicleModel = async (id: string, name: string): Promise<VehicleModel | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_models')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle model:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateVehicleModel:', error);
    return null;
  }
};

export const deleteVehicleModel = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vehicle_models')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle model:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteVehicleModel:', error);
    return false;
  }
};
