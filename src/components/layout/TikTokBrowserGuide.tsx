import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, ExternalLink, ArrowUpRight, ArrowBigUpDash } from 'lucide-react';

export function TikTokBrowserGuide() {
  const [isTikTok, setIsTikTok] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const ua_lower = ua.toLowerCase();
    const isTikTokBrowser = ua_lower.includes('tiktok') || 
                           ua_lower.includes('musical_ly') || 
                           ua_lower.includes('bytedance') ||
                           ua_lower.includes('ttwebview') ||
                           ua_lower.includes('aweme') ||
                           ua_lower.includes('trill_sdk');
    setIsTikTok(isTikTokBrowser);
    
    // Check if user has already dismissed it this session
    try {
      const dismissed = sessionStorage.getItem('tiktok-guide-dismissed');
      if (dismissed) setIsDismissed(true);
    } catch {}
  }, []);

  const handleDismiss = () => {
    try { sessionStorage.setItem('tiktok-guide-dismissed', 'true'); } catch {}
    setIsDismissed(true);
  };

  if (!isTikTok || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      >
        {/* Animated Arrow pointing top right */}
        <motion.div 
          className="absolute top-4 right-8 z-[110] flex flex-col items-center"
          animate={{ y: [0, -15, 0], x: [0, 15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowUpRight className="h-16 w-16 text-white drop-shadow-[0_0_8px_rgba(254,44,85,0.8)]" strokeWidth={3} />
          <span className="text-white font-black text-sm uppercase tracking-widest mt-2 animate-pulse bg-black/50 px-3 py-1 rounded-full">
            C'est par ici !
          </span>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-[#121212] rounded-3xl overflow-hidden border border-gray-800"
          style={{boxShadow: '0 0 40px rgba(37,244,238,0.1), 0 0 40px rgba(254,44,85,0.1)'}}
        >
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex relative">
                <span className="text-3xl font-black tracking-tighter text-white relative z-10">
                  LIGGEYBI
                </span>
                {/* TikTok Glitch Effect */}
                <span className="text-3xl font-black tracking-tighter text-[#25F4EE] absolute top-[2px] -left-[2px] z-0">
                  LIGGEYBI
                </span>
                <span className="text-3xl font-black tracking-tighter text-[#FE2C55] absolute -top-[2px] left-[2px] z-0">
                  LIGGEYBI
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-300 tracking-tight leading-tight">
                Pour postuler, suivez ces <br />
                <span className="text-white">deux étapes simples</span>
              </h2>
            </div>

            {/* Steps */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#25F4EE]"></div>
                <div className="w-10 h-10 shrink-0 bg-[#25F4EE]/20 text-[#25F4EE] rounded-xl flex items-center justify-center font-black">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-gray-200 font-bold leading-snug">
                    Cliquez sur les <span className="inline-flex align-middle bg-white/10 p-1 rounded-md mx-1"><MoreHorizontal className="h-4 w-4" /></span> en haut à droite.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FE2C55]"></div>
                <div className="w-10 h-10 shrink-0 bg-[#FE2C55]/20 text-[#FE2C55] rounded-xl flex items-center justify-center font-black">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-gray-200 font-bold leading-snug flex items-center flex-wrap gap-1">
                    Choisissez <span className="text-white border-b-2 border-[#FE2C55]">Ouvrir dans le navigateur</span>
                    <ExternalLink className="h-4 w-4 inline ml-1 text-[#FE2C55]" />
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
