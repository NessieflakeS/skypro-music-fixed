export const checkApiEndpoints = async () => {
  const endpoints = [
    'https://webdev-music-003b5b991590.herokuapp.com/api/catalog/track/all/',
    'https://webdev-music-003b5b991590.herokuapp.com/api/catalog/selection/1/',
    'https://webdev-music-003b5b991590.herokuapp.com/api/user/login/',
    'https://webdev-music-003b5b991590.herokuapp.com/api/user/signup/'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET' });
      results.push({
        endpoint,
        status: response.status,
        ok: response.ok
      });
    } catch (error) {
      results.push({
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
};