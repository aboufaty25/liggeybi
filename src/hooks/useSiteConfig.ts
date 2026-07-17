import { useState, useEffect } from 'react';

export function useSiteConfig() {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    fetch('/api/config/site')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return config;
}
