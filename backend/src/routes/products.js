const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');
const auditLog = require('../middleware/audit');

router.use(authenticate);
router.use(authorize('admin', 'supervisor', 'operario'));

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.get('/:id/movements', productController.getMovements);
router.post('/', auditLog('CREATE', 'product'), productController.create);
router.put('/:id', auditLog('UPDATE', 'product'), productController.update);
router.delete('/:id', authorize('admin', 'supervisor'), auditLog('DELETE', 'product'), productController.delete);
router.post('/:id/movements', auditLog('CREATE', 'stock_movement'), productController.addMovement);

module.exports = router;
