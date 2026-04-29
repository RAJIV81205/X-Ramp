'use client';

import { Languages, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';
import { useExperience } from './ExperienceProvider';

export function PreferenceControls({ compact = false }) {
  const { theme, toggleTheme, language, setLanguage } = useExperience();

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)]"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <div className="flex items-center rounded-xs border border-[var(--border-color)] bg-[var(--card-background)] p-1 text-[var(--foreground)]">
        <Languages className="ml-2 h-4 w-4 text-[var(--muted-foreground)]" />
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`rounded-xs px-2 py-1 text-xs font-medium ${language === 'en' ? 'bg-zinc-950 text-white' : 'text-[var(--muted-foreground)]'}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('hi')}
          className={`rounded-xs px-2 py-1 text-xs font-medium ${language === 'hi' ? 'bg-zinc-950 text-white' : 'text-[var(--muted-foreground)]'}`}
        >
          HI
        </button>
      </div>
    </div>
  );
}
