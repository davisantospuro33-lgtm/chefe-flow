import { describe, expect, it } from 'vitest'
import { canTransitionStatus, canTransitionTicket, positionForTickets, type QueueTicket } from './types'

describe('Operational Engine invariants', () => {
  it('permite reabrir uma operação encerrada', () => expect(canTransitionStatus('closed', 'available')).toBe(true))
  it('não permite ressuscitar ticket finalizado', () => expect(canTransitionTicket('completed', 'waiting')).toBe(false))
  it('deriva posição apenas de tickets aguardando', () => {
    const tickets = [
      { id: 'a', queueId: 'q', customerId: 'c', serviceId: null, kind: 'virtual', position: 3, status: 'waiting', estimatedStartAt: null, createdAt: '' },
      { id: 'b', queueId: 'q', customerId: 'c', serviceId: null, kind: 'physical', position: 1, status: 'serving', estimatedStartAt: null, createdAt: '' },
      { id: 'c', queueId: 'q', customerId: 'c', serviceId: null, kind: 'virtual', position: 2, status: 'waiting', estimatedStartAt: null, createdAt: '' },
    ] satisfies QueueTicket[]
    expect(positionForTickets(tickets, 'a')).toBe(2)
  })
})
