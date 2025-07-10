# Docker Setup for Clixxx.me

This guide explains how to run the Clixxx.me monorepo using Docker and Docker Compose.

## Prerequisites

- Docker
- Docker Compose
- Firebase service account JSON file (for backend)

## Quick Start

1. **Clone the repository and navigate to the root directory**

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your actual configuration values.

3. **Add Firebase credentials**
   - Place your Firebase service account JSON file in the `backend/` directory
   - Name it `clixxx-dev-44e45f09d47f.json` or update the Docker configuration accordingly

4. **Build and run the services**
   ```bash
   docker compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - PostgreSQL: localhost:5432

## Services

### Frontend (Next.js)
- **Port**: 3000
- **Technology**: Next.js 15.2.4 with React 19
- **Build**: Multi-stage Docker build with optimizations
- **Features**: Standalone output, optimized for production
- **Build Commands**: 
  - `yarn build` - Production build (used in Docker)
  - `yarn build:dev` - Development build with git metadata

### Backend (Go)
- **Port**: 8080
- **Technology**: Go 1.24.4 with Gin framework
- **Features**: Firebase authentication, PostgreSQL integration
- **Migrations**: Automatic database migrations on startup

### Database (PostgreSQL)
- **Port**: 5432
- **Version**: PostgreSQL 15 Alpine
- **Features**: Health checks, persistent volume storage

## Development Commands

### Start all services
```bash
docker compose up
```

### Start services in background
```bash
docker compose up -d
```

### Rebuild and start services
```bash
docker compose up --build
```

### Stop all services
```bash
docker compose down
```

### View logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs frontend
docker compose logs backend
docker compose logs postgres
```

### Access service containers
```bash
# Backend container
docker compose exec backend sh

# Frontend container
docker compose exec frontend sh

# Database container
docker compose exec postgres psql -U clixxx_user -d clixxx_db
```

## Environment Variables

### Backend Environment Variables
- `DB_HOST`: Database host (default: postgres)
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `APP_PORT`: Application port (default: 8080)
- `GIN_MODE`: Gin mode (development/release)

### Frontend Environment Variables
- `NODE_ENV`: Node environment (development/production)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration

**Note**: The Docker build uses `yarn build` which doesn't include git metadata generation. For development builds with git information, use `yarn build:dev` locally.

## Database Management

### Run migrations manually
```bash
docker compose exec backend ./main -migrate up
```

### Access database directly
```bash
docker compose exec postgres psql -U clixxx_user -d clixxx_db
```

### Backup database
```bash
docker compose exec postgres pg_dump -U clixxx_user clixxx_db > backup.sql
```

### Restore database
```bash
docker compose exec -T postgres psql -U clixxx_user clixxx_db < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Make sure ports 3000, 8080, and 5432 are not in use
   - Modify the port mappings in `docker-compose.yml` if needed

2. **Firebase credentials missing**
   - Ensure the Firebase JSON file is in the correct location
   - Check the volume mount in the backend service

3. **Database connection issues**
   - Wait for the PostgreSQL health check to pass
   - Check the database environment variables

4. **Build failures**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker compose build --no-cache`

### Logs and Debugging

```bash
# Check service status
docker compose ps

# View real-time logs
docker compose logs -f

# Check container resource usage
docker stats

# Inspect a specific container
docker compose exec backend printenv
```

## Production Deployment

### Environment Setup
1. Update environment variables for production
2. Use proper secrets management
3. Configure proper CORS settings
4. Set up SSL certificates
5. Configure reverse proxy (nginx/traefik)

### Security Considerations
- Change default database credentials
- Use secrets for sensitive configuration
- Enable SSL/TLS
- Configure proper firewall rules
- Regular security updates

## Performance Optimization

### Database
- Configure PostgreSQL for production workloads
- Set up connection pooling
- Optimize queries and indexes

### Frontend
- Enable Next.js optimizations
- Configure CDN for static assets
- Implement proper caching strategies

### Backend
- Configure Go application for production
- Set up proper logging and monitoring
- Implement health checks 