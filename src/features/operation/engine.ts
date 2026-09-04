import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import type { OperationCommand, OperationalSnapshot, QueueTicket } from './types'

const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('set_status'), status: z.enum(['available', 'serving', 'paused', 'closed']) }),
  z.object({ type: z.literal('join_queue'), queueId: z.string().uuid(), serviceId: z.string().uuid().optional(), kind: z.enum(['physical', 'virtual']) }),
  z.object({ type: z.literal('call_ticket'), ticketId: z.string().uuid() }),
  z.object({ type: z.literal('start_ticket'), ticketId: z.string().uuid() }),
  z.object({ type: z.literal('complete_ticket'), ticketId: z.string().uuid(), durationMinutes: z.number().int().min(1).max(1440).optional() }),
  z.object({ type: z.literal('cancel_ticket'), ticketId: z.string().uuid() }),
])

export async function executeOperation(command: OperationCommand) {
  const parsed = commandSchema.safeParse(command)
  if (!parsed.success) throw new Error('Comando operacional inválido')
  const { data, error } = await supabase.rpc('execute_operation_command', { command: parsed.data })
  if (error) throw error
  return data
}

export function deriveQueuePosition(tickets: QueueTicket[], ticketId: string) {
  return tickets
    .filter((ticket) => ticket.status === 'waiting')
    .sort((a, b) => a.position - b.position)
    .findIndex((ticket) => ticket.id === ticketId) + 1 || null
}

export type { OperationalSnapshot, QueueTicket }
