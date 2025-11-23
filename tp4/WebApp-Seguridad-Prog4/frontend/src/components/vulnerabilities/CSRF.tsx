import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { TransferData } from '../../types';

interface TransferResult {
  success: boolean;
  message: string;
}

const CSRF: React.FC = () => {
  const [fromAccount, setFromAccount] = useState<string>('');
  const [toAccount, setToAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [result, setResult] = useState<TransferResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasCsrfToken, setHasCsrfToken] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si tenemos token CSRF al cargar
    checkCsrfToken();
  }, []);

  const checkCsrfToken = async () => {
    try {
      await apiService.getCsrfToken();
      setHasCsrfToken(true);
    } catch (error) {
      setHasCsrfToken(false);
    }
  };

  const handleTransfer = async (): Promise<void> => {
    setIsLoading(true);
    setResult(null);

    try {
      const transferData: TransferData = { fromAccount, toAccount, amount };
      const response = await apiService.transfer(transferData);
      setResult({ success: true, message: response.message });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error en la transferencia';
      setResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const maliciousHTML = `
<!-- Página maliciosa que AHORA SERÁ BLOQUEADA -->
<html>
<body onload="document.forms[0].submit()">
  <h1>Felicidades! Has ganado un premio!</h1>
  <form action="${API_URL}/api/transfer" method="POST">
    <input type="hidden" name="fromAccount" value="cuenta-victima" />
    <input type="hidden" name="toAccount" value="cuenta-atacante" />
    <input type="hidden" name="amount" value="10000" />
    <!-- NOTA: Este ataque ahora FALLA porque falta el token CSRF -->
  </form>
</body>
</html>
  `;

  return (
    <div className="vulnerability-section">
      <h2>Cross-Site Request Forgery (CSRF)</h2>

      <div className="alert alert-success">
        <strong>✅ PROTECCIÓN IMPLEMENTADA:</strong>
        <ul style={{ textAlign: 'left', marginTop: '10px' }}>
          <li>Token CSRF único por sesión (cookies seguras)</li>
          <li>Validación de origen (Origin/Referer headers)</li>
          <li>Cookies con SameSite=Strict</li>
          <li>Token debe incluirse en todas las peticiones sensibles</li>
          <li>Re-autenticación requerida para operaciones críticas</li>
        </ul>
        {hasCsrfToken && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
            🔐 Token CSRF activo para esta sesión
          </div>
        )}
      </div>

      <div className="transfer-form">
        <h3>Formulario de Transferencia</h3>

        <div className="form-group">
          <label>Cuenta Origen:</label>
          <input
            type="text"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            placeholder="Número de cuenta origen"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Cuenta Destino:</label>
          <input
            type="text"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="Número de cuenta destino"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Monto:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monto a transferir"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleTransfer}
          className="btn btn-primary"
          disabled={isLoading || !hasCsrfToken}
        >
          {isLoading ? 'Procesando...' : 'Realizar Transferencia'}
        </button>

        {!hasCsrfToken && (
          <div className="alert alert-warning" style={{ marginTop: '10px' }}>
            ⚠️ Esperando token CSRF...
          </div>
        )}

        {result && (
          <div className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
            {result.success ? '✅' : '❌'} {result.message}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Ejemplo de ataque CSRF (ahora bloqueado):</h3>
        <pre style={{ fontSize: '12px', background: '#f8d7da', padding: '15px', borderRadius: '4px' }}>
          {maliciousHTML}
        </pre>
        <div className="alert alert-info">
          <strong>🛡️ Por qué este ataque ahora falla:</strong>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li>El formulario no incluye el token CSRF requerido</li>
            <li>El origen es diferente al permitido</li>
            <li>Las cookies tienen SameSite=Strict</li>
            <li>El servidor valida el token en cada petición POST</li>
          </ul>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        <strong>🔍 Prueba la protección:</strong>
        <p>Intenta hacer una transferencia desde otra pestaña o usando herramientas como Postman sin el token CSRF. La petición será rechazada con error 403 (Forbidden).</p>
      </div>
    </div>
  );
};

export default CSRF;