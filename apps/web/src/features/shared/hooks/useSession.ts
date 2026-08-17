import { useState, useEffect } from 'react';

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = `anon-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('sessionId', id);
      
      // Optionally notify backend to create the session explicitly
      fetch('http://localhost:3333/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, eventType: 'SESSION_CREATED' })
      }).catch(console.error);
    }
    setSessionId(id);
  }, []);

  return { sessionId };
};
