import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cachedFetch } from '@/lib/fetchCache';
import { MoreHorizontal, ArrowUpRight } from 'lucide-react';

export function SocialBrowserGuide() {
  const [platform, setPlatform] = useState<'facebook' | 'whatsapp' | 'instagram' | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Check global config first
    cachedFetch('/api/config/site')
      .then(res => {
        if (!res.ok) throw new Error('Fetch Error');
        return res.json();
      })
      .then(config => {
        if (config.social_browser_guide_enabled === 'false') {
          setIsEnabled(false);
        }
      })
      .catch(console.error);

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const ua_lower = ua.toLowerCase();
    
    // Check for platforms
    const isFacebookBrowser = ua_lower.includes('fban') || ua_lower.includes('fbav');
    const isWhatsAppBrowser = ua_lower.includes('whatsapp');
    const isInstagramBrowser = ua_lower.includes('instagram');

    if (isFacebookBrowser) {
        setPlatform('facebook');
    } else if (isWhatsAppBrowser) {
        setPlatform('whatsapp');
    } else if (isInstagramBrowser) {
        setPlatform('instagram');
    }

    // Check if user has already dismissed it this session
    try {
      const dismissed = sessionStorage.getItem('social-guide-dismissed');
      if (dismissed) setIsDismissed(true);
    } catch {}
  }, []);

  const handleDismiss = () => {
    try { sessionStorage.setItem('social-guide-dismissed', 'true'); } catch {}
    setIsDismissed(true);
  };

  const getPlatformConfig = () => {
    switch (platform) {
      case 'facebook':
        return {
          name: 'Facebook',
          color: '#1877F2',
          bgColor: '#ffffff',
          textColor: '#050505',
          shadowColor: 'rgba(24,119,242,0.15)',
          icon: <svg className="w-10 h-10 fill-current text-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" /></svg>
        };
      case 'whatsapp':
        return {
          name: 'WhatsApp',
          color: '#25D366',
          bgColor: '#EFEAE2', 
          textColor: '#075E54',
          shadowColor: 'rgba(37,211,102,0.15)',
          icon: <svg className="w-10 h-10 fill-current text-[#25D366]" viewBox="0 0 24 24"><path d="M17.47 13.5v.01c-.15 0-.3-.02-.45-.06-.5-.13-1.07-.3-1.66-.46-.35-.1-.7-.2-.97-.24-.22-.03-.42 0-.58.07-.38.16-.76.43-1.12.72-.42.34-.84.67-1.13.78-.13.05-.28.08-.43.08-.4 0-.82-.16-1.5-.48-1.42-.66-3.26-2.02-4.2-3.32-.42-.58-.6-1.05-.6-1.45 0-.15.02-.3.07-.44.13-.3.45-.63.8-.97.23-.21.46-.43.6-.68.17-.3.12-.55 0-.8-.11-.23-.27-.58-.45-.98-.22-.48-.46-1.03-.68-1.43-.3-.52-.6-.56-.95-.56h-.14c-.37 0-.74.05-1.05.15-.55.18-1.52.88-1.52 2.62 0 1.95.82 3.82 2.38 5.43 2.92 3.02 7.15 4.96 11.23 4.96 2.05 0 3.32-.77 4.14-1.63.76-.8 1.05-1.8 1.05-2.6 0-.3-.06-.5-.07-.53-.18-.46-.73-.68-1.3-.84-.52-.15-1.06-.3-1.6-.44-.3-.1-.6-.2-.73-.2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-1.8 0-3.48-.52-4.9-1.4l-.35-.2-5.4 1.4 1.45-5.26-.22-.38C1.65 12.8 1.15 10.96 1.15 9.1c0-5.87 4.88-10.65 10.85-10.65S22.85 3.23 22.85 9.1c0 5.86-4.88 10.64-10.85 10.64z"/></svg>
        };
      case 'instagram':
        return {
          name: 'Instagram',
          color: '#E1306C',
          bgColor: '#FAFAFA',
          textColor: '#262626',
          shadowColor: 'rgba(225,48,108,0.15)',
          icon: <svg className="w-10 h-10 fill-current text-[#E1306C]" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.95.48 1.35.88.4.4.66.8.88 1.35.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.95-.88 1.35-.4.4-.8.66-1.35.88-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.22-.41-.56-.22-.95-.48-1.35-.88-.4-.4-.66-.8-.88-1.35-.16-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.95.88-1.35.4-.4.8-.66 1.35-.88.42-.16 1.05-.36 2.22-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.77.13 4.9.33 4.14.63c-.8.3-1.47.73-2.12 1.38-.65.65-1.08 1.32-1.38 2.12C.33 4.9.13 5.77.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.3.8.73 1.47 1.38 2.12.65.65 1.32 1.08 2.12 1.38.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56.8-.3 1.47-.73 2.12-1.38.65-.65 1.08-1.32 1.38-2.12.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91-.3-.8-.73-1.47-1.38-2.12-.65-.65-1.32-1.08-2.12-1.38-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1012 18.16 6.16 6.16 0 0012 5.84zm0 10.16A4 4 0 1112 8a4 4 0 010 8zm3.96-9.11a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
        };
      default:
        return null;
    }
  };

  const config = getPlatformConfig();
  if (!config || isDismissed || !isEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        onClick={handleDismiss}
      >
        <motion.div 
          className="absolute top-4 right-4 z-[110] flex flex-col items-end transition-all duration-300"
          animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ backgroundColor: config.color, boxShadow: `0 0 20px ${config.color}` }} className="rounded-full p-2">
            <ArrowUpRight className="h-16 w-16 text-white" strokeWidth={3} />
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-sm rounded-[2rem] overflow-hidden mt-20"
          style={{
            backgroundColor: config.bgColor,
            boxShadow: `0 0 60px ${config.shadowColor}`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 space-y-6">
            <div className="flex justify-center mb-2">
              {config.icon}
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight" style={{ color: config.textColor }}>
                Vous êtes sur {config.name}
              </h2>
            </div>

            <div className="pt-4 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-black text-gray-800 shrink-0">1</div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-800 font-bold leading-snug text-sm">
                    Cliquez sur les <span className="inline-flex items-center align-middle bg-gray-100 p-1 px-1.5 rounded-lg mx-1 border border-gray-200"><MoreHorizontal className="h-4 w-4 text-gray-700" /></span> en haut à droite.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-black text-gray-800 shrink-0">2</div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-800 font-bold leading-snug text-sm">
                    Choisissez <strong className="text-green-600">"Ouvrir dans le navigateur"</strong> pour voir l'offre complète.
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
