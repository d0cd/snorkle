'use client';

import { useState } from 'react';
import { LayoutDashboard, Layers, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const DASHBOARDS = [
  { id: 'mapping', name: 'Mapping Dashboard', icon: LayoutDashboard },
  // Add more dashboards here
];

export function Sidebar({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <aside className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-200 ${open ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <span className="font-bold text-lg tracking-wide">Snorkle</span>
        <button onClick={() => setOpen(!open)} className="ml-2 p-1 rounded hover:bg-gray-800">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 py-4">
        {DASHBOARDS.map(d => (
          <button
            key={d.id}
            className={`flex items-center w-full px-4 py-3 text-left gap-3 hover:bg-gray-800 transition-colors ${selected === d.id ? 'bg-gray-800 font-semibold' : ''}`}
            onClick={() => onSelect(d.id)}
          >
            <d.icon className="h-5 w-5" />
            {open && <span>{d.name}</span>}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-800 text-xs text-gray-400 flex flex-col gap-2">
        <ThemeToggle />
        <span>© {new Date().getFullYear()} Snorkle</span>
      </div>
    </aside>
  );
} 