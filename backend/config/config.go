package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort                string
	DBHost                 string
	DBPort                 int
	DBUser                 string
	DBPassword             string
	DBName                 string
	JwtSecret              string
	CoinPaymentsPublicKey  string
	CoinPaymentsPrivateKey string
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
		AppPort:                getEnv("APP_PORT", "8080"),
		DBHost:                 getEnv("DB_HOST", ""),
		DBPort:                 port,
		DBUser:                 getEnv("DB_USER", ""),
		DBPassword:             getEnv("DB_PASSWORD", ""),
		DBName:                 getEnv("DB_NAME", ""),
		JwtSecret:              getEnv("JWT_SECRET", ""),
		CoinPaymentsPublicKey:  getEnv("COINPAYMENTS_KEY", ""),
		CoinPaymentsPrivateKey: getEnv("COINPAYMENTS_SECRET", ""),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
