package main

import (
	"log"
	"time"

	"go-backend/config"
	"go-backend/database"
	"go-backend/middleware"
	"go-backend/routes"

	"github.com/joho/godotenv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Загрузка конфигурации и подключение к базе
	config.LoadConfig()
	database.InitDB()

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Инициализация Firebase — путь к JSON-файлу в корне
	middleware.InitFirebase("clixxx-dev-44e45f09d47f.json")

	r := gin.Default()

	// Middleware
	r.Use(middleware.ErrorHandler())      // централизованная обработка ошибок
	r.Use(middleware.UserMiddlewareGin()) // проверка Firebase токена и добавление пользователя в контекст
	r.SetTrustedProxies([]string{"127.0.0.1"})

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://159.223.94.49:3000",
		},
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Accept",
			"Accept-Encoding",
			"X-CSRF-Token",
			"Authorization",
			"X-Requested-With",
			"X-Auth-Token",
		},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Инициализация маршрутов
	routes.InitRoutes(r)

	// Запуск сервера
	r.Run("0.0.0.0:" + config.AppConfig.AppPort)
}
