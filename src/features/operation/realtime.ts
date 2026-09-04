import { supabase } from '@/integrations/supabase/client'

export function subscribeToOperation(professionalId: string, onChange: () => void) {
  const channel = supabase
    .channel(`operation:${professionalId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'operational_status', filter: `professional_id=eq.${professionalId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tickets', filter: `professional_id=eq.${professionalId}` }, onChange)
    .subscribe()

  return () => { void supabase.removeChannel(channel) }
}
