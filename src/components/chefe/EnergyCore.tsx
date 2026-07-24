import React, { useEffect, useRef, useState } from 'react';

export const EnergyCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  // SINTETIZADOR PSICODÉLICO VIBRACIONAL 432HZ
  const toggleAudio = () => {
    if (typeof window === 'undefined') return;

    if (!isAudioActive) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfoGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.8, ctx.currentTime);
      lfoGain.gain.setValueAtTime(16, ctx.currentTime);

      lfo.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);

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

  // MOTOR GRÁFICO WEBGL / CANVAS 3D INTERATIVO
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Paleta Neon Chefe: Verde Neon, Rosa Shock, Roxo Cyber, Azul Elétrico
    const colors = ['#00FF66', '#FF007A', '#8B00FF', '#00E5FF'];

    // Partículas da Poeira Cósmica
    const numParticles = 100;
    const particles = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      size: Math.random() * 2.5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 0.8,
    }));

    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleInteraction = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - width / 2;
      const y = clientY - rect.top - height / 2;
      targetRotY = (x / width) * 2.5;
      targetRotX = -(y / height) * 2.5;
    };

    const onMouseMove = (e: MouseEvent) => handleInteraction(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove);

    let angle = 0;

    // LOOP DE RENDERIZAÇÃO 3D EM ALTA DEFINIÇÃO
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;
      angle += 0.025;

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. GLOW RADIANTE DE FUNDO
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, width * 0.45);
      bgGlow.addColorStop(0, 'rgba(139, 0, 255, 0.4)');
      bgGlow.addColorStop(0.4, 'rgba(0, 255, 102, 0.2)');
      bgGlow.addColorStop(0.8, 'rgba(255, 0, 122, 0.1)');
      bgGlow.addColorStop(1, 'rgba(5, 5, 13, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. ÓRBITAS 3D MULTIDIMENSIONAIS
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle * (i % 2 === 0 ? 1.2 : -1.2) + rotY);
        ctx.scale(1, 0.3 + Math.sin(angle + i) * 0.15);

        ctx.beginPath();
        ctx.arc(0, 0, 65 + i * 20, 0, Math.PI * 2);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2.2;
        ctx.shadowColor = colors[i % colors.length];
        ctx.shadowBlur = 15;
        ctx.setLineDash([15, 10]);
        ctx.stroke();
        ctx.restore();
      }

      // 3. NÚCLEO CENTRAL RADIANTE (MATÉRIA EXPANDIDA)
      ctx.save();
      ctx.translate(centerX, centerY);
      const pulseSize = 32 + Math.sin(angle * 3) * 5;
      const coreGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, pulseSize);
      coreGlow.addColorStop(0, '#FFFFFF');
      coreGlow.addColorStop(0.25, '#00FF66');
      coreGlow.addColorStop(0.6, '#FF007A');
      coreGlow.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = coreGlow;
      ctx.shadowColor = '#00FF66';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. CAMPO DE PARTÍCULAS EM PERSPECTIVA FLUTUANTE
      particles.forEach((p) => {
        p.z -= p.speed;
        if (p.z <= 0) p.z = width;

        const k = 280 / p.z;
        const px = p.x * k + centerX + rotY * 15;
        const py = p.y * k + centerY + rotX * 15;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = 1 - p.z / width;
          ctx.beginPath();
          ctx.arc(px, py, p.size * k * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div className="relative w-full h-80 rounded-3xl bg-[#05050d]/95 overflow-hidden my-4 border border-transparent [background-clip:padding-box,_border-box] [background-origin:border-box] [background-image:linear-gradient(to_bottom_right,#05050d,#080714),conic-gradient(from_0deg,#FF007A,#8B00FF,#00E5FF,#00FF66,#FF007A)] shadow-[0_0_40px_rgba(139,0,255,0.4)]">
      
      {/* CANVAS 3D DO PORTAL DO UNIVERSO */}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* BOTÃO DISCRETO DE SOM 432HZ */}
      <button
        onClick={toggleAudio}
        className={`absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider transition-all duration-300 border backdrop-blur-md ${
          isAudioActive
            ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66] shadow-[0_0_15px_#00FF66] animate-pulse'
            : 'bg-black/60 border-white/20 text-gray-300 hover:text-white'
        }`}
      >
        {isAudioActive ? '🌀 PORTAL 432Hz ATIVO' : '🔊 SINCRO SONORA'}
      </button>

      {/* BADGE DISCRETO NO CANTO INFERIOR */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-none">
        <span className="text-[9px] font-black tracking-widest text-[#00FF66] uppercase drop-shadow-[0_0_8px_#00FF66]">
          ⚡ NÚCLEO CHEFE VIVO
        </span>
      </div>
    </div>
  );
};
