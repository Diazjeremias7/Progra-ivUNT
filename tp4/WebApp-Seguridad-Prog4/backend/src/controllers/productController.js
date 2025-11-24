const { db } = require('../config/database');
const { logSqlInjectionAttempt } = require('../utils/securityLogger');

const getProducts = (req, res) => {
  const { category, search } = req.query;
  
  // detectar intentos sospechosos
  logSqlInjectionAttempt(req, { category, search });
  
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        error: 'Error al obtener productos' 
      });
    }
    
    res.json(results);
  });
};

module.exports = {
  getProducts
};
