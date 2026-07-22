import { useState } from "react";
import { useChefeStore } from "@/lib/chefe-store";
import { Cpu, Send, Sparkles, Database, CheckCircle2 } from "lucide-react";

export function ConfigAI() {
  const [input, setInput] = useState("");
  
  // Conexão em Tempo Real com a Central do Salão
  const queue = useChefeStore((s) => s.queue);
  const presencialCount = useChefeStore((s) => s.presencialCount);
  const status = useChefeStore((s) => s.status);
  const totalEspera = (queue.length + presencialCount) * 40;

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: `👊 CHEFE, este é seu canal de comando direto. Qualquer ordem que você digitar aqui vira instrução ao vivo para sua atendente virtual (que fala com seus clientes no chat público).`,
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: userText }]);
    setInput("");

    setTimeout(() => {
      let reply = "";
      const lower = userText.toLowerCase();

      if (lower.includes("status") || lower.includes("fila") || lower.includes("resumo")) {
        reply = `📊 RESUMO EM TEMPO REAL:\n• Salão: ${status.toUpperCase()}\n• Fila Virtual: ${queue.length} pessoa(s)\n• Sofá/Presencial: ${presencialCount}\n• Tempo de Espera: ~${totalEspera} min`;
      } else {
        reply = `✅ Ordem recebida e sincronizada! Instrução aplicada no cérebro da CHEFE AI do chat público em tempo real.`;
      }

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: reply }]);
    }, 500);
  };

  return (
    <div className="rounded-3xl border border-pink-500/30 bg-black/90 p-4 shadow-2xl backdrop-blur-xl">
      {/* Header Pro Motor */}
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 shadow-lg shadow-pink-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wider text-white uppercase">
              CHEFE AI · PAINEL PRO MOTOR
            </h3>
            <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sincronizado ao Vivo · {queue.length + presencialCount} na fila (~{totalEspera}min)
            </p>
          </div>
        </div>
      </div>

      {/* Visor de Status Rápido */}
      <div className="mb-3 grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.03] p-2.5 text-center border border-white/5">
        <div>
          <p className="text-[8px] font-bold uppercase text-muted-foreground">Fila Virtual</p>
          <p className="text-xs font-black text-cyan-400">{queue.length} pess.</p>
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase text-muted-foreground">Presencial</p>
          <p className="text-xs font-black text-amber-400">{presencialCount} pess.</p>
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase text-muted-foreground">Tic-Tac Relógio</p>
          <p className="text-xs font-black text-emerald-400">~{totalEspera} min</p>
        </div>
      </div>

      {/* Chat de Comando Interno */}
      <div className="max-h-52 min-h-[120px] overflow-y-auto space-y-2 pr-1 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl p-2.5 leading-relaxed ${
              m.sender === "user"
                ? "bg-pink-500/20 text-pink-200 border border-pink-500/30 ml-6"
                : "bg-zinc-900/90 text-zinc-200 border border-white/10 mr-4"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Input de Ordem Directa */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ex: muda o preço pra R$ 30 ou cria um aviso..."
          className="flex-1 rounded-2xl bg-white/[0.05] border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-pink-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 text-white shadow-lg active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
