import React, { useEffect, useRef, useState } from 'react'
import { Send, X, Bot, User, Check } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { supabase } from '@/integrations/supabase/client'
import { useChefeStore } from '@/lib/chefe-store'
import { atendentePublicaChat } from '@/lib/atendente-publica.functions'

type Tab = 'chefe' | 'ceochefe'
type Msg = { id: string; from: 'me' | 'them'; text: string; time: string }

const hora = () =>
  new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

interface CEOChefeChatProps {
  isOpen: boolean
  onClose: () => void
}

export const CEOChefeChat: React.FC<CEOChefeChatProps> = ({ isOpen, onClose }) => {
  const profile = useChefeStore((s) => s.profile)
  const status = useChefeStore((s) => s.status)
  const distanceKm = useChefeStore((s) => s.distanceKm)
  const chatAI = useServerFn(atendentePublicaChat)

  const [tab, setTab] = useState<Tab>('chefe')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chefeMsgs, setChefeMsgs] = useState<Msg[]>([])
  const [aiMsgs, setAiMsgs] = useState<Msg[]>([
    {
      id: 'greet',
      from: 'them',
      text:
        profile?.aiGreeting ||
        'Salve! Aqui é o CEOCHEFE 🤝 Consulto o salão em tempo real: fila, encaixe, horários e tempo de espera. O que você precisa?',
      time: hora(),
    },
  ])

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Canal em tempo real com o Painel de Controle
  useEffect(() => {
    if (!isOpen) return
    const ch = supabase.channel('painel_operacao')
    ch.on('broadcast', { event: 'dm-chefe' }, (msg) => {
      const text = (msg.payload as { text?: string })?.text
      if (!text) return
      setChefeMsgs((prev) => [
        ...prev,
        { id: crypto.randomUUID(), from: 'them', text, time: hora() },
      ])
    })
    ch.subscribe()
    channelRef.current = ch
    return () => {
      supabase.removeChannel(ch)
      channelRef.current = null
    }
  }, [isOpen])

  const messages = tab === 'chefe' ? chefeMsgs : aiMsgs

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, tab])

  if (!isOpen) return null

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text || sending) return
    if (!preset) setInput('')

    const mine: Msg = { id: crypto.randomUUID(), from: 'me', text, time: hora() }

    if (tab === 'chefe') {
      setChefeMsgs((prev) => [...prev, mine])
      await channelRef.current?.send({
        type: 'broadcast',
        event: 'dm-cliente',
        payload: { text, at: Date.now() },
      })
      return
    }

    const history = [...aiMsgs, mine]
    setAiMsgs(history)
    setSending(true)
    try {
      const res = (await chatAI({
        data: {
          messages: history.map((m) => ({
            role: m.from === 'me' ? ('user' as const) : ('assistant' as const),
            content: m.text,
          })),
          distanceKm,
          durationMin: profile?.serviceDurationMin ?? null,
        },
      })) as { text?: string } | string
      const reply = typeof res === 'string' ? res : (res?.text ?? 'Não consegui responder agora.')
      setAiMsgs((prev) => [
        ...prev,
        { id: crypto.randomUUID(), from: 'them', text: reply, time: hora() },
      ])
    } catch {
      setAiMsgs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: 'them',
          text: 'Falha ao consultar o painel agora. Tenta de novo em instantes.',
          time: hora(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const sugestoes =
    tab === 'ceochefe'
      ? ['Como está o salão agora?', 'Quero entrar no encaixe', 'Ver horários disponíveis']
      : ['Salve CHEFE, tem vaga agora?', 'Quanto tempo de espera?', 'Quero marcar um horário']

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
      <div className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:h-[620px] sm:max-w-md sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="h-10 w-10 rounded-full border border-primary/40 object-cover"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  {tab === 'chefe' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                {tab === 'chefe' ? profile?.username || 'CHEFE' : 'CEOCHEFE'}
                <Check className="h-3 w-3 text-primary" />
              </p>
              <p className="text-[11px] font-medium text-emerald-500">
                {tab === 'chefe'
                  ? `Online • ${status}`
                  : 'Copiloto IA • Sincronizado ao Painel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar chat"
            className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs de contexto */}
        <div className="flex gap-1 border-b border-border bg-background/60 p-1.5">
          {(['chefe', 'ceochefe'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold uppercase tracking-wide transition-all ${
                tab === t
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'chefe' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              {t === 'chefe' ? 'CHEFE' : 'CEOCHEFE'}
            </button>
          ))}
        </div>

        {/* Sugestões rápidas */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border bg-muted/20 px-3 py-2">
          {sugestoes.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mensagens */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
          {messages.length === 0 && (
            <p className="mt-8 text-center text-[11px] text-muted-foreground">
              Manda sua mensagem — o CHEFE responde direto pelo painel.
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.from === 'me'
                    ? 'rounded-br-none bg-primary text-primary-foreground'
                    : 'rounded-bl-none border border-border bg-card text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span className="mt-1 block text-right text-[9px] opacity-60">{m.time}</span>
              </div>
            </div>
          ))}
          {sending && tab === 'ceochefe' && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-none border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                digitando…
              </div>
            </div>
          )}
        </div>

        {/* Input contextual */}
        <div className="flex items-center gap-2 border-t border-border bg-card p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={
              tab === 'chefe'
                ? `Mensagem direta para ${profile?.username || 'o CHEFE'}...`
                : 'Pergunte ao CEOCHEFE (fila, horários, encaixe)...'
            }
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground outline-none transition-colors focus:border-primary"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending}
            aria-label="Enviar"
            className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground transition-all active:scale-95 disabled:opacity-40"
          >
            <Send className="-ml-0.5 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
