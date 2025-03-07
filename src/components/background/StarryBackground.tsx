'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
  opacity: number;
  opacityChange: number;
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  // Dodajemy refs dla kontekstu i flag animacji
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Zapisujemy kontekst do referencji, aby był dostępny w innych miejscach
    ctxRef.current = ctx;

    // Funkcja inicjalizująca gwiazdy
    const initStars = () => {
      if (!canvas) return;
      
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 3000);
      
      for (let i = 0; i < starCount; i++) {
        const radius = Math.random() * 1.5 + 0.5;
        
        const hue = Math.random() * 60 + 240;
        const saturation = Math.random() * 30 + 70;
        const lightness = Math.random() * 30 + 70;
        
        const opacity = Math.random() * 0.5 + 0.5;
        const opacityChange = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.005 + 0.002);
        
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`,
          speed: 0.07,
          opacity,
          opacityChange
        });
      }
      
      starsRef.current = stars;
    };

    // Funkcja rysująca gradient tła
    const drawBackground = () => {
      const currentCtx = ctxRef.current;
      const currentCanvas = canvasRef.current;
      
      if (!currentCtx || !currentCanvas) return;
      
      const gradient = currentCtx.createLinearGradient(0, 0, 0, currentCanvas.height);
      gradient.addColorStop(0, '#0c0026');
      gradient.addColorStop(0.5, '#1a0038');
      gradient.addColorStop(1, '#000000');
      
      currentCtx.fillStyle = gradient;
      currentCtx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
    };

    // Funkcja animacji - używamy arrow function dla zachowania this
    const animate = () => {
      const currentCtx = ctxRef.current;
      const currentCanvas = canvasRef.current;
      
      if (!currentCtx || !currentCanvas) return;
      
      // Czyszczenie canvasa
      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
      
      // Rysowanie tła
      drawBackground();
      
      // Rysowanie i aktualizacja gwiazd
      starsRef.current.forEach(star => {
        // Aktualizacja pozycji
        star.x += star.speed;
        if (star.x > currentCanvas.width) {
          star.x = 0;
        }
        
        // Aktualizacja przezroczystości
        star.opacity += star.opacityChange;
        if (star.opacity > 1 || star.opacity < 0.3) {
          star.opacityChange = -star.opacityChange;
        }
        
        // Aktualizacja koloru
        const color = star.color.split(', ');
        color[3] = star.opacity + ')';
        const updatedColor = color.join(', ');
        
        // Rysowanie gwiazdy
        currentCtx.beginPath();
        currentCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        currentCtx.fillStyle = updatedColor;
        currentCtx.fill();
      });
      
      // Zapisujemy ID animacji do referencji, aby móc ją później anulować
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // Ustawienie canvasa na pełny rozmiar okna
    const handleResize = () => {
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Regeneracja gwiazd przy zmianie rozmiaru
      initStars();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Uruchomienie animacji
    animate();

    // Czyszczenie przy odmontowaniu komponentu
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Anulowanie animacji przy odmontowaniu
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
}