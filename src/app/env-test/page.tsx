'use client';

import { useEffect } from 'react';

export default function EnvTest() {
  useEffect(() => {
    console.log('=== ENVIRONMENT VARIABLE TEST ===');
    console.log('API Key from env:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    console.log('Expected API Key:', 'AIzaSyDHeegNk_omjNiEgC2qArnk0sg2oK9vlVI');
    console.log('Keys match:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyDHeegNk_omjNiEgC2qArnk0sg2oK9vlVI');
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, background: 'yellow', padding: '10px', zIndex: 9999 }}>
      <h3>Env Test - Check Console</h3>
      <p>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 20)}...</p>
      <p>Expected: AIzaSyDHeegNk_omjNiE...</p>
    </div>
  );
}
