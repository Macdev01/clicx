package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort           string
	DBHost            string
	DBPort            int
	DBUser            string
	DBPassword        string
	DBName            string
	JwtSecret         string
	PlisioKey         string
	PlisioSecret      string
	BunnyStorageZone  string
	BunnyStorageKey   string
	BunnyPullZoneHost string
	BunnyTokenKey     string
}

var AppConfig *Config

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ .env файл не найден, читаем из переменных окружения")
	}

	port, err := strconv.Atoi(getEnv("DB_PORT", "5432"))
	if err != nil {
		log.Fatalf("❌ Невалидный DB_PORT: %v", err)
	}

	AppConfig = &Config{
		AppPort:           getEnv("APP_PORT", "8080"),
		DBHost:            getEnv("DB_HOST", ""),
		DBPort:            port,
		DBUser:            getEnv("DB_USER", ""),
		DBPassword:        getEnv("DB_PASSWORD", ""),
		DBName:            getEnv("DB_NAME", ""),
		JwtSecret:         getEnv("JWT_SECRET", ""),
		PlisioKey:         getEnv("PLISIO_API_KEY", ""),
		PlisioSecret:      getEnv("PLISIO_SECRET_KEY", ""),
		BunnyStorageZone:  os.Getenv("BUNNY_STORAGE_ZONE"),
		BunnyStorageKey:   os.Getenv("BUNNY_STORAGE_KEY"),
		BunnyPullZoneHost: os.Getenv("BUNNY_PULL_ZONE_HOSTNAME"),
		BunnyTokenKey:     os.Getenv("BUNNY_TOKEN_KEY"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
