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
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const getColor = (t: number) => {
      const cycle = (t * 0.3) % 3;
      if (cycle < 1) {
        const r = Math.round(0 + 170 * cycle);
        const g = Math.round(255 - 255 * cycle);
        const b = Math.round(110 + 145 * cycle);
        return `rgb(${r},${g},${b})`;
      } else if (cycle < 2) {
        const c = cycle - 1;
        const r = Math.round(170 - 170 * c);
        const g = Math.round(0 + 220 * c);
        return `rgb(${r},${g},255)`;
      } else {
        const c = cycle - 2;
        const g = Math.round(220 + 35 * c);
        const b = Math.round(255 - 145 * c);
        return `rgb(0,${g},${b})`;
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
      const pulseRaw = Math.sin(time * 3.5);
      const pulse = Math.pow(Math.max(0, pulseRaw), 3);

      const baseRadius = 60;
      const screenMax = Math.max(w, h) * 0.9;
      const rayMaxReach = baseRadius + (screenMax - baseRadius) * (0.25 + pulse * 0.75);

      const numBeans = 140;
      for (let i = 0; i < numBeans; i++) {
        const angle = (i / numBeans) * Math.PI * 2;
        const noise = Math.sin(i * 11.7 + time * 5) * 0.5 + 0.5;
        const currentRayLen = baseRadius + (rayMaxReach - baseRadius) * (0.7 + noise * 0.3);

        const x1 = cx + Math.cos(angle) * baseRadius;
        const y1 = cy + Math.sin(angle) * baseRadius;
        const x2 = cx + Math.cos(angle) * currentRayLen;
        const y2 = cy + Math.sin(angle) * currentRayLen;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        const alpha = 0.10 + pulse * 0.45;

        grad.addColorStop(0, color.replace('rgb', 'rgba').replace(')', `,${alpha})`));
        grad.addColorStop(0.45, color.replace('rgb', 'rgba').replace(')', `,${alpha * 0.55})`));
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 + noise * 2.6 + pulse * 2.0;
        ctx.stroke();
      }

      // anel dentado
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
      ctx.lineWidth = 2.2 + pulse * 1.4;
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

  const mask = 'radial-gradient(circle at center, black 30%, transparent 80%)';

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`fixed inset-0 -z-10 pointer-events-none w-screen h-screen ${className}`}
      style={{
        background: 'transparent',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
};