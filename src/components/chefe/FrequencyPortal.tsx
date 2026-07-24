import React, { useEffect, useRef } from 'react';

interface FrequencyPortalProps {
  className?: string;
}

export const FrequencyPortal: React.FC<FrequencyPortalProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // PALETA FIEL AO VÍDEO (VERDE → ROXO → AZUL)
    const getColor = (t: number) => {
      const cycle = (t * 0.4) % 3;
      if (cycle < 1) {
        // Verde -> Roxo
        const r = Math.round(0 + 160 * cycle);
        const g = Math.round(255 - 255 * cycle);
        const b = Math.round(85 + 170 * cycle);
        return { r, g, b, str: `rgb(${r},${g},${b})` };
      } else if (cycle < 2) {
        // Roxo -> Azul Ciano
        const c = cycle - 1;
        const r = Math.round(160 - 160 * c);
        const g = Math.round(0 + 213 * c);
        const b = Math.round(255);
        return { r, g, b, str: `rgb(${r},${g},${b})` };
      } else {
        // Azul Ciano -> Verde
        const c = cycle - 2;
        const r = 0;
        const g = Math.round(213 + 42 * c);
        const b = Math.round(255 - 170 * c);
        return { r, g, b, str: `rgb(${r},${g},${b})` };
      }
    };

    const draw = () => {
      time += 0.03;
      const w = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio || 1, 2);
      const cx = w / 2;
      const cy = h / 2;
      
      // Raio do anel central
      const baseRadius = Math.min(w, h) * 0.22;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const color = getColor(time);

      // Simulação da batida de som (pulso do túnel igual ao vídeo)
      const pulse = Math.pow(Math.sin(time * 2.5), 6); // picos de expansão súbitos
      const maxRayLength = Math.max(w, h) * 1.2;

      // 1. TÚNEL DE FEIXES DE LUZ VOLUMÉTRICOS (EXPANSÃO DO VÍDEO)
      const numBeams = 120;
      for (let i = 0; i < numBeams; i++) {
        const angle = (i / numBeams) * Math.PI * 2;
        const noise = Math.sin(i * 9.3 + time * 5) * 0.5 + 0.5;
        
        // Comprimento dinâmico do raio baseado no pulso do ritmo
        const rayLen = baseRadius + (maxRayLength - baseRadius) * (noise * 0.3 + pulse * 0.7);

        const x1 = cx + Math.cos(angle) * baseRadius;
        const y1 = cy + Math.sin(angle) * baseRadius;
        const x2 = cx + Math.cos(angle) * rayLen;
        const y2 = cy + Math.sin(angle) * rayLen;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        const alpha = 0.1 + pulse * 0.6;
        grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
        grad.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2 + noise * 3 + pulse * 4;
        ctx.stroke();
      }

      // 2. ANEL ONDULADO DE FREQUÊNCIA (WAVEFORM DO VÍDEO)
      ctx.beginPath();
      const points = 180;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Picos de frequência denteados de áudio
        const freqWave = (Math.sin(angle * 24 + time * 12) * 0.6 + Math.cos(angle * 36 - time * 8) * 0.4) * (4 + pulse * 6);
        const r = baseRadius + freqWave;

        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = color.str;
      ctx.lineWidth = 2.5 + pulse * 1.5;
      ctx.shadowColor = color.str;
      ctx.shadowBlur = 20;
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
      className={`pointer-events-none w-full h-full ${className}`}
      style={{ background: 'transparent' }}
    />
  );
};

export default FrequencyPortal;
