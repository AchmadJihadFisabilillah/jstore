"use client";

import { Sparkles, ShoppingCart, Package } from "lucide-react";

export function PhoneMockup() {
  return (
    <div className="relative w-[240px] sm:w-[260px] h-[480px] sm:h-[520px] bg-black rounded-[36px] sm:rounded-[40px] border-[6px] border-gray-800 shadow-2xl overflow-hidden z-10 animate-float drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Dynamic Island / Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-5 sm:h-6 bg-black rounded-full z-20"></div>
      
      {/* Content Inside Phone (Pure CSS Mockup of JStore) */}
      <div className="w-full h-full bg-card relative flex flex-col pt-10 px-4 select-none pointer-events-none">
        
        {/* Header Mockup */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded flex items-center justify-center text-[8px] font-bold text-foreground">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="w-14 h-3 bg-white/90 rounded-sm"></div>
          </div>
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white/40 rounded-full"></div>
          </div>
        </div>
        
        {/* Banner Mockup */}
        <div className="w-full h-24 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/20 rounded-xl mb-6 p-3 border border-violet-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-violet-500/20 blur-xl rounded-full"></div>
          <div className="w-12 h-3 bg-white/90 rounded mb-2"></div>
          <div className="w-3/4 h-2 bg-gray-400 rounded mb-1"></div>
          <div className="w-1/2 h-2 bg-gray-400 rounded"></div>
          <div className="absolute bottom-3 left-3 w-16 h-5 bg-violet-600 rounded-md"></div>
        </div>

        {/* Categories Mockup */}
        <div className="flex gap-2 mb-6">
           <div className="flex-1 h-8 bg-violet-600/20 border border-violet-500/30 rounded-lg flex items-center justify-center">
             <div className="w-10 h-2 bg-violet-400 rounded"></div>
           </div>
           <div className="flex-1 h-8 bg-muted border border-border rounded-lg flex items-center justify-center">
             <div className="w-10 h-2 bg-gray-400 rounded"></div>
           </div>
           <div className="flex-1 h-8 bg-muted border border-border rounded-lg flex items-center justify-center">
             <div className="w-8 h-2 bg-gray-400 rounded"></div>
           </div>
        </div>

        {/* Product Cards Mockup */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="h-28 bg-muted border border-border rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -right-2 -top-2 w-10 h-10 bg-red-500/10 blur-md rounded-full"></div>
             <div className="w-6 h-6 bg-red-500/20 rounded text-red-500 flex items-center justify-center text-[10px] font-black">N</div>
             <div className="space-y-1.5 mt-2">
                <div className="w-full h-2.5 bg-white/80 rounded"></div>
                <div className="w-1/2 h-2 bg-gray-500 rounded"></div>
                <div className="w-2/3 h-3 bg-violet-400 rounded mt-1"></div>
             </div>
          </div>
          <div className="h-28 bg-muted border border-border rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -right-2 -top-2 w-10 h-10 bg-green-500/10 blur-md rounded-full"></div>
             <div className="w-6 h-6 bg-green-500/20 rounded text-green-500 flex items-center justify-center text-[10px] font-black">S</div>
             <div className="space-y-1.5 mt-2">
                <div className="w-full h-2.5 bg-white/80 rounded"></div>
                <div className="w-1/2 h-2 bg-gray-500 rounded"></div>
                <div className="w-2/3 h-3 bg-violet-400 rounded mt-1"></div>
             </div>
          </div>
        </div>

        {/* Bottom Nav Mockup */}
        <div className="absolute bottom-4 left-4 right-4 h-12 bg-[#12121a]/80 backdrop-blur-md border border-border rounded-2xl flex justify-around items-center px-2 z-30 shadow-lg">
           <div className="flex flex-col items-center gap-1">
             <div className="w-4 h-4 bg-violet-500 rounded-sm"></div>
             <div className="w-6 h-1 bg-violet-500 rounded-full"></div>
           </div>
           <div className="flex flex-col items-center gap-1 opacity-40">
             <div className="w-4 h-4 bg-white rounded-sm"></div>
             <div className="w-6 h-1 bg-transparent rounded-full"></div>
           </div>
           <div className="flex flex-col items-center gap-1 opacity-40">
             <div className="w-4 h-4 bg-white rounded-sm"></div>
             <div className="w-6 h-1 bg-transparent rounded-full"></div>
           </div>
           <div className="flex flex-col items-center gap-1 opacity-40">
             <div className="w-4 h-4 bg-white rounded-sm"></div>
             <div className="w-6 h-1 bg-transparent rounded-full"></div>
           </div>
        </div>

        {/* Glow behind bottom nav */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent pointer-events-none z-20"></div>
      </div>
    </div>
  );
}
