CREATE TABLE public.price_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  base_price INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.price_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read price_list" ON public.price_list FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert price_list" ON public.price_list FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update price_list" ON public.price_list FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete price_list" ON public.price_list FOR DELETE TO authenticated USING (true);