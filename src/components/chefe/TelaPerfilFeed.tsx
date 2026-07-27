import React, { useState, type ReactNode } from 'react';
import { MessageCircle, Video, Grid, Sparkles, Send } from 'lucide-react';

export interface MediaItem {
  id: string;
  type: 'reel' | 'post';
  url: string;
  views?: string;
}

interface TelaPerfilFeedProps {
  reels?: MediaItem[];
  posts?: MediaItem[];
  headerActions?: ReactNode;
  onOpenChatCentral?: () => void;
  onOpenCEOCHEFE?: () => void;
}

export const TelaPerfilFeed: React.FC<TelaPerfilFeedProps> = ({
  reels = [],
  posts = [],
  headerActions,
  onOpenChatCentral,
  onOpenCEOCHEFE,
}) => {
  const [activeTab, setActiveTab] = useState<'reels' | 'posts'>('reels');

  const hasContent = reels.length > 0 || posts.length > 0;

  const destaques = [
    { id: 1, title: 'Cortes', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150' },
    { id: 2, title: 'Navalha', img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150' },
    { id: 3, title: 'Produtos', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=150' },
    { id: 4, title: 'Resenha', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=150' },
  ];

  return (
    <div className="relative w-full font-sans text-foreground">
      {/* 1. HEADER TOPO COM ÍCONE DE MENSAGEM (CHAT DIRETO & CEOCHEFE) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md">
        <h1 className="text-xl font-black tracking-wider">
          <span className="text-gradient-ig">CHEFE</span>
        </h1>
        <div className="flex items-center gap-2">
          {headerActions}
          <button
            onClick={onOpenChatCentral}
            className="relative rounded-full bg-muted/60 p-2 text-emerald-400 transition-all hover:bg-muted"
            title="Abrir Chat & Resenha com CEOCHEFE"
            aria-label="Abrir chat com o CEOCHEFE"
          >
            <Send size={20} />
            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </button>
        </div>
      </header>

      {/* 2. HEADER PERFIL (IDENTIDADE E BIO) */}
      <section className="px-4 pt-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400 p-[2px]">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
                alt="Foto de perfil do Ch3fg8"
                className="h-full w-full rounded-full border-2 border-background object-cover"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold">Ch3fg8</h2>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                VERIFICADO
              </span>
            </div>

            <div className="mt-2 flex gap-4 text-center text-xs">
              <div>
                <strong className="block text-sm font-bold">128</strong>
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div>
                <strong className="block text-sm font-bold">3.4K</strong>
                <span className="text-muted-foreground">Clientes</span>
              </div>
              <div>
                <strong className="block text-sm font-bold">4.9 ★</strong>
                <span className="text-muted-foreground">Avaliação</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-xs font-bold">CHEFE | Barbearia &amp; Estilo</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            🧿 🪬 👁️ Especialista em cortes de alta precisão e visagismo.
          </p>
        </div>

        {/* CARROSSEL DE DESTAQUES */}
        <div className="no-scrollbar flex gap-4 overflow-x-auto border-b border-border/60 py-4">
          {destaques.map((item) => (
            <button
              key={item.id}
              className="flex flex-shrink-0 cursor-pointer flex-col items-center gap-1"
            >
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[2px]">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full rounded-full border-2 border-background object-cover"
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{item.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. MÍDIAS DINÂMICAS: APENAS ÍCONES */}
      {hasContent && (
        <section className="mt-2 px-4">
          <div className="mb-3 flex border-b border-border/60">
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex flex-1 items-center justify-center border-b-2 py-2.5 transition-all ${
                activeTab === 'reels'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-muted-foreground'
              }`}
              title="Reels"
              aria-label="Reels"
            >
              <Video size={22} />
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex flex-1 items-center justify-center border-b-2 py-2.5 transition-all ${
                activeTab === 'posts'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-muted-foreground'
              }`}
              title="Posts"
              aria-label="Posts"
            >
              <Grid size={22} />
            </button>
          </div>

          {activeTab === 'reels' ? (
            <div className="grid grid-cols-2 gap-2">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className="relative aspect-[9/16] overflow-hidden rounded-xl border border-border/60 bg-muted/40"
                >
                  <img src={reel.url} alt="Reel do CHEFE" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted/40"
                >
                  <img src={post.url} alt="Post do CHEFE" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. CARD INSTITUCIONAL */}
      <section className="mt-2 p-4">
        <div className="glass-strong rounded-2xl border border-white/10 p-5 shadow-xl">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h3 className="text-lg font-bold">
              Bem-vindo ao <span className="text-emerald-400">CHEFE</span>.
            </h3>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            Criamos este espaço para deixar nosso atendimento mais{' '}
            <strong className="text-foreground">organizado, transparente e inteligente</strong>. Aqui
            você acompanha tudo em tempo real, sem precisar perguntar nada pelo WhatsApp.
          </p>
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3.5">
            <div className="mt-0.5 rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                O CHEFE pensa por você
              </h4>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                O sistema avisa a hora exata de sair de casa, calcula a fila e atualiza seu celular
                automaticamente com total visão de status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTÃO FLUTUANTE — COPILOTO CEOCHEFE */}
      <div className="fixed bottom-6 right-4 z-50">
        <button
          onClick={onOpenCEOCHEFE}
          className="relative flex items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500 p-3.5 text-black shadow-2xl transition-transform active:scale-95 hover:bg-emerald-400"
          title="CEOCHEFE - Atendimento & Copiloto IA"
          aria-label="Abrir CEOCHEFE"
        >
          <MessageCircle className="fill-black" size={24} />
          <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-background bg-cyan-400" />
        </button>
      </div>
    </div>
  );
};
