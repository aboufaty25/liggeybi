import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Smartphone, ChevronRight, X, Globe, LogOut, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TikTokBrowserAlert() {
  const [isTikTok, setIsTikTok] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const ua_lower = ua.toLowerCase();
    const isTikTokBrowser = ua_lower.includes('tiktok') || 
                           ua_lower.includes('musical_ly') || 
                           ua_lower.includes('bytedance') ||
                           ua_lower.includes('ttwebview');
    setIsTikTok(isTikTokBrowser);
    
    // Check if user already dismissed it this session
    let dismissed = false;
    try {
      dismissed = !!sessionStorage.getItem('tiktok_alert_dismissed');
    } catch {}
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    try { sessionStorage.setItem('tiktok_alert_dismissed', 'true'); } catch {}
  };

  if (!isTikTok || !isVisible) return null;

  return (
    <AnimatePresence>
      {/* Flèche animée en haut à droite pointant vers les "..." */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed top-4 right-4 z-[200] pointer-events-none"
      >
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex flex-col items-end drop-shadow-2xl"
        >
          <div className="bg-gradient-to-tr from-[#fe0055] via-[#ff0050] to-[#00f2fe] p-4 rounded-[2rem] shadow-[0_0_40px_rgba(255,0,80,0.6)] mb-3 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white opacity-20 rounded-[2rem] animate-ping" />
            <ArrowUpRight className="w-10 h-10 text-white relative z-10" strokeWidth={3} />
          </div>
          <div className="bg-black/90 backdrop-blur-md text-white text-[12px] font-black uppercase tracking-[0.1em] px-5 py-3 rounded-2xl shadow-xl whitespace-nowrap border border-white/20">
            Cliquer sur <span className="text-[#00f2fe] font-black text-lg align-middle leading-none mx-1">•••</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed inset-x-4 bottom-6 z-[100] md:max-w-md md:mx-auto"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border border-gray-100 overflow-hidden">
          <div className="relative p-8 space-y-6">
            <button 
              onClick={dismiss}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Globe className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter leading-none">Meilleure Expérience</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">Navigateur Externe</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-900 font-black leading-relaxed text-lg tracking-tight">
                Pour postuler, suivez ces deux étapes simples :
              </p>
              
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100 relative overflow-hidden">
                <div className="flex items-start space-x-3 relative z-10">
                  <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black shrink-0">1</div>
                  <p className="text-sm font-bold text-gray-700 leading-tight pt-1">Regardez en haut à droite et cliquez sur <span className="text-gray-900 font-black text-lg align-middle leading-none mx-1">•••</span></p>
                </div>
                <div className="flex items-start space-x-3 relative z-10">
                  <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black shrink-0">2</div>
                  <p className="text-sm font-bold text-gray-700 leading-tight pt-1">Sélectionnez <span className="text-gray-900 font-black text-blue-700 italic">"Ouvrir dans le navigateur"</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
