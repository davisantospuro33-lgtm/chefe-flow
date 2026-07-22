import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Alerta = {
  resumo: string;
  cliente_nome: string | null;
  urgencia: "baixa" | "media" | "alta";
  ts: number;
};

type QuickReply = { action: string; tag: string | null; ts: number };

export function EmergencyBanner() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [replies, setReplies] = useState<QuickReply[]>([]);

  useEffect(() => {
    const ch = supabase.channel("painel_operacao");
    ch.on("broadcast", { event: "alerta-emergencia" }, (msg) => {
      const p = msg.payload as Alerta;
      setAlertas((a) => [p, ...a].slice(0, 5));
      try {
        const ctx = new ((window as unknown as { AudioContext: typeof AudioContext }).AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.value = p.urgencia === "alta" ? 1100 : 700;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.value = 0.1;
        o.start();
        setTimeout(() => {
          o.stop();
          ctx.close();
        }, 700);
      } catch {
        /* ignore */
      }
    });
    ch.on("broadcast", { event: "quick-reply" }, (msg) => {
      const p = msg.payload as QuickReply;
      setReplies((r) => [p, ...r].slice(0, 6));
    });
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  if (alertas.length === 0 && replies.length === 0) return null;

  return (
    <section className="mb-4 space-y-2">
      <AnimatePresence>
        {alertas.map((a, i) => (
          <motion.div
            key={a.ts + "-" + i}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-[1.5px]"
            style={{
              background:
                a.urgencia === "alta"
                  ? "linear-gradient(135deg,#ef4444,#f97316)"
                  : "linear-gradient(135deg,#f59e0b,#e94179)",
            }}
          >
            <div className="flex items-start gap-3 rounded-[calc(1rem-1.5px)] glass-strong p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-300 animate-pulse" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                  🚨 Ponte de Emergência da IA · urgência {a.urgencia}
                </p>
                <p className="mt-1 text-sm font-bold text-white leading-snug">{a.resumo}</p>
                {a.cliente_nome && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Cliente: {a.cliente_nome}
                  </p>
                )}
              </div>
              <button
                onClick={() => setAlertas((r) => r.filter((_, idx) => idx !== i))}
                className="rounded-full p-1 text-muted-foreground hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {replies.length > 0 && (
        <div className="rounded-2xl glass p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-sky-300">
            📱 Respostas rápidas de clientes (via notificação)
          </p>
          <ul className="space-y-1">
            {replies.map((r, i) => (
              <li
                key={r.ts + "-" + i}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[11px]"
              >
                <span className="font-bold text-white">{r.action}</span>
                <span className="text-muted-foreground">
                  {new Date(r.ts).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}