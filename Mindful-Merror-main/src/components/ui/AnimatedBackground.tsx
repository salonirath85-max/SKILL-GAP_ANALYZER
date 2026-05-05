import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export function AnimatedBackground() {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-0 overflow-hidden animated-gradient-bg">
      {/* Floating orbs */}
      <div
        className="floating-orb"
        style={{
          width: '400px',
          height: '400px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent)' 
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent)',
          top: '10%',
          left: '15%',
          animationDelay: '0s',
        }}
      />
      <div
        className="floating-orb"
        style={{
          width: '500px',
          height: '500px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)' 
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent)',
          top: '50%',
          right: '10%',
          animationDelay: '-5s',
          animationDuration: '25s',
        }}
      />
      <div
        className="floating-orb"
        style={{
          width: '350px',
          height: '350px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent)' 
            : 'radial-gradient(circle, rgba(236, 72, 153, 0.15), transparent)',
          bottom: '10%',
          left: '30%',
          animationDelay: '-10s',
          animationDuration: '22s',
        }}
      />
      <div
        className="floating-orb"
        style={{
          width: '300px',
          height: '300px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.3), transparent)' 
            : 'radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent)',
          top: '30%',
          left: '60%',
          animationDelay: '-7s',
          animationDuration: '18s',
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            bottom: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            background: `rgba(${139 + Math.random() * 50}, ${92 + Math.random() * 50}, ${246}, ${particle.opacity})`,
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
