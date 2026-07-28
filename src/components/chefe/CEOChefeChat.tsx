import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, BadgeCheck, Smile, Bot, User } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { atendentePublicaChat } from "@/lib/atendente-publica.functions";
import { supabase } from "@/integrations/supabase/client";
import profileImg from "@/assets/chefe-profile.jpg";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Mode = "chefe" | "ceochefe";
type Msg = { id: string; role: "user" | "assistant"; text: string; time: string };

const SUGESTOES_IA = [
  "Como está o salão agora?",
  "Quero entrar no encaixe",
  "Ver horários disponíveis",
  "Quanto tempo de espera?",
  "Valores dos cortes",
  "Falar direto com o CHEFE",
];

const SUGESTOES_CHEFE = [
  "Salve CHEFE! 🤝",
  "Tá on agora?",
  "Consegue me encaixar hoje?",
  "Vou chegar em 10 min",
];

const EMOJIS = ["😀", "😎", "🔥", "💈", "✂️", "👍", "🙏", "❤️", "🤝", "⏰"];

const now = () =>
  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function CEOChefeChat({ open, onClose }: Props) {
  const chat = useServerFn(atendentePublicaChat);
  const [mode, setMode] = useState<Mode>("chefe");
  const [iaMessages, setIaMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Salve! Aqui é o CEOCHEFE 🤝 Consulto o salão em tempo real: status da casa, encaixe virtual, horários da agenda e tempo de espera. O que você precisa?",
      time: now(),
    },
  ]);
  const [dmMessages, setDmMessages] = useState<Msg[]>([
    {
      id: "dm-welcome",
      role: "assistant",
      text: "Fala! Aqui é o CHEFE em pessoa 💈 Manda a real: resenha, dúvida ou horário. Se eu estiver na tesoura, o CEOCHEFE te responde na hora — é só trocar de aba aqui embaixo.",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const messages = mode === "chefe" ? dmMessages : iaMessages;
  const sugestoes = useMemo(
    () => (mode === "chefe" ? SUGESTOES_CHEFE : SUGESTOES_IA),
    [mode],
  );

  // Canal em tempo real com o painel do CHEFE (mensagens diretas)
  useEffect(() => {
    if (!open) return;
    const ch = supabase.channel("painel_operacao");
    ch.on("broadcast", { event: "dm-chefe" }, (msg) => {
      const p = msg.payload as { text?: string };
      if (!p?.text) return;
      setDmMessages((prev) => [
        ...prev,
        { id: `dm-${Date.now()}`, role: "assistant", text: p.text as string, time: now() },
      ]);
    });
    ch.subscribe();
    channelRef.current = ch;
    return () => {
      channelRef.current = null;
      supabase.removeChannel(ch);
    };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, mode]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setShowEmoji(false);
    setInput("");
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text, time: now() };

    // ── Canal 1: conversa direta com o CHEFE (estilo WhatsApp) ──
    if (mode === "chefe") {
      setDmMessages((prev) => [...prev, userMsg]);
      try {
        await channelRef.current?.send({
          type: "broadcast",
          event: "dm-cliente",
          payload: { text, ts: Date.now() },
        });
      } catch {
        setDmMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            text: "Não consegui entregar agora ⚠️ Tenta de novo ou fala com o CEOCHEFE na outra aba.",
            time: now(),
          },
        ]);
      }
      inputRef.current?.focus();
      return;
    }

    // ── Canal 2: copiloto CEOCHEFE (IA em nuvem) ──
    const history = [...iaMessages, userMsg];
    setIaMessages(history);
    setTyping(true);
    try {
      const res = await chat({
        data: {
          messages: history
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.text })),
        },
      });
      setIaMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: res?.text?.trim() || "Recebi sua mensagem! Já te retorno com os detalhes.",
          time: now(),
        },
      ]);
    } catch {
      setIaMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: "Tive uma instabilidade agora ⚠️ Tenta mandar de novo em instantes.",
          time: now(),
        },
      ]);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-0 z-[120] mx-auto flex w-full max-w-md flex-col bg-background text-foreground"
        >
          {/* Header */}
          <header className="flex items-center gap-3 border-b border-border/60 bg-background/90 px-3 py-3 backdrop-blur-xl">
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted"
              aria-label="Fechar chat"
            >
              <X size={20} />
            </button>
            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-ig p-[2px]">
              <img
                src={profileImg}
                alt="CEOCHEFE"
                className="h-full w-full rounded-full border-2 border-background object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h2 className="truncate text-sm font-bold">
                  {mode === "chefe" ? "CHEFE · Ch3fg8" : "CEOCHEFE · Copiloto IA"}
                </h2>
                <BadgeCheck size={14} className="text-emerald-400" />
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {typing ? "digitando..." : mode === "chefe" ? "Online · resposta direta" : "Online · dados ao vivo"}
              </p>
            </div>
          </header>

          {/* Alternador de canal (2 em 1) */}
          <div className="flex gap-1 border-b border-border/40 bg-background/60 px-3 py-2">
            {([
              { id: "chefe" as const, label: "CHEFE", Icon: User },
              { id: "ceochefe" as const, label: "CEOCHEFE", Icon: Bot },
            ]).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  mode === id
                    ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/40"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Sugestões */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border/40 px-3 py-2">
            {sugestoes.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 transition active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Mensagens */}
          <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-4">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border/60 bg-muted/60 text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <span className="mt-1 block text-right text-[9px] opacity-60">{m.time}</span>
                </div>
              </motion.div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border/60 bg-muted/60 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Emojis */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1 overflow-hidden border-t border-border/40 px-3 py-2"
              >
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setInput((v) => v + e)}
                    className="rounded-lg px-2 py-1 text-xl transition active:scale-90 hover:bg-muted"
                  >
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2 border-t border-border/60 bg-background/90 px-3 py-3 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-muted"
              aria-label="Emojis"
            >
              <Smile size={20} />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "chefe" ? "Mensagem direta para o CHEFE..." : "Perguntar ao CEOCHEFE (IA)..."
              }
              className="flex-1 rounded-full border border-border/60 bg-muted/40 px-4 py-2.5 text-[13px] outline-none transition focus:border-emerald-400/60"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-black transition active:scale-95 disabled:opacity-40"
              aria-label="Enviar mensagem"
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}