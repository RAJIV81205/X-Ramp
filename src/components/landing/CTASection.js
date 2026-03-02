'use client';

export const CTASection = ({ onRegister }) => {
  return (
    <section className="py-24 bg-gray-100 text-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Experience the future of crypto wallets
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Create your keyless wallet in seconds. No seed phrases, no private keys to manage. 
          Just email-based recovery with zero-knowledge privacy on Stellar.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onRegister}
            className="h-12 px-8 bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all rounded-xs flex items-center justify-center gap-2"
          >
            Create Wallet Now
          </button>
        </div>
        
      </div>
    </section>
  );
};