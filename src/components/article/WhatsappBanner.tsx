import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cachedFetch } from '@/lib/fetchCache';

export function WhatsappBanner() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    cachedFetch('/api/config/site')
      .then(res => {
        if (!res.ok) throw new Error('Fetch error');
        return res.json();
      })
      .then(data => setConfig(data))
      .catch(console.error);
  }, []);

  // Only render if we have loaded the config and it's enabled (or enabled by default)
  if (config && config.whatsapp_channel_enabled === 'false') {
    return null;
  }

  const channelUrl = config?.whatsapp_channel_url || "https://whatsapp.com/channel/0029Vb5e4tw4inotGoAu0A0r";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] shadow-lg shadow-green-500/10 mt-6 mb-10 max-w-[800px] mx-auto p-0.5"
    >
      <a 
        href={channelUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative bg-white/10 hover:bg-white/20 transition-colors duration-300 rounded-[15px] px-6 py-4 overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="bg-white p-2.5 rounded-xl shadow-md rotate-[-3deg] shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#25D366" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"></path>
            </svg>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">
              Ne ratez aucune offre !
            </h3>
            <p className="text-green-50/90 font-medium text-xs sm:text-sm max-w-sm mx-auto sm:mx-0">
              Recevez de nouvelles opportunités en exclusivité sur notre chaîne WhatsApp.
            </p>
          </div>
          
          <div className="shrink-0 w-full sm:w-auto">
            <div className="bg-white text-[#128C7E] w-full justify-center hover:text-[#0a665b] hover:bg-gray-50 transition-colors px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider flex items-center shadow-md">
              Rejoindre
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
