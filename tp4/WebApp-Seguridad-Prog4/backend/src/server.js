const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');

// Importar configuraciones y utilidades
const { connectWithRetry } = require('./config/database');
const { initializeFiles } = require('./utils/fileInit');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Importar rutas
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  credentials: true // Importante para cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session configurada con cookies seguras
app.use(session({
  secret: process.env.SESSION_SECRET || 'vulnerable-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    httpOnly: true,
    sameSite: 'strict', // Protección adicional contra CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configurar CSRF protection
const csrfProtection = csrf({ cookie: true });

// Ruta para obtener el token CSRF
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Usar todas las rutas con prefijo /api
// Pasamos csrfProtection como parámetro para usarlo selectivamente
app.use('/api', routes(csrfProtection));

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Inicializar archivos de ejemplo
initializeFiles();

// Conectar a la base de datos
setTimeout(connectWithRetry, 5000); // Esperar 5 segundos antes de conectar

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);

  console.log('\nRutas disponibles:');
  console.log('- GET  /api/csrf-token');
  console.log('- POST /api/login');
  console.log('- POST /api/register');
  console.log('- POST /api/check-username');
  console.log('- GET  /api/products');
  console.log('- POST /api/ping');
  console.log('- POST /api/transfer (protegido con CSRF)');
  console.log('- GET  /api/file');
  console.log('- POST /api/upload');
  console.log('- GET  /api/captcha');
  console.log('- POST /api/verify-captcha');
  console.log('- GET  /api/health');
});

module.exports = app;