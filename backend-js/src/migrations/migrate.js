const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

// Import all migration files
const migrations = [
  require('./001_create_users_table'),
  require('./002_create_model_profiles_table'),
  require('./003_create_posts_table'),
  require('./004_create_media_table'),
  require('./005_create_videos_table'),
  require('./006_create_comments_table'),
  require('./007_create_likes_table'),
  require('./008_create_saved_posts_table'),
  require('./009_create_purchases_table'),
  require('./010_create_follows_table'),
  require('./011_create_referrals_table'),
  require('./012_create_orders_table'),
  require('./013_create_payments_table'),
  require('./014_create_logs_table'),
];

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');
    
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // Create a simple migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Get executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedMigrationNames = executedMigrations.map(m => m.name);
    
    // Run pending migrations
    for (const migration of migrations) {
      const migrationName = migration.up.toString().split('/').pop().replace('.js', '');
      
      if (!executedMigrationNames.includes(migrationName)) {
        logger.info(`Running migration: ${migrationName}`);
        
        // Create a mock queryInterface for the migration
        const queryInterface = {
          createTable: async (tableName, attributes) => {
            const columns = Object.entries(attributes).map(([columnName, columnDef]) => {
              let columnType = columnDef.type;
              if (columnDef.type.key) {
                columnType = columnDef.type.key;
              }
              if (columnDef.type instanceof Array) {
                columnType = columnDef.type[0].key;
              }
              
              let columnDefinition = `${columnName} ${columnType}`;
              
              if (columnDef.allowNull === false) {
                columnDefinition += ' NOT NULL';
              }
              
              if (columnDef.defaultValue !== undefined) {
                if (columnDef.defaultValue === 'CURRENT_TIMESTAMP') {
                  columnDefinition += ' DEFAULT CURRENT_TIMESTAMP';
                } else {
                  columnDefinition += ` DEFAULT '${columnDef.defaultValue}'`;
                }
              }
              
              if (columnDef.primaryKey) {
                columnDefinition += ' PRIMARY KEY';
              }
              
              if (columnDef.unique) {
                columnDefinition += ' UNIQUE';
              }
              
              if (columnDef.references) {
                columnDefinition += ` REFERENCES ${columnDef.references.model}(${columnDef.references.key})`;
                if (columnDef.onUpdate) {
                  columnDefinition += ` ON UPDATE ${columnDef.onUpdate}`;
                }
                if (columnDef.onDelete) {
                  columnDefinition += ` ON DELETE ${columnDef.onDelete}`;
                }
              }
              
              return columnDefinition;
            }).join(', ');
            
            const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;
            await sequelize.query(createTableSQL);
            logger.info(`Created table: ${tableName}`);
          },
          
          addIndex: async (tableName, columns) => {
            const indexName = `${tableName}_${columns.join('_')}_idx`;
            const createIndexSQL = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns.join(', ')});`;
            await sequelize.query(createIndexSQL);
            logger.info(`Created index: ${indexName} on ${tableName}`);
          },
          
          addConstraint: async (tableName, constraint) => {
            if (constraint.type === 'unique') {
              const constraintSQL = `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraint.name} UNIQUE (${constraint.fields.join(', ')});`;
              try {
                await sequelize.query(constraintSQL);
                logger.info(`Added constraint: ${constraint.name} to ${tableName}`);
              } catch (error) {
                if (error.message.includes('already exists')) {
                  logger.info(`Constraint ${constraint.name} already exists on ${tableName}`);
                } else {
                  throw error;
                }
              }
            }
          }
        };
        
        // Run the migration
        await migration.up(queryInterface, sequelize);
        
        // Record the migration as executed
        await sequelize.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          { bind: [migrationName] }
        );
        
        logger.info(`Migration completed: ${migrationName}`);
      } else {
        logger.info(`Migration already executed: ${migrationName}`);
      }
    }
    
    logger.info('All migrations completed successfully!');
    
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migrations failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
