import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Terminal, 
  Sliders, 
  Lock, 
  Unlock, 
  Bot, 
  Send,
  Zap,
  TrendingUp,
  ShieldCheck,
  Building2
} from 'lucide-react'

export const Route = createFileRoute('/painel')({
  component: PainelPage,
})

function PainelPage() {
  const [pin, setPin] = useState('')
  const [autenticado, setAutenticado] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'operacional' | 'radar' | 'portfolio' | 'comandos' | 'ia'>('operacional')

  // Autenticação simples por PIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === '3337') {
      setAutenticado(true)
    } else {
      alert('PIN incorreto!')
    }
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 w-full max-w-sm space-y-4">
          <div className="flex items-center justify-center gap-2 text-xl font-bold">
            <Lock className="w-6 h-6 text-emerald-500" />
            <span>Acesso ao Painel</span>
          </div>
          <input
            type="password"
            placeholder="Digite o PIN (3337)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Cabeçalho */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <h1 className="font-bold text-lg">Painel de Controle - Chefe Flow</h1>
        </div>
        <button
          onClick={() => setAutenticado(false)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50"
        >
          <Unlock className="w-5 h-5" />
        </button>
      </header>

      {/* Navegação de Abas */}
      <nav className="flex border-b border-slate-800 bg-slate-900/30 overflow-x-auto">
        <button
          onClick={() => setAbaAtiva('operacional')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
            abaAtiva === 'operacional' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" /> Operacional
        </button>
        <button
          onClick={() => setAbaAtiva('radar')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
            abaAtiva === 'radar' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'
          }`}
        >
          <MapPin className="w-4 h-4" /> Radar GPS
        </button>
        <button
          onClick={() => setAbaAtiva('portfolio')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
            abaAtiva === 'portfolio' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Portfólio
        </button>
        <button
          onClick={() => setAbaAtiva('comandos')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
            abaAtiva === 'comandos' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'
          }`}
        >
          <Terminal className="w-4 h-4" /> Comandos
        </button>
        <button
          onClick={() => setAbaAtiva('ia')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
            abaAtiva === 'ia' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'
          }`}
        >
          <Bot className="w-4 h-4" /> Cérebro IA
        </button>
      </nav>

      {/* Conteúdo das Abas */}
      <main className="flex-1 p-4 max-w-4xl w-full mx-auto">
        {abaAtiva === 'operacional' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-emerald-500" /> Gestão Operacional
            </h2>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-400">Contador de Pessoas / Sofá / Presença ativa</p>
              <div className="mt-4 text-3xl font-bold text-emerald-400">0 Ativos</div>
            </div>
          </div>
        )}

        {abaAtiva === 'radar' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-emerald-500" /> Radar GPS
            </h2>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-400">Localização e monitoramento territorial</p>
            </div>
          </div>
        )}

        {abaAtiva === 'portfolio' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="text-emerald-500" /> Portfólio & Negócios
            </h2>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-400">Métricas e acompanhamento de projetos</p>
            </div>
          </div>
        )}

        {abaAtiva === 'comandos' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Terminal className="text-emerald-500" /> Console de Comandos
            </h2>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-400">Envio de comandos diretos para o sistema</p>
            </div>
          </div>
        )}

        {abaAtiva === 'ia' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bot className="text-emerald-500" /> Cérebro IA
            </h2>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-400">Ajustes finos do assistente e regras de automação</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default PainelPage
