import React, { useState } from 'react';
import apiService from '../../services/api';

interface InjectionExample {
  label: string;
  value: string;
  isMalicious: boolean;
}

const CommandInjection: React.FC = () => {
  const [host, setHost] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePing = async (): Promise<void> => {
    setError('');
    setOutput('');
    setIsLoading(true);
    
    try {
      const response = await apiService.ping(host);
      setOutput(response.output);
    } catch (error: any) {
      const errorData = error.response?.data;
      setError(errorData?.error || 'Error al ejecutar ping');
      
      // Mostrar detalles si están disponibles
      if (errorData?.details && Array.isArray(errorData.details)) {
        setError(prev => `${prev}\\n${errorData.details.join('\\n')}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const examples: InjectionExample[] = [
    { label: 'Ping normal ✅', value: '8.8.8.8', isMalicious: false },
    { label: 'Google.com ✅', value: 'google.com', isMalicious: false },
    { label: 'Cloudflare DNS ✅', value: '1.1.1.1', isMalicious: false },
    { label: 'Listar archivos ❌', value: '8.8.8.8; ls -la', isMalicious: true },
    { label: 'Ver archivo passwd ❌', value: '8.8.8.8; cat /etc/passwd', isMalicious: true },
    { label: 'Comando con pipe ❌', value: '8.8.8.8 | whoami', isMalicious: true },
    { label: 'Múltiples comandos ❌', value: '8.8.8.8 && uname -a', isMalicious: true }
  ];

  return (
    <div className="vulnerability-section">
      <h2>Command Injection</h2>
      
      <div className="alert alert-success">
        <strong>✅ PROTECCIÓN IMPLEMENTADA:</strong>
        <ul style={{ textAlign: 'left', marginTop: '10px' }}>
          <li>Validación estricta de entrada (solo IPs y hostnames válidos)</li>
          <li>Uso de <code>spawn()</code> con argumentos separados en lugar de <code>exec()</code></li>
          <li>Eliminación de caracteres peligrosos (;, |, &, `, $, etc.)</li>
          <li>Timeout de 10 segundos para evitar comandos largos</li>
          <li>Logging de intentos sospechosos</li>
          <li>Mensajes de error genéricos (sin exponer detalles internos)</li>
        </ul>
      </div>

      <div className="form-group">
        <label>Host/IP para hacer ping:</label>
        <input 
          type="text" 
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="Ej: 8.8.8.8 o google.com"
          disabled={isLoading}
        />
      </div>

      <button 
        onClick={handlePing} 
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? 'Ejecutando...' : 'Ejecutar Ping'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Ejemplos de prueba:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {examples.map((example, index) => (
            <button 
              key={index}
              className={`btn ${example.isMalicious ? 'btn-danger' : 'btn-success'}`}
              onClick={() => setHost(example.value)}
              style={{ margin: '0', fontSize: '12px' }}
              disabled={isLoading}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginTop: '20px' }}>
          <strong>❌ Bloqueado por seguridad:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '10px' }}>
            {error}
          </pre>
        </div>
      )}

      {output && (
        <div style={{ marginTop: '20px' }}>
          <h3>✅ Salida del comando:</h3>
          <pre style={{ maxHeight: '300px', overflowY: 'auto' }}>{output}</pre>
        </div>
      )}

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        <strong>🔍 Prueba los ejemplos maliciosos:</strong>
        <p>Los intentos de inyección ahora son bloqueados y registrados. La aplicación solo permite ejecutar ping con hosts válidos.</p>
      </div>
    </div>
  );
};

export default CommandInjection;