import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function AdSenseUpdater() {
  const location = useLocation();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        
        // We use a small timeout to ensure the new page components and their ad tags are fully mounted
        const timer = setTimeout(() => {
          // For Auto Ads, AdSense sometimes handles this automatically on push state, 
          // but for manual ad slots we need to trigger them.
          // This push pushes a new ad request for any empty ad slots on the page.
          const uninitializedAds = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status="done"])');
          if (uninitializedAds.length > 0) {
            // Push one for each uninitialized ad unit, or just let AdSense handle the queue
            uninitializedAds.forEach(() => {
               adsbygoogle.push({});
            });
          }
        }, 500);

        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error('Error updating AdSense:', err);
    }
  }, [location.pathname, location.search]);

  return null;
}
