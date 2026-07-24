  import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutGrid, Calendar } from "lucide-react";
import { GradientAvatar } from "@/components/chefe/GradientAvatar";
import { StatusAvatar } from "@/components/chefe/StatusAvatar";
import { Highlights } from "@/components/chefe/Highlights";
import { EnergyCore } from "@/components/chefe/EnergyCore";
import { StoriesViewer } from "@/components/chefe/StoriesViewer";
import { ServiceCard } from "@/components/chefe/ServiceCard";
import { ProgressTracker } from "@/components/chefe/ProgressTracker";
import { AIAlertBox } from "@/components/chefe/AIAlertBox";
import { SalonMap } from "@/components/chefe/SalonMap";
import { SalonInfo } from "@/components/chefe/SalonInfo";
import { QueueList } from "@/components/chefe/QueueList";
import { LeaveNotifier } from "@/components/chefe/LeaveNotifier";
import { Manifesto } from "@/components/chefe/Manifesto";
import { Feed } from "@/components/chefe/Feed";
import { InstallBanner } from "@/components/chefe/InstallBanner";
import { ShareButton } from "@/components/chefe/ShareButton";
import { ChefeAI } from "@/components/chefe/ChefeAI";
import { Reviews } from "@/components/chefe/Reviews";
import { useChefeStore } from "@/lib/chefe-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const profile = useChefeStore((s) => s.profile);
  const stories = useChefeStore((s) => s.stories);
  const [storiesOpen, setStoriesOpen] = useState(false);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-24 pt-6">
      <InstallBanner />

      {/* Top bar */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-black tracking-tight">
            <span className="text-gradient-ig">CHEFE</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton />
        </div>
      </header>

      {/* Profile header */}
      <section className="flex flex-col items-center gap-3 text-center">
        <GradientAvatar
          size={128}
          src={profile.avatarUrl}
          hasStories={stories.length > 0}
          onClick={stories.length > 0 ? () => setStoriesOpen(true) : undefined}
        />
        <div>
          <h2 className="text-2xl font-black tracking-tight">{profile.username}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{profile.bio}</p>
        </div>
      </section>

      {/* Highlights (Stories + Destaques) */}
      <div className="mt-6">
        <Highlights />
      </div>

      {/* Avatar de status dinâmico */}
      <div className="mt-4">
        <StatusAvatar />
      </div>

      {/* Energy Core */}
      <div className="mt-4">
        <EnergyCore />
      </div>

      {/* Serviço principal */}
      <div className="mt-4">
        <ServiceCard />
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 💥 TRINCA DE CARDS COMPACTOS (3 LADO A LADO) 💥   */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {/* 1. No Salão Agora */}
        <SalonInfo />

        {/* 2. Encaixe Virtual na Fila */}
        <QueueList compact />

        {/* 3. Garantir Horário na Agenda */}
        <button
          onClick={() => alert("Selecione o dia e horário desejado no atendimento com a IA!")}
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
            <p className="mt-1 text-[10px] font-bold text-white leading-tight">
              Marcar Horário
            </p>
          </div>
          <span className="mt-2 w-full text-center rounded-xl bg-white/10 py-1 text-[9px] font-bold text-neon">
            Garantir ➔
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* CHEFE AI & ALERTA INTELIGENTE                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="mt-4">
        <ChefeAI />
      </div>

      <div className="mt-3">
        <AIAlertBox />
      </div>

      <LeaveNotifier />

      {/* Acompanhamento ao vivo */}
      <div className="mt-3">
        <ProgressTracker />
      </div>

      {/* Mapa */}
      <div className="mt-4">
        <SalonMap />
      </div>

      <div className="mt-6">
        <Manifesto />
      </div>

      <div className="mt-6">
        <Feed />
      </div>

      <div className="mt-6">
        <Reviews />
      </div>

      <footer className="mt-10 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Powered by <span className="text-gradient-ig">CHEFE AI</span>
      </footer>

      <StoriesViewer
        stories={stories}
        open={storiesOpen}
        onClose={() => setStoriesOpen(false)}
      />
    </main>
  );
}
       
  

