import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Calendar, Home, UserRoundCog, MapPin } from 'lucide-react'
import { GradientAvatar } from '@/components/chefe/GradientAvatar'
import { StatusAvatar } from '@/components/chefe/StatusAvatar'
import { StoriesViewer } from '@/components/chefe/StoriesViewer'
import { ServiceCard } from '@/components/chefe/ServiceCard'
import { ProgressTracker } from '@/components/chefe/ProgressTracker'
import { AIAlertBox } from '@/components/chefe/AIAlertBox'
import { SalonMap } from '@/components/chefe/SalonMap'
import { SalonInfo } from '@/components/chefe/SalonInfo'
import { QueueList } from '@/components/chefe/QueueList'
import { LeaveNotifier } from '@/components/chefe/LeaveNotifier'
import { InstallBanner } from '@/components/chefe/InstallBanner'
import { ChefeHeader } from '@/components/chefe/ChefeHeader'
import { CEOChefeChat } from '@/components/chefe/CEOChefeChat'
import { Reviews } from '@/components/chefe/Reviews'
import { useChefeStore } from '@/lib/chefe-store'
import { PostsReelsCarousel } from '@/components/chefe/PostsReelsCarousel'
import { TelaPerfilFeed } from '@/components/chefe/TelaPerfilFeed';
export const Route = createFileRoute('/')({
  component: Index,
  head: () => ({
    meta: [
      { title: 'CHEFE · Barbearia inteligente em tempo real' },
      { name: 'description', content: 'Acompanhe a fila, status e agenda do CHEFE ao vivo. Corte CHEFE por R$ 25 em 40 min.' },
      { property: 'og:title', content: 'CHEFE · Barbearia inteligente em tempo real' },
      { property: 'og:description', content: 'Fila ao vivo, status do barbeiro e agendamento inteligente.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
})

function Index() {
  const stories = useChefeStore((s) => s.stories)
  const profile = useChefeStore((s) => s.profile)
  const [storiesOpen, setStoriesOpen] = useState(false)
  const [tab, setTab] = useState<'home' | 'copiloto' | 'mapa'>('home')
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-md bg-background pb-28 text-foreground overflow-hidden">
      <InstallBanner />

      {/* 🏠 TELA 1 — PERFIL & FEED */}
      {tab === 'home' && <TelaPerfilFeed mediaSlot={<PostsReelsCarousel />} />}

      {/* 👨‍✈️ TELA 2 — CO-PILOTO (STATUS, FILA, AGENDA, MAPA) */}
      {tab === 'copiloto' && (
        <>
      <ChefeHeader onOpenChat={() => setChatOpen(true)} />
      <div className="relative z-10 mt-4 px-4">
        <StatusAvatar status="disponivel" />
      </div>
      
      <div className="relative z-10 mt-4 px-4">
        <ServiceCard />
      </div>

      <div className="relative z-10 mt-4 px-4 grid grid-cols-3 gap-2">
        <SalonInfo />
        <QueueList compact />
        <button
          onClick={() => alert('Selecione o dia e horário desejado no atendimento com a IA!')}
          className="flex flex-col justify-between rounded-3xl glass-strong p-3 text-left transition-transform active:scale-95 border border-white/10"
        >
          <div>
            <div className="flex items-center gap-1">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <Calendar className="h-3 w-3 text-white" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground leading-tight">
                📅 Agenda
              </p>
            </div>
            <p className="mt-1 text-[10px] font-bold text-white leading-tight">Marcar Horário</p>
          </div>
          <span className="mt-2 w-full text-center rounded-xl bg-white/10 py-1 text-[9px] font-bold text-neon">
            Garantir ➔
          </span>
        </button>
      </div>

      <div className="relative z-10 mt-6 px-4">
        <Reviews />
      </div>

      <footer className="relative z-10 mt-10 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Powered by <span className="font-black text-foreground">CHEFE AI</span>
      </footer>
        </>
      )}

      {/* 📍 TELA 3 — MAPA & RASTREAMENTO */}
      {tab === 'mapa' && (
        <>
          <ChefeHeader onOpenChat={() => setChatOpen(true)} />

          <div className="relative z-10 mt-4 px-4">
            <AIAlertBox />
          </div>

          <LeaveNotifier />

          <div className="relative z-10 mt-3 px-4">
            <ProgressTracker />
          </div>

          <div className="relative z-10 mt-4 px-4">
            <SalonMap />
          </div>
        </>
      )}

      {/* BARRA DE NAVEGAÇÃO ESTILO INSTAGRAM */}
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="grid grid-cols-3">
          <button
            onClick={() => setTab('home')}
            aria-label="Perfil e Feed"
            aria-current={tab === 'home'}
            className={`flex items-center justify-center py-4 transition-opacity ${tab === 'home' ? 'text-foreground' : 'text-muted-foreground opacity-60'}`}
          >
            <Home size={24} strokeWidth={tab === 'home' ? 2.6 : 2} />
          </button>
          <button
            onClick={() => setTab('copiloto')}
            aria-label="Co-piloto, status e fila"
            aria-current={tab === 'copiloto'}
            className={`flex items-center justify-center py-4 transition-opacity ${tab === 'copiloto' ? 'text-foreground' : 'text-muted-foreground opacity-60'}`}
          >
            <UserRoundCog size={24} strokeWidth={tab === 'copiloto' ? 2.6 : 2} />
          </button>
          <button
            onClick={() => setTab('mapa')}
            aria-label="Mapa e trajeto ao vivo"
            aria-current={tab === 'mapa'}
            className={`flex items-center justify-center py-4 transition-opacity ${tab === 'mapa' ? 'text-foreground' : 'text-muted-foreground opacity-60'}`}
          >
            <MapPin size={24} strokeWidth={tab === 'mapa' ? 2.6 : 2} />
          </button>
        </div>
      </nav>

      <StoriesViewer
        stories={stories}
        open={storiesOpen}
        onClose={() => setStoriesOpen(false)}
      />

      <CEOChefeChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </main>
  )
}
