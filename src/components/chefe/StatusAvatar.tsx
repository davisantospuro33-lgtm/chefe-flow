import { motion } from "framer-motion";
import { useChefeStore, type ChefeStatus } from "@/lib/chefe-store";

type Variant = {
  label: string;
  emoji: string;
  headline: string;
  bar: string;
  glow: string;
  ring: string;
  bg: string;
  accent: string;
  gestureY: number[];
  gestureRotate: number[];
};

const VARIANTS: Record<ChefeStatus, Variant> = {
  available: {
    label: "DISPONÍVEL AGORA",
    emoji: "⚡",
    headline: "Chefe livre! Chegue e corte.",
    bar: "#00FF66",
    glow: "rgba(0,255,102,0.45)",
    ring: "rgba(0,255,102,0.6)",
    bg: "radial-gradient(120% 100% at 0% 0%, rgba(0,255,102,0.22), rgba(10,20,15,0.88))",
    accent: "text-emerald-300",
    gestureY: [0, -2, 0],
    gestureRotate: [0, 2, 0],
  },
  busy: {
    label: "EM ATENDIMENTO",
    emoji: "💈",
    headline: "Chefe focado no momento.",
    bar: "#FFB020",
    glow: "rgba(255,176,32,0.4)",
    ring: "rgba(255,120,32,0.55)",
    bg: "radial-gradient(120% 100% at 100% 0%, rgba(255,176,32,0.22), rgba(255,80,0,0.12), rgba(20,10,5,0.9))",
    accent: "text-amber-300",
    gestureY: [0, 1, -1, 0],
    gestureRotate: [0, -3, 3, 0],
  },
  break: {
    label: "PAUSA RÁPIDA",
    emoji: "☕",
    headline: "Recarregando energias, já retorna.",
    bar: "#FFD700",
    glow: "rgba(255,215,0,0.35)",
    ring: "rgba(255,215,0,0.5)",
    bg: "radial-gradient(120% 100% at 50% 0%, rgba(255,215,0,0.2), rgba(20,15,5,0.9))",
    accent: "text-amber-300",
    gestureY: [0, -1, 0],
    gestureRotate: [0, -1, 0],
  },
  closed: {
    label: "ATENDIMENTO ENCERRADO",
    emoji: "🌙",
    headline: "Nos vemos amanhã!",
    bar: "#FF0055",
    glow: "rgba(255,0,85,0.35)",
    ring: "rgba(255,0,85,0.5)",
    bg: "radial-gradient(120% 100% at 0% 100%, rgba(255,0,85,0.22), rgba(15,5,10,0.9))",
    accent: "text-rose-300",
    gestureY: [0, 0.5, 0],
    gestureRotate: [0, 0, 0],
  },
};

export function StatusAvatar() {
  const status = useChefeStore((s) => s.status);
  const queue = useChefeStore((s) => s.queue);
  // Fila cheia (>=3) força tom amarelo/laranja quando disponível
  const effective: ChefeStatus =
    status === "available" && queue && queue.length >= 3 ? "busy" : status;
  const v = VARIANTS[effective] ?? VARIANTS.available;

  return (
    <motion.div
      key={effective}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-[1.5px]"
      style={{ background: `linear-gradient(135deg, ${v.bar}, ${v.ring})` }}
    >
      {/* respiração neon envolvendo o card */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-[calc(1.5rem+2px)]"
        style={{ boxShadow: `0 0 40px ${v.glow}` }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="relative flex items-center gap-4 rounded-[calc(1.5rem-1.5px)] p-4 backdrop-blur-xl"
        style={{ background: v.bg, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)` }}
      >
        {/* Personagem */}
        <motion.div
          animate={{ y: v.gestureY, rotate: v.gestureRotate }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative shrink-0"
          style={{ width: 76, height: 76 }}
        >
          {/* aura pulsante */}
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, ${v.bar}, ${v.ring}, ${v.bar})`,
              filter: "blur(10px)",
            }}
            animate={{ opacity: [0.5, 0.95, 0.5], rotate: [0, 360] }}
            transition={{
              opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            }}
          />
          <div className="absolute inset-[2px] grid place-items-center rounded-2xl bg-black overflow-hidden">
            <span className="text-3xl leading-none">🕴️</span>
            {/* brilho no óculos/capacete */}
            <motion.span
              aria-hidden
              className="absolute left-2 right-2 top-1/2 h-[2px] rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${v.bar}, transparent)`,
                filter: `drop-shadow(0 0 6px ${v.bar})`,
              }}
              animate={{ x: ["-60%", "60%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="absolute bottom-1 right-1 text-sm">🕶️</span>
          </div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <motion.span
              className="h-2 w-2 rounded-full"
              style={{ background: v.bar, boxShadow: `0 0 12px ${v.bar}` }}
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.2, 0.85] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <p className={`text-[10px] font-black uppercase tracking-widest ${v.accent}`}>
              {v.emoji} {v.label}
            </p>
          </div>
          <p className="mt-1.5 text-sm font-bold leading-snug text-white">{v.headline}</p>
        </div>
      </div>
    </motion.div>
  );
}