import React, { useEffect, useRef } from 'react';

export const EnergyCore: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: any, scene: any, camera: any, animId: number;
    let coreMesh: any, rings: any[] = [], particlesMesh: any;

    // CARREGADOR DINÂMICO DE ENGINE 3D (THREE.JS HIGH-PERFORMANCE)
    const loadScript = (src: string) => {
      return new Promise((resolve) => {
        if ((window as any).THREE) {
          resolve((window as any).THREE);
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve((window as any).THREE);
        document.head.appendChild(script);
      });
    };

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js').then((THREE: any) => {
      if (!container) return;

      const width = container.offsetWidth;
      const height = container.offsetHeight;

      // 1. CENA E CÂMERA 3D REAL
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 18;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 2. LUZES CIBERNÉTICAS (VERDE, ROSA, ROXO, AZUL)
      const lightGreen = new THREE.PointLight(0x00FF66, 3, 30);
      lightGreen.position.set(5, 5, 5);
      scene.add(lightGreen);

      const lightPink = new THREE.PointLight(0xFF007A, 3, 30);
      lightPink.position.set(-5, -5, 5);
      scene.add(lightPink);

      const lightBlue = new THREE.PointLight(0x00E5FF, 2, 30);
      lightBlue.position.set(0, 5, -5);
      scene.add(lightBlue);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      // 3. NÚCLEO CENTRAL SÓLIDO (MATÉRIA EXPANDIDA DE ALTA PRESSÃO)
      const coreGeo = new THREE.IcosahedronGeometry(1.8, 4);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x00FF66,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.9,
        wireframe: false,
      });
      coreMesh = new THREE.Mesh(coreGeo, coreMat);
      scene.add(coreMesh);

      // 4. ANÉIS CIBERNÉTICOS 3D COM ESPESSURA E METALLIC RENDER
      const ringColors = [0x00FF66, 0xFF007A, 0x8B00FF, 0x00E5FF, 0x00FF66];
      const ringGeometries = [
        new THREE.TorusGeometry(3.2, 0.08, 16, 100),
        new THREE.TorusGeometry(4.1, 0.06, 16, 100),
        new THREE.TorusGeometry(5.0, 0.07, 16, 100),
        new THREE.TorusGeometry(5.8, 0.05, 16, 100),
      ];

      rings = ringGeometries.map((geo, index) => {
        const mat = new THREE.MeshStandardMaterial({
          color: ringColors[index],
          emissive: ringColors[index],
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.8,
        });
        const ring = new THREE.Mesh(geo, mat);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        scene.add(ring);
        return ring;
      });

      // 5. CAMPO DE PARTÍCULAS QUÂNTICAS 3D (POEIRA DE ENERGIA)
      const particlesGeo = new THREE.BufferGeometry();
      const count = 250;
      const positions = new Float32Array(count * 3);
      const colorsArr = new Float32Array(count * 3);

      const palette = [
        new THREE.Color(0x00FF66),
        new THREE.Color(0xFF007A),
        new THREE.Color(0x8B00FF),
        new THREE.Color(0x00E5FF),
      ];

      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 16;
        positions[i + 1] = (Math.random() - 0.5) * 16;
        positions[i + 2] = (Math.random() - 0.5) * 16;

        const c = palette[Math.floor(Math.random() * palette.length)];
        colorsArr[i] = c.r;
        colorsArr[i + 1] = c.g;
        colorsArr[i + 2] = c.b;
      }

      particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

      const particlesMat = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });

      particlesMesh = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particlesMesh);

      // INTERATIVIDADE NO TOQUE / MOUSE
      let mouseX = 0;
      let mouseY = 0;

      const handleMove = (clientX: number, clientY: number) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((clientX - rect.left) / width) * 2 - 1;
        mouseY = -((clientY - rect.top) / height) * 2 + 1;
      };

      const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchmove', onTouchMove);

      let clock = new THREE.Clock();

      // LOOP DE RENDERIZAÇÃO REALTIME 60FPS
      const animate = () => {
        animId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Pulsação do Núcleo
        if (coreMesh) {
          const scale = 1 + Math.sin(elapsedTime * 4) * 0.08;
          coreMesh.scale.set(scale, scale, scale);
          coreMesh.rotation.y = elapsedTime * 0.5;
          coreMesh.rotation.x = elapsedTime * 0.3;
        }

        // Rotação Acelerada dos Anéis em Eixos Diferentes
        rings.forEach((ring, idx) => {
          const speed = (idx + 1) * 0.6;
          ring.rotation.x += 0.01 * speed;
          ring.rotation.y += 0.015 * speed;
          ring.rotation.z += 0.008 * speed;
        });

        // Rotação suave do campo de partículas
        if (particlesMesh) {
          particlesMesh.rotation.y = elapsedTime * 0.05;
        }

        // Movimento da câmera com o toque
        camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);
      };
    });
  }, []);

  return (
    <div className="relative w-full h-44 flex items-center justify-center bg-transparent overflow-hidden my-1">
      {/* CONTAINER DO ENGINE 3D REAL (THREE.JS RENDER) */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
