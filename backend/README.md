# Clicx Platform

Clicx is a monorepo that provides a simple content sharing platform with a Go backend and two Next.js applications (frontend and admin). The backend exposes a REST API for managing users, posts and media while the web apps consume this API.

## Tech Stack

- **Go / Gin** – backend HTTP API
- **PostgreSQL** – relational database used by the backend
- **Next.js** – frontend and admin panels
- **BunnyCDN** – storage and streaming of uploaded media
- **Plisio** – cryptocurrency payments
- **Firebase** – authentication
- **Docker Compose** – local development/production orchestration

## Folder Structure

```
backend/    Go API service
frontend/   Public facing web application
admin/      Admin panel
```

## Development Setup

1. Copy `.env.example` to `.env` and fill in the required values.
2. Ensure Docker and Docker Compose are installed.
3. Start the stack:

```bash
docker compose up --build
```

The backend will be available on `http://localhost:8080` and the Next.js apps on ports `3000` (frontend) and `3001` (admin).

## Production Build

Use the provided Dockerfiles or build the Go binary and Next.js apps separately. The compose file can be deployed on any Docker host.

## Environment Variables

Example `.env` file:

```env
# Core application settings
APP_PORT=8080
GIN_MODE=release

# Database configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=clixxx_user
DB_PASSWORD=clixxx_password
DB_NAME=clixxx_db

# Plisio payment service
PLISIO_API_KEY=
PLISIO_SECRET_KEY=

# BunnyCDN storage
BUNNY_STORAGE_ZONE=
BUNNY_STORAGE_KEY=
BUNNY_PULL_ZONE_HOSTNAME=
BUNNY_TOKEN_KEY=

# Firebase (service account JSON values)
GOOGLE_TYPE=
GOOGLE_PROJECT_ID=
GOOGLE_PRIVATE_KEY_ID=
GOOGLE_PRIVATE_KEY=""
GOOGLE_CLIENT_EMAIL=
GOOGLE_CLIENT_ID=
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=
GOOGLE_CLIENT_X509_CERT_URL=

# Frontend public environment variables
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Node/Next.js environment
NODE_ENV=development
```

## API Reference

### Users

| Method | Endpoint                     | Description           |
| ------ | ---------------------------- | --------------------- |
| GET    | `/users`                     | List all users        |
| GET    | `/users/:id`                 | Get user by id        |
| GET    | `/users/:id/model-profile`   | Model profile of user |
| GET    | `/users/:id/saved-posts`     | Posts saved by user   |
| GET    | `/users/:id/purchased-posts` | Purchased posts       |
| POST   | `/users`                     | Create a user         |
| PUT    | `/users/:id`                 | Update user           |
| DELETE | `/users/:id`                 | Delete user           |

### Posts

| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| GET    | `/posts`          | List posts          |
| GET    | `/posts/:id`      | Get post with media |
| POST   | `/posts`          | Create post         |
| PUT    | `/posts/:id`      | Update post         |
| DELETE | `/posts/:id`      | Delete post         |
| POST   | `/posts/:id/like` | Toggle like         |
| POST   | `/posts/:id/save` | Toggle save         |

### Models

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| GET    | `/models`     | List model profiles  |
| GET    | `/models/:id` | Get model profile    |
| POST   | `/models`     | Create model profile |
| PUT    | `/models/:id` | Update model profile |
| DELETE | `/models/:id` | Delete model profile |

### Media

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/videos/upload`     | Upload video (auth required) |
| GET    | `/videos/:id`        | Get media info               |
| GET    | `/videos/:id/stream` | Signed streaming link        |
| DELETE | `/videos/:id`        | Delete media                 |

### Purchases & Orders

| Method | Endpoint      | Description    |
| ------ | ------------- | -------------- |
| POST   | `/purchases`  | Buy content    |
| GET    | `/purchases`  | List purchases |
| GET    | `/orders`     | List orders    |
| GET    | `/orders/:id` | Get order      |
| POST   | `/orders`     | Create order   |
| PUT    | `/orders/:id` | Update order   |
| DELETE | `/orders/:id` | Delete order   |

### Social & Admin

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| POST   | `/follow/:id`         | Follow user                    |
| DELETE | `/follow/:id`         | Unfollow user                  |
| GET    | `/followers`          | Followers of current user      |
| GET    | `/referrals`          | Referred users                 |
| POST   | `/admin/posts/upload` | Create post with media (admin) |

### Payments & Webhooks

| Method | Endpoint                    | Description             |
| ------ | --------------------------- | ----------------------- |
| POST   | `/payments/plisio`          | Create crypto invoice   |
| POST   | `/payments/plisio/callback` | Payment callback        |
| POST   | `/webhook/bunny`            | BunnyCDN upload webhook |

### Technical

| Method | Endpoint   | Description             |
| ------ | ---------- | ----------------------- |
| GET    | `/migrate` | Run database migrations |
| GET    | `/seed`    | Seed sample data        |

All endpoints return JSON. Errors follow a consistent format with HTTP status codes `400`, `401`, `404` or `500` as appropriate.

## Example Request

```bash
curl http://localhost:8080/posts
```

This will return a list of posts in JSON format.

## Logging

The backend uses a production-grade zap logging system with the following features:

- **Log Levels:** Configurable via `LOG_LEVEL` env var (`debug`, `info`, `warn`, `error`).
- **Environments:**
  - Development: Console logs (human-readable)
  - Production: JSON logs (machine-readable)
- **Request Correlation:**
  - Each HTTP request gets a unique `request_id` (UUID), available in all logs and returned as `X-Request-ID` header.
  - You can trace a request across all logs using this ID.
- **Log Storage:**
  - **stdout:** All logs are written to stdout (for Docker/Kubernetes).
  - **File:** If `LOG_TO_FILE=true`, logs are also written to a rotating file (see `LOG_FILE_PATH`).
  - **Database:** All logs are asynchronously persisted to the `logs` table for audit/history.
- **Structured Logging:**
  - All logs include fields: `request_id`, `endpoint`, `method`, `status`, `duration_ms`, and `user_id` (if available).
  - No sensitive data (passwords, tokens) is ever logged.

### Example: Tracing a Request

1. Make an API call. The response will include an `X-Request-ID` header.
2. Use this ID to search logs in stdout, file, or the `logs` table for all related events/errors.

### Log Rotation

- File logs are rotated using lumberjack: max 100MB per file, 5 backups, 30 days retention, compressed.

### Log Table Schema

- See `models/log.go` and `migrations/000003_logs.up.sql` for the DB log schema.
