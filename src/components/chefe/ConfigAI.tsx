import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Cpu, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { configAssistantChat } from "@/lib/config-ai.functions";
import { useChefeStore } from "@/lib/chefe-store";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function ConfigAI() {
  const hydrate = useChefeStore((s) => s.hydrate);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "🥋 CHEFE AI · MESTRE FAIXA PRETA online. Poder total sobre o banco de dados via SQL. Me diga o que quer construir ou alterar (ex: 'cria uma tabela pra clientes de manicure com nome, telefone e data', 'muda o preço pra R$ 30', 'lista todas as tabelas', 'expande o app pra receber lava-rápido'). Eu executo direto no Postgres.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function send() {
    const v = input.trim();
    if (!v || busy) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: v }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await configAssistantChat({
        data: { messages: next.map((m) => ({ role: m.role, content: m.content })) },
      });
      const reply = res.text || "✅ Feito.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (res.changes.length > 0) {
        toast.success(res.changes.join(" · "));
        await hydrate();
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Erro ao processar. Tenta de novo." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-[1.5px]"
      style={{ background: "linear-gradient(135deg,#38bdf8,#a855f7,#e94179)" }}
    >
      <div className="rounded-[calc(1.5rem-1.5px)] glass-strong p-4">
        <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-400 via-fuchsia-500 to-rose-500 shadow-lg">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-fuchsia-300">
              CHEFE AI · Mestre Faixa Preta
            </p>
            <p className="text-[10px] text-muted-foreground">
              SQL, schema, expansão de verticais. Comando total do banco.
            </p>
          </div>
        </div>

        <div className="flex max-h-[380px] flex-col gap-2 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
                m.role === "assistant"
                  ? "self-start bg-fuchsia-500/10 text-fuchsia-50 ring-1 ring-fuchsia-400/25"
                  : "self-end bg-gradient-ig text-white"
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 self-start text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> processando...
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Ex: muda o preço pra R$ 30 e atualiza minha bio"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-muted-foreground focus:ring-fuchsia-400/50"
          />
          <button
            onClick={send}
            disabled={busy}
            className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-500 via-fuchsia-500 to-rose-500 text-white shadow-lg active:scale-95 disabled:opacity-50"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}