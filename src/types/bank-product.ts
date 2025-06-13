
export interface BankProduct {
  id: string;
  name: string;
  description?: string;
  bank_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface BankBranch {
  id: string;
  name: string;
  location: string;
  bank_id: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Bank {
  id: string;
  name: string;
  total_applications?: number;
  created_at?: string;
}
