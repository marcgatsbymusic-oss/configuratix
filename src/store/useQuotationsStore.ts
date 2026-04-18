import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { CartItem } from './useCartStore';

export type QuotationStatus = 'draft' | 'pending' | 'approved' | 'factory' | 'exported';

export interface Quotation {
  id: string;
  quotation_number: string;
  status: QuotationStatus;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company_name?: string;
  delivery_address?: string;
  country?: string;
  notes?: string;
  items: CartItem[];
  total_price: number;
  currency: string;
  approved_by?: string;
  approved_at?: string;
  valid_until?: string;
  requested_date: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationSubmitPayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company_name?: string;
  delivery_address?: string;
  country?: string;
  notes?: string;
  items: CartItem[];
  total_price: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface QuotationsStore {
  quotations: Quotation[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchQuotations: () => Promise<void>;
  submitQuotation: (payload: QuotationSubmitPayload) => Promise<{ success: boolean; quotationNumber?: string; error?: string }>;
  updateStatus: (id: string, status: QuotationStatus, approvedBy?: string) => Promise<void>;
  addNote: (id: string, notes: string) => Promise<void>;
}

export const useQuotationsStore = create<QuotationsStore>()((set) => ({
  quotations: [],
  loading: false,
  submitting: false,
  error: null,

  fetchQuotations: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await (supabase as any)
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ quotations: (data as Quotation[]) || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  submitQuotation: async (payload) => {
    set({ submitting: true, error: null });
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const { data, error } = await (supabase as any)
        .from('quotations')
        .insert({
          quotation_number: '', // will be set by DB trigger
          status: 'pending',
          customer_name: payload.customer_name,
          customer_email: payload.customer_email,
          customer_phone: payload.customer_phone || null,
          company_name: payload.company_name || null,
          delivery_address: payload.delivery_address || null,
          country: payload.country || null,
          notes: payload.notes || null,
          items: payload.items,
          total_price: payload.total_price,
          currency: 'EUR',
          valid_until: validUntil.toISOString(),
        })
        .select('quotation_number')
        .single();

      if (error) throw error;
      return { success: true, quotationNumber: data?.quotation_number };
    } catch (err: any) {
      set({ error: err.message });
      return { success: false, error: err.message };
    } finally {
      set({ submitting: false });
    }
  },

  updateStatus: async (id, status, approvedBy) => {
    const updates: Record<string, any> = { status };
    if (approvedBy) {
      updates.approved_by = approvedBy;
      updates.approved_at = new Date().toISOString();
    }

    const { error } = await (supabase as any)
      .from('quotations')
      .update(updates)
      .eq('id', id);

    if (!error) {
      set((state) => ({
        quotations: state.quotations.map((q) =>
          q.id === id ? { ...q, ...updates } : q
        ),
      }));
    }
  },

  addNote: async (id, notes) => {
    const { error } = await (supabase as any)
      .from('quotations')
      .update({ notes })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        quotations: state.quotations.map((q) =>
          q.id === id ? { ...q, notes } : q
        ),
      }));
    }
  },
}));
