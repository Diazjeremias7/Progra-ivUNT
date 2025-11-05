import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const mockProducts = [
  { id: '1', name: 'Café', price: 3.5 },
  { id: '2', name: 'Té', price: 2.5 },
  { id: '3', name: 'Croissant', price: 4.0 },
  { id: '4', name: 'Capuchino', price: 4.5 },
  { id: '5', name: 'Muffin', price: 3.0 },
];

export const handlers = [
  http.get('/api/menu', () => {
    return HttpResponse.json(mockProducts);
  }),
  
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ 
      success: true, 
      orderId: Math.random().toString(36).substr(2, 9) 
    });
  }),
];

export const server = setupServer(...handlers);