import React, { useState, type ReactNode } from 'react';
import { MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { CEOChefeChat } from './CEOChefeChat';
import { ChefeHeader } from './ChefeHeader';
import { Highlights } from './Highlights';
import { useChefeStore } from '@/lib/chefe-store';

interface TelaPerfilFeedProps {
  headerActions?: ReactNode;
  /** Carrossel de Posts & Reels renderizado logo abaixo do card institucional */
  mediaSlot?: ReactNode;
}

export const TelaPerfilFeed: React.FC<TelaPerfilFeedProps> = ({ mediaSlot }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const profile = useChefeStore((s) => s.profile);
  const portfolio = useChefeStore((s) => s.portfolio);

  const openChat = () => setChatOpen(true);

  return (
    <div className="relative w-full font-sans text-foreground">
      {/* 1. HEADER GLOBAL */}
      <ChefeHeader onOpenChat={openChat} />

      {/* 2. HEADER PERFIL (IDENTIDADE E BIO) */}
      <section className="px-4 pt-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-foreground p-[2px]">
              <img
                src={profile.avatarUrl ?? ''}
                alt={`Foto de perfil de ${profile.username}`}
                className="h-full w-full rounded-full border-2 border-background object-cover"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold">{profile.username}</h2>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                VERIFICADO
              </span>
            </div>

            <div className="mt-2 flex gap-4 text-center text-xs">
              <div>
                <strong className="block text-sm font-bold">
                  {profile.postsCount || portfolio.length}
                </strong>
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div>
                <strong className="block text-sm font-bold">{profile.cutsCount}</strong>
                <span className="text-muted-foreground">Clientes</span>
              </div>
              <div>
                <strong className="block text-sm font-bold">{profile.rating} ★</strong>
                <span className="text-muted-foreground">Avaliação</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-xs font-bold">{profile.headline}</h3>
          <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">{profile.bio}</p>
        </div>

        {/* CARROSSEL DE DESTAQUES (dinâmico · Painel) */}
        <div className="border-b border-border py-2">
          <Highlights />
        </div>
      </section>

      {/* 3. CARD INSTITUCIONAL */}
      <section className="mt-2 p-4">
        <div className="glass-strong rounded-2xl border border-border p-5 shadow-xl">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h3 className="text-lg font-bold">
              Bem-vindo ao <span className="text-foreground">CHEFE</span>.
            </h3>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            Criamos este espaço para deixar nosso atendimento mais{' '}
            <strong className="text-foreground">organizado, transparente e inteligente</strong>. Aqui
            você acompanha tudo em tempo real, sem precisar perguntar nada pelo WhatsApp.
          </p>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3.5">
            <div className="mt-0.5 rounded-lg bg-muted p-2 text-foreground">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
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

      {/* 4. CARROSSEL DE POSTS & REELS (oculto quando não há mídias) */}
      {mediaSlot}

      {/* 5. BOTÃO FLUTUANTE — COPILOTO CEOCHEFE */}
      <div className="fixed bottom-24 right-4 z-50">
        <button
          onClick={openChat}
          className="relative flex items-center justify-center rounded-full border border-border bg-foreground p-3.5 text-background shadow-2xl transition-transform active:scale-95 hover:opacity-90"
          title="CEOCHEFE - Atendimento & Copiloto IA"
          aria-label="Abrir CEOCHEFE"
        >
          <MessageCircle size={24} />
          <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-background bg-foreground" />
        </button>
      </div>

      <CEOChefeChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};
