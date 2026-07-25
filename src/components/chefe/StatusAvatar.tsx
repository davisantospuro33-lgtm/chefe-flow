import React, { useState, useEffect } from 'react';

export type ChefeStatusMode = 'disponivel' | 'atendendo' | 'pausa' | 'encerrado';

interface StatusAvatarProps {
  status?: ChefeStatusMode;
  onAudioPlay?: () => void;
}

export const StatusAvatar: React.FC<StatusAvatarProps> = ({ status = 'disponivel' }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Configuração visual e falas do Chefe de acordo com o status
  const statusConfig = {
    disponivel: {
      label: 'DISPONÍVEL AGORA',
      subtext: 'Chefe livre! Chegue e corte.',
      color: '#00ff88',
      bgGlow: 'rgba(0, 255, 136, 0.15)',
      borderColor: 'border-emerald-500/50',
      badgeBg: 'bg-emerald-500/20 text-emerald-400',
      voiceText: 'Salão tranquilo! Chefe livre para te atender agora. Só chegar!',
      icon: '⚡',
      scannerColor: '#00ff88',
    },
    atendendo: {
      label: 'ATENDENDO NO MOMENTO',
      subtext: 'Foco total no corte atual.',
      color: '#00e5ff',
      bgGlow: 'rgba(0, 229, 255, 0.15)',
      borderColor: 'border-cyan-500/50',
      badgeBg: 'bg-cyan-500/20 text-cyan-400',
      voiceText: 'Chefe concentrado na cadeira agora. Acompanhe a fila em tempo real!',
      icon: '✂️',
      scannerColor: '#00e5ff',
    },
    pausa: {
      label: 'PAUSA RÁPIDA',
      subtext: 'Recarregando as energias. Volto já!',
      color: '#ffb700',
      bgGlow: 'rgba(255, 183, 0, 0.15)',
      borderColor: 'border-amber-500/50',
      badgeBg: 'bg-amber-500/20 text-amber-400',
      voiceText: 'Pausa rápida para alinhar a rotina. Em instantes retorno aos cortes.',
      icon: '☕',
      scannerColor: '#ffb700',
    },
    encerrado: {
      label: 'ATENDIMENTO ENCERRADO',
      subtext: 'Agenda fechada por hoje.',
      color: '#ff2a5f',
      bgGlow: 'rgba(255, 42, 95, 0.15)',
      borderColor: 'border-rose-500/50',
      badgeBg: 'bg-rose-500/20 text-rose-400',
      voiceText: 'Atendimentos encerrados por hoje, chefe. Garanta seu horário para amanhã!',
      icon: '🌙',
      scannerColor: '#ff2a5f',
    },
  };

  const current = statusConfig[status];

  // Sintetizador de Voz Futurista / Hacker (Web Speech API)
  const speakStatus = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Para fala anterior se houver
      const utterance = new SpeechSynthesisUtterance(current.voiceText);
      utterance.lang = 'pt-BR';
      utterance.pitch = 0.8; // Voz mais grave/elegante de Chefe
      utterance.rate = 1.0;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl p-4 transition-all duration-500 border ${current.borderColor} overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.95) 100%)`,
        boxShadow: `0 8px 32px 0 ${current.bgGlow}`,
      }}
    >
      {/* Luz de Fundo e Aura Pulsante */}
      <div
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ background: current.color, opacity: 0.2 }}
      />

      <div className="relative z-10 flex items-center gap-4">
        {/* AVATAR DO PERSONAGEM (TERNO PRETO + ÓCULOS + ANIMAÇÕES) */}
        <div
          onClick={speakStatus}
          className="relative flex-shrink-0 cursor-pointer group"
          title="Clique para ouvir o Chefe"
        >
          {/* Anel de Radar / Pulso Futurista */}
          <div
            className="absolute -inset-1.5 rounded-2xl opacity-75 blur-sm animate-pulse transition-all duration-500"
            style={{ background: current.color }}
          />

          {/* Container do Avatar */}
          <div className="relative w-20 h-20 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
            {/* SVG do Personagem Chefe (Terno Preto + Óculos Escuros) */}
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              {/* Fundo interno */}
              <rect width="100" height="100" fill="#090d16" />

              {/* Terno Preto Elegante */}
              <path d="M20 90 L35 52 L50 65 L65 52 L80 90 Z" fill="#111827" />
              <path d="M38 55 L50 78 L62 55 L50 65 Z" fill="#1f2937" />
              {/* Gravata / Camisa */}
              <path d="M47 55 L53 55 L52 70 L50 73 L48 70 Z" fill={current.color} />

              {/* Rosto / Silhueta */}
              <circle cx="50" cy="38" r="18" fill="#d1d5db" />

              {/* Óculos Escuros de Chefe */}
              <rect x="35" y="32" width="13" height="8" rx="2" fill="#000" />
              <rect x="52" y="32" width="13" height="8" rx="2" fill="#000" />
              <line x1="48" y1="35" x2="52" y2="35" stroke="#000" strokeWidth="2" />

              {/* Varredura Laser nos Óculos (Scanner Vivo) */}
              <line
                x1="35"
                y1="36"
                x2="65"
                y2="36"
                stroke={current.scannerColor}
                strokeWidth="1.5"
                className="animate-pulse"
                style={{
                  filter: `drop-shadow(0 0 4px ${current.scannerColor})`,
                }}
              />
            </svg>

            {/* Ícone de Áudio Falando */}
            {isPlayingAudio && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <span className="flex h-3 w-3 relative">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: current.color }}
                  ></span>
                  <span
                    className="relative inline-flex rounded-full h-3 w-3"
                    style={{ background: current.color }}
                  ></span>
                </span>
              </div>
            )}
          </div>

          {/* Badge de micro status no canto do avatar */}
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px]"
            style={{ background: current.color, color: '#000' }}
          >
            {current.icon}
          </div>
        </div>

        {/* INFORMAÇÕES DO STATUS EM TEMPO REAL */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${current.badgeBg}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ background: current.color }}
              />
              {current.label}
            </span>
          </div>

          <h3 className="text-base font-black text-white tracking-tight truncate">
            {current.subtext}
          </h3>

          <button
            onClick={speakStatus}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: current.color }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span>{isPlayingAudio ? 'Chefe falando...' : 'Ouvir mensagem do Chefe'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
