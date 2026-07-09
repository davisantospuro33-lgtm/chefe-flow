import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { toast } from "sonner";
import { subscribeToPush } from "@/lib/push-client";

type Msg = {
  sender: "ia" | "user";
  text: string;
  kind?: "perfil" | "qtd";
};

type Dados = {
  nome: string;
  telefone: string;
  referencia: string;
  perfil: string;
  qtd: number;
};

export function ChefeAI() {
  const addSolicitacao = useChefeStore((s) => s.addSolicitacao);
  const greeting = useChefeStore((s) => s.profile.aiGreeting);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [dados, setDados] = useState<Dados>({
    nome: "",
    telefone: "",
    referencia: "",
    perfil: "",
    qtd: 1,
  });
  const [messages, setMessages] = useState<Msg[]>([
    { sender: "ia", text: `${greeting} Qual é o seu nome completo?` },
  ]);
  useEffect(() => {
    setMessages((m) =>
      m.length === 1 && m[0].sender === "ia"
        ? [{ sender: "ia", text: `${greeting} Qual é o seu nome completo?` }]
        : m,
    );
  }, [greeting]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  function push(msg: Msg) {
    setMessages((m) => [...m, msg]);
  }

  function finalize(final: Dados) {
    addSolicitacao({
      name: final.nome,
      phone: final.telefone || "",
      referencia: final.referencia,
      perfil: final.perfil,
      qtd: final.qtd,
    });
    toast.success("Solicitação enviada ao CHEFE!");
    // Pede permissão de push assim que o cliente entra na fila
    subscribeToPush(final.nome).then((ok) => {
      if (ok) toast("🔔 Você será avisado quando o status mudar");
    });
  }

  function handleText(textValue: string) {
    const v = textValue.trim();
    if (!v) return;
    push({ sender: "user", text: v });
    setInput("");

    setTimeout(() => {
      if (step === 0) {
        setDados((d) => ({ ...d, nome: v }));
        push({
          sender: "ia",
          text: `Prazer, ${v.split(" ")[0]}! Qual seu WhatsApp com DDD para contato?`,
        });
        setStep(1);
      } else if (step === 1) {
        setDados((d) => ({ ...d, telefone: v }));
        push({
          sender: "ia",
          text:
            'Me diz uma referência sua (ex: "vizinho do bloco B", "amigo do Pedro") pra eu salvar:',
        });
        setStep(2);
      } else if (step === 2) {
        setDados((d) => ({ ...d, referencia: v }));
        push({
          sender: "ia",
          text: "Você já é cliente, é novo por aqui ou veio por indicação?",
          kind: "perfil",
        });
        setStep(3);
      }
    }, 350);
  }

  function handlePerfil(valor: string) {
    push({ sender: "user", text: valor });
    setDados((d) => ({ ...d, perfil: valor }));
    setTimeout(() => {
      push({
        sender: "ia",
        text: "Quantos cortes no total? Só você ou traz mais alguém junto?",
        kind: "qtd",
      });
      setStep(4);
    }, 300);
  }

  function handleQtd(label: string, qtd: number) {
    push({ sender: "user", text: label });
    const final: Dados = { ...dados, qtd };
    setDados(final);
    setTimeout(() => {
      push({
        sender: "ia",
        text:
          "⚡ Perfeito! Enviei tudo pro painel do CHEFE. Ele vai analisar e você recebe a confirmação!",
      });
      finalize(final);
      setStep(5);
    }, 300);
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
          <div>
            <p
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: "#38bdf8" }}
            >
              CHEFE AI · Atendente
            </p>
            <p className="text-[10px] text-muted-foreground">
              Triagem inteligente e automática
            </p>
          </div>
        </div>

        <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
                m.sender === "ia"
                  ? "self-start bg-sky-500/10 text-sky-50 ring-1 ring-sky-400/25"
                  : "self-end bg-gradient-ig text-white"
              }`}
            >
              {m.text}
              {m.kind === "perfil" && step === 3 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Já sou cliente", "Cliente novo", "Fui indicado"].map((op) => (
                    <button
                      key={op}
                      onClick={() => handlePerfil(op)}
                      className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[12px] font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                    >
                      {op}
                    </button>
                  ))}
                </div>
              )}
              {m.kind === "qtd" && step === 4 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    { label: "Apenas eu", qtd: 1 },
                    { label: "Eu e +1", qtd: 2 },
                    { label: "Eu e +2 ou mais", qtd: 3 },
                  ].map((op) => (
                    <button
                      key={op.label}
                      onClick={() => handleQtd(op.label, op.qtd)}
                      className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[12px] font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {step < 3 && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              inputMode={step === 1 ? "tel" : "text"}
              placeholder="Digite sua resposta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleText(input);
              }}
              className="flex-1 rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-muted-foreground focus:ring-sky-400/50"
            />
            <button
              onClick={() => handleText(input)}
              className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30 active:scale-95"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}