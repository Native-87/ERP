const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roles');

/**
 * @swagger
 * /ai/stock-prediction/{id}:
 *   get:
 *     summary: Obtener predicción de agotamiento de stock
 *     tags: [AI Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Predicción de stock calculada
 */
router.get('/stock-prediction/:id', authenticate, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const prediction = await AIService.predictStockDepletion(req.params.id);
    if (!prediction) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /ai/ot-patterns:
 *   get:
 *     summary: Analizar patrones de fallas en Órdenes de Trabajo (Sectores conflictivos)
 *     tags: [AI Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking de sectores problemáticos
 */
router.get('/ot-patterns', authenticate, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const patterns = await AIService.analyzeWorkOrderPatterns();
    res.json(patterns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
