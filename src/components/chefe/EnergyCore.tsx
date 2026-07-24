import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Gauge, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

export function EnergyCore() {
  const queueLen = useChefeStore((s) => s.queue.length);
  const sofa = useChefeStore((s) => s.pessoasNoSalao);
  const [audioOn, setAudioOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => () => stopTone(), []);

  const stopTone = () => {
    try {
      oscRef.current?.stop();
      lfoRef.current?.stop();
    } catch {
      // ignore
    }
    oscRef.current = null;
    lfoRef.current = null;
    gainRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  };

  const toggleAudio = async () => {
    if (typeof window === "undefined") return;
    if (audioOn) {
      stopTone();
      setAudioOn(false);
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 432;
    gain.gain.value = 0.06;

    lfo.type = "sine";
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 12;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    lfo.start();

    ctxRef.current = ctx;
    oscRef.current = osc;
    lfoRef.current = lfo;
    gainRef.current = gain;
    setAudioOn(true);
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-[1.5px]"
      style={{
        background:
          "conic-gradient(from 0deg, #00FF66, #00E5FF, #8B00FF, #FF007A, #00FF66)",
      }}
    >
      <div
        className="relative rounded-[calc(1.5rem-1.5px)] p-5 backdrop-blur-xl"
        style={{ background: "rgba(15,15,25,0.72)" }}
      >
        {/* Rotating gear background */}
        <motion.svg
          aria-hidden
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <defs>
            <linearGradient id="gearGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#00FF66" />
              <stop offset="50%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#FF007A" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#gearGrad)" strokeWidth="1.5">
            <circle cx="100" cy="100" r="70" />
            <circle cx="100" cy="100" r="40" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * Math.PI * 2) / 12;
              const x1 = 100 + Math.cos(a) * 70;
              const y1 = 100 + Math.sin(a) * 70;
              const x2 = 100 + Math.cos(a) * 90;
              const y2 = 100 + Math.sin(a) * 90;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
        </motion.svg>

        {/* Pulse particles */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(0,255,102,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(139,0,255,0.15), transparent 40%)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest"
                style={{
                  background: "linear-gradient(90deg, rgba(0,255,102,0.2), rgba(139,0,255,0.2))",
                  color: "#00FF66",
                  border: "1px solid rgba(0,255,102,0.4)",
                }}
              >
                ⚡ Energia CHEFE · Matéria em Expansão
              </span>
              <h3 className="mt-2 text-base font-black leading-tight text-white">
                Fluxo de Alta Frequência
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(90deg,#00FF66,#00E5FF,#FF007A)" }}
                >
                  em Tempo Real
                </span>
              </h3>
            </div>
            <button
              onClick={toggleAudio}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition ${
                audioOn ? "bg-emerald-500/30 ring-1 ring-emerald-400" : "bg-white/5 ring-1 ring-white/10"
              }`}
              aria-label="Sincro sonora"
              title={audioOn ? "Desligar 432Hz" : "Sincro Sonora 432Hz"}
            >
              {audioOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Metric
              icon={<Zap className="h-3.5 w-3.5" />}
              label="Frequência"
              value="432 Hz"
              sub="Energia pura"
              color="#00FF66"
            />
            <Metric
              icon={<Gauge className="h-3.5 w-3.5" />}
              label="Engrenagem"
              value={`${queueLen + sofa}`}
              sub="Tempo sincro"
              color="#00E5FF"
            />
            <Metric
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="Matéria"
              value="Fluxo"
              sub="Contínuo"
              color="#FF007A"
            />
          </div>

          {audioOn && (
            <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              🔊 432Hz ativo · LFO 0.3Hz
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-2.5 ring-1"
      style={{
        background: "rgba(0,0,0,0.35)",
        borderColor: color,
        boxShadow: `inset 0 0 20px ${color}22`,
      }}
    >
      <div className="flex items-center gap-1" style={{ color }}>
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 text-sm font-black text-white leading-tight">{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-white/50">{sub}</p>
    </div>
  );
}