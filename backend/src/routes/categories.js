const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');
const auditLog = require('../middleware/audit');

router.use(authenticate);

router.get('/', categoryController.getAll);
router.post('/', authorize('admin'), auditLog('CREATE', 'category'), categoryController.create);
router.put('/:id', authorize('admin'), auditLog('UPDATE', 'category'), categoryController.update);
router.delete('/:id', authorize('admin'), auditLog('DELETE', 'category'), categoryController.delete);

module.exports = router;
