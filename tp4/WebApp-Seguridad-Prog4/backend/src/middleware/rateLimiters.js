const rateLimit = require('express-rate-limit');

// Rate limiter para login - 5 intentos cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: {
    error: 'Demasiados intentos de login. Por favor, intente más tarde.',
    requiresCaptcha: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Identificar por IP
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// Rate limiter para verificación de usuarios - 10 intentos por minuto
const checkUsernameLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10,
  message: {
    error: 'Demasiadas verificaciones. Por favor, espere un momento.'
  }
});

module.exports = {
  loginLimiter,
  checkUsernameLimiter
};