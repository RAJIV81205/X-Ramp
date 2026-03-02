'use client';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-900 rounded-none flex items-center justify-center text-white text-xs font-bold">X</div>
          <span className="font-semibold text-gray-900">X-Ramp</span>
        </div>
        <div className="text-sm text-gray-500">
          © 2024 X-Ramp Protocol. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">Twitter</a>
          <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">GitHub</a>
          <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  );
};