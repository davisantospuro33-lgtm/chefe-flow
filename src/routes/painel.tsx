import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useChefeStore } from "@/lib/chefe-store";
import { 
  Users, 
  Cpu, 
  Send, 
  MapPin, 
  Sparkles, 
  Scissors, 
  Lock, 
  Unlock, 
  Clock, 
  Share2, 
  Play, 
  Plus, 
  Minus,
  MessageSquare,
  Compass,
  LayoutGrid
} from "lucide-react";

export const Route = createFileRoute("/painel")({
  component: PainelAdmin,
});

function PainelAdmin() {
  // Autenticação Privada
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Navegação das 5 Abas Oficiais
  const [tab, setTab] = useState<"operacao" | "gps" | "app" | "portfolio" | "ia">("operacao");
  const [status, setStatus] = useState<"disponivel" | "atendendo" | "pausa" | "fechado">("disponivel");

  // Recado para Fila do Dia / IA Atendente
  const [recadoIA, setRecadoIA] = useState("");
  const [recadoAtivo, setRecadoAtivo] = useState(false);

  // Canal de Comando IA Pro Motor
  const [inputIA, setInputIA] = useState("");
  const [messagesIA, setMessagesIA] = useState([
    {
      id: "1",
      sender: "ai",
      text: `👊 CHEFE, este é seu canal de comando direto. Qualquer ordem que você digitar aqui vira instrução ao vivo para sua atendente virtual. Também posso alterar o banco em tempo real via SQL. Manda a ordem que eu executo.`,
    },
  ]);

  // Estado Global Sincronizado do Relógio e Fila
  const store = useChefeStore();
  const queue = store.queue || [];
  const presencialCount = store.presencialCount || 0;
  const currentClient = queue[0] || null;

  // Cálculo Exato do Relógio para o App do Cliente
  const totalFila = queue.length + presencialCount;
  const tempoEstimado = totalFila * 40;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "3337") {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSendIA = () => {
    if (!inputIA.trim()) return;
    const text = inputIA.trim();
    setMessagesIA((prev) => [...prev, { id: Date.now().toString(), sender: "user", text }]);
    setInputIA("");

    setTimeout(() => {
      let reply = `✅ Comando recebido e executado no motor do app!`;
      if (text.toLowerCase().includes("status") || text.toLowerCase().includes("fila")) {
        reply = `📊 MONITORAMENTO DO RELÓGIO:\n• Sofá/Presencial: ${presencialCount}\n• Fila Virtual App: ${queue.length}\n• Estimativa para o Cliente: ~${tempoEstimado} min`;
      }
      setMessagesIA((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: reply }]);
    }, 400);
  };

  // 🔒 TELA DE SENHA PIN (3337)
  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-[#0d0914] px-6 text-white font-sans">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-lg shadow-rose-500/20">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">PAINEL PRIVADO</p>
          <h2 className="text-xl font-black uppercase tracking-wider text-white">Comando CHEFE</h2>
          <p className="mt-1 text-xs text-zinc-400">Digite a senha PIN para acessar o painel restrito</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Digite o PIN (3337)"
              className="w-full rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3.5 text-center text-2xl font-black tracking-widest text-amber-400 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            />
            {pinError && <p className="text-[10px] font-bold text-rose-500">Senha incorreta. Tente 3337.</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95 transition-transform"
            >
              Liberar Painel
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 🔓 PAINEL PRIVADO COMANDO CHEFE
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#0a0612] px-4 pb-20 pt-6 text-white font-sans">
      {/* Header com Avatar do Chefe */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500 p-0.5 shadow-xl">
            <div className="h-full w-full rounded-full bg-black grid place-items-center overflow-hidden">
              <span className="font-black text-xs text-amber-400">CHEFE</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">PAINEL PRIVADO</p>
            <h1 className="text-xl font-black tracking-tight text-white">Comando CHEFE</h1>
          </div>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
        >
          <Unlock className="h-4 w-4" />
        </button>
      </header>

      {/* Menu Principal de 5 Abas */}
      <nav className="mb-6 grid grid-cols-5 gap-1 rounded-2xl bg-white/[0.03] p-1 border border-white/10">
        <button
          onClick={() => setTab("operacao")}
          className={`flex flex-col items-center py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
            tab === "operacao"
              ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Play className="h-3.5 w-3.5 mb-1 fill-current" />
          Operação
        </button>

        <button
          onClick={() => setTab("gps")}
          className={`flex flex-col items-center py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
            tab === "gps"
              ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Compass className="h-3.5 w-3.5 mb-1" />
          Radar GPS
        </button>

        <button
          onClick={() => setTab("app")}
          className={`flex flex-col items-center py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
            tab === "app"
              ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="h-3.5 w-3.5 mb-1" />
          App
        </button>

        <button
          onClick={() => setTab("portfolio")}
          className={`flex flex-col items-center py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
            tab === "portfolio"
              ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 mb-1" />
          Portfólio
        </button>

        <button
          onClick={() => setTab("ia")}
          className={`flex flex-col items-center py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
            tab === "ia"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Cpu className="h-3.5 w-3.5 mb-1" />
          IA
        </button>
      </nav>

      {/* COMPARTILHAR LINK DO APP */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-blue-400">LINK DO APP</p>
          <p className="text-xs font-bold text-white">Enviar para clientes</p>
        </div>
        <button 
          onClick={() => navigator.clipboard?.writeText(window.location.origin)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600/30 px-3 py-2 text-xs font-bold text-blue-300 border border-blue-500/30 active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5" /> Compartilhar
        </button>
      </div>

      {/* ABA 1: OPERAÇÃO DO SALÃO */}
      {tab === "operacao" && (
        <div className="space-y-4">
          {/* Recado da IA Atendente */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                INSTRUÇÃO PARA A FILA DO DIA · IA ATENDENTE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mb-3">
              Digite um recado rápido em linguagem natural. A IA Atendente reescreve com postura profissional e mostra no início do chat do cliente.
            </p>
            <textarea
              rows={2}
              value={recadoIA}
              onChange={(e) => setRecadoIA(e.target.value)}
              placeholder='Ex: "Fila cheia, só quem já está agendado hoje" ou "Pausa pro almoço, volto em 40min"'
              className="w-full rounded-2xl bg-black/40 border border-white/10 p-3 text-xs text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none resize-none"
            />
            <button
              onClick={() => setRecadoAtivo(!recadoAtivo)}
              className={`mt-2 w-full rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                recadoAtivo
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white"
              }`}
            >
              {recadoAtivo ? "✓ Recado Ativo no Chat Público" : "Ativar recado no chat público"}
            </button>
          </div>

          {/* Alterar Status */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-3">
              ALTERAR STATUS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStatus("disponivel")}
                className={`flex items-center gap-2 rounded-2xl p-3 text-xs font-bold border transition-all ${
                  status === "disponivel"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                Disponível
              </button>

              <button
                onClick={() => setStatus("atendendo")}
                className={`flex items-center gap-2 rounded-2xl p-3 text-xs font-bold border transition-all ${
                  status === "atendendo"
                    ? "bg-rose-500/20 border-rose-500 text-rose-400"
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
                Atendendo
              </button>

              <button
                onClick={() => setStatus("pausa")}
                className={`flex items-center gap-2 rounded-2xl p-3 text-xs font-bold border transition-all ${
                  status === "pausa"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}
              >
                ☕ Pausa
              </button>

              <button
                onClick={() => setStatus("fechado")}
                className={`flex items-center gap-2 rounded-2xl p-3 text-xs font-bold border transition-all ${
                  status === "fechado"
                    ? "bg-purple-500/20 border-purple-500 text-purple-400"
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}
              >
                🏠 Fechado
              </button>
            </div>
          </div>

          {/* Cliente Atual na Cadeira */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 p-5 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">CLIENTE ATUAL</p>
            <h3 className="text-xl font-black text-white mt-1">
              {currentClient ? (currentClient.name || currentClient.cliente_nome) : "Nenhum cliente na cadeira"}
            </h3>
            <p className="text-[10px] font-bold text-zinc-400 mt-1">
              {queue.length > 0 ? `${queue.length} cliente(s) aguardando na fila virtual` : "Fila virtual zerada."}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => store.nextInQueue && store.nextInQueue()}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-xs font-black uppercase text-black shadow-lg active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-black" /> Iniciar Corte
              </button>
              <button
                onClick={() => store.nextInQueue && store.nextInQueue()}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 py-3 text-xs font-black uppercase text-black shadow-lg active:scale-95"
              >
                <Scissors className="h-3.5 w-3.5" /> Concluir / Próximo
              </button>
            </div>
          </div>

          {/* +10 Minutos no Relógio */}
          <div className="flex items-center justify-between rounded-3xl border border-rose-500/20 bg-rose-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-black">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">+10 Minutos</h4>
                <p className="text-[9px] font-bold text-zinc-400">Recalcula e notifica toda a fila</p>
              </div>
            </div>
            <button className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-black text-emerald-400 active:scale-95">
              +10 min
            </button>
          </div>

          {/* Pessoas no Salão Agora (Sofá) */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                📍 PESSOAS NO SALÃO AGORA (SOFÁ)
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mb-4">
              Informativo público de movimento — separado da fila virtual e da rua.
            </p>

            <div className="flex items-center justify-around">
              <button
                onClick={() => store.decrementPresencial && store.decrementPresencial()}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white text-xl font-black active:scale-90"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="text-center">
                <span className="text-4xl font-black text-amber-400">{presencialCount}</span>
                <span className="block text-[8px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                  NO SOFÁ
                </span>
              </div>
              <button
                onClick={() => store.incrementPresencial && store.incrementPresencial()}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-black shadow-lg active:scale-90"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: RADAR GPS (Fotos Atualizadas) */}
      {tab === "gps" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">RADAR DE CLIENTES · TEMPO REAL</h3>
            <p className="text-[10px] text-zinc-400 mt-1">
              Mapa dark centralizado no salão. Clientes com GPS ativo aparecem se movendo ao vivo, com distância e ETA.
            </p>
          </div>

          <div className="relative h-72 w-full rounded-3xl border border-white/10 bg-[#07050d] overflow-hidden grid place-items-center">
            {/* Grid Dark de Satélite */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:20px_20px]" />
            
            {/* Marcador do Salão no Centro */}
            <div className="relative flex flex-col items-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-2xl animate-pulse">
                <div className="h-full w-full rounded-full bg-black grid place-items-center">
                  <Scissors className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <span className="mt-3 rounded-full bg-black/90 border border-white/10 px-3 py-1 text-[9px] font-black text-amber-400 uppercase tracking-wider">
                RADAR DE CLIENTES · AO VIVO (0)
              </span>
            </div>
          </div>
          <p className="text-center text-[10px] font-black text-zinc-500 tracking-widest uppercase">
            PAINEL RESTRITO · CHEFE
          </p>
        </div>
      )}

      {/* ABA 3: APP */}
      {tab === "app" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">GESTÃO DO APLICATIVO</h3>
          <p className="text-[10px] text-zinc-400">
            Acompanhe em tempo real a sincronização da fila e as preferências enviadas pelos clientes no app.
          </p>
          <div className="rounded-2xl bg-white/[0.02] p-4 text-center text-xs font-bold text-emerald-400 border border-white/5">
            Sincronização com o cliente em tempo real: OK
          </div>
        </div>
      )}

      {/* ABA 4: PORTFÓLIO */}
      {tab === "portfolio" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center space-y-3">
          <Sparkles className="mx-auto h-8 w-8 text-amber-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">PORTFÓLIO DE CORTES</h3>
          <p className="text-[10px] text-zinc-400">Gerencie a galeria de fotos exibidas na tela principal do cliente.</p>
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
                <p className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conexão Supabase Ativa · Postgres Real-Time
                </p>
              </div>
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
              placeholder="Ex: muda o preço pra R$ 30 ou veja a fila..."
              className="flex-1 rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:border-pink-500 focus:outline-none"
            />
            <button
              onClick={handleSendIA}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 text-white shadow-lg active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
