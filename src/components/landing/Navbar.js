'use client';

import Image from 'next/image';

export const Navbar = ({ onLogin, onRegister }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Image src="/xramp-logo.png" width={100} height={50} alt='logo' />
        <div className="flex items-center gap-6">
            <button
              onClick={onLogin}
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-5 py-2.5 rounded-xs border"
            >
              Log in
            </button>
            <button
              onClick={onRegister}
              className="bg-zinc-950 text-white text-sm font-medium px-5 py-2.5 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200/50 rounded-xs hover:-translate-y-0.5"
            >
              Get started
            </button>
        </div>
      </div>
    </nav>
  );
};