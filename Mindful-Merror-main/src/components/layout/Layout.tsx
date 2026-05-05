import { ReactNode } from 'react';
import { Header } from './Header';
import FloatingLines from '@/components/ui/FloatingLines';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060d]">
      {/* FloatingLines background */}
      <div className="fixed inset-0 z-0 opacity-50">
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[10, 15, 20]}
          lineDistance={[8, 6, 4]}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
          linesGradient={['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4']}
          animationSpeed={0.8}
        />
      </div>

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
