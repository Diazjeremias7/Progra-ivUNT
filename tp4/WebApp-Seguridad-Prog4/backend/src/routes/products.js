const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProductSearch } = require('../middleware/validators');
const { productSearchLimiter } = require('../middleware/rateLimiters');

router.get(
  '/products', 
  productSearchLimiter,
  validateProductSearch, 
  productController.getProducts
);

module.exports = router;