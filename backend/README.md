# 📦 Backend (Go + Gin)

A backend platform built in **Go** using the **Gin** web framework, **PostgreSQL**, integrated with **Plisio** for crypto payments and **BunnyCDN** for media hosting and streaming.

---

## 🚀 Features

- 🔐 Firebase JWT authentication middleware
- 📄 CRUD APIs: Users, Posts, Media, Comments, Models
- 💰 Plisio integration:
  - Create cryptocurrency invoices
  - Handle callback notifications
- 🎥 BunnyCDN integration:
  - Upload media files directly to BunnyCDN storage
  - Generate secure streaming URLs with signed tokens
  - Delete media files from BunnyCDN and DB
- 🌐 CORS configured for frontend
- 🔄 Migration and seeding tools (`/migrate` and `/seed` endpoints)

---

## ⚙️ Tech Stack

| Technology | Purpose                               |
| ---------- | ------------------------------------- |
| Go 1.21+   | Backend language                      |
| Gin        | HTTP web framework                    |
| GORM       | ORM for PostgreSQL                    |
| Plisio     | Crypto payments integration           |
| BunnyCDN   | Media storage and tokenized streaming |
| Firebase   | Authentication                        |

---

## 📁 Project Structure

backend/
├── cmd/ # Utilities: seeding & migrations
├── config/ # .env loader
├── database/ # DB connection and migrations
├── handlers/ # HTTP Handlers (Users, Posts, Video, etc.)
├── middleware/ # Error handling, Auth
├── models/ # GORM models (User, Post, Media, etc.)
├── routes/ # API routes initialization
├── services/ # External integrations (Plisio, Bunny)
└── main.go # Entry point

makefile
Копировать
Редактировать

---

## 🔑 .env Configuration

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=yourdb

# JWT & Firebase
JWT_SECRET=your-secret

# BunnyCDN
BUNNY_STORAGE_ZONE=clicx-storage
BUNNY_STORAGE_KEY=your-storage-password
BUNNY_PULL_ZONE_HOSTNAME=clicx.b-cdn.net
BUNNY_TOKEN_KEY=your-token-key

# Plisio
PLISIO_API_KEY=your-plisio-key
🧪 Run Project
bash
Копировать
Редактировать
cd backend
go mod tidy
go run main.go
🔐 Authentication
Use Firebase JWT in Authorization header:

makefile
Копировать
Редактировать
Authorization: Bearer <token>
📘 API Endpoints
✅ Users
Method	Path	Description
GET	/users	Get all users
GET	/users/:id	Get user by ID
POST	/users	Create user
PUT	/users/:id	Update user
DELETE	/users/:id	Delete user

✅ Posts
Method	Path	Description
GET	/posts	Get all posts
GET	/posts/:id	Get post by ID (with media, comments)
POST	/posts	Create post (JSON)
PUT	/posts/:id	Update post
DELETE	/posts/:id	Delete post
POST	/posts/:id/like	Toggle like

✅ Admin Posts
Method	Path	Description
POST	/admin/posts/upload	Create post + upload media

✅ Videos & Media
Method	Path	Description
POST	/videos/upload	Upload video to BunnyCDN & link to post
GET	/videos/:id/stream	Generate signed BunnyCDN streaming URL
GET	/videos/:id	Get media info by ID
DELETE	/videos/:id	Delete video from Bunny + DB

✅ Payments
Method	Path	Description
POST	/payments/plisio	Create crypto invoice
POST	/payments/plisio/callback	Handle payment callback

✅ Migration & Seeding
Method	Path	Description
GET	/migrate	Run migrations
GET	/seed	Seed database

🔒 BunnyCDN Integration Details
Uploads happen via Storage API → https://sg.storage.bunnycdn.com/<zone>/<path>

Each file gets public URL via Pull Zone → https://<pullzone>/<path>

Secure streaming uses signed tokens:

php-template
Копировать
Редактировать
https://pullzone/user/video.mp4?token=<signature>&expires=<timestamp>
```
