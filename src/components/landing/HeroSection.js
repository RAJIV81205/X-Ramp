'use client';

import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { useExperience } from '../preferences/ExperienceProvider';

export const HeroSection = ({ onRegister }) => {
  const { t } = useExperience();

  return (
    <section className="relative overflow-hidden pb-24 pt-40 md:pb-32 md:pt-50">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.1)_1px,transparent_1px),linear-gradient(to_right,rgba(30,58,138,0.05)_1px,transparent_1px)] bg-size-[40px_40px] [radial-gradient(ellipse_80%_80%_at_50%_50%,#dbeafe_10%,transparent_100%)]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left Side: Text Content */}
        <div className="flex flex-col items-start text-left">

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold tracking-tight text-[var(--foreground)] mb-6 max-w-2xl leading-[1.1]"
          >
            {t('landing.headline')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-950 via-zinc-800 to-gray-500">
              {t('landing.subheadline')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[var(--muted-foreground)] mb-10 max-w-xl leading-relaxed"
          >
            {t('landing.body')}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={onRegister}
              className="h-12 px-8 bg-zinc-950 text-white font-semibold rounded-xs hover:bg-gray-900 transition-all flex items-center gap-2"
            >
              {t('common.createWallet')}
            </button>
            <button
              onClick={onRegister}
              className="h-12 px-8 text-blue-600 bg-zinc-50 border border-blue-100 hover:bg-blue-100 font-semibold rounded-xs transition-all"
            >
              {t('common.login')}
            </button>
          </motion.div>
        </div>

        {/* Right Side: Visual Element */}
        <div className="flex justify-center lg:justify-end w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative w-full aspect-4/3 bg-[var(--card-background)] rounded-lg border border-[var(--border-color)] shadow-2xl flex items-center justify-center overflow-hidden group"
          >
            {/* Inner Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* Central Process Chip */}
            <div className="relative w-40 h-40 bg-blue-600 border border-gray-700 rounded-lg flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.2)] z-10">
              <div className="absolute inset-0 border border-blue-500/20 rounded-lg animate-pulse" />
              <Shield className="w-12 h-12 text-white" />

              {/* Orbiting Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] border border-dashed border-gray-700 rounded-full"
              />
            </div>

            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-900/50 to-transparent" />
            <div className="absolute top-0 left-1/2 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-900/50 to-transparent" />

            {/* Code Snippets */}
            <div className="absolute top-4 left-4 text-[10px] font-mono text-gray-600">
              zk_verify(proof, public_inputs)
            </div>
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-gray-600">
              0x71C...9A2
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
