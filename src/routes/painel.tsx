import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Play, Scissors, Plus, Clock, UserPlus, RotateCcw } from "lucide-react";
import { useChefeStore, statusMeta, type ChefeStatus } from "@/lib/chefe-store";
import { GradientAvatar } from "@/components/chefe/GradientAvatar";
import { toast } from "sonner";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel do CHEFE — Controle Manual" },
      { name: "description", content: "Painel privado de controle do atendimento em tempo real." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

const statuses: ChefeStatus[] = ["available", "busy", "break", "closed"];

function Painel() {
  const status = useChefeStore((s) => s.status);
  const setStatus = useChefeStore((s) => s.setStatus);
  const queue = useChefeStore((s) => s.queue);
  const stage = useChefeStore((s) => s.stage);
  const startCut = useChefeStore((s) => s.startCut);
  const completeAndNext = useChefeStore((s) => s.completeAndNext);
  const addTenMinutes = useChefeStore((s) => s.addTenMinutes);
  const addClient = useChefeStore((s) => s.addClient);
  const resetDemo = useChefeStore((s) => s.resetDemo);
  const extra = useChefeStore((s) => s.extraMinutes);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const current = queue[0];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <button
          onClick={() => {
            resetDemo();
            toast("Demo resetada");
          }}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <GradientAvatar size={64} animated={false} />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Painel privado
          </p>
          <h1 className="truncate text-2xl font-black leading-tight">Comando CHEFE</h1>
        </div>
      </div>

      {/* Status selector */}
      <section className="glass rounded-3xl p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Alterar Status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {statuses.map((s) => {
            const meta = statusMeta[s];
            const active = status === s;
            return (
              <motion.button
                key={s}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setStatus(s);
                  toast(`Status: ${meta.label}`);
                }}
                className={`relative flex items-center gap-2 rounded-2xl px-4 py-4 text-left transition ${
                  active
                    ? "bg-white/[0.06] ring-1 ring-neon/60"
                    : "bg-white/[0.02] ring-1 ring-border"
                }`}
              >
                <span className="text-2xl">{meta.emoji}</span>
                <span className="text-sm font-bold">{meta.label}</span>
                {active && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-neon shadow-neon" />
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Current client */}
      <section className="mt-4 relative overflow-hidden rounded-3xl p-[1.5px]">
        <div className="absolute inset-0 bg-gradient-ig" />
        <div className="relative rounded-[calc(1.5rem-1.5px)] glass-strong p-5">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gradient-ig">
            Cliente atual
          </p>
          <h2 className="text-2xl font-black">{current?.name ?? "Nenhum cliente"}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {queue.length > 0
              ? `${queue.length} na fila · estágio ${stage + 1}/4`
              : "Adicione um novo cliente abaixo."}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <BigActionButton
              icon={Play}
              label="Iniciar Corte"
              disabled={!current || stage >= 2}
              onClick={() => {
                startCut();
                toast("Corte iniciado ✂️");
              }}
              variant="neon"
            />
            <BigActionButton
              icon={Scissors}
              label="Concluir / Próximo"
              disabled={!current}
              onClick={() => {
                completeAndNext();
                toast("Cliente concluído. Próximo na cadeira!");
              }}
              variant="ig"
            />
          </div>
        </div>
      </section>

      {/* Add 10 min */}
      <section className="mt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            addTenMinutes();
            toast("+10 min adicionados. Fila notificada.");
          }}
          className="flex w-full items-center justify-between rounded-3xl glass p-5 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-ig">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-base font-black">+10 Minutos</p>
              <p className="text-xs text-muted-foreground">Recalcula e notifica toda a fila</p>
            </div>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold tabular-nums text-neon">
            +{extra} min
          </span>
        </motion.button>
      </section>

      {/* New client */}
      <section className="mt-4 glass rounded-3xl p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Novo Cliente Presencial
        </p>
        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm font-medium outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-neon/60"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Número (opcional)"
            inputMode="tel"
            className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm font-medium outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-neon/60"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!name.trim()}
            onClick={() => {
              addClient(name.trim(), phone.trim() || undefined);
              setName("");
              setPhone("");
              toast(`${name} adicionado à fila`);
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-ig py-4 text-base font-black text-white disabled:opacity-40"
          >
            <UserPlus className="h-5 w-5" /> Adicionar à Fila
          </motion.button>
        </div>
      </section>

      {/* Queue mini */}
      <section className="mt-4 glass rounded-3xl p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Fila atual
        </p>
        <ul className="space-y-2">
          {queue.length === 0 && (
            <li className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-sm text-muted-foreground">
              Fila vazia
            </li>
          )}
          {queue.map((c, i) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[11px] font-black">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold">{c.name}</span>
              </div>
              {c.phone && <span className="text-[11px] text-muted-foreground">{c.phone}</span>}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Plus className="mx-auto mb-2 h-4 w-4 opacity-40" />
        Painel restrito · CHEFE
      </footer>
    </main>
  );
}

function BigActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "neon" | "ig";
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl px-3 py-5 text-center font-black disabled:opacity-40"
      style={{
        background:
          variant === "neon"
            ? "color-mix(in oklab, var(--neon) 20%, transparent)"
            : "var(--gradient-ig)",
        color: variant === "neon" ? "var(--neon)" : "#fff",
        boxShadow:
          variant === "neon"
            ? "0 0 24px rgba(74,222,128,0.25), inset 0 0 0 1px rgba(74,222,128,0.4)"
            : "0 8px 32px rgba(233,65,121,0.35)",
      }}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm leading-tight">{label}</span>
    </motion.button>
  );
}