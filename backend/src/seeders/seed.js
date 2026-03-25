const { User, Category, CompanySettings } = require('../models');

const seedDatabase = async () => {
  try {
    // Create default admin user
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@empresa.com',
        password: 'admin123',
        first_name: 'Administrador',
        last_name: 'Sistema',
        role: 'admin',
      });
      console.log('✅ Admin user created (admin / admin123)');
    }

    // Create demo users
    const demoUsers = [
      { username: 'supervisor1', email: 'supervisor@empresa.com', password: 'supervisor123', first_name: 'Juan', last_name: 'García', role: 'supervisor' },
      { username: 'operario1', email: 'operario@empresa.com', password: 'operario123', first_name: 'Carlos', last_name: 'López', role: 'operario' },
      { username: 'contador1', email: 'contador@empresa.com', password: 'contador123', first_name: 'María', last_name: 'Rodríguez', role: 'contador' },
    ];

    for (const userData of demoUsers) {
      const exists = await User.findOne({ where: { username: userData.username } });
      if (!exists) {
        await User.create(userData);
        console.log(`✅ User ${userData.username} created`);
      }
    }

    // Create default categories
    const defaultCategories = [
      { name: 'Ventas', type: 'ingreso' },
      { name: 'Servicios', type: 'ingreso' },
      { name: 'Otros ingresos', type: 'ingreso' },
      { name: 'Salarios', type: 'egreso' },
      { name: 'Insumos', type: 'egreso' },
      { name: 'Servicios básicos', type: 'egreso' },
      { name: 'Mantenimiento', type: 'egreso' },
      { name: 'Transporte', type: 'egreso' },
      { name: 'Otros egresos', type: 'egreso' },
    ];

    for (const catData of defaultCategories) {
      const exists = await Category.findOne({ where: { name: catData.name, type: catData.type } });
      if (!exists) {
        await Category.create(catData);
      }
    }
    console.log('✅ Default categories created');

    // Create default company settings
    const settingsExist = await CompanySettings.findOne();
    if (!settingsExist) {
      await CompanySettings.create({
        company_name: 'Mi Empresa',
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        accent_color: '#10B981',
      });
      console.log('✅ Company settings initialized');
    }

    console.log('🌱 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

module.exports = seedDatabase;
