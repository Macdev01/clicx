# Clicx Backend API (Node.js)

A modern, secure, and scalable REST API for the Clicx platform built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **Modern Architecture**: Built with Express.js and Sequelize ORM
- **Security First**: JWT authentication, rate limiting, input validation, and security headers
- **Comprehensive Logging**: Winston-based logging with file rotation and database storage
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **File Upload**: Secure file upload with validation and CDN integration
- **Real-time Features**: WebSocket support for real-time interactions
- **Testing**: Comprehensive test suite with Jest
- **Monitoring**: Health checks and performance monitoring
- **Docker Ready**: Containerized deployment with Docker

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Firebase Admin SDK
- **File Storage**: BunnyCDN integration
- **Logging**: Winston with daily rotation
- **Validation**: Joi schema validation
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)
- Docker (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd backend-js
npm install
```

### 2. Environment Setup

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=clixxx_user
DB_PASSWORD=clixxx_password
DB_NAME=clixxx_db
DB_SSL_MODE=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# BunnyCDN Configuration
BUNNY_STORAGE_ZONE=your-storage-zone
BUNNY_STORAGE_KEY=your-storage-key
BUNNY_PULL_ZONE_HOSTNAME=your-pull-zone-hostname
BUNNY_TOKEN_KEY=your-token-key
BUNNY_STORAGE_API_KEY=your-storage-api-key
BUNNY_STORAGE_HOSTNAME=your-storage-hostname

# Bunny Stream Configuration
BUNNY_STREAM_API=https://video.bunnycdn.com
BUNNY_STREAM_API_KEY=your-stream-api-key
BUNNY_STREAM_LIBRARY_ID=your-library-id
BUNNY_STREAM_HOSTNAME=your-stream-hostname

# Plisio Payment Configuration
PLISIO_API_KEY=your-plisio-api-key
PLISIO_SECRET_KEY=your-plisio-secret-key

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=logs/app.log

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Database Setup

```bash
# Create database
createdb clixxx_db

# Run migrations
npm run migrate

# Seed data (optional)
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8080`

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health

## 🏗 Project Structure

```
src/
├── config/           # Configuration files
│   └── database.js   # Database configuration
├── controllers/      # Route controllers
│   ├── userController.js
│   ├── postController.js
│   └── ...
├── middleware/       # Custom middleware
│   ├── auth.js       # Authentication middleware
│   └── validation.js # Input validation
├── models/          # Sequelize models
│   ├── User.js
│   ├── Post.js
│   └── index.js
├── routes/          # Express routes
│   ├── userRoutes.js
│   ├── postRoutes.js
│   └── ...
├── services/        # Business logic
│   ├── userService.js
│   └── ...
├── utils/           # Utility functions
│   ├── logger.js    # Winston logger
│   └── crypto.js    # Cryptographic utilities
├── database/        # Database utilities
│   ├── migrate.js   # Migration runner
│   └── seed.js      # Data seeding
└── app.js          # Main application file
```

## 🔐 Security Features

### Authentication & Authorization

- Firebase Admin SDK integration
- JWT token validation
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt

### Input Validation & Sanitization

- Joi schema validation
- Input sanitization to prevent XSS
- File upload validation
- SQL injection prevention with Sequelize

### Rate Limiting & DDoS Protection

- Express Rate Limit middleware
- Speed limiting for sensitive endpoints
- Request throttling

### Security Headers

- Helmet.js for security headers
- CORS configuration
- Content Security Policy
- XSS protection

## 📊 Logging & Monitoring

### Logging Levels

- **ERROR**: Application errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information

### Log Outputs

- **Console**: Colored output for development
- **File**: Rotated log files for production
- **Database**: Structured logging to database

### Health Checks

- Database connectivity
- External service status
- Memory usage
- Response time monitoring

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t clixx-backend .

# Run container
docker run -p 8080:8080 --env-file .env clixx-backend
```

### Docker Compose

```yaml
version: "3.8"
services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
    env_file:
      - .env

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: clixxx_db
      POSTGRES_USER: clixxx_user
      POSTGRES_PASSWORD: clixxx_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL/TLS certificates
- [ ] Set up reverse proxy (nginx/traefik)
- [ ] Configure database connection pooling
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up backup strategies
- [ ] Configure CDN for static assets

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run migrate      # Run database migrations
npm run seed         # Seed database with test data
```

### Code Quality

- **ESLint**: Code linting with Airbnb config
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Lint-staged**: Run linters on staged files

## 📈 Performance

### Optimization Features

- Database query optimization
- Response compression
- Caching strategies
- Connection pooling
- Async/await patterns

### Monitoring

- Request/response logging
- Database query monitoring
- Memory usage tracking
- Error tracking and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the API documentation
- Review the logs for debugging

## 🔄 Migration from Go

This Node.js version addresses the security issues found in the original Go implementation:

### Security Improvements

- ✅ Removed hardcoded password
- ✅ Added comprehensive input validation
- ✅ Implemented rate limiting
- ✅ Enhanced file upload security
- ✅ Added proper error handling
- ✅ Implemented request sanitization
- ✅ Added security headers
- ✅ Enhanced CORS configuration

### Performance Improvements

- ✅ Connection pooling
- ✅ Response compression
- ✅ Optimized database queries
- ✅ Caching strategies
- ✅ Async/await patterns

### Developer Experience

- ✅ Comprehensive logging
- ✅ API documentation
- ✅ Test coverage
- ✅ Code quality tools
- ✅ Docker support
- ✅ Health checks
