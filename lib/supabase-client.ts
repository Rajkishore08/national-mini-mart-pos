import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          stock_quantity: number
          min_stock_level: number
          gst_rate: number
          price_includes_gst: boolean
          hsn_code: string
          brand: string
          barcode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          stock_quantity: number
          min_stock_level?: number
          gst_rate?: number
          price_includes_gst?: boolean
          hsn_code?: string
          brand?: string
          barcode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          stock_quantity?: number
          min_stock_level?: number
          gst_rate?: number
          price_includes_gst?: boolean
          hsn_code?: string
          brand?: string
          barcode?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          invoice_number: string
          cashier_id: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          subtotal: number
          gst_amount: number
          total_amount: number
          rounding_adjustment: number
          loyalty_points_earned: number
          loyalty_points_redeemed: number
          loyalty_discount_amount: number
          payment_method: string
          cash_received: number | null
          change_amount: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          cashier_id: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          subtotal: number
          gst_amount: number
          total_amount: number
          rounding_adjustment?: number
          loyalty_points_earned?: number
          loyalty_points_redeemed?: number
          loyalty_discount_amount?: number
          payment_method: string
          cash_received?: number | null
          change_amount?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          cashier_id?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          subtotal?: number
          gst_amount?: number
          total_amount?: number
          rounding_adjustment?: number
          loyalty_points_earned?: number
          loyalty_points_redeemed?: number
          loyalty_discount_amount?: number
          payment_method?: string
          cash_received?: number | null
          change_amount?: number | null
          status?: string
          created_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          gst_rate: number
          price_includes_gst: boolean
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          gst_rate?: number
          price_includes_gst?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          gst_rate?: number
          price_includes_gst?: boolean
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          movement_type: string
          quantity: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          movement_type: string
          quantity: number
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          movement_type?: string
          quantity?: number
          reason?: string
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          loyalty_points: number
          total_spent: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          loyalty_points?: number
          total_spent?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          loyalty_points?: number
          total_spent?: number
          created_at?: string
        }
      }
      loyalty_transactions: {
        Row: {
          id: string
          customer_id: string
          transaction_id: string
          points_earned: number
          points_redeemed: number
          discount_amount: number
          transaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          transaction_id: string
          points_earned?: number
          points_redeemed?: number
          discount_amount?: number
          transaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          transaction_id?: string
          points_earned?: number
          points_redeemed?: number
          discount_amount?: number
          transaction_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
