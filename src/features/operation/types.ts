export const OPERATIONAL_STATUSES = ['available', 'serving', 'paused', 'closed'] as const
export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number]

export const TICKET_STATUSES = ['waiting', 'called', 'serving', 'completed', 'cancelled'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export type QueueKind = 'physical' | 'virtual'
export type OperationRole = 'customer' | 'staff' | 'manager' | 'owner'

export interface OperationalSnapshot {
  professionalId: string
  status: OperationalStatus
  currentTicketId: string | null
  updatedAt: string
}

export interface QueueTicket {
  id: string
  queueId: string
  customerId: string
  serviceId: string | null
  kind: QueueKind
  position: number
  status: TicketStatus
  estimatedStartAt: string | null
  createdAt: string
}

export type OperationCommand =
  | { type: 'set_status'; status: OperationalStatus }
  | { type: 'join_queue'; queueId: string; serviceId?: string; kind: QueueKind }
  | { type: 'call_ticket'; ticketId: string }
  | { type: 'start_ticket'; ticketId: string }
  | { type: 'complete_ticket'; ticketId: string; durationMinutes?: number }
  | { type: 'cancel_ticket'; ticketId: string }

export const STATUS_LABELS: Record<OperationalStatus, string> = {
  available: 'Disponível',
  serving: 'Atendendo',
  paused: 'Pausado',
  closed: 'Encerrado',
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  waiting: 'Aguardando',
  called: 'Chamado',
  serving: 'Em atendimento',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}

export function canTransitionStatus(from: OperationalStatus, to: OperationalStatus): boolean {
  if (from === to) return true
  if (from === 'closed') return to === 'available'
  return true
}

export function canTransitionTicket(from: TicketStatus, to: TicketStatus): boolean {
  const transitions: Record<TicketStatus, TicketStatus[]> = {
    waiting: ['called', 'cancelled'],
    called: ['serving', 'cancelled'],
    serving: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  }
  return from === to || transitions[from].includes(to)
}

export function positionForTickets(tickets: QueueTicket[], ticketId: string): number | null {
  const waiting = tickets.filter((ticket) => ticket.status === 'waiting').sort((a, b) => a.position - b.position)
  const index = waiting.findIndex((ticket) => ticket.id === ticketId)
  return index === -1 ? null : index + 1
}
