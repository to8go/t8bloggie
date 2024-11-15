import { useState, useEffect } from 'react';

export function useClientId() {
  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    // Generate a random client ID if not exists
    const stored = localStorage.getItem('clientId');
    if (stored) {
      setClientId(stored);
    } else {
      const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('clientId', newId);
      setClientId(newId);
    }
  }, []);

  return clientId;
}