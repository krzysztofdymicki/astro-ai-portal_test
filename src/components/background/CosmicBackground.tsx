'use client';

import { useEffect, useRef } from 'react';

interface StellarObject {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  type: 'star' | 'nebula' | 'comet' | 'constellation';
  color: string;
  velocity?: number;
  angle?: number;
  tail?: number;
  pulseSpeed?: number;
  size?: number;
  growing?: boolean;
  points?: {x: number, y: number}[];
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectsRef = useRef<StellarObject[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initObjects();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    function initObjects() {
      if (!canvas) return;
      
      const stellarObjects: StellarObject[] = [];
      const width = canvas.width;
      const height = canvas.height;
    
      // Więcej gwiazd dla efektu nocnego nieba
      const starCount = Math.floor((width * height) / 4000); 
      for (let i = 0; i < starCount; i++) {
        const radius = Math.random() * 1.2 + 0.3;
        const opacity = Math.random() * 0.6 + 0.4; // Jaśniejsze gwiazdy
        
        // Kolory gwiazd - więcej białych i niebieskich, mniej fioletowych
        let hue;
        let saturation;
        let lightness;
        
        const colorType = Math.random();
        if (colorType < 0.7) {
          // 70% białych/niebieskawych gwiazd
          hue = Math.random() * 20 + 200;
          saturation = Math.random() * 30 + 10;
          lightness = Math.random() * 20 + 80; // Jaśniejsze
        } else {
          // 30% innych kolorów (włączając fioletowe)
          hue = Math.random() * 60 + 220;
          saturation = Math.random() * 40 + 20;
          lightness = Math.random() * 30 + 70;
        }
        
        stellarObjects.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          opacity,
          type: 'star',
          color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`,
          pulseSpeed: Math.random() * 0.008 + 0.002,
          growing: Math.random() > 0.5
        });
      }
      
      // Subtelniejsze mgławice
      const nebulaCount = Math.floor(width / 1000) + 1; // Mniej mgławic
      for (let i = 0; i < nebulaCount; i++) {
        const size = Math.random() * 120 + 80;
        const opacity = Math.random() * 0.05 + 0.02; // Bardzo przezroczyste
        
        // Kolory mgławic - bardziej niebieskio i subtelne
        const hue = Math.random() * 40 + 210; // 210-250 to głównie niebieski zakres
        const saturation = Math.random() * 40 + 20; // Mniej nasycone
        const lightness = Math.random() * 20 + 40; // Ciemniejsze
        
        stellarObjects.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1,
          size,
          opacity,
          type: 'nebula',
          color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`,
          pulseSpeed: Math.random() * 0.002 + 0.0005,
          growing: Math.random() > 0.5
        });
      }
      
      // Dodajemy kilka komet - mniej i rzadziej
      if (Math.random() < 0.7) { // 70% szans na komety
        const cometCount = Math.min(2, Math.floor(width / 800));
        for (let i = 0; i < cometCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = Math.random() * 0.4 + 0.1; // Wolniejsze komety
          const tail = Math.random() * 40 + 15;
          
          stellarObjects.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.8,
            opacity: Math.random() * 0.6 + 0.4,
            type: 'comet',
            color: 'rgba(220, 240, 255, 0.8)',
            velocity,
            angle,
            tail
          });
        }
      }
      
      // Dodajemy gwiazdozbiory - subtelne linie łączące gwiazdy
      const constellationCount = Math.min(2, Math.floor(width / 600));
      for (let i = 0; i < constellationCount; i++) {
        const starCount = Math.floor(Math.random() * 5) + 3; // 3-7 gwiazd w konstelacji
        const points: {x: number, y: number}[] = [];
        
        // Tworzymy grupę gwiazd w bliskim obszarze
        const centerX = Math.random() * width;
        const centerY = Math.random() * height;
        const spread = Math.min(width, height) * 0.15; // Rozrzut gwiazd
        
        for (let j = 0; j < starCount; j++) {
          points.push({
            x: centerX + (Math.random() - 0.5) * spread,
            y: centerY + (Math.random() - 0.5) * spread
          });
        }
        
        stellarObjects.push({
          x: centerX,
          y: centerY,
          radius: 0.5,
          opacity: Math.random() * 0.2 + 0.50, // Bardzo subtelne linie
          type: 'constellation',
          color: 'rgba(180, 190, 255, 0.15)',
          points
        });
      }
      
      objectsRef.current = stellarObjects;
    }

    function drawBackground() {
      if (!ctx || !canvas) return;
      
      // Bardziej nocne kolory - ciemniejszy granat zamiast fioletu
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(8, 8, 25, 0.95)');   // Ciemny granat u góry
      gradient.addColorStop(0.4, 'rgba(12, 10, 30, 0.9)'); // Subtelny granat w środku
      gradient.addColorStop(0.8, 'rgba(10, 5, 25, 0.92)'); // Delikatny fiolet na dole
      gradient.addColorStop(1, 'rgba(5, 5, 15, 0.95)');   // Prawie czarny na samym dole
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawObjects() {
      if (!ctx || !canvas) return;
      
      objectsRef.current.forEach(obj => {
        ctx.save();
        
        if (obj.type === 'star') {
          // Animacja migotania gwiazd
          if (obj.growing) {
            obj.opacity += obj.pulseSpeed!;
            if (obj.opacity > 0.8) {
              obj.growing = false;
            }
          } else {
            obj.opacity -= obj.pulseSpeed!;
            if (obj.opacity < 0.2) {
              obj.growing = true;
            }
          }
          
          // Aktualizacja koloru z nową przezroczystością
          const colorParts = obj.color.substring(0, obj.color.lastIndexOf(',') + 1);
          obj.color = `${colorParts} ${obj.opacity})`;
          
          // Rysowanie gwiazdy
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = obj.color;
          ctx.fill();
        } 
        else if (obj.type === 'nebula') {
          // Animacja pulsowania mgławic
          if (obj.growing) {
            obj.size! += obj.pulseSpeed! * 10;
            if (obj.size! > 180) {
              obj.growing = false;
            }
          } else {
            obj.size! -= obj.pulseSpeed! * 10;
            if (obj.size! < 80) {
              obj.growing = true;
            }
          }
          
          // Rysowanie mgławicy jako gradient radialny
          const gradient = ctx.createRadialGradient(
            obj.x, obj.y, 0,
            obj.x, obj.y, obj.size!
          );
          
          const baseColor = obj.color.substring(0, obj.color.lastIndexOf(','));
          gradient.addColorStop(0, `${baseColor}, ${obj.opacity * 1.3})`);
          gradient.addColorStop(0.5, `${baseColor}, ${obj.opacity * 0.7})`);
          gradient.addColorStop(1, `${baseColor}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            obj.x - obj.size!, 
            obj.y - obj.size!, 
            obj.size! * 2, 
            obj.size! * 2
          );
        }
        else if (obj.type === 'comet') {
          // Aktualizacja pozycji komety
          obj.x += Math.cos(obj.angle!) * obj.velocity!;
          obj.y += Math.sin(obj.angle!) * obj.velocity!;
          
          // Jeśli kometa wyszła poza ekran, resetujemy jej pozycję
          if (obj.x < -obj.tail! || obj.x > canvas.width + obj.tail! || 
              obj.y < -obj.tail! || obj.y > canvas.height + obj.tail!) {
            obj.x = Math.random() * canvas.width;
            obj.y = Math.random() * canvas.height;
            obj.angle = Math.random() * Math.PI * 2;
          }
          
          // Rysowanie ogona komety
          const tailX = obj.x - Math.cos(obj.angle!) * obj.tail!;
          const tailY = obj.y - Math.sin(obj.angle!) * obj.tail!;
          
          const gradient = ctx.createLinearGradient(
            obj.x, obj.y,
            tailX, tailY
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, ' + obj.opacity + ')');
          gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
          
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = obj.radius * 2;
          ctx.stroke();
          
          // Rysowanie głowy komety
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, ' + obj.opacity + ')';
          ctx.fill();
        }
        else if (obj.type === 'constellation') {
          // Rysowanie linii konstelacji
          ctx.beginPath();
          
          if (obj.points && obj.points.length > 0) {
            ctx.moveTo(obj.points[0].x, obj.points[0].y);
            
            for (let i = 1; i < obj.points.length; i++) {
              ctx.lineTo(obj.points[i].x, obj.points[i].y);
            }
            
            // Dodatkowe rysowanie gwiazd w punktach konstelacji
            obj.points.forEach(point => {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.beginPath();
              ctx.arc(point.x, point.y, 0.8, 0, Math.PI * 2);
              ctx.fill();
            });
          }
          
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        
        ctx.restore();
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawObjects();
      
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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