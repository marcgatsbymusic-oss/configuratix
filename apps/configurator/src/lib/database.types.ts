// Auto-typed Supabase database schema for Mammut

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'partner'
          full_name: string | null
          company_name: string | null
          company_tax_id: string | null
          phone: string | null
          address: string | null
          country: string
          partner_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'customer' | 'partner'
          full_name?: string | null
          company_name?: string | null
          company_tax_id?: string | null
          phone?: string | null
          address?: string | null
          country?: string
          partner_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'customer' | 'partner'
          full_name?: string | null
          company_name?: string | null
          company_tax_id?: string | null
          phone?: string | null
          address?: string | null
          country?: string
          partner_verified?: boolean
          updated_at?: string
        }
      }
      configurator_saves: {
        Row: {
          id: string
          user_id: string
          name: string
          product_line: string
          product_type: string
          material: string
          configuration: Json
          screenshot_url: string | null
          is_quote_requested: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          product_line: string
          product_type: string
          material: string
          configuration: Json
          screenshot_url?: string | null
          is_quote_requested?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          product_line?: string
          product_type?: string
          material?: string
          configuration?: Json
          screenshot_url?: string | null
          is_quote_requested?: boolean
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'customer' | 'partner'
    }
  }
}
