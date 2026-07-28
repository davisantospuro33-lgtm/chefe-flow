import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Alerta = {
  resumo: string;
  cliente_nome: string | null;
  urgencia: "baixa" | "media" | "alta";
  ts: number;
};

type QuickReply = { action: string; tag: string | null; ts: number };
type DM = { from: "cliente" | "chefe"; text: string; ts: number };

export function EmergencyBanner() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [dms, setDms] = useState<DM[]>([]);
  const [dmInput, setDmInput] = useState("");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
    ch.on("broadcast", { event: "dm-cliente" }, (msg) => {
      const p = msg.payload as { text?: string; ts?: number };
      if (!p?.text) return;
      setDms((d) => [...d, { from: "cliente", text: p.text as string, ts: p.ts ?? Date.now() }].slice(-30));
    });
    ch.subscribe();
    channelRef.current = ch;
    return () => {
      channelRef.current = null;
      supabase.removeChannel(ch);
    };
  }, []);

  const enviarDm = async () => {
    const text = dmInput.trim();
    if (!text) return;
    setDmInput("");
    setDms((d) => [...d, { from: "chefe", text, ts: Date.now() }].slice(-30));
    try {
      await channelRef.current?.send({
        type: "broadcast",
        event: "dm-chefe",
        payload: { text, ts: Date.now() },
      });
    } catch {
      /* ignore */
    }
  };

  if (alertas.length === 0 && replies.length === 0 && dms.length === 0) return null;

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
      {dms.length > 0 && (
        <div className="rounded-2xl glass p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-300">
            💬 Conversa direta com cliente (chat da Tela 1)
          </p>
          <div className="max-h-48 space-y-1.5 overflow-y-auto">
            {dms.map((d, i) => (
              <div
                key={d.ts + "-" + i}
                className={`flex ${d.from === "chefe" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`max-w-[80%] rounded-xl px-2.5 py-1.5 text-[11px] ${
                    d.from === "chefe"
                      ? "bg-emerald-500 text-black"
                      : "bg-white/[0.06] text-foreground"
                  }`}
                >
                  {d.text}
                </span>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void enviarDm();
            }}
            className="mt-2 flex items-center gap-2"
          >
            <input
              value={dmInput}
              onChange={(e) => setDmInput(e.target.value)}
              placeholder="Responder o cliente..."
              className="flex-1 rounded-full border border-border/60 bg-background/60 px-3 py-2 text-[11px] outline-none focus:border-emerald-400/60"
            />
            <button
              type="submit"
              disabled={!dmInput.trim()}
              className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-black disabled:opacity-40"
              aria-label="Enviar resposta"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}