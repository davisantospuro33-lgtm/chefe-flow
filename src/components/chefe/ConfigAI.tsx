import { useState } from "react";
import { useChefeStore } from "@/lib/chefe-store";
import { Cpu, Send } from "lucide-react";

export function ConfigAI() {
  const [input, setInput] = useState("");

  // Acessa a fila, o contador presencial e a atualização do serviço principal
  const store = useChefeStore();
  const queue = store.queue || [];
  const presencialCount = store.presencialCount || 0;
  const tempoEstimado = (queue.length + presencialCount) * 20;

  const mainService = store.mainService || {
    name: "Corte CHEFE",
    price: "25,00",
    duration: "40 min",
    hours: "9h-20h",
  };

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "👑 CHEFE, canal de comando direto! Digite para ajustar preço, tempo ou status.",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: userText }]);
    setInput("");

    setTimeout(() => {
      let reply = "✅ Comando recebido e sincronizado!";
      const lower = userText.toLowerCase();

      // Ajuste cirúrgico de preço via IA/Painel
      if (lower.includes("preço") || lower.includes("preco") || lower.includes("r$")) {
        const match = userText.match(/\d+([.,]\d+)?/);
        if (match) {
          const newPrice = match[0];
          store.updateMainService?.({ price: newPrice });
          reply = `🎯 Preço do Corte CHEFE atualizado para R$ ${newPrice} no header!`;
        }
      } else if (lower.includes("tempo") || lower.includes("min")) {
        const match = userText.match(/\d+/);
        if (match) {
          const newTime = `${match[0]} min`;
          store.updateMainService?.({ duration: newTime });
          reply = `⏱️ Tempo estimado atualizado para ${newTime}!`;
        }
      } else if (lower.includes("status") || lower.includes("fila")) {
        reply = `📊 MONITORAMENTO DO RELÓGIO: ${queue.length} na fila virtual, ${presencialCount} presenciais. Tempo total est.: ${tempoEstimado} min.`;
      }

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: reply }]);
    }, 400);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      {/* Header Pro Motor */}
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              CHEFE AI • PAINEL PRO MOTOR
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Conexão Ativa • Tempo Real
            </p>
          </div>
        </div>
      </div>

      {/* Visor de Status Sincronizado */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-border bg-muted/50 p-2">
          <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Fila Virtual</p>
          <p className="text-xs font-black text-foreground">{queue.length} pessoas</p>
        </div>
        <div className="rounded-2xl border border-border bg-muted/50 p-2">
          <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Presenciais</p>
          <p className="text-xs font-black text-foreground">{presencialCount} no local</p>
        </div>
        <div className="rounded-2xl border border-border bg-muted/50 p-2">
          <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Serviço Atual</p>
          <p className="text-xs font-black text-emerald-500">R$ {mainService.price}</p>
        </div>
      </div>

      {/* Chat de Comando */}
      <div className="max-h-52 min-h-[120px] overflow-y-auto space-y-2 pr-1 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl p-2.5 leading-relaxed ${
              m.sender === "user"
                ? "bg-primary text-primary-foreground ml-auto max-w-[85%]"
                : "bg-muted text-foreground max-w-[90%]"
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
          placeholder="Ex: muda o preço pra R$ 30 ou status..."
          className="flex-1 rounded-2xl bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
