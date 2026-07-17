import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const skipScroll = () => {
      try {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
        document.documentElement.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
        document.body.scrollTo({
           top: 0,
           left: 0,
           behavior: 'instant',
        });
      } catch (error) {
        window.scrollTo(0, 0);
      }
    };
    
    // Run immediately
    skipScroll();
    
    // Also run after a short tick to handle React rendering delays
    const timeoutId = setTimeout(skipScroll, 0);
    const timeoutId2 = setTimeout(skipScroll, 50);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [pathname]);

  return null;
}
