const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');
const auditLog = require('../middleware/audit');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', workOrderController.getAll);
router.get('/:id', workOrderController.getById);
router.post('/', authorize('admin', 'supervisor', 'operario'), auditLog('CREATE', 'work_order'), workOrderController.create);
router.put('/:id', authorize('admin', 'supervisor'), auditLog('UPDATE', 'work_order'), workOrderController.update);
router.patch('/:id/status', auditLog('STATUS_CHANGE', 'work_order'), workOrderController.changeStatus);
router.post('/:id/attachments', upload.single('file'), auditLog('UPLOAD', 'work_order_attachment'), workOrderController.uploadAttachment);
router.delete('/:id', authorize('admin'), auditLog('DELETE', 'work_order'), workOrderController.delete);

module.exports = router;
