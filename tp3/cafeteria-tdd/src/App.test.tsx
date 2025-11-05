import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import App from './App';

describe('Cafetería TDD', () => {
  
  test('HU1: muestra productos del menú al cargar', async () => {
    render(<App />);
    
    expect(screen.getByText(/cargando menú/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Té')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
  });

test('HU2: agrega producto al pedido', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  await waitFor(() => {
    expect(screen.getByText('Café')).toBeInTheDocument();
  });
  
  const addButtons = screen.getAllByRole('button', { name: /agregar/i });
  await user.click(addButtons[0]);
  
  // Buscar dentro del contenedor "Tu Pedido"
  const pedidoSection = screen.getByText('Tu Pedido').closest('div');
  expect(pedidoSection).toHaveTextContent(/café/i);
  expect(pedidoSection).toHaveTextContent(/x1/i);
});

  test('HU3: calcula el total correctamente', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument();
    });
    
    const addButtons = screen.getAllByRole('button', { name: /agregar/i });
    await user.click(addButtons[0]); // Café $3.50
    await user.click(addButtons[1]); // Té $2.50
    
    expect(screen.getByText(/total: \$6\.00/i)).toBeInTheDocument();
  });

  test('HU4: elimina producto del pedido', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument();
    });
    
    const addButton = screen.getAllByRole('button', { name: /agregar/i })[0];
    await user.click(addButton);
    
    const removeButton = screen.getByRole('button', { name: /eliminar/i });
    await user.click(removeButton);
    
    expect(screen.getByText(/no hay ítems en el pedido/i)).toBeInTheDocument();
  });

  test('HU5: envía pedido y muestra confirmación', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument();
    });
    
    const addButton = screen.getAllByRole('button', { name: /agregar/i })[0];
    await user.click(addButton);
    
    const submitButton = screen.getByRole('button', { name: /enviar pedido/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/pedido confirmado/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/no hay ítems en el pedido/i)).toBeInTheDocument();
  });

  test('HU6: muestra error cuando falla la carga del menú', async () => {
    server.use(
      http.get('/api/menu', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  test('HU6: muestra mensaje cuando no hay productos', async () => {
    server.use(
      http.get('/api/menu', () => {
        return HttpResponse.json([]);
      })
    );
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/no hay productos disponibles/i)).toBeInTheDocument();
    });
  });
});