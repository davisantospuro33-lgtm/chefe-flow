import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { GradientAvatar } from "@/components/chefe/GradientAvatar";
import { StatusBadge } from "@/components/chefe/StatusBadge";
import { Highlights } from "@/components/chefe/Highlights";
import { ServiceCard } from "@/components/chefe/ServiceCard";
import { ProgressTracker } from "@/components/chefe/ProgressTracker";
import { AIAlertBox } from "@/components/chefe/AIAlertBox";
import { QueueList } from "@/components/chefe/QueueList";
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

      {/* Profile header — Instagram style */}
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

      {/* Service card */}
      <div className="mt-4">
        <ServiceCard />
      </div>

      {/* CHEFE AI — Atendente conversacional */}
      <div className="mt-4">
        <ChefeAI />
      </div>

      {/* AI + progress + queue */}
      <section className="mt-6 space-y-4">
        <AIAlertBox />
        <ProgressTracker />
        <QueueList />
      </section>

      {/* Manifesto */}
      <div className="mt-6">
        <Manifesto />
      </div>

      {/* Feed */}
      <div className="mt-6">
        <Feed />
      </div>

      {/* Reviews */}
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
