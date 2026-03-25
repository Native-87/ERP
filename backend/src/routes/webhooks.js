const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /webhooks:
 *   post:
 *     summary: Recibir payloads externos (Webhooks)
 *     description: Endpoint genérico para recepcionar eventos de sistemas externos.
 *     tags: [Integraciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 */
router.post('/', (req, res) => {
  const { event, data } = req.body;
  console.log(`[Webhooks] Recibido evento: ${event}`, data);
  // Aquí se enrutaría el evento dependiendo de 'event' (ej: sync-clientes)
  res.status(200).json({ success: true, message: 'Webhook recibido' });
});

module.exports = router;
