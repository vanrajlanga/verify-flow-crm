export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      additional_details: {
        Row: {
          additional_comments: string | null
          agency_file_no: string | null
          annual_income: string | null
          application_barcode: string | null
          bank_branch: string | null
          case_id: string | null
          company: string | null
          created_at: string
          date_of_birth: string | null
          designation: string | null
          email: string | null
          id: string
          lead_id: string | null
          lead_type: string | null
          lead_type_id: string | null
          loan_amount: string | null
          loan_type: string | null
          monthly_income: string | null
          other_income: string | null
          ownership_status: string | null
          phone_number: string | null
          property_age: string | null
          property_type: string | null
          scheme_desc: string | null
          vehicle_brand_id: string | null
          vehicle_brand_name: string | null
          vehicle_model_id: string | null
          vehicle_model_name: string | null
          work_experience: string | null
        }
        Insert: {
          additional_comments?: string | null
          agency_file_no?: string | null
          annual_income?: string | null
          application_barcode?: string | null
          bank_branch?: string | null
          case_id?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          lead_id?: string | null
          lead_type?: string | null
          lead_type_id?: string | null
          loan_amount?: string | null
          loan_type?: string | null
          monthly_income?: string | null
          other_income?: string | null
          ownership_status?: string | null
          phone_number?: string | null
          property_age?: string | null
          property_type?: string | null
          scheme_desc?: string | null
          vehicle_brand_id?: string | null
          vehicle_brand_name?: string | null
          vehicle_model_id?: string | null
          vehicle_model_name?: string | null
          work_experience?: string | null
        }
        Update: {
          additional_comments?: string | null
          agency_file_no?: string | null
          annual_income?: string | null
          application_barcode?: string | null
          bank_branch?: string | null
          case_id?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          lead_id?: string | null
          lead_type?: string | null
          lead_type_id?: string | null
          loan_amount?: string | null
          loan_type?: string | null
          monthly_income?: string | null
          other_income?: string | null
          ownership_status?: string | null
          phone_number?: string | null
          property_age?: string | null
          property_type?: string | null
          scheme_desc?: string | null
          vehicle_brand_id?: string | null
          vehicle_brand_name?: string | null
          vehicle_model_id?: string | null
          vehicle_model_name?: string | null
          work_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "additional_details_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          city: string | null
          created_at: string
          district: string | null
          id: string
          pincode: string | null
          state: string | null
          street: string | null
          type: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          pincode?: string | null
          state?: string | null
          street?: string | null
          type: string
        }
        Update: {
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          pincode?: string | null
          state?: string | null
          street?: string | null
          type?: string
        }
        Relationships: []
      }
      banks: {
        Row: {
          created_at: string
          id: string
          name: string
          total_applications: number | null
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          total_applications?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          total_applications?: number | null
        }
        Relationships: []
      }
      co_applicants: {
        Row: {
          age: number | null
          created_at: string
          email: string | null
          id: string
          lead_id: string | null
          monthly_income: string | null
          name: string
          occupation: string | null
          phone_number: string | null
          relationship: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          monthly_income?: string | null
          name: string
          occupation?: string | null
          phone_number?: string | null
          relationship?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          monthly_income?: string | null
          name?: string
          occupation?: string | null
          phone_number?: string | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "co_applicants_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      field_verifications: {
        Row: {
          created_at: string | null
          field_name: string
          id: string
          is_verified: boolean | null
          lead_id: string
          updated_at: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          id?: string
          is_verified?: boolean | null
          lead_id: string
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          id?: string
          is_verified?: boolean | null
          lead_id?: string
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      lead_addresses: {
        Row: {
          address_id: string | null
          created_at: string
          id: string
          lead_id: string | null
        }
        Insert: {
          address_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
        }
        Update: {
          address_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_addresses_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_addresses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address_id: string | null
          age: number | null
          assigned_to: string | null
          bank_id: string | null
          co_applicant_name: string | null
          created_at: string
          has_co_applicant: boolean | null
          id: string
          instructions: string | null
          job: string | null
          name: string
          status: string
          updated_at: string
          verification_date: string | null
          visit_type: string | null
        }
        Insert: {
          address_id?: string | null
          age?: number | null
          assigned_to?: string | null
          bank_id?: string | null
          co_applicant_name?: string | null
          created_at?: string
          has_co_applicant?: boolean | null
          id: string
          instructions?: string | null
          job?: string | null
          name: string
          status: string
          updated_at?: string
          verification_date?: string | null
          visit_type?: string | null
        }
        Update: {
          address_id?: string | null
          age?: number | null
          assigned_to?: string | null
          bank_id?: string | null
          co_applicant_name?: string | null
          created_at?: string
          has_co_applicant?: boolean | null
          id?: string
          instructions?: string | null
          job?: string | null
          name?: string
          status?: string
          updated_at?: string
          verification_date?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          lead_id: string | null
          number: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          lead_id?: string | null
          number: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          lead_id?: string | null
          number?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          base_location: string | null
          city: string | null
          completion_rate: number | null
          created_at: string
          district: string | null
          email: string
          extra_charge_per_km: number | null
          id: string
          max_travel_distance: number | null
          name: string
          password: string
          phone: string | null
          profile_picture: string | null
          role: string
          state: string | null
          status: string | null
          total_verifications: number | null
        }
        Insert: {
          base_location?: string | null
          city?: string | null
          completion_rate?: number | null
          created_at?: string
          district?: string | null
          email: string
          extra_charge_per_km?: number | null
          id: string
          max_travel_distance?: number | null
          name: string
          password: string
          phone?: string | null
          profile_picture?: string | null
          role: string
          state?: string | null
          status?: string | null
          total_verifications?: number | null
        }
        Update: {
          base_location?: string | null
          city?: string | null
          completion_rate?: number | null
          created_at?: string
          district?: string | null
          email?: string
          extra_charge_per_km?: number | null
          id?: string
          max_travel_distance?: number | null
          name?: string
          password?: string
          phone?: string | null
          profile_picture?: string | null
          role?: string
          state?: string | null
          status?: string | null
          total_verifications?: number | null
        }
        Relationships: []
      }
      vehicle_details: {
        Row: {
          created_at: string
          down_payment: string | null
          id: string
          lead_id: string | null
          vehicle_brand_id: string | null
          vehicle_brand_name: string | null
          vehicle_model_id: string | null
          vehicle_model_name: string | null
          vehicle_price: string | null
          vehicle_type: string | null
          vehicle_year: number | null
        }
        Insert: {
          created_at?: string
          down_payment?: string | null
          id?: string
          lead_id?: string | null
          vehicle_brand_id?: string | null
          vehicle_brand_name?: string | null
          vehicle_model_id?: string | null
          vehicle_model_name?: string | null
          vehicle_price?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Update: {
          created_at?: string
          down_payment?: string | null
          id?: string
          lead_id?: string | null
          vehicle_brand_id?: string | null
          vehicle_brand_name?: string | null
          vehicle_model_id?: string | null
          vehicle_model_name?: string | null
          vehicle_price?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_details_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          admin_remarks: string | null
          agent_id: string | null
          arrival_time: string | null
          completion_time: string | null
          created_at: string
          end_time: string | null
          id: string
          lead_id: string | null
          location_address: string | null
          location_latitude: number | null
          location_longitude: number | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          admin_remarks?: string | null
          agent_id?: string | null
          arrival_time?: string | null
          completion_time?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          lead_id?: string | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          admin_remarks?: string | null
          agent_id?: string | null
          arrival_time?: string | null
          completion_time?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          lead_id?: string | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      address_type: "Residence" | "Office" | "Permanent"
      document_type: "ID Proof" | "Address Proof" | "Income Proof" | "Other"
      lead_status: "Pending" | "In Progress" | "Completed" | "Rejected"
      ownership_status: "owned" | "rented" | "family_owned"
      property_type: "apartment" | "house" | "villa" | "commercial"
      uploaded_by: "agent" | "bank"
      user_role: "admin" | "agent"
      user_status: "Active" | "Inactive"
      verification_status:
        | "Not Started"
        | "In Progress"
        | "Completed"
        | "Rejected"
      visit_type: "Office" | "Residence" | "Both"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      address_type: ["Residence", "Office", "Permanent"],
      document_type: ["ID Proof", "Address Proof", "Income Proof", "Other"],
      lead_status: ["Pending", "In Progress", "Completed", "Rejected"],
      ownership_status: ["owned", "rented", "family_owned"],
      property_type: ["apartment", "house", "villa", "commercial"],
      uploaded_by: ["agent", "bank"],
      user_role: ["admin", "agent"],
      user_status: ["Active", "Inactive"],
      verification_status: [
        "Not Started",
        "In Progress",
        "Completed",
        "Rejected",
      ],
      visit_type: ["Office", "Residence", "Both"],
    },
  },
} as const
