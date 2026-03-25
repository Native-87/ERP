const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');
const auditLog = require('../middleware/audit');

router.use(authenticate);
router.use(authorize('admin', 'supervisor', 'contador'));

router.get('/', transactionController.getAll);
router.get('/summary', transactionController.getSummary);
router.get('/:id', transactionController.getById);
router.post('/', auditLog('CREATE', 'transaction'), transactionController.create);
router.put('/:id', auditLog('UPDATE', 'transaction'), transactionController.update);
router.delete('/:id', auditLog('DELETE', 'transaction'), transactionController.delete);

module.exports = router;
