const cron = require('node-cron');
const { automationQueue } = require('./queue');
const { WorkOrder, Product } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Ejecutar todos los días a las 08:00 AM para revisar OT pendientes y stock
cron.schedule('0 8 * * *', async () => {
  console.log('[Cron] Ejecutando rutinas diarias (8 AM)...');

  try {
    // 1. Revisar OTs pendientes de más de 48hs
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const oldOrders = await WorkOrder.findAll({
      where: {
        status: 'Pendiente',
        createdAt: { [Op.lt]: fortyEightHoursAgo }
      }
    });

    for (let order of oldOrders) {
      automationQueue.add('send-email', {
        to: 'supervisor@empresa.com',
        subject: `Alerta ERP: OT #${order.id} sin movimiento por más de 48hs`,
        text: `La orden de trabajo "${order.title}" lleva más de 48 horas en estado Pendiente.`
      });
    }

    // 2. Revisar umbrales de stock
    const lowStockProducts = await Product.findAll({
      where: {
        stock: { [Op.lte]: Sequelize.col('minStock') }
      }
    });

    for (let product of lowStockProducts) {
      automationQueue.add('whatsapp-alert', {
        phone: '+5491100000000',
        message: `ALERTA STOCK ERP: El producto ${product.name} tiene un stock actual de ${product.stock}, límite mínimo: ${product.minStock}.`
      });
    }

  } catch (error) {
    console.error('[Cron] Error ejecutando cron diario:', error);
  }
});

// Balance mensual: Día 1 de cada mes a las 09:00 AM
cron.schedule('0 9 1 * *', async () => {
    console.log('[Cron] Generando balance mensual automático para el equipo...');
    automationQueue.add('send-email', {
        to: 'admin@empresa.com, contador@empresa.com',
        subject: 'Cierre Mensual - ERP',
        text: 'Se ha generado el resumen consolidado del mes anterior automáticamente. (Ver adjunto online)'
    });
});

console.log('[Cron] Tareas programadas activadas.');
