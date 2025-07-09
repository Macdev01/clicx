# Database Setup Guide

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Application Configuration
APP_PORT=8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

## Available Migration Commands

- **Check migration status:**
  ```bash
  go run cmd/migrate.go version
  ```

- **Run migrations up:**
  ```bash
  go run cmd/migrate.go up
  ```

- **Run migrations down (rollback):**
  ```bash
  go run cmd/migrate.go down
  ```

- **Drop all tables:**
  ```bash
  go run cmd/migrate.go drop
  ```

- **Force a specific version (for dirty database):**
  ```bash
  go run cmd/migrate.go force <version>
  ```

## Fixing Dirty Database Issues

If you encounter a "Dirty database version" error:

1. **Check the current status:**
   ```bash
   go run cmd/migrate.go version
   ```

2. **Force clean the database:**
   ```bash
   # Reset to clean state (no migrations applied)
   go run cmd/migrate.go force 0
   
   # Then run migrations from scratch
   go run cmd/migrate.go up
   ```

3. **Alternative: Force to specific version:**
   ```bash
   # If you know the correct version should be 1
   go run cmd/migrate.go force 1
   ```

## Seeding Data

After running migrations, you can seed the database with test data:

```bash
go run cmd/seed/main.go
```

## Notes

- Make sure your PostgreSQL database is running and accessible
- The database user must have CREATE privileges to create tables and extensions
- The UUID extension will be installed automatically during migration
- Always check migration status before applying new migrations 