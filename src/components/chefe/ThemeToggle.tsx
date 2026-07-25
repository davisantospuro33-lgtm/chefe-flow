import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Mantém estado com base no HTML/Dark mode do Tailwind
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full border border-slate-700/50 dark:border-slate-800 bg-slate-900/40 dark:bg-slate-950 text-slate-200 hover:scale-105 active:scale-95 transition-all shadow-sm"
      title={isDark ? "Mudar para Tema Dia" : "Mudar para Tema Noite"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-800" />
      )}
    </button>
  );
};
