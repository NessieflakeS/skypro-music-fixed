"use client";

import { useState } from 'react';
import { testAPI } from '@/services/authService';

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestAPI = async () => {
    setLoading(true);
    try {
      const response = await testAPI();
      setResult(response);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Тест</h1>
      <button 
        onClick={handleTestAPI}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Тестирование...' : 'Протестировать API'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
          <h3>Результат:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <h3>Попробуйте вручную в консоли:</h3>
        <pre style={{ background: '#000', color: '#0f0', padding: '10px', borderRadius: '5px' }}>
{`fetch('https://webdev-music-003b5b991590.herokuapp.com/user/signup/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'testpassword',
    username: 'testuser'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err))`}
        </pre>
      </div>
    </div>
  );
}