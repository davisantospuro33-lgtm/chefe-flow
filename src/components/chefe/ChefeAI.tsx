import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Clock, MapPin } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

export function ChefeAI() {
  const queue = useChefeStore((s) => s.queue);
  const presencialCount = useChefeStore((s) => s.presencialCount);
  const addToQueue = useChefeStore((s) => s.addToQueue);

  // Cálculos em tempo real da IA
  const totalFila = queue.length + presencialCount;
  const tempoEsperaMinutos = totalFila * 40; // 40min por corte

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensagem inicial baseada no contexto do salão
  const getInitialMessage = () => {
    if (totalFila === 0) {
      return "Salve! Sou a Assessora Premium do Comando CHEFE. ✂️ O salão está ZERADO no momento! Você pode vir direto ou garantir seu encaixe agora. Como posso te ajudar?";
    }
    return `Salve! Sou a Assessora do CHEFE. ✂️ Temos ${totalFila} pessoa(s) na fila (Tempo estimado: ${tempoEsperaMinutos} min). Quer entrar na fila de encaixe ou agendar um horário?`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: getInitialMessage(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Processamento do cérebro automatizado
    setTimeout(() => {
      let replyText = "";
      const lower = userText.toLowerCase();

      if (
        lower.includes("encaixe") ||
        lower.includes("fila") ||
        lower.includes("entrar") ||
        lower.includes("quero cortar") ||
        lower.includes("corta")
      ) {
        const clientName = userText.length > 3 && !lower.includes("quero") ? userText : "Cliente App";
        addToQueue(clientName);
        
        const novaPosicao = queue.length + 1;
        const novoTempo = (novaPosicao + presencialCount - 1) * 40;

        replyText = `⚡ CHECK-IN REALIZADO COM SUCESSO! Te coloquei no Encaixe Virtual.\n\n📍 Sua Posição: #${novaPosicao}\n⏱️ Tempo estimado até a cadeira: ${novoTempo > 0 ? novoTempo + ' min' : 'Atendimento Imediato'}.\n\nAcompanhe seu status nos cards do topo ou no Alerta Inteligente!`;
      } else if (
        lower.includes("tempo") ||
        lower.includes("demora") ||
        lower.includes("espera") ||
        lower.includes("quanto tempo")
      ) {
        replyText = `📊 MONITOREI O SALÃO AGORA:\n• Fila Total: ${totalFila} cliente(s)\n• Tempo Médio de Espera: ~${tempoEsperaMinutos} minutos.\n\nSe pedir encaixe agora, seu tempo já começa a rodar!`;
      } else if (
        lower.includes("agenda") ||
        lower.includes("horario") ||
        lower.includes("marcar") ||
        lower.includes("reserva")
      ) {
        replyText = `📅 Perfeito! Para agendar um horário com horário garantido sem fila, basta clicar no card "📅 Agenda" no topo do app. Gostaria de ver os horários de hoje?`;
      } else if (lower.includes("preço") || lower.includes("quanto") || lower.includes("valor")) {
        replyText = `💈 O Corte CHEFE é R$ 25,00 (duração aproximada de 40 minutos com acabamento profissional de alto nível).`;
      } else if (lower.includes("onde") || lower.includes("local") || lower.includes("endereco")) {
        replyText = `📍 Estamos localizados no Jardim Santo André (Rua Renato Russo, 100). Você pode abrir a rota direto pelo Waze ou Google Maps na opção do mapa aqui embaixo!`;
      } else {
        replyText = `Entendido, chefe! Como sua assessora, posso fazer seu **Check-in no Encaixe**, calcular seu **Tempo na Fila**, **Agendar Horário** ou te guiar até o salão. O que prefere?`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 500);
  };

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-neutral-900/95 to-black p-4 shadow-2xl backdrop-blur-md">
      {/* Header do Cérebro */}
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 shadow-lg">
            <Sparkles className="h-4 w-4 text-black font-bold" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
              CHEFE AI · CÉREBRO DE ATENDIMENTO
            </h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado ao Vivo · {totalFila} na fila (~{tempoEsperaMinutos}min)
            </p>
          </div>
        </div>
      </div>

      {/* Caixa de Mensagens */}
      <div className="max-h-64 min-h-[140px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                msg.sender === "user"
                  ? "bg-amber-500 text-black"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              }`}
            >
              {msg.sender === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-amber-500 text-black font-semibold rounded-tr-none"
                  : "bg-white/[0.07] text-white border border-white/10 rounded-tl-none"
              }`}
            >
              <p>{msg.text}</p>
              <span
                className={`mt-1 block text-[8px] text-right ${
                  msg.sender === "user" ? "text-black/60" : "text-muted-foreground"
                }`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Peça encaixe, pergunte a fila ou tire dúvidas..."
          className="flex-1 rounded-2xl bg-white/[0.05] border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleSend}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md active:scale-95 transition-transform"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
