export async function fetchToken(username: string, password: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/auth/token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
    
        if (!res.ok) {
          throw new Error('Failed to fetch token');
        }
    
        const data = await res.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
      } catch (error) {
        console.error('Error in fetchToken:', error);
      }
}
  

export async function refreshToken() {
    const apiUrl = process.env.NEXT_PUBLIC_DJANGO_URL;
    const refreshToken = localStorage.getItem('refresh_token');
  
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
  
    const res = await fetch(`${apiUrl}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
  
    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }
  
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
  }  