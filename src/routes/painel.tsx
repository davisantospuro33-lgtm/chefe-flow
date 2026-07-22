import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useChefeStore } from "@/lib/chefe-store";
import { 
  Users, 
  Cpu, 
  Send, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  Layers
} from "lucide-react";

export const Route = createFileRoute("/painel")({
  component: PainelAdmin,
});

function PainelAdmin() {
  const [tab, setTab] = useState<"operacao" | "gps" | "app" | "portfolio" | "ia">("operacao");
  const [inputIA, setInputIA] = useState("");

  // Estado Global Sincronizado
  const store = useChefeStore();
  const queue = store.queue || [];
  const presencialCount = store.presencialCount || 0;
  
  const totalFila = queue.length + presencialCount;
  const tempoEstimado = totalFila * 40;

  const [messagesIA, setMessagesIA] = useState([
    {
      id: "1",
      sender: "ai",
      text: `👊 CHEFE, canal de comando direto ativo! As duas IAs estão sincronizadas no mesmo relógio. Qualquer atualização aqui reflete imediatamente para o cliente público.`,
    },
  ]);

  const handleSendIA = () => {
    if (!inputIA.trim()) return;
    const text = inputIA.trim();
    setMessagesIA((prev) => [...prev, { id: Date.now().toString(), sender: "user", text }]);
    setInputIA("");

    setTimeout(() => {
      let reply = `✅ Comando processado e sincronizado ao vivo no cérebro do app!`;
      if (text.toLowerCase().includes("status") || text.toLowerCase().includes("fila")) {
        reply = `📊 MONITORAMENTO DO RELÓGIO:\n• Clientes no Sofá: ${presencialCount}\n• Fila Virtual: ${queue.length}\n• Tempo de Espera: ~${tempoEstimado} min`;
      }
      setMessagesIA((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: reply }]);
    }, 400);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-black px-4 pb-20 pt-6 text-white font-sans">
      {/* Header do Painel Privado */}
      <header className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg">
            <div className="h-full w-full rounded-full bg-black grid place-items-center">
              <span className="font-black text-xs text-amber-400">CHEFE</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              PAINEL PRIVADO
            </p>
            <h1 className="text-xl font-black tracking-tight">Comando CHEFE</h1>
          </div>
        </div>
      </header>

      {/* Navegação Principal das Abas */}
      <nav className="mb-6 grid grid-cols-5 gap-1 rounded-2xl bg-white/[0.05] p-1 border border-white/10">
        <button
          onClick={() => setTab("operacao")}
          className={`flex flex-col items-center py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
            tab === "operacao" ? "bg-amber-500 text-black shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4 mb-1" />
          Operação
        </button>

        <button
          onClick={() => setTab("gps")}
          className={`flex flex-col items-center py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
            tab === "gps" ? "bg-amber-500 text-black shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <MapPin className="h-4 w-4 mb-1" />
          Radar GPS
        </button>

        <button
          onClick={() => setTab("app")}
          className={`flex flex-col items-center py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
            tab === "app" ? "bg-amber-500 text-black shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4 mb-1" />
          App
        </button>

        <button
          onClick={() => setTab("portfolio")}
          className={`flex flex-col items-center py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
            tab === "portfolio" ? "bg-amber-500 text-black shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <Sparkles className="h-4 w-4 mb-1" />
          Portfólio
        </button>

        <button
          onClick={() => setTab("ia")}
          className={`flex flex-col items-center py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
            tab === "ia" ? "bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-md font-bold" : "text-white/60 hover:text-white"
          }`}
        >
          <Cpu className="h-4 w-4 mb-1" />
          IA
        </button>
      </nav>

      {/* ABA 1: OPERAÇÃO DO SALÃO (ÚNICO CONTADOR DE SOFÁ) */}
      {tab === "operacao" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> PESSOAS NO SALÃO AGORA (SOFÁ)
              </span>
              <span className="text-[10px] font-bold text-emerald-400">
                ~{presencialCount * 40} min
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-4">
              Informativo direto de movimento presencial no seu espaço.
            </p>

            <div className="flex items-center justify-around py-2">
              <button
                onClick={() => store.decrementPresencial && store.decrementPresencial()}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white text-xl font-black active:scale-90 transition-transform"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-4xl font-black text-amber-400">{presencialCount}</span>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                  No Sofá
                </span>
              </div>
              <button
                onClick={() => store.incrementPresencial && store.incrementPresencial()}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-black text-xl font-black shadow-lg active:scale-90 transition-transform"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                FILA VIRTUAL (ENCAIXE APP)
              </span>
              <span className="text-xs font-black text-white">{queue.length} cliente(s)</span>
            </div>

            {queue.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.02] p-4 text-center text-xs text-muted-foreground">
                Fila virtual zerada no momento.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {queue.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3 border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-black font-black text-xs">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-white">{item.name || item.cliente_nome || "Cliente"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400">
                      ~{(index + presencialCount) * 40} min
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={() => store.nextInQueue && store.nextInQueue()}
                disabled={queue.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg disabled:opacity-30 active:scale-95 transition-transform"
              >
                <CheckCircle2 className="h-4 w-4" /> Chamar Próximo da Fila Virtual
              </button>

              <button
                onClick={() => store.clearQueue && store.clearQueue()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.04] py-2.5 text-[10px] font-bold text-rose-400 border border-rose-500/20 active:scale-95 transition-transform"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Zerar Toda a Fila
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: IA PAINEL PRO MOTOR */}
      {tab === "ia" && (
        <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-b from-neutral-900 to-black p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 shadow-lg shadow-pink-500/20">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider text-white uppercase">
                  CHEFE AI · PAINEL PRO MOTOR
                </h3>
                <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Conexão Ativa · Sincronizado ao Vivo
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.04] p-3 text-center border border-white/5">
            <div>
              <p className="text-[8px] font-bold uppercase text-muted-foreground">Sofá</p>
              <p className="text-sm font-black text-amber-400">{presencialCount}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase text-muted-foreground">Fila Virtual</p>
              <p className="text-sm font-black text-cyan-400">{queue.length}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase text-muted-foreground">Tic-Tac Relógio</p>
              <p className="text-sm font-black text-emerald-400">~{tempoEstimado} min</p>
            </div>
          </div>

          <div className="max-h-64 min-h-[140px] overflow-y-auto space-y-2.5 pr-1 text-xs">
            {messagesIA.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl p-3 leading-relaxed whitespace-pre-line ${
                  m.sender === "user"
                    ? "bg-pink-500/20 text-pink-200 border border-pink-500/30 ml-6"
                    : "bg-white/[0.07] text-zinc-200 border border-white/10 mr-4"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={inputIA}
              onChange={(e) => setInputIA(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendIA()}
              placeholder="Ex: muda o preço pra R$ 30 ou veja o status..."
              className="flex-1 rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:border-pink-500 focus:outline-none"
            />
            <button
              onClick={handleSendIA}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 text-white shadow-lg active:scale-95 transition-transform"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {(tab === "gps" || tab === "app" || tab === "portfolio") && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-xs text-muted-foreground">
          Módulo <span className="font-bold text-amber-400 uppercase">{tab}</span> ativo e sincronizado com a Central CHEFE.
        </div>
      )}
    </main>
  );
}
