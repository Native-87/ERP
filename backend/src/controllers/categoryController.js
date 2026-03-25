const { Category } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { type, active } = req.query;
    const where = {};
    if (type) where.type = type;
    if (active !== undefined) where.active = active === 'true';

    const categories = await Category.findAll({ where, order: [['name', 'ASC']] });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Nombre y tipo son obligatorios' });
    }

    const category = await Category.create({ name, type, description });
    res.status(201).json({ category, id: category.id });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const { name, type, description, active } = req.body;
    await category.update({ name, type, description, active });
    res.json({ category, id: category.id });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await category.update({ active: false });
    res.json({ message: 'Categoría desactivada', id: parseInt(req.params.id) });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Error al desactivar categoría' });
  }
};
