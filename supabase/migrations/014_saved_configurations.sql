-- Create saved_configurations table
CREATE TABLE public.saved_configurations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_state jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.saved_configurations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT Configurations (for beta)
CREATE POLICY "Allow public insert on saved_configurations"
ON public.saved_configurations FOR INSERT
TO public
WITH CHECK (true);

-- Allow anonymous users to SELECT Configurations (for hydration)
CREATE POLICY "Allow public select on saved_configurations"
ON public.saved_configurations FOR SELECT
TO public
USING (true);
