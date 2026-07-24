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
    glow: "rgba(0,255,102,0.35)",
    ring: "rgba(0,255,102,0.5)",
    bg: "radial-gradient(120% 100% at 0% 0%, rgba(0,255,102,0.18), rgba(10,20,15,0.85))",
    accent: "text-emerald-300",
    gestureY: [0, -2, 0],
    gestureRotate: [0, 2, 0],
  },
  busy: {
    label: "EM ATENDIMENTO",
    emoji: "💈",
    headline: "Chefe focado no momento.",
    bar: "#00E5FF",
    glow: "rgba(139,0,255,0.35)",
    ring: "rgba(0,229,255,0.55)",
    bg: "radial-gradient(120% 100% at 100% 0%, rgba(139,0,255,0.22), rgba(0,229,255,0.10), rgba(6,10,20,0.9))",
    accent: "text-cyan-300",
    gestureY: [0, 1, -1, 0],
    gestureRotate: [0, -3, 3, 0],
  },
  break: {
    label: "PAUSA RÁPIDA",
    emoji: "☕",
    headline: "Recarregando energias, já retorna.",
    bar: "#FFD700",
    glow: "rgba(255,215,0,0.32)",
    ring: "rgba(255,215,0,0.5)",
    bg: "radial-gradient(120% 100% at 50% 0%, rgba(255,215,0,0.18), rgba(20,15,5,0.9))",
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
  const v = VARIANTS[status] ?? VARIANTS.available;

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-[1.5px]"
      style={{ background: `linear-gradient(135deg, ${v.bar}, ${v.ring})` }}
    >
      <div
        className="relative flex items-center gap-4 rounded-[calc(1.5rem-1.5px)] p-4 backdrop-blur-xl"
        style={{ background: v.bg, boxShadow: `0 0 40px ${v.glow}, inset 0 1px 0 rgba(255,255,255,0.06)` }}
      >
        {/* Character avatar */}
        <motion.div
          animate={{ y: v.gestureY, rotate: v.gestureRotate }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative shrink-0"
          style={{ width: 72, height: 72 }}
        >
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, ${v.bar}, ${v.ring}, ${v.bar})`,
              filter: "blur(8px)",
              opacity: 0.7,
            }}
          />
          <div className="absolute inset-[2px] grid place-items-center rounded-2xl bg-black">
            <span className="text-3xl">🕴️</span>
            <span className="absolute bottom-1 right-1 text-sm">🕶️</span>
          </div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <motion.span
              className="h-2 w-2 rounded-full"
              style={{ background: v.bar, boxShadow: `0 0 12px ${v.bar}` }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.4, repeat: Infinity }}
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