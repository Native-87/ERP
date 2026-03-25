const { Product, WorkOrder, StockMovement } = require('../models');
const { Op } = require('sequelize');

class AIService {
  // Predicción heurística: "Si en los últimos 30 días se consumieron X unidades, ¿cuándo se agota?"
  static async predictStockDepletion(productId) {
    const product = await Product.findByPk(productId);
    if (!product) return null;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Calcular egresos de stock del mes pasado
    const movements = await StockMovement.findAll({
      where: {
        productId,
        type: 'Salida',
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    const totalOut = movements.reduce((acc, mov) => acc + mov.quantity, 0);
    const dailyAvgOut = totalOut / 30;

    if (dailyAvgOut === 0) {
      return { daysRemaining: 'Incalculable (Sin consumo reciente)', dailyAvg: 0 };
    }

    const daysRemaining = Math.floor(product.stock / dailyAvgOut);
    return { daysRemaining, dailyAvg: dailyAvgOut.toFixed(2), stock: product.stock };
  }

  // Detectar por ubicación/sector qué OTs fallan más
  static async analyzeWorkOrderPatterns() {
    const orders = await WorkOrder.findAll({
      where: { status: 'Cerrada' }
    });

    const sectorStats = {};
    orders.forEach(ot => {
      const sector = ot.sector || 'General';
      sectorStats[sector] = (sectorStats[sector] || 0) + 1;
    });

    // Ordenar sectores con más incidencias
    const sortedSectors = Object.entries(sectorStats)
      .sort((a, b) => b[1] - a[1])
      .map(([sector, count]) => ({ sector, count }));

    return { mostProblematicSectors: sortedSectors.slice(0, 3) };
  }
}

module.exports = AIService;
