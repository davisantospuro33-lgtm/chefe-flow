import { useState } from "react";
import { useChefeStore } from "@/lib/chefe-store";
import { Cpu, Send } from "lucide-react";

export function ConfigAI() {
  const [input, setInput] = useState("");
  
  // Acessa a fila e o contador presencial direto do estado global
  const store = useChefeStore();
  const queue = store.queue || [];
  const presencialCount = store.presencialCount || 0;
  const tempoEstimado = (queue.length + presencialCount) * 40;

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: `👊 CHEFE, canal de comando direto! As duas IAs estão sincronizadas no mesmo relógio.`,
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: userText }]);
    setInput("");

    setTimeout(() => {
      let reply = `✅ Comando recebido e sincronizado no cérebro do app!`;
      if (userText.toLowerCase().includes("status") || userText.toLowerCase().includes("fila")) {
        reply = `📊 MONITORAMENTO DO RELÓGIO:\n• Sofá/Presencial: ${presencialCount}\n• Fila Virtual: ${queue.length}\n• Tempo Estimado: ~${tempoEstimado} min`;
      }
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: reply }]);
    }, 400);
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
              Conexão Ativa · Tempo Real
            </p>
          </div>
        </div>
      </div>

      {/* Visor de Status Sincronizado */}
      <div className="mb-3 grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.03] p-2.5 text-center border border-white/5">
        <div>
          <p className="text-[8px] font-bold uppercase text-muted-foreground">Sofá</p>
          <p className="text-xs font-black text-amber-400">{presencialCount}</p>
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase text-muted-foreground">Fila Virtual</p>
          <p className="text-xs font-black text-cyan-400">{queue.length}</p>
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase text-muted-foreground">Relógio</p>
          <p className="text-xs font-black text-emerald-400">~{tempoEstimado} min</p>
        </div>
      </div>

      {/* Chat de Comando */}
      <div className="max-h-52 min-h-[120px] overflow-y-auto space-y-2 pr-1 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl p-2.5 leading-relaxed whitespace-pre-line ${
              m.sender === "user"
                ? "bg-pink-500/20 text-pink-200 border border-pink-500/30 ml-6"
                : "bg-zinc-900/90 text-zinc-200 border border-white/10 mr-4"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ex: muda o preço pra R$ 30 ou veja o status..."
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
