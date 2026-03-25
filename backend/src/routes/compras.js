const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');

// Providers
router.get('/providers', authenticate, comprasController.getProviders);
router.post('/providers', authenticate, authorize('admin'), comprasController.createProvider);

// Purchase Requests
router.get('/requests', authenticate, comprasController.getRequests);
router.post('/requests', authenticate, comprasController.createRequest);
router.patch('/requests/:id/status', authenticate, authorize('admin', 'supervisor', 'contador'), comprasController.updateRequestStatus);

// Purchase Orders
router.get('/orders', authenticate, comprasController.getOrders);
router.post('/orders', authenticate, authorize('admin', 'contador'), comprasController.createOrder);
router.patch('/orders/:id/status', authenticate, authorize('admin', 'supervisor', 'contador'), comprasController.updateOrderStatus);

module.exports = router;
