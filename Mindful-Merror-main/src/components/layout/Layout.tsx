import { ReactNode } from 'react';
import { Header } from './Header';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="container py-8 flex-1">
          {children}
        </main>
        <footer className="border-t border-white/10 py-6 backdrop-blur-sm">
          <div className="container text-center text-sm text-white/50">
            <p className="text-white/40">Memory belongs to you. AI explains, never decides.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
