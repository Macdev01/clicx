# 📦 Backend (Go + Gin)

A backend platform built in Go using the **Gin** web framework, **PostgreSQL** as the database, and integrated with the **Plisio** cryptocurrency payment system. Provides APIs for managing users, posts, orders, and payment logic.

---

## 🚀 Features

- 🔐 Firebase JWT authentication via middleware
- 📄 CRUD APIs: users, posts, comments, models
- 💰 Plisio integration:
  - create crypto invoices
  - handle callback notifications
  - save transactions in the database
- 🌐 CORS configured for frontend (e.g., `http://localhost:3000`)
- 🔄 Migration and seeding tools (`cmd/` directory)

---

## ⚙️ Tech Stack

| Technology | Purpose                     |
| ---------- | --------------------------- |
| Go 1.21+   | Backend language            |
| Gin        | HTTP web framework          |
| GORM       | PostgreSQL ORM              |
| Plisio     | Crypto payments integration |
| Firebase   | User authentication         |
| godotenv   | Load `.env` configuration   |

---

## 📁 Project Structure

```
backend/
├── cmd/                  # Utilities: seeding & migrations
├── config/               # .env configuration loader
├── database/             # DB connection and migration
├── handlers/             # Gin HTTP handlers
├── middleware/           # Error handling and auth
├── models/               # GORM models (User, Post, Payment, etc.)
├── routes/               # Gin route initialization
├── services/             # External services (Plisio)
├── go.mod / go.sum       # Go modules
└── main.go               # Entry point
```

---

## 🧪 Getting Started

1. Create a `.env` file in `backend/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=yourdb

PLISIO_API_KEY=...
PLISIO_SECRET_KEY=...

JWT_SECRET=...
```

2. Run the server:

```bash
cd backend
go run main.go
```

---

## 🧰 Useful Endpoints

```bash
# Run DB migrations
curl http://localhost:3000/migrate

# Run data seeding
curl http://localhost:3000/seed
```

---

## 🔐 Payment Routes

| Method | Path                        | Description                     |
| ------ | --------------------------- | ------------------------------- |
| POST   | `/payments/plisio`          | Create crypto invoice           |
| POST   | `/payments/plisio/callback` | Receive Plisio payment callback |
| GET    | `/payment/success`          | Payment success (JSON)          |
| GET    | `/payment/failed`           | Payment failed or cancelled     |

---

## 🔒 Authentication

Authentication is handled via Firebase Bearer Token, processed by middleware.  
Pass it in headers as: `Authorization: Bearer <token>`

## 📘 API Endpoints

### `admin_handler.go`

- `CreateAdmin()`
- `DeleteAdmin()`
- `GetAdminByID()`
- `GetAdmins()`
- `UpdateAdmin()`

### `migrate_handler.go`

- `MigrateHandler()`
- `SeedHandler()`

### `model_profile_handler.go`

- `CreateModelProfile()`
- `DeleteModelProfile()`
- `GetModelProfileByID()`
- `GetModelProfileByUserID()`
- `GetModelProfiles()`
- `UpdateModelProfile()`

### `order_handler.go`

- `CreateOrder()`
- `DeleteOrder()`
- `GetOrderByID()`
- `GetOrders()`
- `UpdateOrder()`

### `plisio_payment.go`

- `CreatePlisioInvoice()`
- `PlisioCallback()`

### `post_handler.go`

- `CreatePost()`
- `DeletePost()`
- `GetPostByID()`
- `GetPosts()`
- `UpdatePost()`

### `user_handler.go`

- `CreateUser()`
- `DeleteUser()`
- `GetUserByID()`
- `GetUsers()`
- `UpdateUser()`

## 📚 HTTP API Routes

| Method | Path                      | Handler                          |
| ------ | ------------------------- | -------------------------------- |
| GET    | /users/:id                | handlers.GetUserByID             |
| GET    | /users/:id/model-profile  | handlers.GetModelProfileByUserID |
| PUT    | /users/:id                | handlers.UpdateUser              |
| DELETE | /users/:id                | handlers.DeleteUser              |
| GET    | /posts/:id                | handlers.GetPostByID             |
| PUT    | /posts/:id                | handlers.UpdatePost              |
| DELETE | /posts/:id                | handlers.DeletePost              |
| GET    | /orders/:id               | handlers.GetOrderByID            |
| PUT    | /orders/:id               | handlers.UpdateOrder             |
| DELETE | /orders/:id               | handlers.DeleteOrder             |
| GET    | /admins/:id               | handlers.GetAdminByID            |
| PUT    | /admins/:id               | handlers.UpdateAdmin             |
| DELETE | /admins/:id               | handlers.DeleteAdmin             |
| GET    | /models/:id               | handlers.GetModelProfileByID     |
| PUT    | /models/:id               | handlers.UpdateModelProfile      |
| DELETE | /models/:id               | handlers.DeleteModelProfile      |
| POST   | /payments/plisio          | handlers.CreatePlisioInvoice     |
| POST   | /payments/plisio/callback | handlers.PlisioCallback          |
| GET    | /migrate                  | handlers.MigrateHandler          |
| GET    | /seed                     | handlers.SeedHandler             |
