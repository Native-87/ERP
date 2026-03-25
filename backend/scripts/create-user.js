const { User } = require('../src/models');
const path = require('path');
// El archivo .env está en la raíz del proyecto (un nivel arriba de backend)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const createUser = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 6) {
    console.log('Uso: node scripts/create-user.js <username> <email> <password> <first_name> <last_name> <role>');
    console.log('Roles permitidos: admin, supervisor, operario, contador');
    process.exit(1);
  }

  const [username, email, password, first_name, last_name, role] = args;

  try {
    const user = await User.create({
      username,
      email,
      password,
      first_name,
      last_name,
      role
    });
    console.log(`✅ Usuario creado exitosamente: ${user.username} (${user.role})`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error(`  - ${err.message}`));
    }
    process.exit(1);
  }
};

createUser();
