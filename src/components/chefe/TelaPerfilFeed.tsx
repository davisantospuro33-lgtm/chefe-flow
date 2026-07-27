       import React, { useState } from 'react';
import { Video, Grid, MessageCircle, Sparkles } from 'lucide-react';

interface TelaPerfilFeedProps {
  // Recebe os posts do seu backend/painel. Se estiver vazio, oculta a área automaticamente!
  reelsList?: any[];
  postsList?: any[];
  onOpenChatIA?: () => void; // Função para abrir o Cérebro de Atendimento
}

export const TelaPerfilFeed: React.FC<TelaPerfilFeedProps> = ({
  reelsList = [], // Caso você tenha posts no painel, passe o array aqui
  postsList = [],
  onOpenChatIA
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'reels' | 'grid'>('reels');

  // Destaques fixos salvos
  const destaques = [
    { id: 1, titulo: 'Cortes', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150' },
    { id: 2, titulo: 'Navalha', img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150' },
    { id: 3, titulo: 'Produtos', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=150' },
    { id: 4, titulo: 'Resenha', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=150' },
  ];

  const temConteudoPublicado = reelsList.length > 0 || postsList.length > 0;

  return (
    <div className="w-full text-white font-sans">
      
      {/* 1. PERFIL E BIO ORIGINAL (Mantido idêntico) */}
      <section className="px-4 pt-2">
        {/* Carrossel de Destaques (Stories Salvos) */}
        <div className="flex gap-4 overflow-x-auto py-3 no-scrollbar border-b border-zinc-800/60">
          {destaques.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
              <div className="w-16 h-16 rounded-full p-[2px] bg-zinc-800 hover:border-emerald-500 transition-all">
                <img 
                  src={item.img} 
                  alt={item.titulo} 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">{item.titulo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. CARD BEM-VINDO AO CHEFE (Estrutura Fiel Original) */}
      <section className="p-4">
        <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👋</span>
            <h3 className="text-lg font-bold text-white">
              Bem-vindo ao <span className="text-emerald-400">CHEFE</span>.
            </h3>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Criamos este espaço para deixar nosso atendimento mais <strong className="text-zinc-200">organizado, transparente e inteligente</strong>. Aqui você acompanha tudo em tempo real, sem precisar perguntar nada pelo WhatsApp.
          </p>

          <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 flex items-start gap-3">
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

      {/* 3. REELS / POSTS (Aparece APENAS se houver postagens publicadas) */}
      {temConteudoPublicado && (
        <section className="px-4 mt-2">
          {/* Seletor de Abas */}
          <div className="flex border-b border-zinc-800 mb-3">
            <button 
              onClick={() => setAbaAtiva('reels')}
              className={`flex-1 py-2.5 flex justify-center items-center gap-2 border-b-2 text-sm font-semibold transition-all ${
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
              className={`flex-1 py-2.5 flex justify-center items-center gap-2 border-b-2 text-sm font-semibold transition-all ${
                abaAtiva === 'grid' 
                  ? 'border-emerald-400 text-emerald-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Grid size={18} />
              Posts
            </button>
          </div>

          {/* Renderização dos Mídias */}
          {abaAtiva === 'reels' ? (
            <div className="grid grid-cols-2 gap-2.5">
              {reelsList.map((item, index) => (
                <div key={index} className="relative aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                  <img src={item.url || item.thumb} alt="Reels" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {postsList.map((item, index) => (
                <div key={index} className="aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                  <img src={item.url} alt="Post" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. CHAT DIRETO - VINCULADO AO CHEFE IA CÉREBRO DE ATENDIMENTO */}
      <div className="fixed bottom-6 right-4 z-50">
        <button 
          onClick={onOpenChatIA}
          title="Falar com o CHEFE AI"
          className="bg-emerald-500 hover:bg-emerald-400 text-black p-3.5 rounded-full shadow-2xl transition-transform active:scale-90 flex items-center justify-center border border-emerald-300/40"
        >
          <MessageCircle size={24} className="fill-black" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"></span>
        </button>
      </div>

    </div>
  );
};       
