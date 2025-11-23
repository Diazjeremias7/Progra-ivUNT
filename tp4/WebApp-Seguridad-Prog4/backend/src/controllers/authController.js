const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { updateAuthTime } = require('../middleware/csrfValidation');

// Store temporal para rastrear intentos fallidos (en producción usar Redis)
const failedAttempts = new Map();

// Limpiar intentos antiguos cada 30 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > 30 * 60 * 1000) {
      failedAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

// Calcular delay basado en intentos fallidos
const calculateDelay = (attempts) => {
  if (attempts <= 2) return 0;
  return Math.min(Math.pow(2, attempts - 2) * 1000, 30000);
};

// Función para registrar intento fallido
const recordFailedAttempt = (identifier) => {
  const current = failedAttempts.get(identifier) || {
    count: 0,
    lastAttempt: Date.now()
  };

  current.count += 1;
  current.lastAttempt = Date.now();
  failedAttempts.set(identifier, current);

  return current.count;
};

// Función para verificar si necesita CAPTCHA
const needsCaptcha = (identifier) => {
  const attempts = failedAttempts.get(identifier);
  return attempts && attempts.count >= 3;
};

const login = async (req, res) => {
  const { username, password, captchaId, captchaText } = req.body;
  const identifier = req.ip || 'unknown';

  // Verificar si necesita CAPTCHA
  if (needsCaptcha(identifier)) {
    if (!captchaId || !captchaText) {
      return res.status(400).json({
        error: 'Se requiere verificación CAPTCHA después de múltiples intentos fallidos',
        requiresCaptcha: true
      });
    }

    // Verificar CAPTCHA
    const { captchaStore } = require('./captchaController');
    const storedCaptcha = captchaStore[captchaId];

    if (!storedCaptcha || storedCaptcha !== captchaText.toLowerCase()) {
      return res.status(400).json({
        error: 'CAPTCHA inválido',
        requiresCaptcha: true
      });
    }

    // CAPTCHA válido, eliminar
    delete captchaStore[captchaId];
  }

  // Calcular delay basado en intentos previos
  const attempts = failedAttempts.get(identifier);
  const delay = attempts ? calculateDelay(attempts.count) : 0;

  // Aplicar delay si es necesario
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  const query = `SELECT * FROM users WHERE username = ?`;

  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      recordFailedAttempt(identifier);
      return res.status(401).json({
        error: 'Credenciales inválidas',
        requiresCaptcha: needsCaptcha(identifier)
      });
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      recordFailedAttempt(identifier);
      return res.status(401).json({
        error: 'Credenciales inválidas',
        requiresCaptcha: needsCaptcha(identifier)
      });
    }

    // Login exitoso - limpiar intentos fallidos
    failedAttempts.delete(identifier);

    // Actualizar timestamp de autenticación para CSRF
    updateAuthTime(req);

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'supersecret123'
    );

    res.json({ token, username: user.username });
  });
};

const register = async (req, res) => {
  const { username, password, email } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  db.query(query, [username, hashedPassword, email], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    res.json({ message: 'Usuario registrado con éxito' });
  });
};

const verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');
    req.session.userId = decoded.id;

    // Actualizar timestamp de autenticación
    updateAuthTime(req);

    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Blind SQL Injection - ahora con rate limiting
const checkUsername = (req, res) => {
  const { username } = req.body;

  // Validación estricta de username
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Formato de usuario inválido' });
  }

  // Usar consulta parametrizada
  const query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';

  // Agregar delay aleatorio para prevenir timing attacks
  const delay = Math.random() * 100 + 50; // 50-150ms

  setTimeout(() => {
    db.query(query, [username], (err, results) => {
      if (err) {
        // No exponer detalles del error
        console.error('Database error:', err);
        return res.json({ exists: false });
      }

      const exists = results[0].count > 0;
      res.json({ exists });
    });
  }, delay);
};

module.exports = {
  login,
  register,
  verifyToken,
  checkUsername
};