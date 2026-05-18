import { supabase } from '@/integrations/supabase/client';

export interface AuditEntry {
  id: string;
  orderId: string;
  timestamp: string;
  description: string;
}

export async function addAuditEntry(orderId: string, description: string): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    order_id: orderId,
    description,
  });
  if (error) throw error;
}

export async function getAuditEntries(orderId: string): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    orderId: r.order_id as string,
    timestamp: r.created_at as string,
    description: r.description as string,
  }));
}
