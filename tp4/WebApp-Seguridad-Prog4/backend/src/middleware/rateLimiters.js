const rateLimit = require('express-rate-limit');
const rateLimit = require('express-rate-limit');

// Rate limiter para login - 5 intentos cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    error: 'Demasiados intentos de login. Por favor, intente más tarde.',
    requiresCaptcha: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// Rate limiter para verificación de usuarios - 10 intentos por minuto
const checkUsernameLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10,
  message: {
    error: 'Demasiadas verificaciones. Por favor, espere un momento.'
  }
});

const productSearchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 30, 
  message: {
    error: 'Demasiadas búsquedas. Por favor, espere un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

module.exports = {
  loginLimiter,
  checkUsernameLimiter,
  productSearchLimiter
};