import React, { useEffect, useRef } from 'react';

interface FrequencyPortalProps {
  className?: string;
}

export const FrequencyPortal: React.FC<FrequencyPortalProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Pega a largura/altura real da janela para expandir até as bordas da tela
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // PALETA DE CORES IDÊNTICA AO VÍDEO (Verde -> Roxo -> Azul Ciano)
    const getColor = (t: number) => {
      const cycle = (t * 0.3) % 3;
      if (cycle < 1) {
        // Verde -> Roxo
        const r = Math.round(0 + 170 * cycle);
        const g = Math.round(255 - 255 * cycle);
        const b = Math.round(110 + 145 * cycle);
        return `rgb(${r},${g},${b})`;
      } else if (cycle < 2) {
        // Roxo -> Azul Ciano
        const c = cycle - 1;
        const r = Math.round(170 - 170 * c);
        const g = Math.round(0 + 220 * c);
        const b = 255;
        return `rgb(${r},${g},${b})`;
      } else {
        // Azul Ciano -> Verde
        const c = cycle - 2;
        const r = 0;
        const g = Math.round(220 + 35 * c);
        const b = Math.round(255 - 145 * c);
        return `rgb(${r},${g},${b})`;
      }
    };

    const draw = () => {
      time += 0.02;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const color = getColor(time);
      
      // Batida pulsante idêntica ao áudio/vídeo
      const pulseRaw = Math.sin(time * 3.5);
      const pulse = Math.pow(Math.max(0, pulseRaw), 3); // Pico agressivo da batida
      
      // Raio do anel central e expansão máxima dos raios
      const baseRadius = 65;
      const screenMax = Math.max(w, h) * 0.85; 
      const rayMaxReach = baseRadius + (screenMax - baseRadius) * (0.2 + pulse * 0.8);

      // 1. TÚNEL DE RAIOS VOLUMÉTRICOS (EXPANSÃO TELA CHEIA)
      const numBeans = 140;
      for (let i = 0; i < numBeans; i++) {
        const angle = (i / numBeans) * Math.PI * 2;
        const noise = Math.sin(i * 11.7 + time * 5) * 0.5 + 0.5;
        
        // Comprimento dinâmico do raio
        const currentRayLen = baseRadius + (rayMaxReach - baseRadius) * (0.7 + noise * 0.3);

        const x1 = cx + Math.cos(angle) * baseRadius;
        const y1 = cy + Math.sin(angle) * baseRadius;
        const x2 = cx + Math.cos(angle) * currentRayLen;
        const y2 = cy + Math.sin(angle) * currentRayLen;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        const alpha = 0.12 + pulse * 0.48;

        grad.addColorStop(0, color.replace('rgb', 'rgba').replace(')', `,${alpha})`));
        grad.addColorStop(0.4, color.replace('rgb', 'rgba').replace(')', `,${alpha * 0.6})`));
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 + noise * 2.8 + pulse * 2.0;
        ctx.stroke();
      }

      // 2. ANEL DE FREQUÊNCIA DENTADO (ONDA EM REDOR DO AVATAR)
      ctx.beginPath();
      const points = 180;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const freqWave = Math.sin(angle * 14 + time * 8) * (5 + pulse * 12);
        const r = baseRadius + freqWave;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5 + pulse * 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
      }}
    />
  );
};
