
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  preferred_notification_channel text NOT NULL DEFAULT 'none',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  received_at timestamptz NOT NULL DEFAULT now(),
  due_date date NOT NULL,
  status text NOT NULL,
  payment_status text NOT NULL,
  payment_method text NOT NULL,
  total_price integer NOT NULL DEFAULT 0,
  amount_paid integer NOT NULL DEFAULT 0,
  rack_location text,
  internal_notes text,
  customer_note text,
  ready_notification_sent_at timestamptz,
  picked_up_at timestamptz
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL DEFAULT 0,
  upcharge_amount integer,
  note text,
  stain_notes text,
  damage_notes text,
  special_instructions text,
  item_status text NOT NULL DEFAULT 'Na cekanju'
);

CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read customers" ON public.customers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert customers" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update customers" ON public.customers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete customers" ON public.customers
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can read orders" ON public.orders
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can read order_items" ON public.order_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert order_items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update order_items" ON public.order_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete order_items" ON public.order_items
  FOR DELETE TO authenticated USING (true);
