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
  const tempoEsperaMinutos = totalFila * 40;

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensagem inicial baseada no contexto do salão
  const getInitialMessage = () => {
    if (totalFila === 0) {
      return 'Salve! Sou a Assessora Premium do CHEFE. O salão está livre agora! Quer agendar um horário ou tirar dúvidas?';
    }
    return 'Salve! Sou a Assessora do CHEFE. Fila atual com estimativa de tempo ativa. Como posso te ajudar?';
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: getInitialMessage(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        const clientName = userText.length > 3 && !lower.includes("quero") ? userText : "Cliente";
        addToQueue(clientName);

        const novaPosicao = queue.length + 1;
        const novoTempo = (novaPosicao + presencialCount) * 40;

        replyText = `✅ CHECK-IN REALIZADO COM SUCESSO! Você entrou na fila virtual. Posição: ${novaPosicao}º. Tempo estimado: ~${novoTempo} min.`;
      } else if (
        lower.includes("tempo") ||
        lower.includes("demora") ||
        lower.includes("espera") ||
        lower.includes("quanto tempo")
      ) {
        replyText = `⏱️ MONITOREI O SALÃO AGORA: Temos ${totalFila} pessoa(s) no total. O tempo estimado de espera é de ~${tempoEsperaMinutos} minutos.`;
      } else if (
        lower.includes("agenda") ||
        lower.includes("horario") ||
        lower.includes("marcar") ||
        lower.includes("reserva")
      ) {
        replyText = "📅 Perfeito! Para agendar um horário exclusivo, clique na aba 'Agenda' no menu ou me diga o dia e hora desejados!";
      } else if (lower.includes("preço") || lower.includes("valor") || lower.includes("quanto é")) {
        replyText = "💈 O Corte CHEFE é R$ 25,00. Barba R$ 20,00. Combo Corte + Barba R$ 40,00!";
      } else if (lower.includes("onde") || lower.includes("local") || lower.includes("endereço")) {
        replyText = "📍 Estamos localizados na João XXIII, 439! Cola aí!";
      } else {
        replyText = "Entendido, chefe! Como sua Assessora, posso te colocar na fila, checar horários ou tirar dúvidas sobre o salão. Como prefere seguir?";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 500);
  };

  return (
    <div className="chefe-ai-card rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
      {/* Header do Cérebro */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              CHEFE AI - CÉREBRO DE ATENDIMENTO
            </h3>
            <p className="text-[10px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Sincronizado ao Vivo ({totalFila} na fila)
            </p>
          </div>
        </div>
      </div>

      {/* Caixa de Mensagens */}
      <div className="max-h-64 min-h-[140px] overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] ${
                msg.sender === "user"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {msg.sender === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3 ${
                msg.sender === "user"
                  ? "bg-amber-500 text-black font-medium"
                  : "bg-white/[0.07] text-white border border-white/10"
              }`}
            >
              <p className="text-xs leading-relaxed">{msg.text}</p>
              <span
                suppressHydrationWarning
                className={`mt-1 block text-[8px] text-right ${
                  msg.sender === "user" ? "text-black/70" : "text-white/70"
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
          placeholder="Peça encaixe, pergunte a fila..."
          className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={handleSend}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-black hover:bg-amber-400 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
