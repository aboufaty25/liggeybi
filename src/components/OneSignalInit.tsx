import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

let initPromise: Promise<void> | null = null;

export function OneSignalInit() {
  useEffect(() => {
    const initOneSignal = async () => {
      // Prevent multiple initialization attempts
      if (initPromise) return;
      
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      
      if (!appId) {
        console.warn("OneSignal: VITE_ONESIGNAL_APP_ID is missing. Notification initialization skipped.");
        return;
      }

      // Check if we are on the correct domain to avoid OneSignal initialization errors
      const isCorrectDomain = window.location.hostname === 'liggeybi.com' || window.location.hostname.endsWith('.liggeybi.com') || window.location.hostname === 'localhost';
      if (!isCorrectDomain) {
        console.warn(`OneSignal: Initialization skipped on ${window.location.hostname}. OneSignal is configured for liggeybi.com.`);
        return;
      }

      initPromise = (async () => {
        try {
          // Check if OneSignal is already initialized by the library's internal state
          // react-onesignal doesn't expose a clean 'isInitialized' boolean sometimes, 
          // so we wrap it and catch the specific error.
          await OneSignal.init({
            appId,
            allowLocalhostAsSecureOrigin: true,
          });
          OneSignal.Slidedown.promptPush();
        } catch (err: any) {
          if (err?.message?.includes("already initialized")) {
             console.log("OneSignal: SDK already initialized.");
          } else {
             console.error("OneSignal init error:", err);
          }
        }
      })();
    };
    
    initOneSignal();
  }, []);

  return null;
}
