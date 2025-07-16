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
	// ✅ Создаём zap-логгер
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	logger.Info("Сервис запущен", zap.String("env", "prod"))

	// ✅ Загружаем .env, но не падаем, если его нет
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ .env не найден, используем ENV переменные")
	}

	// ✅ Загружаем конфиг
	config.LoadConfig()

	// ✅ Подключаем базу
	database.InitDB()

	// ✅ Инициализация Firebase (только если ключи заданы)
	if config.AppConfig.FirebaseProjectID != "" {
		middleware.InitFirebase()
		log.Println("✅ Firebase подключен")
	} else {
		log.Println("⚠️ Firebase пропущен (нет конфигурации)")
	}

	// ✅ Создаём Gin
	r := gin.New()
	r.Use(gin.Recovery())

	// ✅ Настройка CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://159.223.94.49:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ✅ Подключаем middleware
	r.Use(middleware.LoggerMiddleware(logger))
	r.Use(middleware.ErrorHandler())
	r.Use(middleware.UserMiddlewareGin())

	r.SetTrustedProxies([]string{"127.0.0.1"})

	// ✅ Роуты
	routes.InitRoutes(r)

	// ✅ Запускаем сервер
	if err := r.Run("0.0.0.0:" + config.AppConfig.AppPort); err != nil {
		log.Fatalf("❌ Ошибка запуска сервера: %v", err)
	}
}
