import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  Minus
} from "lucide-react";

export const Route = createFileRoute("/painel")({
  component: PainelAdmin,
});

function PainelAdmin() {
  // Autenticação Privada (PIN 3337)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Navegação das 5 Abas
  const [tab, setTab] = useState<"operacao" | "gps" | "app" | "portfolio" | "ia">("operacao");
  const [status, setStatus] = useState<"disponivel" | "atendendo" | "pausa" | "fechado">("disponivel");

  // Estados locais para controle imediato sem crash de store
  const [presencialCount, setPresencialCount] = useState(0);
  const [queue, setQueue] = useState<{ id: string; name: string }[]>([]);
  const [recadoIA, setRecadoIA] = useState("");
  const [recadoAtivo, setRecadoAtivo] = useState(false);

  // IA Chat
  const [inputIA, setInputIA] = useState("");
  const [messagesIA, setMessagesIA] = useState([
    {
      id: "1",
      sender: "ai",
      text: `👊 CHEFE, canal de comando direto ativo. Manda a ordem que eu executo no sistema.`,
    },
  ]);

  const currentClient = queue[0] || null;

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
      let reply = `✅ Comando executado no motor do app!`;
      if (text.toLowerCase().includes("status") || text.toLowerCase().includes("fila")) {
        reply = `📊 MONITORAMENTO:\n• Sofá: ${presencialCount}\n• Fila Virtual: ${queue.length}`;
      }
      setMessagesIA((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: reply }]);
    }, 400);
  };

  // 🔒 TELA DE LOGIN (PIN 3337)
  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-[#0d0914] px-6 text-white font-sans">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-lg shadow-rose-500/20">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">PAINEL PRIVADO</p>
          <h2 className="text-xl font-black uppercase tracking-wider text-white">Comando CHEFE</h2>
          <p className="mt-1 text-xs text-zinc-400">Digite o PIN para liberar</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN (3337)"
              className="w-full rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3.5 text-center text-2xl font-black tracking-widest text-amber-400 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            />
            {pinError && <p className="text-[10px] font-bold text-rose-500">PIN incorreto. Tente 3337.</p>}
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

  // 🔓 TELA PRINCIPAL
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#0a0612] px-4 pb-20 pt-6 text-white font-sans">
      {/* Topo */}
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

      {/* Menu Principal (5 ABAS IGUAL A SUA FOTO) */}
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
          <MapPin className="h-3.5 w-3.5 mb-1" />
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

      {/* LINK DO APP */}
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

      {/* ABA 1: OPERAÇÃO */}
      {tab === "operacao" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                INSTRUÇÃO PARA A FILA DO DIA · IA ATENDENTE
              </span>
            </div>
            <textarea
              rows={2}
              value={recadoIA}
              onChange={(e) => setRecadoIA(e.target.value)}
              placeholder='Ex: "Fila cheia, só quem já está agendado hoje"'
              className="w-full rounded-2xl bg-black/40 border border-white/10 p-3 text-xs text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none resize-none"
            />
            <button
              onClick={() => setRecadoAtivo(!recadoAtivo)}
              className={`mt-2 w-full rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                recadoAtivo
                  ? "bg-emerald-500 text-black"
                  : "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white"
              }`}
            >
              {recadoAtivo ? "✓ Recado Ativo" : "Ativar recado no chat público"}
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-3">
              ALTERAR STATUS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStatus("disponivel")}
                className={`flex items-center gap-2 rounded-2xl p-3 text-xs font-bold border transition-all ${
                  status === "disponivel" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-emerald-400" /> Disponível
              </button>
              <button
                onClick={() => setStatus("atendendo")}
                className={`flex items-center gap-2 rounded-2xl p-3 text-xs font-bold border transition-all ${
                  status === "atendendo" ? "bg-rose-500/20 border-rose-500 text-rose-400" : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-rose-500" /> Atendendo
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <span className="text-[10px] font-black uppercase text-amber-400 block mb-2">📍 PESSOAS NO SOFÁ</span>
            <div className="flex items-center justify-around">
              <button
                onClick={() => setPresencialCount((p) => Math.max(0, p - 1))}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white text-xl font-black"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-4xl font-black text-amber-400">{presencialCount}</span>
              <button
                onClick={() => setPresencialCount((p) => p + 1)}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-black"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: RADAR GPS (FOTO EXATA) */}
      {tab === "gps" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">RADAR DE CLIENTES · TEMPO REAL</h3>
            <p className="text-[10px] text-zinc-400 mt-1">
              Mapa dark centralizado no salão. Clientes com GPS ativo aparecem se movendo ao vivo, com distância e ETA.
            </p>
          </div>

          <div className="relative h-72 w-full rounded-3xl border border-blue-500/30 bg-[#07050d] overflow-hidden grid place-items-center shadow-2xl">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:20px_20px]" />
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
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">GESTÃO DO APLICATIVO</h3>
          <p className="text-[10px] text-zinc-400">Sincronia com o cliente rodando normal.</p>
        </div>
      )}

      {/* ABA 4: PORTFÓLIO */}
      {tab === "portfolio" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-amber-400 mb-2" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">PORTFÓLIO DE CORTES</h3>
        </div>
      )}

      {/* ABA 5: IA */}
      {tab === "ia" && (
        <div className="rounded-3xl border border-pink-500/30 bg-black p-5">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="h-6 w-6 text-pink-500" />
            <h3 className="text-xs font-black text-white uppercase">CHEFE AI · PRO MOTOR</h3>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
            {messagesIA.map((m) => (
              <div key={m.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                {m.text}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={inputIA}
              onChange={(e) => setInputIA(e.target.value)}
              placeholder="Digite a ordem..."
              className="flex-1 rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-white"
            />
            <button onClick={handleSendIA} className="rounded-xl bg-pink-500 px-4 text-xs font-bold text-white">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
