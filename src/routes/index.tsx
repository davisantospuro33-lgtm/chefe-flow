import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, Calendar, Users, Clock } from "lucide-react";
import { GradientAvatar } from "@/components/chefe/GradientAvatar";
import { StatusBadge } from "@/components/chefe/StatusBadge";
import { Highlights } from "@/components/chefe/Highlights";
import { ServiceCard } from "@/components/chefe/ServiceCard";
import { ProgressTracker } from "@/components/chefe/ProgressTracker";
import { AIAlertBox } from "@/components/chefe/AIAlertBox";
import { SalonMap } from "@/components/chefe/SalonMap";
import { SalonInfo } from "@/components/chefe/SalonInfo";
import { QueueList } from "@/components/chefe/QueueList";
import { AgendaBooking } from "@/components/chefe/AgendaBooking";
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
  const totalQueue = useChefeStore(
    (s) => s.queue.length + s.presencialCount,
  );
  const profile = useChefeStore((s) => s.profile);

  const scrollToAgenda = () => {
    const el = document.getElementById("agenda-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
        <GradientAvatar size={128} src={profile.avatarUrl} />
        <div>
          <h2 className="text-2xl font-black tracking-tight">{profile.username}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{profile.bio}</p>
        </div>

        <StatusBadge />

        <div className="mt-2 flex w-full max-w-xs items-center justify-around rounded-2xl glass px-4 py-3">
          <Stat value={profile.cutsCount} label="Cortes" />
          <Divider />
          <Stat value={profile.rating} label="Nota" gradient />
          <Divider />
          <Stat value={String(totalQueue)} label="Na fila" />
        </div>
      </section>

      {/* Highlights */}
      <div className="mt-6">
        <Highlights />
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

        {/* 2. Sequência Virtual (Encaixe) */}
        <QueueList compact />

        {/* 3. Garantir Horário (Agenda) */}
        <button
          onClick={scrollToAgenda}
          className="flex flex-col justify-between rounded-3xl glass-strong p-3 text-left transition-transform active:scale-95 border border-white/10"
        >
          <div className="flex items-center gap-1.5">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
              <Calendar className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground leading-tight">
              📅 Agenda
            </p>
          </div>
          <div className="mt-2">
            <p className="text-[10px] font-bold text-white leading-tight">Garantir Horário</p>
            <span className="mt-1 inline-block text-[9px] font-semibold text-neon">Marcar agora ➔</span>
          </div>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* CHEFE AI & ALERTA INTELIGENTE (LOGO ABAIXO)         */}
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

      {/* Grade de Agendamento */}
      <div id="agenda-section" className="mt-4">
        <AgendaBooking />
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
    </main>
  );
}

function Stat({ value, label, gradient }: { value: string; label: string; gradient?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-black leading-none ${gradient ? "text-gradient-ig" : "text-foreground"}`}>
        {value}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <span className="h-8 w-px bg-border" />;
}
