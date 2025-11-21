import React, { useState, FormEvent, useEffect } from 'react';
import apiService from '../services/api';

interface LoginProps {
  onLogin: (token: string, username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [requiresCaptcha, setRequiresCaptcha] = useState<boolean>(false);
  const [captchaData, setCaptchaData] = useState<any>(null);
  const [captchaInput, setCaptchaInput] = useState<string>('');

  useEffect(() => {
    if (requiresCaptcha) {
      loadCaptcha();
    }
  }, [requiresCaptcha]);

  const loadCaptcha = async () => {
    try {
      const response = await apiService.getCaptcha();
      setCaptchaData(response);
      setCaptchaInput('');
    } catch (error) {
      console.error('Error cargando captcha:', error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        await apiService.register({ username, password, email });
        setError('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        setIsRegistering(false);
      } else {
        // Login con CAPTCHA si es necesario
        const loginData: any = { username, password };
        if (requiresCaptcha && captchaData) {
          loginData.captchaId = captchaData.captchaId;
          loginData.captchaText = captchaInput;
        }
        
        const response = await apiService.login(loginData);
        onLogin(response.token, response.username);
        setRequiresCaptcha(false);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      setError(errorData?.error || 'Error al procesar la solicitud');
      
      // Si requiere CAPTCHA, activarlo
      if (errorData?.requiresCaptcha) {
        setRequiresCaptcha(true);
      }
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Registrar Usuario' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {isRegistering && (
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}
        
        {/* CAPTCHA si es requerido */}
        {requiresCaptcha && captchaData && !isRegistering && (
          <div className="form-group">
            <label>CAPTCHA (requerido después de múltiples intentos):</label>
            <div className="captcha-container" style={{ marginBottom: '10px' }}>
              <div 
                className="captcha-image"
                dangerouslySetInnerHTML={{ __html: captchaData.captcha }}
              />
              <button 
                type="button" 
                onClick={loadCaptcha} 
                className="btn btn-secondary"
                style={{ marginLeft: '10px' }}
              >
                Recargar
              </button>
            </div>
            <input 
              type="text" 
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Ingrese el texto del CAPTCHA"
              required={requiresCaptcha}
            />
          </div>
        )}
        
        {error && <div className={`alert ${error.includes('éxito') ? 'alert-success' : 'alert-danger'}`}>{error}</div>}
        
        <button type="submit" className="btn btn-primary">
          {isRegistering ? 'Registrar' : 'Iniciar Sesión'}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setRequiresCaptcha(false);
            setError('');
          }}
        >
          {isRegistering ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
        </button>
      </form>
      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        <strong>Usuarios de prueba:</strong><br />
        admin / admin123<br />
        user1 / user123
      </div>
    </div>
  );
};

export default Login;