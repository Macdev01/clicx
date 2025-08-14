# Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **CPU**: Minimum 4 vCPUs (8 recommended)
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 50GB SSD minimum
- **OS**: Ubuntu 22.04 LTS or similar
- **Docker**: 24.0+
- **Docker Compose**: 2.20+

### Required Services
- PostgreSQL 15+
- Redis 7+
- Nginx (reverse proxy)
- SSL certificates (Let's Encrypt)

### External Services
- Bunny CDN account with configured zones
- Plisio payment gateway account
- Firebase project (if using Firebase Auth)
- Domain with DNS configured

## Environment Setup

### 1. Create Environment Files

```bash
# Copy example files
cp .env.example .env.production
cp apps/api/.env.example apps/api/.env.production
cp apps/web/.env.example apps/web/.env.production
cp apps/workers/.env.example apps/workers/.env.production
```

### 2. Configure Environment Variables

Edit `.env.production` with your production values:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=clixxx_prod
DB_PASSWORD=<strong-password>
DB_NAME=clixxx_production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Redis
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=production
APP_URL=https://clixxx.com
API_URL=https://api.clixxx.com

# Security
JWT_SECRET=<generate-with-openssl-rand-base64-32>
CORS_ORIGINS=https://clixxx.com,https://www.clixxx.com

# Bunny CDN
BUNNY_ACCESS_KEY=<your-key>
BUNNY_STORAGE_ZONE=<your-zone>
BUNNY_PULL_ZONE_HOSTNAME=<your-pullzone>.b-cdn.net
BUNNY_SIGNING_KEY=<your-signing-key>
BUNNY_WEBHOOK_SECRET=<your-webhook-secret>

# Plisio
PLISIO_API_KEY=<your-api-key>
PLISIO_SECRET_KEY=<your-secret-key>
PLISIO_WEBHOOK_URL=https://api.clixxx.com/webhooks/plisio

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=<strong-password>
```

### 3. Generate Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24

# Generate other secrets as needed
```

## Deployment Options

### Option 1: VPS with Docker Compose (Recommended)

**Pros:**
- Full control over infrastructure
- Cost-effective for small to medium scale
- Easy to manage and debug

**Cons:**
- Manual scaling required
- Self-managed backups and monitoring

**Providers:** Hetzner, DigitalOcean, Linode

### Option 2: Kubernetes (K8s)

**Pros:**
- Auto-scaling capabilities
- High availability
- Industry standard

**Cons:**
- Complex setup and management
- Higher cost
- Requires expertise

**Providers:** GKE, EKS, AKS, DigitalOcean Kubernetes

### Option 3: Platform-as-a-Service

**Pros:**
- Minimal DevOps overhead
- Built-in scaling and monitoring
- Quick deployment

**Cons:**
- Higher cost per resource
- Less control
- Vendor lock-in

**Providers:** Railway, Render, Fly.io

## Production Deployment

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Install additional tools
sudo apt install -y git nginx certbot python3-certbot-nginx ufw fail2ban
```

### Step 2: Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Step 3: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/clixxx-monorepo.git clixxx
sudo chown -R $USER:$USER /opt/clixxx
cd /opt/clixxx
```

### Step 4: SSL Certificate Setup

```bash
# Install SSL certificate with Certbot
sudo certbot --nginx -d clixxx.com -d www.clixxx.com -d api.clixxx.com
```

### Step 5: Nginx Configuration

Create `/etc/nginx/sites-available/clixxx`:

```nginx
upstream api {
    least_conn;
    server localhost:8080;
    server localhost:8081;
    server localhost:8082;
}

upstream web {
    least_conn;
    server localhost:3000;
    server localhost:3001;
}

server {
    listen 443 ssl http2;
    server_name api.clixxx.com;

    ssl_certificate /etc/letsencrypt/live/clixxx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clixxx.com/privkey.pem;

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name clixxx.com www.clixxx.com;

    ssl_certificate /etc/letsencrypt/live/clixxx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clixxx.com/privkey.pem;

    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name clixxx.com www.clixxx.com api.clixxx.com;
    return 301 https://$server_name$request_uri;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/clixxx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Deploy Application

```bash
cd /opt/clixxx

# Build and start services
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Run database migrations
docker-compose -f docker-compose.production.yml exec api pnpm prisma migrate deploy

# Seed initial data (if needed)
docker-compose -f docker-compose.production.yml exec api pnpm prisma db seed

# Check logs
docker-compose -f docker-compose.production.yml logs -f
```

### Step 7: Verify Deployment

```bash
# Check service health
curl https://api.clixxx.com/health
curl https://clixxx.com

# Check metrics
curl https://api.clixxx.com/metrics

# Monitor logs
docker-compose -f docker-compose.production.yml logs -f api
```

## Monitoring & Maintenance

### Health Checks

```bash
# Create health check script
cat > /opt/clixxx/scripts/health-check.sh << 'EOF'
#!/bin/bash
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://api.clixxx.com/health)
WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://clixxx.com)

if [ $API_HEALTH -ne 200 ] || [ $WEB_HEALTH -ne 200 ]; then
    echo "Health check failed: API=$API_HEALTH, WEB=$WEB_HEALTH"
    # Send alert
    curl -X POST $SLACK_WEBHOOK -d '{"text":"Health check failed"}'
    exit 1
fi
EOF

chmod +x /opt/clixxx/scripts/health-check.sh

# Add to crontab
(crontab -l ; echo "*/5 * * * * /opt/clixxx/scripts/health-check.sh") | crontab -
```

### Backup Strategy

```bash
# Create backup script
cat > /opt/clixxx/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.production.yml exec -T postgres \
    pg_dump -U clixxx_prod clixxx_production | gzip > $BACKUP_DIR/database.sql.gz

# Backup Redis
docker-compose -f docker-compose.production.yml exec -T redis \
    redis-cli SAVE
docker cp clixxx_redis:/data/dump.rdb $BACKUP_DIR/redis.rdb

# Upload to S3/B2 (optional)
# aws s3 cp $BACKUP_DIR s3://bucket/backups/$(date +%Y%m%d)/ --recursive

# Clean old backups (keep 30 days)
find /backups -type d -mtime +30 -exec rm -rf {} +
EOF

chmod +x /opt/clixxx/scripts/backup.sh

# Add to crontab (daily at 3 AM)
(crontab -l ; echo "0 3 * * * /opt/clixxx/scripts/backup.sh") | crontab -
```

### Monitoring with Grafana

Access Grafana at `http://your-server-ip:3000`

Default credentials:
- Username: admin
- Password: (from GRAFANA_PASSWORD env)

Import dashboards:
1. Node Exporter Full (ID: 1860)
2. Docker Container (ID: 11600)
3. PostgreSQL Database (ID: 9628)
4. Redis (ID: 11835)

### Log Management

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f api
docker-compose -f docker-compose.production.yml logs -f web
docker-compose -f docker-compose.production.yml logs -f workers

# Log rotation
cat > /etc/logrotate.d/docker-containers << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF
```

## Rollback Procedures

### Quick Rollback

```bash
cd /opt/clixxx

# Stop current deployment
docker-compose -f docker-compose.production.yml down

# Checkout previous version
git checkout <previous-tag>

# Rebuild and deploy
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Rollback database if needed
docker-compose -f docker-compose.production.yml exec api \
    pnpm prisma migrate resolve --rolled-back <migration-name>
```

### Database Rollback

```bash
# Restore from backup
gunzip < /backups/20240115/database.sql.gz | \
    docker-compose -f docker-compose.production.yml exec -T postgres \
    psql -U clixxx_prod clixxx_production
```

## Troubleshooting

### Common Issues

#### 1. Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs api

# Check resources
docker system df
df -h
free -m

# Clean up
docker system prune -a
```

#### 2. Database Connection Issues
```bash
# Test connection
docker-compose -f docker-compose.production.yml exec api \
    npx prisma db pull

# Check PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres
```

#### 3. High Memory Usage
```bash
# Check memory usage
docker stats

# Restart services
docker-compose -f docker-compose.production.yml restart api
```

#### 4. SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew --nginx

# Test auto-renewal
sudo certbot renew --dry-run
```

### Performance Tuning

```bash
# PostgreSQL tuning
docker-compose -f docker-compose.production.yml exec postgres psql -U clixxx_prod -c "
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
"

# Restart PostgreSQL
docker-compose -f docker-compose.production.yml restart postgres
```

## Scaling

### Horizontal Scaling

```bash
# Scale API instances
docker-compose -f docker-compose.production.yml up -d --scale api=3

# Scale workers
docker-compose -f docker-compose.production.yml up -d --scale workers=2
```

### Load Balancer Configuration

Update Nginx upstream configuration for multiple instances.

## Security Checklist

- [ ] SSL certificates installed and auto-renewal configured
- [ ] Firewall rules configured
- [ ] Fail2ban installed and configured
- [ ] Strong passwords for all services
- [ ] Environment variables secured
- [ ] Database backups automated
- [ ] Monitoring alerts configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Webhook secrets configured
- [ ] Admin access restricted

## Support

For issues or questions:
- Check logs: `docker-compose logs -f <service>`
- Review documentation in `/docs`
- Contact DevOps team in #infrastructure Slack channel