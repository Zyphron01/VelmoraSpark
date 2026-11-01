'use client';

import React, { useEffect, useRef, useState } from 'react';

type FlowerType = 'jasmine' | 'marigold_flower' | 'marigold_petal' | 'rose_petal' | 'lotus_petal';

interface FestiveFlower {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  pitch: number;
  pitchSpeed: number;
  type: FlowerType;
  opacity: number;
  swayOffset: number;
  swaySpeed: number;
}

const MAX_FLOWERS = 28;

export function FestivePetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isPaused = false;

    // Check reduced motion preference
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQueryMotion.matches) {
      return;
    }

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const flowerTypes: FlowerType[] = [
      'jasmine',
      'marigold_flower',
      'marigold_petal',
      'rose_petal',
      'lotus_petal',
    ];

    // Initialize realistic floral collection
    const flowers: FestiveFlower[] = Array.from({ length: MAX_FLOWERS }, (_, i) => {
      const type = flowerTypes[i % flowerTypes.length];
      const isWholeFlower = type === 'jasmine' || type === 'marigold_flower';
      return {
        x: Math.random() * width,
        y: Math.random() * height * -1 - i * 25,
        size: isWholeFlower ? 14 + Math.random() * 10 : 10 + Math.random() * 8,
        speedY: 0.5 + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        pitch: Math.random() * Math.PI * 2,
        pitchSpeed: 0.02 + Math.random() * 0.03,
        type,
        opacity: 0.45 + Math.random() * 0.4,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.015 + Math.random() * 0.02,
      };
    });

    // ─── Drawing Realistic Mogra (Jasmine) ───────────────────────────────────
    function drawJasmine(c: CanvasRenderingContext2D, size: number) {
      const r = size * 0.5;
      const petalCount = 5;

      for (let i = 0; i < petalCount; i++) {
        c.save();
        c.rotate((i * (Math.PI * 2)) / petalCount);

        const grad = c.createLinearGradient(0, 0, 0, -r);
        grad.addColorStop(0, '#FFFDF8');
        grad.addColorStop(0.6, '#FDF6E2');
        grad.addColorStop(1, '#EDE2C8');
        c.fillStyle = grad;

        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(-r * 0.35, -r * 0.4, -r * 0.35, -r * 0.8, 0, -r);
        c.bezierCurveTo(r * 0.35, -r * 0.8, r * 0.35, -r * 0.4, 0, 0);
        c.fill();
        c.restore();
      }

      // Golden-green pistil center
      c.beginPath();
      c.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      c.fillStyle = '#D4AF37';
      c.fill();

      c.beginPath();
      c.arc(0, 0, r * 0.1, 0, Math.PI * 2);
      c.fillStyle = '#6E8A38';
      c.fill();
    }

    // ─── Drawing Realistic Marigold Blossom (Genda) ─────────────────────────
    function drawMarigoldFlower(c: CanvasRenderingContext2D, size: number) {
      const r = size * 0.55;
      const layers = [
        { count: 10, radius: r, color: '#D97706' },
        { count: 8, radius: r * 0.75, color: '#F59E0B' },
        { count: 6, radius: r * 0.5, color: '#FFAE34' },
      ];

      for (const layer of layers) {
        for (let i = 0; i < layer.count; i++) {
          c.save();
          c.rotate((i * (Math.PI * 2)) / layer.count);
          c.fillStyle = layer.color;
          c.beginPath();
          c.moveTo(0, 0);
          c.bezierCurveTo(-layer.radius * 0.25, -layer.radius * 0.5, -layer.radius * 0.3, -layer.radius * 0.9, 0, -layer.radius);
          c.bezierCurveTo(layer.radius * 0.3, -layer.radius * 0.9, layer.radius * 0.25, -layer.radius * 0.5, 0, 0);
          c.fill();
          c.restore();
        }
      }

      // Dense golden center
      c.beginPath();
      c.arc(0, 0, r * 0.25, 0, Math.PI * 2);
      c.fillStyle = '#B45309';
      c.fill();
    }

    // ─── Drawing Ruffled Marigold Single Petal ───────────────────────────────
    function drawMarigoldPetal(c: CanvasRenderingContext2D, size: number) {
      const grad = c.createLinearGradient(0, size * 0.4, 0, -size * 0.6);
      grad.addColorStop(0, '#B45309');
      grad.addColorStop(0.3, '#D97706');
      grad.addColorStop(0.7, '#F59E0B');
      grad.addColorStop(1, '#FFE29F');
      c.fillStyle = grad;

      c.beginPath();
      c.moveTo(0, size * 0.4);
      c.bezierCurveTo(-size * 0.3, size * 0.1, -size * 0.38, -size * 0.3, -size * 0.2, -size * 0.5);
      // Ruffled scalloped tip
      c.quadraticCurveTo(-size * 0.1, -size * 0.65, 0, -size * 0.58);
      c.quadraticCurveTo(size * 0.1, -size * 0.65, size * 0.2, -size * 0.5);
      c.bezierCurveTo(size * 0.38, -size * 0.3, size * 0.3, size * 0.1, 0, size * 0.4);
      c.fill();
    }

    // ─── Drawing Realistic Velvet Rose Petal ─────────────────────────────────
    function drawRosePetal(c: CanvasRenderingContext2D, size: number) {
      const grad = c.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 0.7);
      grad.addColorStop(0, '#C2384E');
      grad.addColorStop(0.5, '#8B1E2D');
      grad.addColorStop(1, '#4A0E17');
      c.fillStyle = grad;

      c.beginPath();
      c.moveTo(0, size * 0.45);
      c.bezierCurveTo(-size * 0.45, size * 0.2, -size * 0.5, -size * 0.3, -size * 0.2, -size * 0.5);
      // Curved heart-fold tip
      c.bezierCurveTo(-size * 0.05, -size * 0.58, 0, -size * 0.52, size * 0.05, -size * 0.58);
      c.bezierCurveTo(size * 0.5, -size * 0.3, size * 0.45, size * 0.2, 0, size * 0.45);
      c.fill();

      // Subtle velvety edge highlight
      c.strokeStyle = 'rgba(255, 174, 52, 0.25)';
      c.lineWidth = 0.8;
      c.stroke();
    }

    // ─── Drawing Graceful Lotus Petal ────────────────────────────────────────
    function drawLotusPetal(c: CanvasRenderingContext2D, size: number) {
      const grad = c.createLinearGradient(0, size * 0.5, 0, -size * 0.6);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.4, '#FDE8EE');
      grad.addColorStop(0.8, '#F472B6');
      grad.addColorStop(1, '#BE185D');
      c.fillStyle = grad;

      c.beginPath();
      c.moveTo(0, size * 0.5);
      c.bezierCurveTo(-size * 0.35, size * 0.1, -size * 0.3, -size * 0.4, 0, -size * 0.6);
      c.bezierCurveTo(size * 0.3, -size * 0.4, size * 0.35, size * 0.1, 0, size * 0.5);
      c.fill();
    }

    function renderFlower(f: FestiveFlower) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate((f.rotation * Math.PI) / 180);

      // Realistic 3D pitch/roll tumbling scale
      const pitchScale = Math.cos(f.pitch);
      ctx.scale(1, Math.max(0.18, Math.abs(pitchScale)));
      ctx.globalAlpha = f.opacity;

      switch (f.type) {
        case 'jasmine':
          drawJasmine(ctx, f.size);
          break;
        case 'marigold_flower':
          drawMarigoldFlower(ctx, f.size);
          break;
        case 'marigold_petal':
          drawMarigoldPetal(ctx, f.size);
          break;
        case 'rose_petal':
          drawRosePetal(ctx, f.size);
          break;
        case 'lotus_petal':
          drawLotusPetal(ctx, f.size);
          break;
      }

      ctx.restore();
    }

    let lastTime = performance.now();

    function render(currentTime: number) {
      if (isPaused) {
        animationFrameId = null;
        return;
      }

      const delta = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < flowers.length; i++) {
          const f = flowers[i];
          f.swayOffset += f.swaySpeed * (delta / 16);
          f.pitch += f.pitchSpeed * (delta / 16);
          f.x += (Math.sin(f.swayOffset) * 0.7 + f.speedX) * (delta / 16);
          f.y += f.speedY * (delta / 16);
          f.rotation += f.rotationSpeed * (delta / 16);

          // Wrap boundaries
          if (f.y > height + 25) {
            f.y = -25;
            f.x = Math.random() * width;
          }
          if (f.x < -25) f.x = width + 25;
          if (f.x > width + 25) f.x = -25;

          renderFlower(f);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    function startAnimation() {
      if (!animationFrameId && !isPaused && !mediaQueryMotion.matches) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    }

    function stopAnimation() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (isPaused) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    startAnimation();

    return () => {
      stopAnimation();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 max-w-full w-full h-full overflow-hidden"
      style={{ willChange: 'transform' }}
    />
  );
}
