const app = require('./src/app');
const { server } = require('./src/config/database');
const { sequelize } = require('./src/models');
const seedAdmin = require('./src/seeds/seedAdmin');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const PORT = server.port;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    console.log('Running migrations...');
    await execPromise('npm run migrate');
    console.log('Migrations completed');
    
    await seedAdmin();
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
});