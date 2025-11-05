import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos y validaciones
interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem extends Product {
  quantity: number;
}

// Contexto para el estado global del pedido
interface OrderContextType {
  items: OrderItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  total: number;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<OrderItem[]>([]);

  const addItem = (product: Product) => {
    setItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id);
      if (existing) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => {
      const existing = prevItems.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevItems.filter(item => item.id !== productId);
    });
  };

  const clearOrder = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <OrderContext.Provider value={{ items, addItem, removeItem, total, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder debe usarse dentro de OrderProvider');
  }
  return context;
};

// Componente Menu
const Menu: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useOrder();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/menu');
        
        if (!response.ok) {
          throw new Error('Error al cargar el menú');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) {
    return <div>Cargando menú...</div>;
  }

  if (error) {
    return <div role="alert">Error al cargar menú</div>;
  }

  if (products.length === 0) {
    return <div>No hay productos disponibles</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Menú</h2>
      <ul className="space-y-3">
        {products.map(product => (
          <li
            key={product.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div>
              <span className="font-semibold text-lg text-gray-800">{product.name}</span>
              <span className="ml-3 text-gray-600">${product.price.toFixed(2)}</span>
            </div>
            <button
              onClick={() => addItem(product)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition font-medium"
            >
              Agregar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente Order (Pedido Actual)
const Order: React.FC = () => {
  const { items, removeItem, total, clearOrder } = useOrder();
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (items.length === 0) return;

    try {
      setSubmitting(true);
      setSubmitMessage(null);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el pedido');
      }

      setSubmitMessage('Pedido confirmado');
      clearOrder();
    } catch (err) {
      setSubmitMessage('Error al enviar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Tu Pedido</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500 italic">No hay ítems en el pedido</p>
      ) : (
        <>
          <ul role="list" className="space-y-2 mb-4">
            {items.map(item => (
              <li
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="mx-2 text-gray-600">x{item.quantity}</span>
                  <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t pt-4 mt-4">
            <p className="text-xl font-bold text-gray-800">
              Total: ${total.toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold text-lg disabled:bg-gray-400"
          >
            {submitting ? 'Enviando...' : 'Enviar Pedido'}
          </button>
        </>
      )}

      {submitMessage && (
        <div
          className={`mt-4 p-3 rounded-lg text-center font-medium ${
            submitMessage.includes('confirmado')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {submitMessage}
        </div>
      )}
    </div>
  );
};

// Componente Principal
const App: React.FC = () => {
  return (
    <OrderProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">☕ Cafetería Digital</h1>
            <p className="text-gray-600">Sistema de pedidos con TDD</p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <Menu />
            <Order />
          </div>

          <footer className="mt-8 text-center text-sm text-gray-600">
            <p>Desarrollado con React + TypeScript + Vitest + RTL + MSW</p>
          </footer>
        </div>
      </div>
    </OrderProvider>
  );
};

export default App;