import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { toast } from "sonner";
import { subscribeToPush } from "@/lib/push-client";
import { atendentePublicaChat, type AtendenteMessage } from "@/lib/atendente-publica.functions";

type UIMsg = { role: "user" | "assistant"; content: string };

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function ChefeAI() {
  const salonLat = useChefeStore((s) => s.profile.latitude ?? s.latitude);
  const salonLng = useChefeStore((s) => s.profile.longitude ?? s.longitude);
  const pendentesLen = useChefeStore((s) => s.pendentes.length);
  const status = useChefeStore((s) => s.status);
  const queueLen = useChefeStore((s) => s.queue.length);
  const presencialCount = useChefeStore((s) => s.presencialCount);
  const hydrated = useChefeStore((s) => s.hydrated);
  const lastPendentesRef = useRef(pendentesLen);

  const greeting = (() => {
    const statusMap: Record<string, string> = {
      available: "🟢 DISPONÍVEL",
      busy: "🔴 ATENDENDO",
      break: "☕ EM PAUSA",
      closed: "🏠 FECHADO",
    };
    const statusTxt = statusMap[status] ?? "🟢 DISPONÍVEL";
    const total = queueLen + presencialCount;
    const filaInfo =
      total === 0
        ? "a fila está zerada"
        : total === 1
          ? "só 1 cliente na frente"
          : `${total} clientes na fila`;
    return `Salve! Sou a Assessora Premium do Comando CHEFE. ✂️ Ele está ${statusTxt} agora — ${filaInfo}, você seria atendido praticamente na hora! Vamos garantir o seu corte?`;
  })();

  const [messages, setMessages] = useState<UIMsg[]>(() => [
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((m) =>
      m.length <= 1 ? [{ role: "assistant", content: greeting }] : m,
    );
  }, [greeting, hydrated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  // GPS opcional do cliente
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 8000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Detecta check-in confirmado (novo pendente) e dispara push
  useEffect(() => {
    if (pendentesLen > lastPendentesRef.current) {
      toast.success("✅ Solicitação enviada ao CHEFE!");
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const name = lastUser?.content?.split(/\s+/)[0] ?? "Cliente";
      subscribeToPush(name).catch(() => {});
    }
    lastPendentesRef.current = pendentesLen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendentesLen]);

  async function send() {
    const v = input.trim();
    if (!v || busy) return;
    const next: UIMsg[] = [...messages, { role: "user", content: v }];
    setMessages(next);
    setInput("");
    setBusy(true);

    let distanceKm: number | null = null;
    let durationMin: number | null = null;
    if (coords && salonLat && salonLng) {
      distanceKm = haversineKm(coords.lat, coords.lon, salonLat, salonLng);
      durationMin = (distanceKm / 30) * 60;
    }

    try {
      const payload: AtendenteMessage[] = next.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await atendentePublicaChat({
        data: { messages: payload, distanceKm, durationMin },
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.text || "…" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "⚠️ Tive um probleminha aqui. Pode repetir?",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-[1.5px]"
      style={{ background: "var(--gradient-ig)" }}
    >
      <div className="rounded-[calc(1.5rem-1.5px)] glass-strong p-4">
        <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-full"
            style={{
              background:
                "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #1e3a8a 100%)",
              boxShadow: "0 0 16px rgba(56,189,248,0.5)",
            }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: "#38bdf8" }}
            >
              CHEFE AI · Atendente Premium
            </p>
            <p className="text-[10px] text-muted-foreground">
              {coords ? "📍 GPS ativo · assessora inteligente" : "Assessora inteligente"}
            </p>
          </div>
        </div>

        <div className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
                m.role === "assistant"
                  ? "self-start bg-sky-500/10 text-sky-50 ring-1 ring-sky-400/25"
                  : "self-end bg-gradient-ig text-white"
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="self-start rounded-2xl bg-sky-500/10 px-3.5 py-2.5 text-sky-200 ring-1 ring-sky-400/25">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={busy}
            className="flex-1 rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-muted-foreground focus:ring-sky-400/50 disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30 active:scale-95 disabled:opacity-50"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
