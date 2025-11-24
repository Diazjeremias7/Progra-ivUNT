const { query, validationResult } = require('express-validator');

//valida parametros para la busqueda de productos
const validateProductSearch = [
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Categoría debe tener máximo 50 caracteres')
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage('Categoría contiene caracteres no permitidos'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Búsqueda debe tener máximo 100 caracteres')
    .matches(/^[a-zA-Z0-9\sáéíóúñÁÉÍÓÚÑ-]+$/)
    .withMessage('Búsqueda contiene caracteres no permitidos'),
  
  // Middleware para manejar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parámetros inválidos',
        details: errors.array() 
      });
    }
    next();
  }
];

module.exports = {
  validateProductSearch
};