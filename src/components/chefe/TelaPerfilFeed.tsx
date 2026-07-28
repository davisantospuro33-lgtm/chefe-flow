import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Grid, 
  Video, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  MapPin, 
  Calendar,
  X,
  CheckCircle2,
  ChevronRight,
  Flame
} from 'lucide-react';

interface TelaPerfilFeedProps {
  onOpenChat?: () => void;
  onOpenStories?: (id: string) => void;
}

export const TelaPerfilFeed: React.FC<TelaPerfilFeedProps> = ({ onOpenChat, onOpenStories }) => {
  // Estados sincronizados com o Painel Administrativo (Supabase / Mock seguro)
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');
  const [profileData, setProfileData] = useState({
    name: 'Ch3fg8',
    username: 'chefe_oficial',
    verified: true,
    postsCount: 128,
    clientsCount: '3.4K',
    rating: '4.9',
    bio: 'Especialista em cortes de alta precisão e visagismo.',
    status: 'Disponível', // Disponível, Atendendo, Pausa, Encerrado
    statusColor: 'bg-emerald-500',
    serviceName: 'Corte CHEFE',
    servicePrice: 'R$ 25,00',
    serviceDuration: '40 min',
    salonStatus: 'Salão tranquilo.',
    queueCount: 0
  });

  // Destaques (Renderizados apenas se houver itens)
  const [highlights, setHighlights] = useState([
    { id: '1', title: 'Cortes', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=150' },
    { id: '2', title: 'Navalha', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150' },
    { id: '3', title: 'Produtos', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=150' },
    { id: '4', title: 'Resenha', image: 'https://images.unsplash.com/photo-1517832606293-7ae2a7620a27?w=150' },
  ]);

  // Mídias (Posts e Reels)
  const [posts, setPosts] = useState([
    { id: 'p1', type: 'image', url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500' },
    { id: 'p2', type: 'image', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500' },
  ]);

  const [reels, setReels] = useState([
    { id: 'r1', type: 'video', url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500' }
  ]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white pb-24 font-sans antialiased selection:bg-emerald-500 selection:text-black">
      
      {/* 1. HEADER DO PERFIL */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 bg-clip-text text-transparent">
            CHEFE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenChat}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-all shadow-lg active:scale-95"
            title="Chat CEOCHEFE"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </div>
      </header>

      {/* PERFIL INFO */}
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 via-amber-400 to-indigo-600 animate-pulse">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300" 
                alt="Perfil" 
                className="w-full h-full rounded-full object-cover border-2 border-[#0b0f19]"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0b0f19] rounded-full"></span>
          </div>

          <div className="flex justify-around flex-1 ml-6 text-center">
            <div>
              <div className="font-bold text-lg">{profileData.postsCount}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
            <div>
              <div className="font-bold text-lg">{profileData.clientsCount}</div>
              <div className="text-xs text-gray-400">Clientes</div>
            </div>
            <div>
              <div className="font-bold text-lg flex items-center justify-center gap-1">
                {profileData.rating} <span className="text-amber-400 text-xs">★</span>
              </div>
              <div className="text-xs text-gray-400">Avaliação</div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-lg">{profileData.name}</h1>
            {profileData.verified && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFICADO
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-1">
            <span className="text-emerald-400 font-medium">CHEFE | Barbearia & Estilo</span> • {profileData.bio}
          </p>
        </div>

        {/* 4. DESTAQUES (Renderiza APENAS se houver itens) */}
        {highlights.length > 0 && (
          <div className="mt-5 flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {highlights.map((item) => (
              <button 
                key={item.id} 
                onClick={() => onOpenStories && onOpenStories(item.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-amber-400 group-hover:scale-105 transition-transform">
                  <img src={item.image} alt={item.title} className="w-full h-full rounded-full object-cover border-2 border-[#0b0f19]" />
                </div>
                <span className="text-[11px] text-gray-300 font-medium">{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. CARD DE APRESENTAÇÃO: BEM-VINDO AO CHEFE */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👋</span>
            <h2 className="font-bold text-base text-white">Bem-vindo ao <span className="text-emerald-400">CHEFE</span>.</h2>
          </div>
          
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            Criamos este espaço para deixar nosso atendimento mais <strong className="text-white">organizado, transparente e inteligente</strong>. Aqui você acompanha tudo em tempo real, sem precisar perguntar nada pelo WhatsApp.
          </p>

          <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400 border border-emerald-500/20 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 mb-0.5">O CHEFE PENSA POR VOCÊ</div>
              <p className="text-[11px] text-gray-400 leading-normal">
                O sistema avisa a hora exata de sair de casa, calcula a fila e atualiza seu celular automaticamente com total visão de status.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SERVIÇO PRINCIPAL */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-emerald-950/20 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
          <div>
            <div className="text-[10px] tracking-wider text-amber-400 font-bold uppercase mb-0.5">Serviço Principal</div>
            <div className="font-bold text-sm text-white">{profileData.serviceName}</div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>{profileData.serviceDuration}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{profileData.servicePrice}</span>
            </div>
          </div>
          <button 
            onClick={onOpenChat}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1 active:scale-95"
          >
            Pedir Encaixe <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. ABAS DE CONTEÚDO (POSTS E REELS - LOGO ABAIXO DO CARD DE BEM-VINDO) */}
      <div className="mt-6 border-t border-white/5">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${
              activeTab === 'posts' ? 'text-white font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Grid className="w-4 h-4" />
            {activeTab === 'posts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${
              activeTab === 'reels' ? 'text-white font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Video className="w-4 h-4" />
            {activeTab === 'reels' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
            )}
          </button>
        </div>

        {/* CONTAINER DE MÍDIAS (Oculta automaticamente se vazio) */}
        <div className="p-2">
          {activeTab === 'posts' && posts.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {posts.map((post) => (
                <div key={post.id} className="aspect-square bg-white/5 rounded-lg overflow-hidden group relative cursor-pointer">
                  <img src={post.url} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reels' && reels.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {reels.map((reel) => (
                <div key={reel.id} className="aspect-[9/16] bg-white/5 rounded-lg overflow-hidden group relative cursor-pointer">
                  <img src={reel.url} alt="Reel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          )}

          {((activeTab === 'posts' && posts.length === 0) || (activeTab === 'reels' && reels.length === 0)) && (
            <div className="py-12 text-center text-gray-500 text-xs">
              Nenhuma publicação encontrada no painel.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
