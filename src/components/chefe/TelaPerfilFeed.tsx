import React, { useState } from 'react';
import { 
  Instagram, 
  Video, 
  Grid, 
  MessageCircle, 
  Sparkles, 
  ChevronRight,
  Send
} from 'lucide-react';

export const TelaPerfilFeed = () => {
  const [abaAtiva, setAbaAtiva] = useState<'reels' | 'grid'>('reels');

  // Dados mockados de exemplo para Destaques
  const destaques = [
    { id: 1, titulo: 'Cortes', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150' },
    { id: 2, titulo: 'Navalha', img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150' },
    { id: 3, titulo: 'Produtos', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=150' },
    { id: 4, titulo: 'Resenha', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=150' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
      
      {/* 1. HEADER DO PERFIL (Estilo Instagram / TikTok) */}
      <header className="p-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Ch3fg8
            </h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              VERIFICADO
            </span>
          </div>
          <button className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white">
            <Instagram size={20} />
          </button>
        </div>

        {/* Foto de Perfil + Métricas */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300" 
                alt="Perfil CHEFE" 
                className="w-full h-full object-cover rounded-full border-2 border-black"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full"></span>
          </div>

          <div className="flex justify-around flex-1 text-center">
            <div>
              <p className="font-bold text-lg text-zinc-100">128</p>
              <p className="text-xs text-zinc-400">Posts</p>
            </div>
            <div>
              <p className="font-bold text-lg text-zinc-100">3.4k</p>
              <p className="text-xs text-zinc-400">Clientes</p>
            </div>
            <div>
              <p className="font-bold text-lg text-zinc-100">4.9 ★</p>
              <p className="text-xs text-zinc-400">Avaliação</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <h2 className="font-semibold text-sm text-zinc-200">CHEFE | Barbearia & Estilo</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            ✂️ Especialista em cortes de alta precisão e visagismo.
            <br />
            ⚡ Agendamento inteligente e sem filas presenciais.
          </p>
        </div>

        {/* Carrossel de Destaques (Stories) */}
        <div className="flex gap-4 overflow-x-auto pt-4 pb-2 no-scrollbar">
          {destaques.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
              <div className="w-14 h-14 rounded-full p-[1.5px] bg-zinc-700 hover:bg-emerald-500 transition-colors">
                <img 
                  src={item.img} 
                  alt={item.titulo} 
                  className="w-full h-full object-cover rounded-full border border-black"
                />
              </div>
              <span className="text-[10px] text-zinc-400">{item.titulo}</span>
            </div>
          ))}
        </div>
      </header>

      {/* 2. CARD BEM-VINDO AO CHEFE (Transferido para a Primeira Tela) */}
      <section className="p-4">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👋</span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Bem-vindo ao <span className="text-emerald-400">CHEFE</span>.
            </h3>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Criamos este espaço para deixar nosso atendimento mais <strong className="text-zinc-200">organizado, transparente e inteligente</strong>. Aqui você acompanha tudo em tempo real, sem precisar perguntar nada pelo WhatsApp.
          </p>

          <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 mt-0.5">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                O CHEFE pensa por você
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                O sistema avisa a hora exata de sair de casa, mostra a fila e atualiza seu celular automaticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEED DE MÍDIAS (Reels vs Posts) */}
      <section className="px-4 mt-2">
        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 mb-3">
          <button 
            onClick={() => setAbaAtiva('reels')}
            className={`flex-1 py-2 flex justify-center items-center gap-2 border-b-2 text-sm font-medium transition-all ${
              abaAtiva === 'reels' 
                ? 'border-emerald-400 text-emerald-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Video size={18} />
            Reels
          </button>
          <button 
            onClick={() => setAbaAtiva('grid')}
            className={`flex-1 py-2 flex justify-center items-center gap-2 border-b-2 text-sm font-medium transition-all ${
              abaAtiva === 'grid' 
                ? 'border-emerald-400 text-emerald-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid size={18} />
            Posts
          </button>
        </div>

        {/* Grade de Conteúdo */}
        {abaAtiva === 'reels' ? (
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="relative aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden group cursor-pointer border border-zinc-800/50">
                <img 
                  src={`https://images.unsplash.com/photo-1517832606589-715069686846?w=400&q=80`} 
                  alt="Reels Thumbnail" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-mono">
                    <Video size={12} className="text-emerald-400" />
                    <span>2.4k views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div key={id} className="aspect-square bg-zinc-900 rounded-lg overflow-hidden cursor-pointer border border-zinc-800/50">
                <img 
                  src={`https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300`} 
                  alt="Post Grid" 
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ATALHO DE CHAT FLUTUANTE (Estilo WhatsApp/Telegram IA) */}
      <div className="fixed bottom-20 right-4 z-40">
        <button 
          onClick={() => alert("Abre o Modal / Drawer do Chat CHEFE AI")}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black p-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-emerald-300/30"
        >
          <MessageCircle size={24} className="fill-black/10" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"></span>
        </button>
      </div>

    </div>
  );
};
