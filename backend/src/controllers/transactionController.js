const { Transaction, Category, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category_id, from, to, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (category_id) where.category_id = category_id;
    if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }
    if (search) {
      where.description = { [Op.iLike]: `%${search}%` };
    }

    // Role-based access: contador and admin/supervisor see all
    if (req.user.role === 'operario') {
      where.user_id = req.user.id;
    }

    const { rows, count } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'type'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] },
      ],
      order: [['date', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      transactions: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

exports.getById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Error al obtener transacción' });
  }
};

exports.create = async (req, res) => {
  try {
    const { type, amount, description, date, category_id } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ error: 'Tipo y monto son obligatorios' });
    }

    const transaction = await Transaction.create({
      type,
      amount,
      description,
      date: date || new Date(),
      category_id,
      user_id: req.user.id,
    });

    const full = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] },
      ],
    });

    res.status(201).json({ transaction: full, id: transaction.id });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
};

exports.update = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const { type, amount, description, date, category_id } = req.body;
    await transaction.update({ type, amount, description, date, category_id });

    const full = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] },
      ],
    });

    res.json({ transaction: full, id: transaction.id });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Error al actualizar transacción' });
  }
};

exports.delete = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    await transaction.destroy();
    res.json({ message: 'Transacción eliminada', id: parseInt(req.params.id) });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { period = 'monthly', from, to } = req.query;

    let dateFrom, dateTo;
    const now = new Date();

    if (from && to) {
      dateFrom = from;
      dateTo = to;
    } else {
      dateTo = now.toISOString().split('T')[0];
      if (period === 'daily') {
        dateFrom = dateTo;
      } else if (period === 'weekly') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFrom = weekAgo.toISOString().split('T')[0];
      } else {
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFrom = monthAgo.toISOString().split('T')[0];
      }
    }

    const where = {
      date: { [Op.between]: [dateFrom, dateTo] },
    };

    const [ingresos, egresos] = await Promise.all([
      Transaction.sum('amount', { where: { ...where, type: 'ingreso' } }),
      Transaction.sum('amount', { where: { ...where, type: 'egreso' } }),
    ]);

    const totalIngresos = parseFloat(ingresos || 0);
    const totalEgresos = parseFloat(egresos || 0);

    // Get daily breakdown
    const dailyData = await Transaction.findAll({
      attributes: [
        'type',
        'date',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where,
      group: ['type', 'date'],
      order: [['date', 'ASC']],
      raw: true,
    });

    res.json({
      summary: {
        ingresos: totalIngresos,
        egresos: totalEgresos,
        balance: totalIngresos - totalEgresos,
        from: dateFrom,
        to: dateTo,
        period,
      },
      dailyData,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};
