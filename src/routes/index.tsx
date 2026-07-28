import { CEOChefeChat } from '@/components/chefe/CEOChefeChat'
import { PostsReelsCarousel } from '@/components/chefe/PostsReelsCarousel'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Calendar } from 'lucide-react'
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
import { Manifesto } from '@/components/chefe/Manifesto'
import { InstallBanner } from '@/components/chefe/InstallBanner'
import { ShareButton } from '@/components/chefe/ShareButton'
import { ThemeToggle } from '@/components/chefe/ThemeToggle'
import { CheeefAI } from '@/components/chefe/CheeefAI'
import { Reviews } from '@/components/chefe/Reviews'
import { useChefeStore } from '@/lib/chefe-store'
import { TelaPerfilFeed } from '@/components/chefe/TelaPerfilFeed'

export const Route = createFileRoute('/')({
  component: Index,
  head: () => ({
    meta: [
      { title: 'CHEFE - Barbearia Inteligente' },
      { name: 'description', content: 'Acompanhe seu corte em tempo real.' },
      { property: 'og:title', content: 'CHEFE - Barbearia Inteligente' },
      { property: 'og:description', content: 'Acompanhe seu corte em tempo real.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
})

function Index() {
  const stories = useChefeStore((s) => s.stories)
  const profile = useChefeStore((s) => s.profile)
  const [storiesOpen, setStoriesOpen] = useState(false)

  return (
    <main className="relative mx-auto min-h-screen max-w-md bg-background pb-20 text-foreground shadow-2xl">
      <InstallBanner />

      {/* TELA 1 COMPLETA E REESTRUTURADA */}
      <TelaPerfilFeed
        headerActions={
          <>
            <ThemeToggle />
            <ShareButton />
          </>
        }
      />

      {/* Avatar de status dinâmico */}
      <div className="relative z-10 -mt-4 px-4">
        <StatusAvatar status="disponivel" />
      </div>

      <div className="relative z-10 mt-4 px-4">
        <ServiceCard />
      </div>

      <div className="relative z-10 mt-4 px-4">
        <SalonInfo />
      </div>

      {/* CARROSSEL DE POSTS E REELS - VINCULADO AO PAINEL DO CHEFE */}
      <div className="relative z-10 mt-4 px-4">
        <PostsReelsCarousel />
      </div>

      <div className="relative z-10 mt-4 px-4">
        <QueueList compact />
      </div>

      <div className="relative z-10 mt-4 px-4">
        <button
          onClick={() => alert('Selecione o serviço primeiro')}
          className="flex flex-col justify-between rounded-2xl bg-card p-4 border border-border w-full text-left"
        >
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-3 w-3" />
            </div>
            <p className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
              Agenda
            </p>
          </div>
          <p className="mt-1 text-[10px] font-medium text-foreground">
            Marcar Horário
          </p>
          <span className="mt-2 w-full text-center text-xs font-bold bg-primary text-primary-foreground py-1.5 rounded-xl">
            Garantir →
          </span>
        </button>
      </div>

      <div className="relative z-10 mt-4 px-4">
        <AIAlertBox />
      </div>

      <div className="relative z-10 mt-3 px-4">
        <LeaveNotifier />
      </div>

      <div className="relative z-10 mt-3 px-4">
        <ProgressTracker />
      </div>

      <div className="relative z-10 mt-4 px-4">
        <SalonMap />
      </div>

      <div className="relative z-10 mt-6 px-4">
        <Manifesto />
      </div>

      <div className="relative z-10 mt-6 px-4">
        <Reviews />
      </div>

      {/* CHAT FLUTUANTE CEOCHEFE / PAINEL DE ATENDIMENTO */}
      <CEOChefeChat />

      <footer className="relative z-10 mt-10 pb-6 text-center text-xs text-muted-foreground">
        Powered by <span className="text-gradient font-bold">CHEFE AI</span>
      </footer>

      <StoriesViewer
        stories={stories}
        open={storiesOpen}
        onClose={() => setStoriesOpen(false)}
      />
    </main>
  )
}
