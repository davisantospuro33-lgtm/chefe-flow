import React, { useEffect, useRef } from 'react';

export const EnergyCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioStartedRef = useRef<boolean>(false);

  // ÁUDIO AMBIENT ALUCINÓGENO / MELÓDICO (AUTÔNOMO NO PRIMEIRO TOQUE)
  const initAutoplayAudio = () => {
    if (audioStartedRef.current || typeof window === 'undefined') return;
    audioStartedRef.current = true;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // Oscilador Principal (Frequência Harmônica Verde/Rosa)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, ctx.currentTime); // Tom Quântico

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(216, ctx.currentTime); // Sub-harmônico melódico

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.5, ctx.currentTime); // Ondulação alucinógena lenta

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(15, ctx.currentTime);

      lfo.connect(osc1.frequency);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      // Volume suave de fundo imersivo
      gain.gain.setValueAtTime(0.03, ctx.currentTime);

      osc1.start();
      osc2.start();
      lfo.start();
    } catch (e) {
      console.log("Audio waiting user interaction");
    }
  };

  // MOTOR GRÁFICO NÚCLEO 3D REALISTA (SEM CAIXA / FLUTUANTE)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const colors = ['#00FF66', '#FF007A', '#8B00FF', '#00E5FF', '#00FF66', '#FF007A'];

    // Partículas de Energia Estelar
    const numParticles = 70;
    const particles = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      size: Math.random() * 2 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 1.8 + 0.5,
    }));

    let rotY = 0;
    let rotX = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const handleTouch = (clientX: number, clientY: number) => {
      initAutoplayAudio();
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - width / 2;
      const y = clientY - rect.top - height / 2;
      targetRotY = (x / width) * 2;
      targetRotX = -(y / height) * 2;
    };

    const onMouseMove = (e: MouseEvent) => handleTouch(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleTouch(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('touchstart', initAutoplayAudio, { once: true });
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove);

    let angle = 0;

    // RENDERIZADOR QUÂNTICO 3D (TRANSPARENTE E FLUTUANTE)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotY += (targetRotY - rotY) * 0.05;
      rotX += (targetRotX - rotX) * 0.05;
      angle += 0.02;

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. AURA DE LUZ RADIANTE (SEM BORDA DE CAIXA)
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 90);
      coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGlow.addColorStop(0.2, 'rgba(0, 255, 102, 0.6)');
      coreGlow.addColorStop(0.5, 'rgba(255, 0, 122, 0.3)');
      coreGlow.addColorStop(0.8, 'rgba(139, 0, 255, 0.15)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
      ctx.fill();

      // 2. MÚLTIPLOS ANÉIS ATÔMICOS 3D (6 ANÉIS EM MÚLTIPLOS EIXOS)
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((angle * (i % 2 === 0 ? 1 : -1)) + (i * Math.PI / 3) + rotY);
        ctx.scale(1, 0.3 + Math.sin(angle + i) * 0.1);

        ctx.beginPath();
        ctx.arc(0, 0, 48 + i * 8, 0, Math.PI * 2);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2;
        ctx.shadowColor = colors[i % colors.length];
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 3. CENTRO DENSE DE MATÉRIA PURA (O NÚCLEO REAL)
      ctx.save();
      ctx.translate(centerX, centerY);
      const pulse = 18 + Math.sin(angle * 4) * 3;
      ctx.beginPath();
      ctx.arc(0, 0, pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00FF66';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.restore();

      // 4. PARTÍCULAS DE POEIRA CÓSMICA
      particles.forEach((p) => {
        p.z -= p.speed;
        if (p.z <= 0) p.z = width;

        const k = 200 / p.z;
        const px = p.x * k + centerX;
        const py = p.y * k + centerY;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, p.size * k * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('touchstart', initAutoplayAudio);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div className="relative w-full h-48 flex items-center justify-center my-1 bg-transparent overflow-hidden">
      {/* NÚCLEO 3D REALISTA PURAMENTE FLUTUANTE */}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
