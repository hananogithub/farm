export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'owner' | 'staff' | 'accountant'
          farm_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'owner' | 'staff' | 'accountant'
          farm_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'owner' | 'staff' | 'accountant'
          farm_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      herds: {
        Row: {
          id: string
          farm_id: string
          name: string
          animal_type: 'dairy' | 'beef' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          name: string
          animal_type: 'dairy' | 'beef' | 'other'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          name?: string
          animal_type?: 'dairy' | 'beef' | 'other'
          created_at?: string
          updated_at?: string
        }
      }
      animals: {
        Row: {
          id: string
          herd_id: string
          identification_number: string | null
          birth_date: string | null
          purchase_date: string | null
          sale_date: string | null
          status: 'active' | 'sold' | 'deceased' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          herd_id: string
          identification_number?: string | null
          birth_date?: string | null
          purchase_date?: string | null
          sale_date?: string | null
          status?: 'active' | 'sold' | 'deceased' | 'other'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          herd_id?: string
          identification_number?: string | null
          birth_date?: string | null
          purchase_date?: string | null
          sale_date?: string | null
          status?: 'active' | 'sold' | 'deceased' | 'other'
          created_at?: string
          updated_at?: string
        }
      }
      revenue: {
        Row: {
          id: string
          farm_id: string
          revenue_type: 'milk' | 'carcass' | 'calf' | 'other' | 'subsidy'
          amount: number
          transaction_date: string
          customer_name: string | null
          herd_id: string | null
          animal_id: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          revenue_type: 'milk' | 'carcass' | 'calf' | 'other' | 'subsidy'
          amount: number
          transaction_date: string
          customer_name?: string | null
          herd_id?: string | null
          animal_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          revenue_type?: 'milk' | 'carcass' | 'calf' | 'other' | 'subsidy'
          amount?: number
          transaction_date?: string
          customer_name?: string | null
          herd_id?: string | null
          animal_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          farm_id: string
          category: 'feed_roughage' | 'feed_concentrate' | 'veterinary' | 'labor' | 'fuel' | 'utilities' | 'repairs' | 'machinery' | 'livestock_purchase' | 'losses' | 'other'
          amount: number
          transaction_date: string
          vendor_name: string | null
          herd_id: string | null
          animal_id: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          category: 'feed_roughage' | 'feed_concentrate' | 'veterinary' | 'labor' | 'fuel' | 'utilities' | 'repairs' | 'machinery' | 'livestock_purchase' | 'losses' | 'other'
          amount: number
          transaction_date: string
          vendor_name?: string | null
          herd_id?: string | null
          animal_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          category?: 'feed_roughage' | 'feed_concentrate' | 'veterinary' | 'labor' | 'fuel' | 'utilities' | 'repairs' | 'machinery' | 'livestock_purchase' | 'losses' | 'other'
          amount?: number
          transaction_date?: string
          vendor_name?: string | null
          herd_id?: string | null
          animal_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subsidies: {
        Row: {
          id: string
          farm_id: string
          name: string
          expected_amount: number
          actual_amount: number | null
          application_deadline: string | null
          payment_date: string | null
          status: 'applied' | 'approved' | 'paid' | 'rejected'
          document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          name: string
          expected_amount: number
          actual_amount?: number | null
          application_deadline?: string | null
          payment_date?: string | null
          status?: 'applied' | 'approved' | 'paid' | 'rejected'
          document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          name?: string
          expected_amount?: number
          actual_amount?: number | null
          application_deadline?: string | null
          payment_date?: string | null
          status?: 'applied' | 'approved' | 'paid' | 'rejected'
          document_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      monthly_profit: {
        Row: {
          farm_id: string
          year: number
          month: number
          total_revenue: number
          total_expenses: number
          profit: number
        }
      }
      profit_per_animal: {
        Row: {
          farm_id: string
          herd_id: string
          year: number
          month: number
          animal_count: number
          total_profit: number
          profit_per_animal: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'owner' | 'staff' | 'accountant'
      animal_type: 'dairy' | 'beef' | 'other'
      animal_status: 'active' | 'sold' | 'deceased' | 'other'
      revenue_type: 'milk' | 'carcass' | 'calf' | 'other' | 'subsidy'
      expense_category: 'feed_roughage' | 'feed_concentrate' | 'veterinary' | 'labor' | 'fuel' | 'utilities' | 'repairs' | 'machinery' | 'livestock_purchase' | 'losses' | 'other'
      subsidy_status: 'applied' | 'approved' | 'paid' | 'rejected'
    }
  }
}


