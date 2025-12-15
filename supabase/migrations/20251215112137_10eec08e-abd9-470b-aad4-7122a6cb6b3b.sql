-- Create admin_settings table for password storage
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read admin_settings (for password verification)
CREATE POLICY "Anyone can read admin settings" ON public.admin_settings FOR SELECT USING (true);

-- Only authenticated admins can update (we'll handle this via edge function with service role)
CREATE POLICY "No direct updates" ON public.admin_settings FOR UPDATE USING (false);

-- Insert default password (okami2024)
-- Using a simple hash for demo - in production use bcrypt via edge function
INSERT INTO public.admin_settings (password_hash) VALUES ('okami2024');

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  images TEXT[] NOT NULL DEFAULT '{}',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'outerwear', 'accessories')),
  description TEXT,
  drop_id UUID,
  is_new BOOLEAN DEFAULT false,
  has_fire_effect BOOLEAN DEFAULT false,
  sold_out_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products (visibility logic handled in app based on drop status)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- No direct inserts/updates/deletes - handled via edge functions
CREATE POLICY "No direct modifications" ON public.products FOR ALL USING (false);

-- Create drops table
CREATE TABLE public.drops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL,
  lookbook_images TEXT[] NOT NULL DEFAULT '{}',
  background_url TEXT,
  background_type TEXT DEFAULT 'image' CHECK (background_type IN ('image', 'gif', 'video')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  global_fire_effect BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on drops
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;

-- Anyone can view drops
CREATE POLICY "Anyone can view drops" ON public.drops FOR SELECT USING (true);

-- No direct modifications
CREATE POLICY "No direct modifications on drops" ON public.drops FOR ALL USING (false);

-- Add foreign key from products to drops
ALTER TABLE public.products ADD CONSTRAINT products_drop_id_fkey FOREIGN KEY (drop_id) REFERENCES public.drops(id) ON DELETE SET NULL;

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('home', 'desk')),
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can view orders (for admin panel access)
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);

-- Anyone can insert orders (customers placing orders)
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

-- No direct updates/deletes
CREATE POLICY "No direct updates on orders" ON public.orders FOR UPDATE USING (false);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drops_updated_at BEFORE UPDATE ON public.drops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage policies for media bucket
CREATE POLICY "Public read access for media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Public upload access for media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Public update access for media" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Public delete access for media" ON storage.objects FOR DELETE USING (bucket_id = 'media');