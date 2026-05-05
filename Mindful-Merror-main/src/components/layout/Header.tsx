import { Plus, MessageCircle, Home, Hexagon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Timeline', icon: Home },
    { path: '/add', label: 'New Decision', icon: Plus },
    { path: '/reflect', label: 'Reflect', icon: MessageCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-all hover:scale-105">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
            <Hexagon className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-md" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight text-white">NEXUS</h1>
          </div>
        </Link>
        
        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                location.pathname === path
                  ? "bg-white/15 text-white shadow-inner shadow-white/5"
                  : "text-white/50 hover:bg-white/10 hover:text-white/80"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
