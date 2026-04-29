'use client';

import Image from 'next/image';
import { PreferenceControls } from '../preferences/PreferenceControls';
import { useExperience } from '../preferences/ExperienceProvider';

export const Navbar = ({ onLogin, onRegister }) => {
  const { t } = useExperience();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-color)] bg-[color:rgba(255,255,255,0.82)] backdrop-blur-md supports-[backdrop-filter]:bg-[color:rgba(255,255,255,0.72)] [html[data-theme='dark']_&]:bg-[color:rgba(9,9,11,0.88)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Image src="/xramp-logo.png" width={100} height={50} alt='logo' />
        <div className="flex items-center gap-3 md:gap-6">
            <PreferenceControls compact />
            <button
              onClick={onLogin}
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-4 md:px-5 py-2.5 rounded-xs border border-[var(--border-color)]"
            >
              {t('common.login')}
            </button>
            <button
              onClick={onRegister}
              className="bg-zinc-950 text-white text-sm font-medium px-5 py-2.5 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200/50 rounded-xs hover:-translate-y-0.5"
            >
              {t('common.getStarted')}
            </button>
        </div>
      </div>
    </nav>
  );
};
