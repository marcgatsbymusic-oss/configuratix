-- ============================================================
-- Admin Backend Schema
-- Migration: 018_admin_backend_schema.sql
-- Description: Creates the 4 Control Hubs (Sales, Orders, Logistics, Marketing)
-- ============================================================

-- 1. Roles Expansion
-- Add 'admin' and 'agent' to the user_role enum if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agent' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role ADD VALUE 'agent';
  END IF;
END $$;

-- 2. Sales Channels Hub
CREATE TABLE IF NOT EXISTS public.admin_sales_channels (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL, -- e.g., 'Direct Sales', 'Partner Network', 'External Agents'
  channel_type        TEXT NOT NULL CHECK (channel_type IN ('direct', 'partner', 'agent')),
  base_commission_pct NUMERIC(5, 2) DEFAULT 0.00,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders & Financials Hub
CREATE TABLE IF NOT EXISTS public.admin_orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        TEXT UNIQUE NOT NULL,
  quotation_id        UUID REFERENCES public.quotations(id) ON DELETE RESTRICT,
  channel_id          UUID REFERENCES public.admin_sales_channels(id),
  assigned_agent_id   UUID REFERENCES auth.users(id),
  
  -- Pipeline Stages
  current_stage       TEXT NOT NULL DEFAULT 'Order Placed' 
                      CHECK (current_stage IN ('Order Placed', 'Manufacturing', 'Quality Control', 'Loading', 'Transit', 'Delivered')),
  payment_status      TEXT NOT NULL DEFAULT 'Pending' 
                      CHECK (payment_status IN ('Pending', 'Deposit Paid', 'Interim Paid', 'Final Paid')),
  
  -- Financial Health (Secret Sauce features)
  total_value         NUMERIC(10, 2) NOT NULL,
  base_cost           NUMERIC(10, 2) NOT NULL, -- Calculated from Cantor formulas
  margin_percentage   NUMERIC(5, 2) GENERATED ALWAYS AS (
                        CASE WHEN total_value > 0 THEN ((total_value - base_cost) / total_value) * 100 ELSE 0 END
                      ) STORED,
  margin_alert_flag   BOOLEAN GENERATED ALWAYS AS (
                        CASE WHEN ((total_value - base_cost) / total_value) * 100 < 15 THEN true ELSE false END
                      ) STORED,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate order numbers: ORD-100001
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 100001;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON public.admin_orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.admin_orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();


-- 4. Logistics & Fulfillment Hub
CREATE TABLE IF NOT EXISTS public.admin_logistics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID REFERENCES public.admin_orders(id) ON DELETE CASCADE,
  truck_size          TEXT, -- e.g., '3.5t', '7.5t'
  estimated_weight_kg NUMERIC(10, 2),
  live_gps_url        TEXT, -- Integration for Map Tracking
  delivery_address    TEXT NOT NULL,
  delivery_date       TIMESTAMPTZ,
  logistics_status    TEXT DEFAULT 'Warehouse' CHECK (logistics_status IN ('Warehouse', 'Loading', 'In Transit', 'Site Delivery')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);


-- 5. Installation Hub
CREATE TABLE IF NOT EXISTS public.admin_installations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID REFERENCES public.admin_orders(id) ON DELETE CASCADE,
  team_name           TEXT NOT NULL,
  scheduled_date      TIMESTAMPTZ,
  site_readiness      BOOLEAN DEFAULT false,
  signoff_signature   TEXT, -- Base64 or URL
  completion_photo    TEXT, -- URL
  status              TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Issue Reported')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);


-- 6. Marketing Analytics Hub
CREATE TABLE IF NOT EXISTS public.admin_marketing_campaigns (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform            TEXT NOT NULL, -- e.g., 'Google Ads', 'Meta'
  campaign_name       TEXT NOT NULL,
  ad_spend            NUMERIC(10, 2) DEFAULT 0.00,
  leads_generated     INTEGER DEFAULT 0,
  start_date          TIMESTAMPTZ,
  end_date            TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Join table to attribute specific orders to a marketing campaign for exact ROI
CREATE TABLE IF NOT EXISTS public.admin_marketing_attribution (
  order_id            UUID REFERENCES public.admin_orders(id) ON DELETE CASCADE,
  campaign_id         UUID REFERENCES public.admin_marketing_campaigns(id) ON DELETE CASCADE,
  PRIMARY KEY (order_id, campaign_id)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.admin_sales_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_marketing_attribution ENABLE ROW LEVEL SECURITY;

-- Admins can read/write everything
CREATE POLICY "Admins have full access to sales channels" ON public.admin_sales_channels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins have full access to orders" ON public.admin_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins have full access to logistics" ON public.admin_logistics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins have full access to installations" ON public.admin_installations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins have full access to marketing" ON public.admin_marketing_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Agents/Partners can only view their own assigned orders and related fulfillment data
CREATE POLICY "Agents can view assigned orders" ON public.admin_orders FOR SELECT USING (
  assigned_agent_id = auth.uid()
);
CREATE POLICY "Agents can view assigned logistics" ON public.admin_logistics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_orders WHERE admin_orders.id = admin_logistics.order_id AND admin_orders.assigned_agent_id = auth.uid())
);
CREATE POLICY "Agents can view assigned installations" ON public.admin_installations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_orders WHERE admin_orders.id = admin_installations.order_id AND admin_orders.assigned_agent_id = auth.uid())
);

-- Triggers for updated_at
CREATE TRIGGER trg_sales_channels_updated_at BEFORE UPDATE ON public.admin_sales_channels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.admin_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_logistics_updated_at BEFORE UPDATE ON public.admin_logistics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_installations_updated_at BEFORE UPDATE ON public.admin_installations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
