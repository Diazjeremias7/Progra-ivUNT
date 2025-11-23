const express = require('express');

// Importar todas las rutas
const authRoutes = require('./auth');
const productRoutes = require('./products');
const vulnerabilityRoutes = require('./vulnerabilities');
const captchaRoutes = require('./captcha');

// Función para configurar rutas con CSRF protection opcional
const configureRoutes = (csrfProtection) => {
  const router = express.Router();

  // Usar las rutas (algunas sin CSRF, otras con CSRF)
  router.use('/', authRoutes);
  router.use('/', productRoutes);
  router.use('/', vulnerabilityRoutes(csrfProtection)); // Pasar CSRF a vulnerabilities
  router.use('/', captchaRoutes);

  // Ruta de prueba
  router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API funcionando correctamente' });
  });

  return router;
};

module.exports = configureRoutes;