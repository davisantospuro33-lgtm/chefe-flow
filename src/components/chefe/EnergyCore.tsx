import React, { useState, useEffect, useRef } from 'react';

export const EnergyCore: React.FC = () => {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  // MOTOR SONORO PSICODÉLICO E VIBRACIONAL (WEB AUDIO API + LFO)
  const toggleAudio = () => {
    if (typeof window === 'undefined') return;

    if (!isAudioActive) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // Oscilador Principal (432Hz - Frequência de Alta Vibração)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // LFO (Oscilador de Baixa Frequência para efeito Psicodélico/Portal)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2, ctx.currentTime); // Ondulação de 2Hz
      lfoGain.gain.setValueAtTime(15, ctx.currentTime); // Variação da frequência

      // Conexões
      lfo.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.06, ctx.currentTime); // Volume equilibrado

      osc.start();
      lfo.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      lfoRef.current = lfo;
      setIsAudioActive(true);
    } else {
      if (oscRef.current) oscRef.current.stop();
      if (lfoRef.current) lfoRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
      setIsAudioActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (oscRef.current) oscRef.current.stop();
      if (lfoRef.current) lfoRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#05050d]/90 p-6 backdrop-blur-xl my-4 border border-transparent [background-clip:padding-box,_border-box] [background-origin:border-box] [background-image:linear-gradient(to_bottom_right,#05050d,#080714),conic-gradient(from_0deg,#FF007A,#8B00FF,#00E5FF,#00FF66,#FF007A)] shadow-[0_0_35px_rgba(139,0,255,0.35)]">
      
      {/* NÚCLEO QUÂNTICO / PORTAL DO UNIVERSO FLUTUANTE (SEM CÁPSULA) */}
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none flex items-center justify-center">
        
        {/* Glow Radiante Cósmico no Fundo */}
        <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-[#FF007A] via-[#8B00FF] to-[#00FF66] opacity-30 blur-2xl animate-pulse" />

        {/* Órbita 1 - Rosa Shock */}
        <svg className="absolute w-44 h-44 animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#FF007A" strokeWidth="1.5" strokeDasharray="6 3" className="drop-shadow-[0_0_8px_#FF007A]" />
        </svg>

        {/* Órbita 2 - Roxo / Azul Cyber (Inclinada) */}
        <svg className="absolute w-44 h-44 animate-[spin_12s_linear_infinite_reverse] rotate-45" viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="8 4" className="drop-shadow-[0_0_8px_#00E5FF]" />
        </svg>

        {/* Órbita 3 - Verde Neon (Cruzada) */}
        <svg className="absolute w-44 h-44 animate-[spin_10s_linear_infinite] -rotate-45" viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="4 2" className="drop-shadow-[0_0_8px_#00FF66]" />
        </svg>

        {/* Centro Brilhante de Alta Densidade (O Coração da Energia) */}
        <div className="relative w-10 h-10 rounded-full bg-white shadow-[0_0_25px_#fff,0_0_50px_#00FF66,0_0_75px_#FF007A] animate-ping opacity-75" />
        <div className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-[#00FF66] via-white to-[#00E5FF] shadow-[0_0_20px_#00FF66]" />
      </div>

      {/* CABEÇALHO DO NÚCLEO */}
      <div className="flex items-center justify-between mb-3 relative z-10 pr-36">
        <span className="text-[9px] font-black tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-[#FF007A]/20 via-[#8B00FF]/20 to-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 shadow-[0_0_12px_rgba(0,255,102,0.3)] animate-pulse">
          ⚡ NÚCLEO CHEFE VIVO
        </span>
      </div>

      {/* TÍTULO PRINCIPAL */}
      <div className="relative z-10 pr-32 mb-4">
        <h3 className="text-xl font-black text-white tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(0,229,255,0.5)]">
          MATÉRIA EM <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] via-[#00E5FF] via-[#8B00FF] to-[#FF007A]">
            EXPANSÃO CÓSMICA
          </span>
        </h3>
        <p className="text-[10px] text-gray-300 font-medium mt-1">
          Sincronia de alta frequência & Portal do Universo
        </p>
      </div>

      {/* CONTROLE SONORO PSICODÉLICO */}
      <div className="relative z-10 mb-4">
        <button
          onClick={toggleAudio}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 border ${
            isAudioActive
              ? 'bg-gradient-to-r from-[#00FF66]/20 to-[#00E5FF]/20 border-[#00FF66] text-[#00FF66] shadow-[0_0_15px_#00FF66]'
              : 'bg-white/5 border-white/15 text-gray-300 hover:text-white hover:border-white/30'
          }`}
        >
          {isAudioActive ? '🌀 PORTAL SONORO ATIVO (432Hz LFO)' : '🔊 ATIVAR FREQUÊNCIA DO PORTAL'}
        </button>
      </div>

      {/* METRICAS DO NÚCLEO */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        <div className="bg-black/60 border border-[#00FF66]/30 rounded-xl p-2 text-center backdrop-blur-md shadow-[0_0_10px_rgba(0,255,102,0.1)]">
          <p className="text-[8px] font-black text-[#00FF66] tracking-wider uppercase">FREQUÊNCIA</p>
          <p className="text-xs font-black text-white mt-0.5">432 Hz</p>
          <p className="text-[7px] text-gray-400">LUZ RADIANTE</p>
        </div>

        <div className="bg-black/60 border border-[#00E5FF]/30 rounded-xl p-2 text-center backdrop-blur-md shadow-[0_0_10px_rgba(0,229,255,0.1)]">
          <p className="text-[8px] font-black text-[#00E5FF] tracking-wider uppercase">MOVIMENTO</p>
          <p className="text-xs font-black text-white mt-0.5">CONTINUO</p>
          <p className="text-[7px] text-gray-400">FLUXO VIVO</p>
        </div>

        <div className="bg-black/60 border border-[#FF007A]/30 rounded-xl p-2 text-center backdrop-blur-md shadow-[0_0_10px_rgba(255,0,122,0.1)]">
          <p className="text-[8px] font-black text-[#FF007A] tracking-wider uppercase">ENERGIA</p>
          <p className="text-xs font-black text-white mt-0.5">PORTAL</p>
          <p className="text-[7px] text-gray-400">UNIVERSO</p>
        </div>
      </div>

    </div>
  );
};
