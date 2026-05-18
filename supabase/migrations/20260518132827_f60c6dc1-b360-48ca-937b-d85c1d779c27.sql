CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read audit_log"
ON public.audit_log
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert audit_log"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update audit_log"
ON public.audit_log
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete audit_log"
ON public.audit_log
FOR DELETE
TO authenticated
USING (true);