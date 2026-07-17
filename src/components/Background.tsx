"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ParticleTone = "white" | "blue" | "orange";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  offsetX: number;
  offsetY: number;
  offsetVx: number;
  offsetVy: number;
  size: number;
  baseOpacity: number;
  twinkleAmplitude: number;
  twinkleOmega: number;
  twinklePhase: number;
  tone: ParticleTone;
};

const TONE_COLORS: Record<ParticleTone, [number, number, number]> = {
  white: [245, 245, 248],
  blue: [0, 168, 255],
  orange: [255, 138, 0],
};

function pickTone(): ParticleTone {
  const roll = Math.random();
  if (roll < 0.12) return "blue";
  if (roll < 0.17) return "orange";
  return "white";
}

function createParticle(): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 0.04 + 0.012;
  const periodMs = 3000 + Math.random() * 5000;

  return {
    x: Math.random(),
    y: Math.random(),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    offsetX: 0,
    offsetY: 0,
    offsetVx: 0,
    offsetVy: 0,
    size: Math.random() + 1,
    baseOpacity: Math.random() * 0.32 + 0.18,
    twinkleAmplitude: Math.random() * 0.16 + 0.08,
    twinkleOmega: (Math.PI * 2) / periodMs,
    twinklePhase: Math.random() * Math.PI * 2,
    tone: pickTone(),
  };
}

function particleCount() {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  return isMobile ? 180 + Math.floor(Math.random() * 41) : 260 + Math.floor(Math.random() * 41);
}

/** 挂到当前激活舞台内，使粒子落在背景媒体之上、正文之下 */
function resolveParticleHost(): HTMLElement | null {
  if (document.documentElement.classList.contains("is-free-browse")) {
    return null;
  }

  const community = document.querySelector<HTMLElement>(
    ".community-section.is-engaged .community-frame",
  );
  if (community) return community;

  const open = document.querySelector<HTMLElement>(
    ".open-source-section.is-engaged .open-source-frame",
  );
  if (open) return open;

  const core = document.querySelector<HTMLElement>(".core-section.is-engaged .core-pin");
  if (core) return core;

  const heroPin = document.querySelector<HTMLElement>("[data-hero-position-pin]");
  if (heroPin) return heroPin;

  return null;
}

export default function Background() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const syncHost = () => {
      const nextHost = resolveParticleHost() ?? document.body;
      setHost((currentHost) => (currentHost === nextHost ? currentHost : nextHost));
    };

    syncHost();

    const observer = new MutationObserver(syncHost);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const stageRoots = document.querySelectorAll(
      "[data-core-section], [data-open-section], [data-community-section], [data-hero-position-sequence]",
    );
    stageRoots.forEach((node) => {
      observer.observe(node, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });

    window.addEventListener("siclink-enter-free-browse", syncHost);
    window.addEventListener("siclink-disengage-stages", syncHost);
    window.addEventListener("hero-reset", syncHost);
    window.addEventListener("hero-enter-position", syncHost);

    return () => {
      observer.disconnect();
      window.removeEventListener("siclink-enter-free-browse", syncHost);
      window.removeEventListener("siclink-disengage-stages", syncHost);
      window.removeEventListener("hero-reset", syncHost);
      window.removeEventListener("hero-enter-position", syncHost);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!host || !root || !canvas || !context) return;

    let particles: Particle[] = [];
    let animation = 0;
    let lastTime = performance.now();
    let pointer: { x: number; y: number } | null = null;

    const createParticles = () => {
      const count = particleCount();
      particles = Array.from({ length: count }, createParticle);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      const delta = Math.min(time - lastTime, 32);
      const deltaSeconds = delta / 1000;
      lastTime = time;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const repelRadius = Math.min(190, Math.max(140, width * 0.12));
      const springStrength = 18;
      const velocityDamping = Math.exp(-7 * deltaSeconds);

      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.x += (particle.vx * delta) / width;
        particle.y += (particle.vy * delta) / height;

        if (particle.x < -0.02) particle.x = 1.02;
        if (particle.x > 1.02) particle.x = -0.02;
        if (particle.y < -0.02) particle.y = 1.02;
        if (particle.y > 1.02) particle.y = -0.02;

        const baseX = particle.x * width;
        const baseY = particle.y * height;
        const currentX = baseX + particle.offsetX;
        const currentY = baseY + particle.offsetY;

        if (pointer) {
          const dx = currentX - pointer.x;
          const dy = currentY - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < repelRadius) {
            const safeDistance = Math.max(distance, 0.01);
            const proximity = 1 - safeDistance / repelRadius;
            const repelForce = proximity * proximity * 2400;
            const directionX = distance > 0.01 ? dx / distance : Math.cos(particle.twinklePhase);
            const directionY = distance > 0.01 ? dy / distance : Math.sin(particle.twinklePhase);

            particle.offsetVx += directionX * repelForce * deltaSeconds;
            particle.offsetVy += directionY * repelForce * deltaSeconds;
          }
        }

        particle.offsetVx -= particle.offsetX * springStrength * deltaSeconds;
        particle.offsetVy -= particle.offsetY * springStrength * deltaSeconds;
        particle.offsetVx *= velocityDamping;
        particle.offsetVy *= velocityDamping;
        particle.offsetX += particle.offsetVx * deltaSeconds;
        particle.offsetY += particle.offsetVy * deltaSeconds;

        const drawX = baseX + particle.offsetX;
        const drawY = baseY + particle.offsetY;

        const twinkle = Math.sin(time * particle.twinkleOmega + particle.twinklePhase);
        const alpha = Math.min(0.58, Math.max(0.12, particle.baseOpacity + twinkle * particle.twinkleAmplitude));
        const [r, g, b] = TONE_COLORS[particle.tone];

        context.beginPath();
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        context.arc(drawX, drawY, particle.size * 0.5, 0, Math.PI * 2);
        context.fill();
      });

      animation = window.requestAnimationFrame(draw);
    };

    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
    };

    const clearPointer = () => {
      pointer = null;
    };

    resize();
    createParticles();
    animation = window.requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("resize", createParticles);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.addEventListener("pointerleave", clearPointer);
    document.addEventListener("pointercancel", clearPointer);
    window.addEventListener("blur", clearPointer);

    return () => {
      window.cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", createParticles);
      window.removeEventListener("pointermove", updatePointer);
      document.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("pointercancel", clearPointer);
      window.removeEventListener("blur", clearPointer);
    };
  }, [host]);

  if (!host) return null;

  return createPortal(
    <div
      ref={rootRef}
      className={`universe-background${host === document.body ? "" : " is-contained"}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>,
    host,
  );
}
