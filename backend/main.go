package main

// @title           Clicx API
// @version         1.0
// @description     REST API for the Clicx platform
// @BasePath        /

import (
	"time"

	"go-backend/config"
	"go-backend/database"
	"go-backend/logging"
	"go-backend/middleware"
	"go-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {

	// ✅ Загружаем .env, но не падаем, если его нет
	if err := godotenv.Load(); err != nil {
		zap.L().Warn(".env не найден, используем ENV переменные", zap.Error(err))
	}

	// ✅ Загружаем конфиг
	config.LoadConfig()

	// ✅ Подключаем базу
	database.InitDB()

	// ✅ Создаём zap-логгер
	logger, _ := logging.InitLogger()
	defer logger.Sync()
	logger.Info("Сервис запущен")

	// ✅ Инициализация Firebase (только если ключи заданы)
	if config.AppConfig.FirebaseProjectID != "" {
		middleware.InitFirebase(logger)
		logger.Info("Firebase подключен")
	} else {
		logger.Warn("Firebase пропущен (нет конфигурации)")
	}

	// ✅ Создаём Gin
	r := gin.New()
	r.Use(gin.Recovery())

	// ✅ Request ID middleware
	r.Use(logging.RequestIDMiddleware())

	// ✅ Настройка CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://159.223.94.49:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Authorization", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// ✅ Подключаем middleware
	r.Use(middleware.LoggerMiddleware(logger))
	r.Use(middleware.ErrorHandler(logger))
	r.Use(middleware.UserMiddleware(logger))

	r.SetTrustedProxies([]string{"127.0.0.1"})

	// ✅ Роуты
	routes.InitRoutes(r, logger)

	// ✅ Запускаем сервер
	if err := r.Run("0.0.0.0:" + config.AppConfig.AppPort); err != nil {
		logger.Fatal("Ошибка запуска сервера", zap.Error(err))
	}
}
