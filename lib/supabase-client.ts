import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "admin" | "cashier" | "manager"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: "admin" | "cashier" | "manager"
        }
        Update: {
          full_name?: string
          role?: "admin" | "cashier" | "manager"
        }
      }
      products: {
        Row: {
          id: string
          name: string
          barcode: string | null
          price: number
          stock_quantity: number
          min_stock_level: number
          category_id: string | null
          gst_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          barcode?: string
          price: number
          stock_quantity?: number
          min_stock_level?: number
          category_id?: string
          gst_rate?: number
        }
        Update: {
          name?: string
          barcode?: string
          price?: number
          stock_quantity?: number
          min_stock_level?: number
          category_id?: string
          gst_rate?: number
        }
      }
      transactions: {
        Row: {
          id: string
          invoice_number: string
          cashier_id: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          subtotal: number
          gst_amount: number
          total_amount: number
          payment_method: "cash" | "card" | "upi"
          cash_received: number | null
          change_amount: number | null
          status: "completed" | "cancelled" | "pending"
          created_at: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          address: string | null
          date_of_birth: string | null
          loyalty_points: number
          total_spent: number
          visit_count: number
          last_visit: string | null
          created_at: string
          updated_at: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
      }
    }
  }
}
