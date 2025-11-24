const { db } = require('../config/database');

const getProducts = (req, res) => {
  const { category, search } = req.query;
  
  // construir query con placeholders
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
  
  // ejecutar query con parámetros separados
  db.query(query, params, (err, results) => {
    if (err) {
      // ✅ No exponer detalles del error
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
