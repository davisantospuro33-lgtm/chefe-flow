import React, { useEffect, useRef } from 'react';

export const EnergyCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Paleta de Alta Densidade: Verde Neon, Rosa Shock, Roxo Cyber, Azul Elétrico
    const colors = ['#00FF66', '#FF007A', '#8B00FF', '#00E5FF', '#FFFFFF'];

    // Partículas de Choque Quântico (Descargas Elétricas do Centro)
    const numSparks = 90;
    const sparks = Array.from({ length: numSparks }, () => ({
      x: 0,
      y: 0,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 3 + 1.5,
      dist: Math.random() * 20,
      maxDist: Math.random() * 45 + 25,
      size: Math.random() * 2 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let rotY = 0;
    let rotX = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const handleTouch = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - width / 2;
      const y = clientY - rect.top - height / 2;
      targetRotY = (x / width) * 2.5;
      targetRotX = -(y / height) * 2.5;
    };

    const onMouseMove = (e: MouseEvent) => handleTouch(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleTouch(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove);

    let angle = 0;

    // RENDERIZADOR QUÂNTICO DE ALTA VELOCIDADE
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;
      angle += 0.06; // VELOCIDADE ELEVADA DOS ANÉIS

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. CLARÃO E EXPLOSÃO DE LUZ CENTRAL (PODER DE CHOQUE)
      const pulse = Math.sin(angle * 3) * 4;
      const coreLight = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 55 + pulse);
      coreLight.addColorStop(0, '#FFFFFF');
      coreLight.addColorStop(0.2, '#00FF66');
      coreLight.addColorStop(0.45, '#FF007A');
      coreLight.addColorStop(0.7, '#8B00FF');
      coreLight.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = coreLight;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // 2. 8 ANÉIS COMPLEXOS EM ALTA VELOCIDADE E EIXOS CRUZADOS
      for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Rotações combinadas nos eixos X/Y/Z em alta rotação
        ctx.rotate(angle * (i % 2 === 0 ? 1.8 : -2.2) + (i * Math.PI / 4) + rotY);
        ctx.scale(1, 0.25 + Math.sin(angle * 1.5 + i) * 0.12);

        ctx.beginPath();
        ctx.arc(0, 0, 28 + i * 4.5, 0, Math.PI * 2);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = i % 2 === 0 ? 2.5 : 1.2;
        ctx.shadowColor = colors[i % colors.length];
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 3. FAGULHAS E DISPAROS DE CHOQUE
      sparks.forEach((s) => {
        s.dist += s.speed;
        if (s.dist > s.maxDist) {
          s.dist = 0;
          s.angle = Math.random() * Math.PI * 2;
        }

        const px = centerX + Math.cos(s.angle) * s.dist + rotY * 8;
        const py = centerY + Math.sin(s.angle) * s.dist + rotX * 8;
        const opacity = 1 - s.dist / s.maxDist;

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = opacity;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 4. CENTRO DE MATÉRIA PURA (NÚCLEO VIVO DE ALTA PRESSÃO)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      ctx.arc(0, 0, 11 + Math.sin(angle * 5) * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.restore();

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
    <div className="relative w-full h-32 flex items-center justify-center bg-transparent overflow-hidden my-1">
      {/* CANVAS NÚCLEO 3D DE ALTA DENSIDADE E VELOCIDADE */}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
