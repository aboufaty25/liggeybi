import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
}

export function AdBanner({ slot, format = 'auto', style }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const pushAd = () => {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
          (window as any).adsbygoogle.push({});
        }
      } catch (error: any) {
        if (!error?.message?.includes('already have ads')) {
          console.error('AdSense error:', error);
        }
      }
    };
    
    // Slight delay ensures the DOM layout is settled before pushing the ad
    const timer = setTimeout(pushAd, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="my-2 flex flex-col items-center w-full text-center relative overflow-hidden" style={style}>
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-6041328420882324"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
