import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function GoogleAnalytics() {
  const location = useLocation();
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!gaId) return;

    // Load the GA script if not already loaded
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      const scriptInline = document.createElement('script');
      scriptInline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', { send_page_view: false });
      `;
      document.head.appendChild(scriptInline);
    }
  }, [gaId]);

  // Track page views on route changes
  useEffect(() => {
    if (!gaId) return;
    
    // @ts-ignore
    if (typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('config', gaId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, gaId]);

  return null;
}
