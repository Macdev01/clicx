package main

import (
	"log"
	"time"

	"go-backend/config"
	"go-backend/database"
	"go-backend/middleware"
	"go-backend/routes"

	"go.uber.org/zap"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Создаём zap-логгер
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	logger.Info("Сервис запущен", zap.String("env", "prod"))

	// Загружаем .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Конфиг и база
	config.LoadConfig()
	database.InitDB()

	// Firebase
	middleware.InitFirebase()

	// Создаём Gin
	r := gin.New()
	r.Use(gin.Recovery()) // защита от паник

	// Подключаем CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://159.223.94.49:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept", "Accept-Encoding", "X-CSRF-Token", "Authorization", "X-Requested-With", "X-Auth-Token"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Подключаем наши middleware
	r.Use(middleware.LoggerMiddleware(logger)) // ЛОГИРОВАНИЕ HTTP
	r.Use(middleware.ErrorHandler())           // обработка ошибок
	r.Use(middleware.UserMiddlewareGin())      // Firebase

	r.SetTrustedProxies([]string{"127.0.0.1"})

	// Роуты
	routes.InitRoutes(r)

	// Запуск сервера
	r.Run("0.0.0.0:" + config.AppConfig.AppPort)
}
