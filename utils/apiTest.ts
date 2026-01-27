export const testApiEndpoints = async () => {
  const baseUrl = 'https://webdev-music-003b5b991590.herokuapp.com';
  
  const endpoints = [
    '/api/catalog/track/all/',
    '/api/tracks/',
    '/api/track/all/',
    '/api/music/tracks/',
    '/catalog/track/all/',
    '/tracks/',
    '/track/all/',
    '/music/tracks/'
  ];
  
  console.log('Testing API endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✓ ${endpoint}: SUCCESS`, data.length ? `Found ${data.length} items` : 'Empty response');
        return endpoint;
      } else {
        console.log(`✗ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (err: unknown) {
      const error = err as any;
      console.log(`✗ ${endpoint}: ERROR`, error.message || 'Unknown error');
    }
  }
  
  return null;
};