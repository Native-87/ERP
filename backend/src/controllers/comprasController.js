const { User, WorkOrder, Provider, PurchaseRequest, PurchaseOrder, Product, StockMovement, sequelize } = require('../models');

// Providers
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.findAll();
    res.json(providers);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProvider = async (req, res) => {
  try {
    const provider = await Provider.create(req.body);
    res.status(201).json(provider);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

// Purchase Requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.findAll({ 
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'first_name', 'last_name'] },
        { model: WorkOrder, as: 'workOrder', attributes: ['id', 'title'] }
      ] 
    });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.create({ ...req.body, requestedBy: req.user?.id });
    res.status(201).json(pr);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pr = await PurchaseRequest.findByPk(req.params.id);
    if (!pr) return res.status(404).json({ error: 'Not found' });
    await pr.update({ status });
    res.json(pr);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

// Purchase Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.findAll({ include: ['provider', 'request'] });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.create(req.body);
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });

    // Process inventory reception automagically
    if (status === 'Mercadería Recibida' && order.status !== 'Mercadería Recibida') {
      const items = order.items || [];
      await sequelize.transaction(async (t) => {
        for (let item of items) {
          if (item.productId && item.quantity > 0) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
              await product.increment('stock', { by: item.quantity, transaction: t });
              await StockMovement.create({
                productId: product.id,
                userId: req.user?.id || 1, // Fallback si no hay contexto
                type: 'Entrada',
                quantity: item.quantity,
                reason: `Recepción de OC #${order.id}`,
              }, { transaction: t });
            }
          }
        }
        await order.update({ status }, { transaction: t });
      });
    } else {
      await order.update({ status });
    }
    
    res.json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
};
